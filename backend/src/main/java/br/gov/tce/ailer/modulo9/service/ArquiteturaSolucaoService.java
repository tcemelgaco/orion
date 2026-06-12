package br.gov.tce.ailer.modulo9.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo9.domain.ArquiteturaSolucao;
import br.gov.tce.ailer.modulo9.domain.enums.StatusArquitetura;
import br.gov.tce.ailer.modulo9.domain.enums.VisaoArquitetural;
import br.gov.tce.ailer.modulo9.dto.request.AtualizarArquiteturaRequest;
import br.gov.tce.ailer.modulo9.dto.response.ArquiteturaSolucaoResponse;
import br.gov.tce.ailer.modulo9.repository.ArquiteturaSolucaoRepository;
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
public class ArquiteturaSolucaoService {

    private final ArquiteturaSolucaoRepository repo;
    private final DemandaRepository demandaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final RequisitoRepository requisitoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public ArquiteturaSolucaoResponse gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);
        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt("prompts/arquitetura-geracao.txt");

        log.info("Gerando arquitetura para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt), ChatMessage.user(contexto)));

        ArquiteturaSolucao arq = repo.findByDemandaId(demandaId)
                .orElse(ArquiteturaSolucao.builder().demandaId(demandaId).build());

        parseInto(arq, jsonResp);
        arq.setFonte("IA");
        arq.setStatusAprovacao(StatusArquitetura.RASCUNHO_IA);

        return ArquiteturaSolucaoResponse.from(repo.save(arq));
    }

    @Transactional(readOnly = true)
    public ArquiteturaSolucaoResponse buscar(UUID demandaId) {
        findDemanda(demandaId);
        return repo.findByDemandaId(demandaId)
                .map(ArquiteturaSolucaoResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Arquitetura ainda não gerada para esta demanda."));
    }

    @Transactional
    public ArquiteturaSolucaoResponse atualizar(UUID demandaId, AtualizarArquiteturaRequest req) {
        findDemanda(demandaId);
        ArquiteturaSolucao arq = repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquitetura não encontrada"));
        if (req.visaoArquitetural() != null) arq.setVisaoArquitetural(req.visaoArquitetural());
        if (req.componentes()       != null) arq.setComponentes(req.componentes());
        if (req.integracoes()       != null) arq.setIntegracoes(req.integracoes());
        if (req.modeloDados()       != null) arq.setModeloDados(req.modeloDados());
        if (req.adrs()              != null) arq.setAdrs(req.adrs());
        if (req.recomendacoes()     != null) arq.setRecomendacoes(req.recomendacoes());
        if (req.diagramaMermaid()   != null) arq.setDiagramaMermaid(req.diagramaMermaid());
        return ArquiteturaSolucaoResponse.from(repo.save(arq));
    }

    @Transactional
    public ArquiteturaSolucaoResponse abrirRevisao(UUID demandaId) {
        ArquiteturaSolucao arq = findByDemanda(demandaId);
        arq.setStatusAprovacao(StatusArquitetura.EM_REVISAO);
        return ArquiteturaSolucaoResponse.from(repo.save(arq));
    }

    @Transactional
    public ArquiteturaSolucaoResponse aprovar(UUID demandaId, String aprovadoPor) {
        ArquiteturaSolucao arq = findByDemanda(demandaId);
        if (arq.getStatusAprovacao() != StatusArquitetura.EM_REVISAO)
            throw new BusinessException("Arquitetura deve estar EM_REVISAO para ser aprovada.");
        arq.setStatusAprovacao(StatusArquitetura.APROVADO);
        arq.setAprovadoPor(aprovadoPor);
        arq.setAprovadoEm(LocalDateTime.now());
        return ArquiteturaSolucaoResponse.from(repo.save(arq));
    }

    @Transactional
    public ArquiteturaSolucaoResponse publicar(UUID demandaId) {
        ArquiteturaSolucao arq = findByDemanda(demandaId);
        if (arq.getStatusAprovacao() != StatusArquitetura.APROVADO)
            throw new BusinessException("Arquitetura deve estar APROVADA antes de publicar.");
        arq.setStatusAprovacao(StatusArquitetura.PUBLICADO);
        return ArquiteturaSolucaoResponse.from(repo.save(arq));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private ArquiteturaSolucao findByDemanda(UUID demandaId) {
        return repo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquitetura não encontrada"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao()  != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");
        if (d.getPremissas()  != null) sb.append("PREMISSAS: ").append(d.getPremissas()).append("\n");
        if (d.getRestricoes() != null) sb.append("RESTRIÇÕES: ").append(d.getRestricoes()).append("\n");

        canvasRepo.findByDemandaId(d.getId()).ifPresent(c -> {
            sb.append("\n--- CANVAS ---\n");
            if (c.getContexto()         != null) sb.append("Contexto: ").append(c.getContexto()).append("\n");
            if (c.getSolucaoProposta()  != null) sb.append("Solução: ").append(c.getSolucaoProposta()).append("\n");
            if (c.getIntegracoes()      != null) sb.append("Integrações: ").append(c.getIntegracoes()).append("\n");
        });

        var rfs = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(d.getId());
        if (!rfs.isEmpty()) {
            sb.append("\n--- REQUISITOS (primeiros 15) ---\n");
            rfs.stream().limit(15).forEach(r ->
                    sb.append(r.getCodigo()).append(": ").append(r.getTitulo()).append("\n"));
        }
        return sb.toString();
    }

    private void parseInto(ArquiteturaSolucao arq, String json) {
        String limpo = stripFences(json);
        try {
            JsonNode root = objectMapper.readTree(limpo);
            String vis = root.path("visaoArquitetural").asText(null);
            if (vis != null) {
                try { arq.setVisaoArquitetural(VisaoArquitetural.valueOf(vis)); }
                catch (IllegalArgumentException ignored) {}
            }
            arq.setComponentes(safeJson(root.get("componentes")));
            arq.setIntegracoes(safeJson(root.get("integracoes")));
            arq.setModeloDados(safeJson(root.get("modeloDados")));
            arq.setAdrs(safeJson(root.get("adrs")));
            arq.setRecomendacoes(root.path("recomendacoes").asText(null));
            arq.setDiagramaMermaid(root.path("diagramaMermaid").asText(null));
        } catch (IOException e) {
            log.error("Falha ao parsear arquitetura: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para arquitetura");
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

    private String loadPrompt(String path) {
        try { return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8); }
        catch (IOException e) { throw new IllegalStateException("Prompt não encontrado: " + path, e); }
    }
}
