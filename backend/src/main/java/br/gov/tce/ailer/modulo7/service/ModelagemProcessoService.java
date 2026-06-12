package br.gov.tce.ailer.modulo7.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo7.domain.ModelagemProcesso;
import br.gov.tce.ailer.modulo7.domain.enums.StatusModelagem;
import br.gov.tce.ailer.modulo7.domain.enums.TipoFluxo;
import br.gov.tce.ailer.modulo7.dto.request.AtualizarModelagemRequest;
import br.gov.tce.ailer.modulo7.dto.request.CriarModelagemRequest;
import br.gov.tce.ailer.modulo7.dto.response.ModelagemProcessoResponse;
import br.gov.tce.ailer.modulo7.repository.ModelagemProcessoRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class ModelagemProcessoService {

    private final ModelagemProcessoRepository modelagemRepo;
    private final DemandaRepository demandaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<ModelagemProcessoResponse> gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);

        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando modelagem de processo para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt),
                ChatMessage.user(contexto)
        ));

        List<ModelagemProcesso> novos = parseModelagens(jsonResp, demandaId);

        modelagemRepo.findByDemandaIdOrderByCriadoEmAsc(demandaId).stream()
                .filter(m -> "IA".equals(m.getFonte()))
                .forEach(m -> modelagemRepo.deleteById(m.getId()));

        modelagemRepo.saveAll(novos);
        log.info("{} modelagens geradas para demanda {}", novos.size(), demandaId);
        return listar(demandaId, null);
    }

    @Transactional(readOnly = true)
    public List<ModelagemProcessoResponse> listar(UUID demandaId, TipoFluxo tipoFluxo) {
        findDemanda(demandaId);
        List<ModelagemProcesso> lista = tipoFluxo == null
                ? modelagemRepo.findByDemandaIdOrderByCriadoEmAsc(demandaId)
                : modelagemRepo.findByDemandaIdAndTipoFluxoOrderByCriadoEmAsc(demandaId, tipoFluxo);
        return lista.stream().map(ModelagemProcessoResponse::from).toList();
    }

    @Transactional
    public ModelagemProcessoResponse criar(UUID demandaId, CriarModelagemRequest req) {
        findDemanda(demandaId);
        ModelagemProcesso m = ModelagemProcesso.builder()
                .demandaId(demandaId)
                .tipoFluxo(req.tipoFluxo())
                .titulo(req.titulo())
                .descricaoTexto(req.descricaoTexto())
                .codigoMermaid(req.codigoMermaid())
                .bpmnTextual(req.bpmnTextual())
                .pontosDecisao(req.pontosDecisao())
                .integracoes(req.integracoes())
                .pontosControle(req.pontosControle())
                .statusAprovacao(StatusModelagem.RASCUNHO_IA)
                .fonte("MANUAL")
                .build();
        return ModelagemProcessoResponse.from(modelagemRepo.save(m));
    }

    @Transactional
    public ModelagemProcessoResponse atualizar(UUID id, AtualizarModelagemRequest req) {
        ModelagemProcesso m = findModelagem(id);
        if (req.titulo()          != null) m.setTitulo(req.titulo());
        if (req.descricaoTexto()  != null) m.setDescricaoTexto(req.descricaoTexto());
        if (req.codigoMermaid()   != null) m.setCodigoMermaid(req.codigoMermaid());
        if (req.bpmnTextual()     != null) m.setBpmnTextual(req.bpmnTextual());
        if (req.pontosDecisao()   != null) m.setPontosDecisao(req.pontosDecisao());
        if (req.integracoes()     != null) m.setIntegracoes(req.integracoes());
        if (req.pontosControle()  != null) m.setPontosControle(req.pontosControle());
        if (req.statusAprovacao() != null) m.setStatusAprovacao(req.statusAprovacao());
        return ModelagemProcessoResponse.from(modelagemRepo.save(m));
    }

    @Transactional
    public void excluir(UUID id) {
        findModelagem(id);
        modelagemRepo.deleteById(id);
    }

    @Transactional
    public ModelagemProcessoResponse abrirRevisao(UUID id) {
        ModelagemProcesso m = findModelagem(id);
        m.setStatusAprovacao(StatusModelagem.EM_REVISAO);
        return ModelagemProcessoResponse.from(modelagemRepo.save(m));
    }

    @Transactional
    public ModelagemProcessoResponse aprovar(UUID id, String aprovadoPor) {
        ModelagemProcesso m = findModelagem(id);
        if (m.getStatusAprovacao() != StatusModelagem.EM_REVISAO) {
            throw new BusinessException("Modelagem deve estar EM_REVISAO para ser aprovada.");
        }
        m.setStatusAprovacao(StatusModelagem.APROVADO);
        m.setAprovadoPor(aprovadoPor);
        m.setAprovadoEm(LocalDateTime.now());
        return ModelagemProcessoResponse.from(modelagemRepo.save(m));
    }

    @Transactional
    public ModelagemProcessoResponse publicar(UUID id) {
        ModelagemProcesso m = findModelagem(id);
        if (m.getStatusAprovacao() != StatusModelagem.APROVADO) {
            throw new BusinessException("Modelagem deve estar APROVADA antes de publicar.");
        }
        m.setStatusAprovacao(StatusModelagem.PUBLICADO);
        return ModelagemProcessoResponse.from(modelagemRepo.save(m));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private ModelagemProcesso findModelagem(UUID id) {
        return modelagemRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelagem não encontrada"));
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
            if (c.getProblema()         != null) sb.append("Problema: ").append(c.getProblema()).append("\n");
            if (c.getSolucaoProposta()  != null) sb.append("Solução: ").append(c.getSolucaoProposta()).append("\n");
            if (c.getIntegracoes()      != null) sb.append("Integrações: ").append(c.getIntegracoes()).append("\n");
        });

        return sb.toString();
    }

    private List<ModelagemProcesso> parseModelagens(String json, UUID demandaId) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            JsonNode root = objectMapper.readTree(limpo);
            JsonNode arr  = root.get("modelagens");
            if (arr == null || !arr.isArray()) throw new IllegalStateException("Campo 'modelagens' ausente");

            List<ModelagemProcesso> lista = new ArrayList<>();
            StreamSupport.stream(arr.spliterator(), false).forEach(node -> {
                TipoFluxo tipo;
                try {
                    tipo = TipoFluxo.valueOf(node.path("tipoFluxo").asText("AS_IS").toUpperCase());
                } catch (IllegalArgumentException e) {
                    tipo = TipoFluxo.AS_IS;
                }

                ModelagemProcesso m = ModelagemProcesso.builder()
                        .demandaId(demandaId)
                        .tipoFluxo(tipo)
                        .titulo(node.path("titulo").asText("Processo"))
                        .descricaoTexto(node.path("descricaoTexto").asText(null))
                        .codigoMermaid(node.path("codigoMermaid").asText(null))
                        .bpmnTextual(node.path("bpmnTextual").asText(null))
                        .pontosDecisao(safeJson(node.get("pontosDecisao")))
                        .integracoes(safeJson(node.get("integracoes")))
                        .pontosControle(safeJson(node.get("pontosControle")))
                        .statusAprovacao(StatusModelagem.RASCUNHO_IA)
                        .fonte("IA")
                        .build();
                lista.add(m);
            });
            return lista;
        } catch (IOException e) {
            log.error("Falha ao parsear modelagem JSON: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para modelagem de processo");
        }
    }

    private String safeJson(JsonNode node) {
        if (node == null || node.isNull()) return null;
        try {
            return objectMapper.writeValueAsString(node);
        } catch (IOException e) {
            return null;
        }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/modelagem-processo.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt modelagem-processo.txt não encontrado", e);
        }
    }
}
