package br.gov.tce.ailer.modulo10.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo5.repository.EpicoRepository;
import br.gov.tce.ailer.modulo10.domain.EstimativaProjeto;
import br.gov.tce.ailer.modulo10.domain.enums.StatusEstimativa;
import br.gov.tce.ailer.modulo10.dto.request.AtualizarEstimativaRequest;
import br.gov.tce.ailer.modulo10.dto.response.EstimativaProjetoResponse;
import br.gov.tce.ailer.modulo10.repository.EstimativaProjetoRepository;
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
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EstimativaProjetoService {

    private final EstimativaProjetoRepository repo;
    private final DemandaRepository demandaRepo;
    private final RequisitoRepository requisitoRepo;
    private final EpicoRepository epicoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public EstimativaProjetoResponse gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);
        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando estimativas para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt), ChatMessage.user(contexto)));

        EstimativaProjeto est = repo.findByDemandaId(demandaId)
                .orElse(EstimativaProjeto.builder().demandaId(demandaId).build());

        parseInto(est, jsonResp);
        est.setFonte("IA");
        est.setStatusAprovacao(StatusEstimativa.RASCUNHO_IA);

        return EstimativaProjetoResponse.from(repo.save(est));
    }

    @Transactional(readOnly = true)
    public EstimativaProjetoResponse buscar(UUID demandaId) {
        findDemanda(demandaId);
        return repo.findByDemandaId(demandaId)
                .map(EstimativaProjetoResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Estimativa ainda não gerada para esta demanda."));
    }

    @Transactional
    public EstimativaProjetoResponse atualizar(UUID demandaId, AtualizarEstimativaRequest req) {
        findDemanda(demandaId);
        EstimativaProjeto est = repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estimativa não encontrada"));
        if (req.storyPointsTotal()   != null) est.setStoryPointsTotal(req.storyPointsTotal());
        if (req.horasAnalista()      != null) est.setHorasAnalista(req.horasAnalista());
        if (req.horasDev()           != null) est.setHorasDev(req.horasDev());
        if (req.horasQa()            != null) est.setHorasQa(req.horasQa());
        if (req.horasUx()            != null) est.setHorasUx(req.horasUx());
        if (req.prazoSprints()       != null) est.setPrazoSprints(req.prazoSprints());
        if (req.recursosSugeridos()  != null) est.setRecursosSugeridos(req.recursosSugeridos());
        if (req.matrizEsforco()      != null) est.setMatrizEsforco(req.matrizEsforco());
        if (req.resumoExecutivo()    != null) est.setResumoExecutivo(req.resumoExecutivo());
        return EstimativaProjetoResponse.from(repo.save(est));
    }

    @Transactional
    public EstimativaProjetoResponse abrirRevisao(UUID demandaId) {
        EstimativaProjeto est = findByDemanda(demandaId);
        est.setStatusAprovacao(StatusEstimativa.EM_REVISAO);
        return EstimativaProjetoResponse.from(repo.save(est));
    }

    @Transactional
    public EstimativaProjetoResponse aprovar(UUID demandaId, String aprovadoPor) {
        EstimativaProjeto est = findByDemanda(demandaId);
        if (est.getStatusAprovacao() != StatusEstimativa.EM_REVISAO)
            throw new BusinessException("Estimativa deve estar EM_REVISAO para ser aprovada.");
        est.setStatusAprovacao(StatusEstimativa.APROVADO);
        est.setAprovadoPor(aprovadoPor);
        est.setAprovadoEm(LocalDateTime.now());
        return EstimativaProjetoResponse.from(repo.save(est));
    }

    @Transactional
    public EstimativaProjetoResponse publicar(UUID demandaId) {
        EstimativaProjeto est = findByDemanda(demandaId);
        if (est.getStatusAprovacao() != StatusEstimativa.APROVADO)
            throw new BusinessException("Estimativa deve estar APROVADA antes de publicar.");
        est.setStatusAprovacao(StatusEstimativa.PUBLICADO);
        return EstimativaProjetoResponse.from(repo.save(est));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private EstimativaProjeto findByDemanda(UUID demandaId) {
        return repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estimativa não encontrada"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");

        long qtdRf  = requisitoRepo.countByDemandaIdAndTipo(d.getId(),
                br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito.RF);
        long qtdRnf = requisitoRepo.countByDemandaIdAndTipo(d.getId(),
                br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito.RNF);
        long qtdEpicos = epicoRepo.countByDemandaId(d.getId());

        sb.append("REQUISITOS FUNCIONAIS: ").append(qtdRf).append("\n");
        sb.append("REQUISITOS NÃO FUNCIONAIS: ").append(qtdRnf).append("\n");
        sb.append("ÉPICOS NO BACKLOG: ").append(qtdEpicos).append("\n");

        if (d.getDescricao()  != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");
        if (d.getPremissas()  != null) sb.append("PREMISSAS: ").append(d.getPremissas()).append("\n");
        if (d.getRestricoes() != null) sb.append("RESTRIÇÕES: ").append(d.getRestricoes()).append("\n");
        return sb.toString();
    }

    private void parseInto(EstimativaProjeto est, String json) {
        String limpo = stripFences(json);
        try {
            JsonNode root = objectMapper.readTree(limpo);
            est.setStoryPointsTotal(root.path("storyPointsTotal").asInt(0));
            est.setHorasAnalista(toBD(root, "horasAnalista"));
            est.setHorasDev(toBD(root, "horasDev"));
            est.setHorasQa(toBD(root, "horasQa"));
            est.setHorasUx(toBD(root, "horasUx"));
            est.setPrazoSprints(root.path("prazoSprints").asInt(0));
            est.setRecursosSugeridos(safeJson(root.get("recursosSugeridos")));
            est.setMatrizEsforco(safeJson(root.get("matrizEsforco")));
            est.setResumoExecutivo(root.path("resumoExecutivo").asText(null));
        } catch (IOException e) {
            log.error("Falha ao parsear estimativas: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para estimativas");
        }
    }

    private BigDecimal toBD(JsonNode root, String field) {
        double v = root.path(field).asDouble(0);
        return v > 0 ? BigDecimal.valueOf(v) : null;
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
        try { return new ClassPathResource("prompts/estimativas-geracao.txt").getContentAsString(StandardCharsets.UTF_8); }
        catch (IOException e) { throw new IllegalStateException("Prompt estimativas-geracao.txt não encontrado", e); }
    }
}
