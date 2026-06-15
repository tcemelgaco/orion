package br.gov.tce.ailer.gitlab.service;

import br.gov.tce.ailer.gitlab.client.GitLabClient;
import br.gov.tce.ailer.gitlab.domain.GitLabConfig;
import br.gov.tce.ailer.gitlab.dto.request.GitLabConfigRequest;
import br.gov.tce.ailer.gitlab.dto.response.GitLabConfigResponse;
import br.gov.tce.ailer.gitlab.dto.response.GitLabExportResponse;
import br.gov.tce.ailer.gitlab.repository.GitLabConfigRepository;
import br.gov.tce.ailer.modulo5.domain.Epico;
import br.gov.tce.ailer.modulo5.domain.HistoriaUsuario;
import br.gov.tce.ailer.modulo5.repository.EpicoRepository;
import br.gov.tce.ailer.modulo5.repository.HistoriaUsuarioRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitLabExportService {

    private final GitLabConfigRepository configRepository;
    private final GitLabClient gitLabClient;
    private final EpicoRepository epicoRepository;
    private final HistoriaUsuarioRepository historiaRepository;

    @Transactional
    public GitLabConfigResponse salvarConfig(UUID demandaId, GitLabConfigRequest req) {
        // Valida conectividade antes de salvar
        gitLabClient.buscarProjeto(req.gitlabUrl(), req.projectId(), req.accessToken());

        GitLabConfig config = configRepository.findByDemandaId(demandaId)
                .orElseGet(() -> GitLabConfig.builder()
                        .demandaId(demandaId)
                        .gitlabUrl(req.gitlabUrl())
                        .projectId(req.projectId())
                        .accessToken(req.accessToken())
                        .build());

        config.setGitlabUrl(req.gitlabUrl());
        config.setProjectId(req.projectId());
        config.setAccessToken(req.accessToken());
        config.setAtivo(true);

        GitLabConfig salvo = configRepository.save(config);
        log.info("Configuração GitLab salva. demandaId={}, projectId={}", demandaId, req.projectId());
        return GitLabConfigResponse.from(salvo);
    }

    @Transactional(readOnly = true)
    public GitLabConfigResponse buscarConfig(UUID demandaId) {
        return configRepository.findByDemandaId(demandaId)
                .map(GitLabConfigResponse::from)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Configuração GitLab não encontrada para demanda: " + demandaId));
    }

    @Transactional
    public GitLabExportResponse exportarBacklog(UUID demandaId) {
        GitLabConfig config = configRepository.findByDemandaId(demandaId)
                .filter(GitLabConfig::isAtivo)
                .orElseThrow(() -> new BusinessException(
                        "Configuração GitLab não encontrada ou inativa para esta demanda."));

        List<Epico> epicos = epicoRepository.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId);
        if (epicos.isEmpty()) {
            throw new BusinessException("Nenhum épico encontrado para exportar.");
        }

        int epicosExportados = 0;
        int historiasExportadas = 0;
        int erros = 0;
        List<String> detalhes = new ArrayList<>();

        for (Epico epico : epicos) {
            try {
                Integer milestoneId = exportarEpico(epico, config);
                epicosExportados++;
                detalhes.add("✓ Épico %s exportado → Milestone #%d".formatted(epico.getCodigo(), milestoneId));

                List<HistoriaUsuario> historias = historiaRepository.findByFeature_EpicoIdOrderByOrdemExibicaoAsc(epico.getId());
                for (HistoriaUsuario historia : historias) {
                    try {
                        exportarHistoria(historia, milestoneId, config);
                        historiasExportadas++;
                    } catch (Exception e) {
                        erros++;
                        log.warn("Falha ao exportar história {}: {}", historia.getCodigo(), e.getMessage());
                        detalhes.add("✗ História %s — %s".formatted(historia.getCodigo(), e.getMessage()));
                    }
                }
            } catch (Exception e) {
                erros++;
                log.warn("Falha ao exportar épico {}: {}", epico.getCodigo(), e.getMessage());
                detalhes.add("✗ Épico %s — %s".formatted(epico.getCodigo(), e.getMessage()));
            }
        }

        log.info("Export GitLab concluído. demanda={}, epicos={}, historias={}, erros={}",
                demandaId, epicosExportados, historiasExportadas, erros);

        return new GitLabExportResponse(epicosExportados, historiasExportadas, erros, detalhes);
    }

    // -------------------------------------------------------------------------

    private Integer exportarEpico(Epico epico, GitLabConfig config) {
        if (epico.getGitlabMilestoneId() != null) {
            log.debug("Épico {} já exportado (milestone_id={}), ignorando.", epico.getCodigo(), epico.getGitlabMilestoneId());
            return epico.getGitlabMilestoneId();
        }

        GitLabClient.GitLabMilestoneResult result = gitLabClient.criarMilestone(
                config.getGitlabUrl(), config.getProjectId(), config.getAccessToken(),
                "[%s] %s".formatted(epico.getCodigo(), epico.getTitulo()),
                epico.getDescricao()
        );

        epico.setGitlabMilestoneId(result.id());
        epico.setGitlabMilestoneUrl(result.url());
        epico.setGitlabExportadoEm(LocalDateTime.now());
        epicoRepository.save(epico);

        return result.id();
    }

    private void exportarHistoria(HistoriaUsuario historia, Integer milestoneId, GitLabConfig config) {
        if (historia.getGitlabIssueIid() != null) {
            log.debug("História {} já exportada (issue_iid={}), ignorando.", historia.getCodigo(), historia.getGitlabIssueIid());
            return;
        }

        String titulo = "[%s] Como %s, quero %s".formatted(
                historia.getCodigo(), historia.getComoPapel(), historia.getQueroAcao());

        String descricao = buildDescricaoIssue(historia);

        String labels = "user-story," + historia.getPrioridade().name().toLowerCase();
        if (historia.getStoryPoints() != null) {
            labels += ",sp:" + historia.getStoryPoints();
        }

        GitLabClient.GitLabIssueResult result = gitLabClient.criarIssue(
                config.getGitlabUrl(), config.getProjectId(), config.getAccessToken(),
                titulo, descricao, milestoneId, labels
        );

        historia.setGitlabIssueIid(result.iid());
        historia.setGitlabIssueUrl(result.url());
        historia.setGitlabExportadoEm(LocalDateTime.now());
        historiaRepository.save(historia);
    }

    private String buildDescricaoIssue(HistoriaUsuario h) {
        StringBuilder sb = new StringBuilder();
        sb.append("## História de Usuário\n\n");
        sb.append("**Como** ").append(h.getComoPapel()).append(",\n");
        sb.append("**quero** ").append(h.getQueroAcao());
        if (h.getParaBeneficio() != null && !h.getParaBeneficio().isBlank()) {
            sb.append(",\n**para** ").append(h.getParaBeneficio());
        }
        sb.append("\n\n");

        if (h.getCriteriosAceitacao() != null && !h.getCriteriosAceitacao().isBlank()) {
            sb.append("## Critérios de Aceitação\n\n").append(h.getCriteriosAceitacao()).append("\n\n");
        }

        sb.append("---\n");
        sb.append("*Exportado do AILER — Código: ").append(h.getCodigo()).append("*");
        if (h.getStoryPoints() != null) {
            sb.append(" | Story Points: ").append(h.getStoryPoints());
        }
        return sb.toString();
    }
}
