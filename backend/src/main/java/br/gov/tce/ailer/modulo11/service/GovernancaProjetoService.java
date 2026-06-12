package br.gov.tce.ailer.modulo11.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo11.domain.GovernancaProjeto;
import br.gov.tce.ailer.modulo11.domain.enums.StatusGovernanca;
import br.gov.tce.ailer.modulo11.dto.request.AtualizarGovernancaRequest;
import br.gov.tce.ailer.modulo11.dto.response.GovernancaProjetoResponse;
import br.gov.tce.ailer.modulo11.repository.GovernancaProjetoRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GovernancaProjetoService {

    private final GovernancaProjetoRepository repo;
    private final DemandaRepository demandaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public GovernancaProjetoResponse gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);
        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando governança para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt), ChatMessage.user(contexto)));

        GovernancaProjeto gov = repo.findByDemandaId(demandaId)
                .orElse(GovernancaProjeto.builder().demandaId(demandaId).build());

        parseInto(gov, jsonResp);
        gov.setFonte("IA");
        gov.setStatusAprovacao(StatusGovernanca.RASCUNHO_IA);

        return GovernancaProjetoResponse.from(repo.save(gov));
    }

    @Transactional(readOnly = true)
    public GovernancaProjetoResponse buscar(UUID demandaId) {
        findDemanda(demandaId);
        return repo.findByDemandaId(demandaId)
                .map(GovernancaProjetoResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Governança ainda não gerada para esta demanda."));
    }

    @Transactional
    public GovernancaProjetoResponse atualizar(UUID demandaId, AtualizarGovernancaRequest req) {
        findDemanda(demandaId);
        GovernancaProjeto gov = repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Governança não encontrada"));
        if (req.matrizRaci()           != null) gov.setMatrizRaci(req.matrizRaci());
        if (req.stakeholdersMapeados() != null) gov.setStakeholdersMapeados(req.stakeholdersMapeados());
        if (req.dependenciasExternas() != null) gov.setDependenciasExternas(req.dependenciasExternas());
        if (req.premissas()            != null) gov.setPremissas(req.premissas());
        if (req.restricoes()           != null) gov.setRestricoes(req.restricoes());
        if (req.riscos()               != null) gov.setRiscos(req.riscos());
        if (req.planoMitigacao()       != null) gov.setPlanoMitigacao(req.planoMitigacao());
        return GovernancaProjetoResponse.from(repo.save(gov));
    }

    @Transactional
    public GovernancaProjetoResponse abrirRevisao(UUID demandaId) {
        GovernancaProjeto gov = findByDemanda(demandaId);
        gov.setStatusAprovacao(StatusGovernanca.EM_REVISAO);
        return GovernancaProjetoResponse.from(repo.save(gov));
    }

    @Transactional
    public GovernancaProjetoResponse aprovar(UUID demandaId, String aprovadoPor) {
        GovernancaProjeto gov = findByDemanda(demandaId);
        if (gov.getStatusAprovacao() != StatusGovernanca.EM_REVISAO)
            throw new BusinessException("Governança deve estar EM_REVISAO para ser aprovada.");
        gov.setStatusAprovacao(StatusGovernanca.APROVADO);
        gov.setAprovadoPor(aprovadoPor);
        gov.setAprovadoEm(LocalDateTime.now());
        return GovernancaProjetoResponse.from(repo.save(gov));
    }

    @Transactional
    public GovernancaProjetoResponse publicar(UUID demandaId) {
        GovernancaProjeto gov = findByDemanda(demandaId);
        if (gov.getStatusAprovacao() != StatusGovernanca.APROVADO)
            throw new BusinessException("Governança deve estar APROVADA antes de publicar.");
        gov.setStatusAprovacao(StatusGovernanca.PUBLICADO);
        return GovernancaProjetoResponse.from(repo.save(gov));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private GovernancaProjeto findByDemanda(UUID demandaId) {
        return repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Governança não encontrada"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao()   != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");
        if (d.getPremissas()   != null) sb.append("PREMISSAS: ").append(d.getPremissas()).append("\n");
        if (d.getRestricoes()  != null) sb.append("RESTRIÇÕES: ").append(d.getRestricoes()).append("\n");
        canvasRepo.findByDemandaId(d.getId()).ifPresent(c -> {
            if (c.getRiscos()    != null) sb.append("RISCOS DO CANVAS: ").append(c.getRiscos()).append("\n");
            if (c.getIntegracoes()!= null) sb.append("INTEGRAÇÕES: ").append(c.getIntegracoes()).append("\n");
        });
        d.getStakeholders().forEach(s ->
                sb.append("STAKEHOLDER: ").append(s.getNome())
                  .append(" (").append(s.getPapel()).append(")\n"));
        return sb.toString();
    }

    private void parseInto(GovernancaProjeto gov, String json) {
        String limpo = stripFences(json);
        try {
            JsonNode root = objectMapper.readTree(limpo);
            gov.setMatrizRaci(safeJson(root.get("matrizRaci")));
            gov.setStakeholdersMapeados(safeJson(root.get("stakeholdersMapeados")));
            gov.setDependenciasExternas(safeJson(root.get("dependenciasExternas")));
            gov.setPremissas(safeJson(root.get("premissas")));
            gov.setRestricoes(safeJson(root.get("restricoes")));
            gov.setRiscos(safeJson(root.get("riscos")));
            gov.setPlanoMitigacao(safeJson(root.get("planoMitigacao")));
        } catch (IOException e) {
            log.error("Falha ao parsear governança: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para governança");
        }
    }

    private String stripFences(String raw) {
        String s = raw.strip();
        if (s.startsWith("```")) {
            int i = s.indexOf('{'), j = s.lastIndexOf('}');
            if (i >= 0 && j > i) return s.substring(i, j + 1);
        }
        return s;
    }

    private String safeJson(JsonNode node) {
        if (node == null || node.isNull()) return null;
        try { return objectMapper.writeValueAsString(node); }
        catch (IOException e) { return null; }
    }

    private String loadPrompt() {
        try { return new ClassPathResource("prompts/governanca-geracao.txt").getContentAsString(StandardCharsets.UTF_8); }
        catch (IOException e) { throw new IllegalStateException("Prompt governanca-geracao.txt não encontrado", e); }
    }
}
