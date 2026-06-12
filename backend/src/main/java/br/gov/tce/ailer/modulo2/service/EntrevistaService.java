package br.gov.tce.ailer.modulo2.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.MensagemEntrevista;
import br.gov.tce.ailer.modulo2.domain.SumarioLevantamento;
import br.gov.tce.ailer.modulo2.domain.enums.RoleMensagem;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.dto.request.EnviarMensagemRequest;
import br.gov.tce.ailer.modulo2.dto.response.EntrevistaResponse;
import br.gov.tce.ailer.modulo2.dto.response.SumarioResponse;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo2.repository.MensagemEntrevistaRepository;
import br.gov.tce.ailer.modulo2.repository.SumarioLevantamentoRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EntrevistaService {

    private final EntrevistaRepository entrevistaRepository;
    private final MensagemEntrevistaRepository mensagemRepository;
    private final SumarioLevantamentoRepository sumarioRepository;
    private final DemandaRepository demandaRepository;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    @Transactional
    public EntrevistaResponse iniciar(UUID demandaId) {
        Demanda demanda = demandaRepository.findById(demandaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Demanda", demandaId));

        Entrevista entrevista = Entrevista.builder().demanda(demanda).build();
        entrevista = entrevistaRepository.save(entrevista);

        String systemPrompt = carregarPrompt("prompts/entrevista-sistema.txt");
        String contextoDemanda = """
                Contexto da demanda:
                Título: %s
                Área demandante: %s
                Tipo: %s
                Descrição: %s
                """.formatted(demanda.getTitulo(), demanda.getAreaDemandante(),
                demanda.getTipo(), demanda.getDescricao() != null ? demanda.getDescricao() : "Não informada");

        salvarMensagem(entrevista, RoleMensagem.SYSTEM, systemPrompt + "\n\n" + contextoDemanda);

        log.info("Entrevista iniciada: id={}, demanda={}", entrevista.getId(), demandaId);
        return EntrevistaResponse.from(encontrarEntrevistaComDetalhes(entrevista.getId()));
    }

    public SseEmitter enviarMensagem(UUID entrevistaId, EnviarMensagemRequest req) {
        SseEmitter emitter = new SseEmitter(90_000L);

        executor.submit(() -> {
            try {
                processarMensagem(entrevistaId, req.conteudo(), emitter);
            } catch (Exception e) {
                log.error("Erro ao processar mensagem da entrevista {}: {}", entrevistaId, e.getMessage());
                try {
                    emitter.send(SseEmitter.event().name("error").data(e.getMessage()));
                } catch (IOException ignored) {}
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    @Transactional(readOnly = true)
    public EntrevistaResponse buscar(UUID id) {
        return EntrevistaResponse.from(encontrarEntrevistaComDetalhes(id));
    }

    @Transactional
    public SumarioResponse consolidar(UUID entrevistaId) {
        Entrevista entrevista = encontrarEntrevistaComDetalhes(entrevistaId);

        if (entrevista.getStatus() == StatusEntrevista.CANCELADA) {
            throw new BusinessException("Entrevista cancelada não pode ser consolidada.");
        }

        String transcricao = construirTranscricao(entrevista);
        String promptConsolidacao = carregarPrompt("prompts/entrevista-consolidacao.txt") + transcricao;

        String jsonSumario = openAIClient.chat(List.of(ChatMessage.user(promptConsolidacao)));

        SumarioLevantamento sumario = parsearSumario(entrevista, jsonSumario);
        sumario = sumarioRepository.save(sumario);

        entrevista.setStatus(StatusEntrevista.CONCLUIDA);
        entrevistaRepository.save(entrevista);

        log.info("Entrevista consolidada: id={}", entrevistaId);
        return SumarioResponse.from(sumario);
    }

    @Transactional(readOnly = true)
    public SumarioResponse buscarSumario(UUID entrevistaId) {
        return sumarioRepository.findByEntrevistaId(entrevistaId)
                .map(SumarioResponse::from)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Sumário não encontrado. Execute a consolidação primeiro."));
    }

    // -----------------------------------------------------------------------

    private void processarMensagem(UUID entrevistaId, String conteudoUsuario, SseEmitter emitter) throws IOException {
        Entrevista entrevista = encontrarEntrevista(entrevistaId);

        if (entrevista.getStatus() != StatusEntrevista.EM_ANDAMENTO) {
            emitter.send(SseEmitter.event().name("error").data("Entrevista não está em andamento."));
            emitter.complete();
            return;
        }

        salvarMensagem(entrevista, RoleMensagem.USER, conteudoUsuario);

        List<ChatMessage> historico = mensagemRepository.findByEntrevistaIdOrderByCriadoEmAsc(entrevistaId).stream()
                .map(m -> new ChatMessage(m.getRole().name().toLowerCase(), m.getConteudo()))
                .toList();

        StringBuilder respostaCompleta = new StringBuilder();

        openAIClient.chatStream(historico,
                token -> {
                    respostaCompleta.append(token);
                    try {
                        emitter.send(SseEmitter.event().name("token").data(token));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                },
                () -> {
                    salvarMensagem(entrevista, RoleMensagem.ASSISTANT, respostaCompleta.toString());
                    try {
                        emitter.send(SseEmitter.event().name("done").data(""));
                        emitter.complete();
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                }
        );
    }

    private MensagemEntrevista salvarMensagem(Entrevista entrevista, RoleMensagem role, String conteudo) {
        MensagemEntrevista msg = MensagemEntrevista.builder()
                .entrevista(entrevista)
                .role(role)
                .conteudo(conteudo)
                .build();
        return mensagemRepository.save(msg);
    }

    private Entrevista encontrarEntrevista(UUID id) {
        return entrevistaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrevista", id));
    }

    private Entrevista encontrarEntrevistaComDetalhes(UUID id) {
        return entrevistaRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Entrevista", id));
    }

    private String construirTranscricao(Entrevista entrevista) {
        StringBuilder sb = new StringBuilder();
        entrevista.getMensagens().stream()
                .filter(m -> m.getRole() != RoleMensagem.SYSTEM)
                .forEach(m -> sb.append(m.getRole() == RoleMensagem.USER ? "USUÁRIO" : "ANALISTA IA")
                        .append(": ").append(m.getConteudo()).append("\n\n"));
        return sb.toString();
    }

    private SumarioLevantamento parsearSumario(Entrevista entrevista, String json) {
        try {
            String jsonLimpo = json.trim();
            if (jsonLimpo.startsWith("```")) {
                jsonLimpo = jsonLimpo.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
            }
            JsonNode node = objectMapper.readTree(jsonLimpo);
            int suficiencia = node.path("suficiencia").isMissingNode() ? 50 : node.path("suficiencia").asInt(50);
            String avaliacaoSuficiencia = node.path("avaliacaoSuficiencia").asText(null);
            return SumarioLevantamento.builder()
                    .entrevista(entrevista)
                    .contexto(node.path("contexto").asText())
                    .usuariosIdentificados(node.path("usuariosIdentificados").asText())
                    .processoAtual(node.path("processoAtual").asText())
                    .necessidades(node.path("necessidades").asText())
                    .regrasNegocio(node.path("regrasNegocio").asText())
                    .integracoes(node.path("integracoes").asText())
                    .restricoesPremissas(node.path("restricoesPremissas").asText())
                    .informacoesAusentes(node.path("informacoesAusentes").asText())
                    .conteudoCompleto(json)
                    .suficiencia(suficiencia)
                    .avaliacaoSuficiencia(avaliacaoSuficiencia)
                    .build();
        } catch (Exception e) {
            log.warn("Falha ao parsear JSON do sumário, salvando como texto bruto");
            return SumarioLevantamento.builder()
                    .entrevista(entrevista)
                    .conteudoCompleto(json)
                    .build();
        }
    }

    private String carregarPrompt(String caminho) {
        try {
            return new ClassPathResource(caminho)
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Prompt não encontrado: " + caminho, e);
        }
    }
}
