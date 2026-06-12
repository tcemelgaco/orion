package br.gov.tce.ailer.modulo8.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo8.domain.PrototipoSistema;
import br.gov.tce.ailer.modulo8.domain.enums.StatusPrototipo;
import br.gov.tce.ailer.modulo8.dto.response.PrototipoSistemaResponse;
import br.gov.tce.ailer.modulo8.repository.PrototipoSistemaRepository;
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
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrototipoSistemaService {

    private final PrototipoSistemaRepository repo;
    private final DemandaRepository demandaRepo;
    private final RequisitoRepository requisitoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public PrototipoSistemaResponse gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);
        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando protótipo assistido por IA para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt), ChatMessage.user(contexto)));

        PrototipoSistema prototipo = repo.findByDemandaId(demandaId)
                .orElse(PrototipoSistema.builder().demandaId(demandaId).build());

        parseInto(prototipo, jsonResp);
        prototipo.setFonte("IA");
        prototipo.setStatusAprovacao(StatusPrototipo.RASCUNHO_IA);

        return PrototipoSistemaResponse.from(repo.save(prototipo));
    }

    @Transactional(readOnly = true)
    public PrototipoSistemaResponse buscar(UUID demandaId) {
        findDemanda(demandaId);
        return repo.findByDemandaId(demandaId)
                .map(PrototipoSistemaResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Protótipo ainda não gerado para esta demanda."));
    }

    @Transactional
    public PrototipoSistemaResponse atualizarManual(UUID demandaId, Map<String, String> payload) {
        PrototipoSistema p = findByDemanda(demandaId);

        if (payload.containsKey("descricaoGeral"))       p.setDescricaoGeral(payload.get("descricaoGeral"));
        if (payload.containsKey("telas"))                p.setTelas(payload.get("telas"));
        if (payload.containsKey("fluxoNavegacao"))       p.setFluxoNavegacao(payload.get("fluxoNavegacao"));
        if (payload.containsKey("componentesPrincipais")) p.setComponentesPrincipais(payload.get("componentesPrincipais"));
        if (payload.containsKey("paleta"))               p.setPaleta(payload.get("paleta"));
        if (payload.containsKey("diretrizes"))           p.setDiretrizes(payload.get("diretrizes"));
        if (payload.containsKey("notasAcessibilidade"))  p.setNotasAcessibilidade(payload.get("notasAcessibilidade"));
        if (payload.containsKey("tecnologiasSugeridas")) p.setTecnologiasSugeridas(payload.get("tecnologiasSugeridas"));

        p.setFonte("MANUAL");
        log.info("Protótipo da demanda {} atualizado manualmente", demandaId);
        return PrototipoSistemaResponse.from(repo.save(p));
    }

    @Transactional
    public PrototipoSistemaResponse abrirRevisao(UUID demandaId) {
        PrototipoSistema p = findByDemanda(demandaId);
        p.setStatusAprovacao(StatusPrototipo.EM_REVISAO);
        return PrototipoSistemaResponse.from(repo.save(p));
    }

    @Transactional
    public PrototipoSistemaResponse aprovar(UUID demandaId, String aprovadoPor) {
        PrototipoSistema p = findByDemanda(demandaId);
        if (p.getStatusAprovacao() != StatusPrototipo.EM_REVISAO)
            throw new BusinessException("Protótipo deve estar EM_REVISAO para ser aprovado.");
        p.setStatusAprovacao(StatusPrototipo.APROVADO);
        p.setAprovadoPor(aprovadoPor);
        p.setAprovadoEm(LocalDateTime.now());
        return PrototipoSistemaResponse.from(repo.save(p));
    }

    @Transactional
    public PrototipoSistemaResponse publicar(UUID demandaId) {
        PrototipoSistema p = findByDemanda(demandaId);
        if (p.getStatusAprovacao() != StatusPrototipo.APROVADO)
            throw new BusinessException("Protótipo deve estar APROVADO antes de publicar.");
        p.setStatusAprovacao(StatusPrototipo.PUBLICADO);
        return PrototipoSistemaResponse.from(repo.save(p));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private PrototipoSistema findByDemanda(UUID demandaId) {
        return repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Protótipo não encontrado"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao() != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");

        var requisitos = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(d.getId());
        if (!requisitos.isEmpty()) {
            sb.append("\n--- REQUISITOS (primeiros 15) ---\n");
            requisitos.stream().limit(15).forEach(r ->
                    sb.append(r.getCodigo()).append(": ").append(r.getTitulo())
                      .append(" [").append(r.getTipo()).append("]")
                      .append(r.getDescricao() != null ? " — " + r.getDescricao() : "")
                      .append("\n"));
        }
        return sb.toString();
    }

    private void parseInto(PrototipoSistema p, String json) {
        String limpo = stripFences(json);
        try {
            JsonNode root = objectMapper.readTree(limpo);
            p.setDescricaoGeral(safeText(root.get("descricaoGeral")));
            p.setTelas(safeJson(root.get("telas")));
            p.setFluxoNavegacao(safeJson(root.get("fluxoNavegacao")));
            p.setComponentesPrincipais(safeJson(root.get("componentesPrincipais")));
            p.setPaleta(safeText(root.get("paleta")));
            p.setDiretrizes(safeText(root.get("diretrizes")));
            p.setNotasAcessibilidade(safeText(root.get("notasAcessibilidade")));
            p.setTecnologiasSugeridas(safeJson(root.get("tecnologiasSugeridas")));
        } catch (IOException e) {
            log.error("Falha ao parsear protótipo: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para o protótipo");
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

    /** Serializa o nó de volta para String JSON (para arrays/objects). */
    private String safeJson(JsonNode node) {
        if (node == null || node.isNull()) return null;
        try { return objectMapper.writeValueAsString(node); }
        catch (IOException e) { return null; }
    }

    /** Retorna o texto plano do nó (para campos escalares). */
    private String safeText(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isTextual()) return node.asText();
        return node.toString();
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/prototipo-geracao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt prototipo-geracao.txt não encontrado", e);
        }
    }
}
