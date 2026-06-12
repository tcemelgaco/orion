package br.gov.tce.ailer.modulo12.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo12.domain.ConformidadeQualidade;
import br.gov.tce.ailer.modulo12.domain.enums.StatusConformidade;
import br.gov.tce.ailer.modulo12.dto.response.ConformidadeQualidadeResponse;
import br.gov.tce.ailer.modulo12.repository.ConformidadeQualidadeRepository;
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
public class ConformidadeQualidadeService {

    private final ConformidadeQualidadeRepository repo;
    private final DemandaRepository demandaRepo;
    private final RequisitoRepository requisitoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public ConformidadeQualidadeResponse gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);
        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando análise de conformidade para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt), ChatMessage.user(contexto)));

        ConformidadeQualidade conf = repo.findByDemandaId(demandaId)
                .orElse(ConformidadeQualidade.builder().demandaId(demandaId).build());

        parseInto(conf, jsonResp);
        conf.setFonte("IA");
        conf.setStatusAprovacao(StatusConformidade.RASCUNHO_IA);

        return ConformidadeQualidadeResponse.from(repo.save(conf));
    }

    @Transactional(readOnly = true)
    public ConformidadeQualidadeResponse buscar(UUID demandaId) {
        findDemanda(demandaId);
        return repo.findByDemandaId(demandaId)
                .map(ConformidadeQualidadeResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Análise de conformidade ainda não gerada para esta demanda."));
    }

    @Transactional
    public ConformidadeQualidadeResponse abrirRevisao(UUID demandaId) {
        ConformidadeQualidade c = findByDemanda(demandaId);
        c.setStatusAprovacao(StatusConformidade.EM_REVISAO);
        return ConformidadeQualidadeResponse.from(repo.save(c));
    }

    @Transactional
    public ConformidadeQualidadeResponse aprovar(UUID demandaId, String aprovadoPor) {
        ConformidadeQualidade c = findByDemanda(demandaId);
        if (c.getStatusAprovacao() != StatusConformidade.EM_REVISAO)
            throw new BusinessException("Análise deve estar EM_REVISAO para ser aprovada.");
        c.setStatusAprovacao(StatusConformidade.APROVADO);
        c.setAprovadoPor(aprovadoPor);
        c.setAprovadoEm(LocalDateTime.now());
        return ConformidadeQualidadeResponse.from(repo.save(c));
    }

    @Transactional
    public ConformidadeQualidadeResponse publicar(UUID demandaId) {
        ConformidadeQualidade c = findByDemanda(demandaId);
        if (c.getStatusAprovacao() != StatusConformidade.APROVADO)
            throw new BusinessException("Análise deve estar APROVADA antes de publicar.");
        c.setStatusAprovacao(StatusConformidade.PUBLICADO);
        return ConformidadeQualidadeResponse.from(repo.save(c));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private ConformidadeQualidade findByDemanda(UUID demandaId) {
        return repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Análise não encontrada"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao() != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");

        var requisitos = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(d.getId());
        if (!requisitos.isEmpty()) {
            sb.append("\n--- REQUISITOS (primeiros 20) ---\n");
            requisitos.stream().limit(20).forEach(r ->
                    sb.append(r.getCodigo()).append(": ").append(r.getTitulo())
                      .append(" [").append(r.getTipo()).append("]")
                      .append(r.getDescricao() != null ? " — " + r.getDescricao() : "")
                      .append("\n"));
        }
        return sb.toString();
    }

    private void parseInto(ConformidadeQualidade conf, String json) {
        String limpo = stripFences(json);
        try {
            JsonNode root = objectMapper.readTree(limpo);
            conf.setAnaliseLgpd(safeJson(root.get("analiseLgpd")));
            conf.setAnaliseSeguranca(safeJson(root.get("analiseSeguranca")));
            conf.setAnaliseAcessibilidade(safeJson(root.get("analiseAcessibilidade")));
            conf.setQualidadeRequisitos(safeJson(root.get("qualidadeRequisitos")));
            conf.setPendencias(safeJson(root.get("pendencias")));
            int score = root.path("scoreGeral").asInt(0);
            conf.setScoreGeral(score > 0 ? score : null);
        } catch (IOException e) {
            log.error("Falha ao parsear conformidade: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para conformidade");
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
        try { return new ClassPathResource("prompts/conformidade-geracao.txt").getContentAsString(StandardCharsets.UTF_8); }
        catch (IOException e) { throw new IllegalStateException("Prompt conformidade-geracao.txt não encontrado", e); }
    }
}
