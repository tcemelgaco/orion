package br.gov.tce.ailer.modulo5.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo5.domain.Epico;
import br.gov.tce.ailer.modulo5.domain.Feature;
import br.gov.tce.ailer.modulo5.domain.HistoriaUsuario;
import br.gov.tce.ailer.modulo5.domain.enums.StatusBacklog;
import br.gov.tce.ailer.modulo5.domain.enums.StatusHistoria;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;
import br.gov.tce.ailer.shared.exception.BusinessException;

import br.gov.tce.ailer.modulo5.dto.request.AtualizarHistoriaRequest;
import br.gov.tce.ailer.modulo5.dto.response.EpicoResponse;
import br.gov.tce.ailer.modulo5.dto.response.HistoriaUsuarioResponse;
import br.gov.tce.ailer.modulo5.repository.EpicoRepository;
import br.gov.tce.ailer.modulo5.repository.FeatureRepository;
import br.gov.tce.ailer.modulo5.repository.HistoriaUsuarioRepository;
import br.gov.tce.ailer.repositorio.repository.ArtefatoRepository;
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
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BacklogService {

    private final EpicoRepository epicoRepo;
    private final FeatureRepository featureRepo;
    private final HistoriaUsuarioRepository historiaRepo;
    private final DemandaRepository demandaRepo;
    private final EntrevistaRepository entrevistaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final RequisitoRepository requisitoRepo;
    private final ArtefatoRepository artefatoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<EpicoResponse> gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);
        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando backlog para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt),
                ChatMessage.user(contexto)
        ));

        epicoRepo.deleteGeradosPorIa(demandaId);

        List<Epico> epicos = parseBacklog(jsonResp, demandaId);
        epicoRepo.saveAll(epicos);

        log.info("{} épicos gerados para demanda {}", epicos.size(), demandaId);
        return listar(demandaId);
    }

    @Transactional(readOnly = true)
    public List<EpicoResponse> listar(UUID demandaId) {
        findDemanda(demandaId);
        return epicoRepo.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId)
                .stream().map(EpicoResponse::from).toList();
    }

    @Transactional
    public HistoriaUsuarioResponse atualizarHistoria(UUID historiaId, AtualizarHistoriaRequest req) {
        HistoriaUsuario h = historiaRepo.findById(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "História não encontrada"));
        if (req.comoPapel()          != null) h.setComoPapel(req.comoPapel());
        if (req.queroAcao()          != null) h.setQueroAcao(req.queroAcao());
        if (req.paraBeneficio()      != null) h.setParaBeneficio(req.paraBeneficio());
        if (req.criteriosAceitacao() != null) h.setCriteriosAceitacao(req.criteriosAceitacao());
        if (req.storyPoints()        != null) h.setStoryPoints(req.storyPoints());
        if (req.prioridade()         != null) h.setPrioridade(req.prioridade());
        if (req.status()             != null) h.setStatus(req.status());
        return HistoriaUsuarioResponse.from(historiaRepo.save(h));
    }

    @Transactional
    public void excluirHistoria(UUID historiaId) {
        if (!historiaRepo.existsById(historiaId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "História não encontrada");
        historiaRepo.deleteById(historiaId);
    }

    @Transactional
    public EpicoResponse abrirRevisaoEpico(UUID epicoId) {
        Epico epico = findEpico(epicoId);
        epico.setStatusAprovacao(StatusAprovacao.EM_REVISAO);
        return EpicoResponse.from(epicoRepo.save(epico));
    }

    @Transactional
    public EpicoResponse aprovarEpico(UUID epicoId, String aprovadoPor) {
        Epico epico = findEpico(epicoId);
        epico.setStatusAprovacao(StatusAprovacao.APROVADO);
        epico.setAprovadoPor(aprovadoPor);
        epico.setAprovadoEm(OffsetDateTime.now());
        return EpicoResponse.from(epicoRepo.save(epico));
    }

    @Transactional
    public EpicoResponse publicarEpico(UUID epicoId) {
        Epico epico = findEpico(epicoId);
        if (epico.getStatusAprovacao() != StatusAprovacao.APROVADO) {
            throw new BusinessException("Épico deve estar APROVADO antes de publicar.");
        }
        epico.setStatusAprovacao(StatusAprovacao.PUBLICADO);
        return EpicoResponse.from(epicoRepo.save(epico));
    }

    private Epico findEpico(UUID id) {
        return epicoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Épico não encontrado"));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao() != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");

        canvasRepo.findByDemandaId(d.getId()).ifPresent(c -> {
            sb.append("\n--- CANVAS ---\n");
            if (c.getContexto()            != null) sb.append("Contexto: ").append(c.getContexto()).append("\n");
            if (c.getSolucaoProposta()     != null) sb.append("Solução: ").append(c.getSolucaoProposta()).append("\n");
            if (c.getUsuarios()            != null) sb.append("Usuários: ").append(c.getUsuarios()).append("\n");
            if (c.getFuncionalidadesChave()!= null) sb.append("Funcionalidades: ").append(c.getFuncionalidadesChave()).append("\n");
        });

        List<Requisito> requisitos = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(d.getId());
        if (!requisitos.isEmpty()) {
            sb.append("\n--- REQUISITOS ---\n");
            requisitos.stream()
                    .filter(r -> "RF".equals(r.getTipo().name()))
                    .limit(15)
                    .forEach(r -> sb.append("RF: ").append(r.getTitulo()).append("\n"));
        }

        entrevistaRepo.findByDemandaId(d.getId()).stream()
                .filter(e -> e.getStatus() == StatusEntrevista.CONCLUIDA)
                .findFirst()
                .map(Entrevista::getSumario)
                .ifPresent(s -> {
                    sb.append("\n--- LEVANTAMENTO ---\n");
                    if (s.getNecessidades()         != null) sb.append("Necessidades: ").append(s.getNecessidades()).append("\n");
                    if (s.getUsuariosIdentificados()!= null) sb.append("Usuários: ").append(s.getUsuariosIdentificados()).append("\n");
                    if (s.getRegrasNegocio()        != null) sb.append("Regras: ").append(s.getRegrasNegocio()).append("\n");
                });

        var artefatos = artefatoRepo.findByDemandaIdOrderByCriadoEmDesc(d.getId());
        if (!artefatos.isEmpty()) {
            sb.append("\n--- DOCUMENTOS DE REFERÊNCIA ---\n");
            artefatos.forEach(a -> sb.append("- ")
                    .append(a.getNomeOriginal())
                    .append(" [").append(a.getTipoArtefato().name()).append("]")
                    .append(a.getDescricao() != null ? ": " + a.getDescricao() : "")
                    .append("\n"));
        }

        return sb.toString();
    }

    private List<Epico> parseBacklog(String json, UUID demandaId) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            JsonNode root    = objectMapper.readTree(limpo);
            JsonNode epicArr = root.get("epicos");
            if (epicArr == null || !epicArr.isArray())
                throw new IllegalStateException("Campo 'epicos' ausente");

            List<Epico> result = new ArrayList<>();
            int epicOrd = 0;
            for (JsonNode eNode : epicArr) {
                PrioridadeDemanda epicPrio = parsePrioridade(eNode.path("prioridade").asText("MEDIA"));
                Epico epico = Epico.builder()
                        .demandaId(demandaId)
                        .codigo("EP-" + String.format("%03d", epicOrd + 1))
                        .titulo(eNode.path("titulo").asText("Épico"))
                        .descricao(eNode.path("descricao").asText(null))
                        .prioridade(epicPrio)
                        .status(StatusBacklog.ABERTO)
                        .fonte("IA")
                        .ordemExibicao(epicOrd++)
                        .build();

                JsonNode featArr = eNode.get("features");
                if (featArr != null && featArr.isArray()) {
                    int featOrd = 0;
                    for (JsonNode fNode : featArr) {
                        PrioridadeDemanda featPrio = parsePrioridade(fNode.path("prioridade").asText("MEDIA"));
                        Feature feature = Feature.builder()
                                .epico(epico)
                                .demandaId(demandaId)
                                .codigo("FT-" + String.format("%03d", (epicOrd - 1) * 10 + featOrd + 1))
                                .titulo(fNode.path("titulo").asText("Feature"))
                                .descricao(fNode.path("descricao").asText(null))
                                .prioridade(featPrio)
                                .status(StatusBacklog.ABERTO)
                                .fonte("IA")
                                .ordemExibicao(featOrd++)
                                .build();

                        JsonNode histArr = fNode.get("historias");
                        if (histArr != null && histArr.isArray()) {
                            int histOrd = 0;
                            for (JsonNode hNode : histArr) {
                                PrioridadeDemanda histPrio = parsePrioridade(hNode.path("prioridade").asText("MEDIA"));
                                HistoriaUsuario historia = HistoriaUsuario.builder()
                                        .feature(feature)
                                        .demandaId(demandaId)
                                        .codigo("US-" + String.format("%03d", result.size() * 100 + featOrd * 10 + histOrd + 1))
                                        .comoPapel(hNode.path("comoPapel").asText("usuário"))
                                        .queroAcao(hNode.path("queroAcao").asText("realizar ação"))
                                        .paraBeneficio(hNode.path("paraBeneficio").asText(null))
                                        .criteriosAceitacao(hNode.path("criteriosAceitacao").asText(null))
                                        .storyPoints(hNode.path("storyPoints").asInt(3))
                                        .prioridade(histPrio)
                                        .status(StatusHistoria.BACKLOG)
                                        .fonte("IA")
                                        .ordemExibicao(histOrd++)
                                        .build();
                                feature.getHistorias().add(historia);
                            }
                        }
                        epico.getFeatures().add(feature);
                    }
                }
                result.add(epico);
            }
            return result;
        } catch (IOException e) {
            log.error("Falha ao parsear backlog JSON: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA");
        }
    }

    private PrioridadeDemanda parsePrioridade(String raw) {
        try { return PrioridadeDemanda.valueOf(raw.toUpperCase()); }
        catch (IllegalArgumentException e) { return PrioridadeDemanda.MEDIA; }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/backlog-geracao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt backlog-geracao.txt não encontrado", e);
        }
    }
}
