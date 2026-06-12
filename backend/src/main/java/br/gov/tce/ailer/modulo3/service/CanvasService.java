package br.gov.tce.ailer.modulo3.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.SumarioLevantamento;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;
import br.gov.tce.ailer.modulo3.dto.request.AtualizarCanvasRequest;
import br.gov.tce.ailer.modulo3.dto.response.CanvasProjetoResponse;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;
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
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CanvasService {

    private final CanvasProjetoRepository canvasRepo;
    private final DemandaRepository demandaRepo;
    private final EntrevistaRepository entrevistaRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public CanvasProjetoResponse gerar(UUID demandaId) {
        Demanda demanda = demandaRepo.findById(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));

        String contexto = buildContexto(demanda);
        String promptTemplate = loadPrompt();

        log.info("Gerando canvas para demanda {}", demandaId);

        String jsonResposta = openAIClient.chat(List.of(
                ChatMessage.system(promptTemplate),
                ChatMessage.user(contexto)
        ));

        CanvasProjeto canvas = parseCanvas(jsonResposta, demandaId);

        CanvasProjeto salvo = canvasRepo.findByDemandaId(demandaId)
                .map(existente -> {
                    existente.setContexto(canvas.getContexto());
                    existente.setProblema(canvas.getProblema());
                    existente.setSolucaoProposta(canvas.getSolucaoProposta());
                    existente.setUsuarios(canvas.getUsuarios());
                    existente.setFuncionalidadesChave(canvas.getFuncionalidadesChave());
                    existente.setRestricoes(canvas.getRestricoes());
                    existente.setPremissas(canvas.getPremissas());
                    existente.setRiscos(canvas.getRiscos());
                    existente.setCriteriosSucesso(canvas.getCriteriosSucesso());
                    existente.setIntegracoes(canvas.getIntegracoes());
                    existente.setGeradoPorIa(true);
                    return canvasRepo.save(existente);
                })
                .orElseGet(() -> canvasRepo.save(canvas));

        log.info("Canvas {} para demanda {}", salvo.getId(), demandaId);
        return CanvasProjetoResponse.from(salvo, demanda.getTitulo());
    }

    @Transactional(readOnly = true)
    public CanvasProjetoResponse buscar(UUID demandaId) {
        Demanda demanda = demandaRepo.findById(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
        CanvasProjeto canvas = canvasRepo.findByDemandaId(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Canvas não gerado ainda. Use POST /demandas/{id}/canvas para gerar."));
        return CanvasProjetoResponse.from(canvas, demanda.getTitulo());
    }

    @Transactional
    public CanvasProjetoResponse atualizar(UUID canvasId, AtualizarCanvasRequest req) {
        CanvasProjeto canvas = canvasRepo.findById(canvasId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Canvas não encontrado"));

        Demanda demanda = demandaRepo.findById(canvas.getDemandaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));

        if (req.contexto()             != null) canvas.setContexto(req.contexto());
        if (req.problema()             != null) canvas.setProblema(req.problema());
        if (req.solucaoProposta()      != null) canvas.setSolucaoProposta(req.solucaoProposta());
        if (req.usuarios()             != null) canvas.setUsuarios(req.usuarios());
        if (req.funcionalidadesChave() != null) canvas.setFuncionalidadesChave(req.funcionalidadesChave());
        if (req.restricoes()           != null) canvas.setRestricoes(req.restricoes());
        if (req.premissas()            != null) canvas.setPremissas(req.premissas());
        if (req.riscos()               != null) canvas.setRiscos(req.riscos());
        if (req.criteriosSucesso()     != null) canvas.setCriteriosSucesso(req.criteriosSucesso());
        if (req.integracoes()          != null) canvas.setIntegracoes(req.integracoes());
        canvas.setGeradoPorIa(false);

        return CanvasProjetoResponse.from(canvasRepo.save(canvas), demanda.getTitulo());
    }

    @Transactional
    public CanvasProjetoResponse abrirRevisao(UUID canvasId) {
        CanvasProjeto canvas = findCanvas(canvasId);
        canvas.setStatusAprovacao(StatusAprovacao.EM_REVISAO);
        Demanda demanda = demandaRepo.findById(canvas.getDemandaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
        return CanvasProjetoResponse.from(canvasRepo.save(canvas), demanda.getTitulo());
    }

    @Transactional
    public CanvasProjetoResponse aprovar(UUID canvasId, String aprovadoPor) {
        CanvasProjeto canvas = findCanvas(canvasId);
        canvas.setStatusAprovacao(StatusAprovacao.APROVADO);
        canvas.setAprovadoPor(aprovadoPor);
        canvas.setAprovadoEm(OffsetDateTime.now());
        Demanda demanda = demandaRepo.findById(canvas.getDemandaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
        return CanvasProjetoResponse.from(canvasRepo.save(canvas), demanda.getTitulo());
    }

    @Transactional
    public CanvasProjetoResponse publicar(UUID canvasId) {
        CanvasProjeto canvas = findCanvas(canvasId);
        if (canvas.getStatusAprovacao() != StatusAprovacao.APROVADO) {
            throw new BusinessException("Canvas deve estar APROVADO antes de publicar.");
        }
        canvas.setStatusAprovacao(StatusAprovacao.PUBLICADO);
        Demanda demanda = demandaRepo.findById(canvas.getDemandaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
        return CanvasProjetoResponse.from(canvasRepo.save(canvas), demanda.getTitulo());
    }

    private CanvasProjeto findCanvas(UUID canvasId) {
        return canvasRepo.findById(canvasId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Canvas não encontrado"));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private String buildContexto(Demanda demanda) {
        StringBuilder sb = new StringBuilder();
        sb.append("TÍTULO DA DEMANDA: ").append(demanda.getTitulo()).append("\n");
        sb.append("TIPO: ").append(demanda.getTipo().name()).append("\n");
        sb.append("ÁREA DEMANDANTE: ").append(demanda.getAreaDemandante()).append("\n");
        if (demanda.getDescricao() != null)
            sb.append("DESCRIÇÃO: ").append(demanda.getDescricao()).append("\n");
        if (demanda.getPremissas() != null)
            sb.append("PREMISSAS INFORMADAS: ").append(demanda.getPremissas()).append("\n");
        if (demanda.getRestricoes() != null)
            sb.append("RESTRIÇÕES INFORMADAS: ").append(demanda.getRestricoes()).append("\n");
        if (!demanda.getStakeholders().isEmpty()) {
            sb.append("STAKEHOLDERS CADASTRADOS: ");
            demanda.getStakeholders().forEach(s ->
                    sb.append(s.getNome()).append(" (").append(s.getPapel().name()).append("), "));
            sb.append("\n");
        }

        entrevistaRepo.findByDemandaId(demanda.getId())
                .stream()
                .filter(e -> e.getStatus() == StatusEntrevista.CONCLUIDA)
                .findFirst()
                .map(Entrevista::getSumario)
                .ifPresent(sumario -> appendSumario(sb, sumario));

        return sb.toString();
    }

    private void appendSumario(StringBuilder sb, SumarioLevantamento s) {
        sb.append("\n--- SUMÁRIO DO LEVANTAMENTO DE REQUISITOS ---\n");
        if (s.getContexto()             != null) sb.append("Contexto: ").append(s.getContexto()).append("\n");
        if (s.getNecessidades()         != null) sb.append("Necessidades: ").append(s.getNecessidades()).append("\n");
        if (s.getUsuariosIdentificados()!= null) sb.append("Usuários: ").append(s.getUsuariosIdentificados()).append("\n");
        if (s.getProcessoAtual()        != null) sb.append("Processo atual: ").append(s.getProcessoAtual()).append("\n");
        if (s.getRegrasNegocio()        != null) sb.append("Regras de negócio: ").append(s.getRegrasNegocio()).append("\n");
        if (s.getIntegracoes()          != null) sb.append("Integrações: ").append(s.getIntegracoes()).append("\n");
        if (s.getRestricoesPremissas()  != null) sb.append("Restrições/Premissas: ").append(s.getRestricoesPremissas()).append("\n");
    }

    private CanvasProjeto parseCanvas(String json, UUID demandaId) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int inicio = limpo.indexOf('{');
            int fim    = limpo.lastIndexOf('}');
            if (inicio >= 0 && fim > inicio) limpo = limpo.substring(inicio, fim + 1);
        }
        try {
            JsonNode node = objectMapper.readTree(limpo);
            return CanvasProjeto.builder()
                    .demandaId(demandaId)
                    .contexto(text(node, "contexto"))
                    .problema(text(node, "problema"))
                    .solucaoProposta(text(node, "solucaoProposta"))
                    .usuarios(text(node, "usuarios"))
                    .funcionalidadesChave(text(node, "funcionalidadesChave"))
                    .restricoes(text(node, "restricoes"))
                    .premissas(text(node, "premissas"))
                    .riscos(text(node, "riscos"))
                    .criteriosSucesso(text(node, "criteriosSucesso"))
                    .integracoes(text(node, "integracoes"))
                    .geradoPorIa(true)
                    .build();
        } catch (IOException e) {
            log.error("Falha ao parsear canvas JSON: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA");
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode n = node.get(field);
        return (n != null && !n.isNull()) ? n.asText() : null;
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/canvas-geracao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt canvas-geracao.txt não encontrado", e);
        }
    }
}
