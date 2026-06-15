package br.gov.tce.ailer.modulo14.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo14.domain.AgenteMensagem;
import br.gov.tce.ailer.modulo14.domain.AgenteSessao;
import br.gov.tce.ailer.modulo14.domain.enums.TipoAgente;
import br.gov.tce.ailer.modulo14.dto.response.AgenteMensagemResponse;
import br.gov.tce.ailer.modulo14.dto.response.AgenteSessaoResponse;
import br.gov.tce.ailer.modulo14.repository.AgenteMensagemRepository;
import br.gov.tce.ailer.modulo14.repository.AgenteSessaoRepository;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgenteService {

    private final AgenteSessaoRepository sessaoRepository;
    private final AgenteMensagemRepository mensagemRepository;
    private final DemandaRepository demandaRepository;
    private final OpenAIClient openAIClient;

    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    @Transactional
    public AgenteSessaoResponse criarSessao(UUID demandaId, TipoAgente tipoAgente, String criadoPor) {
        Demanda demanda = demandaRepository.findById(demandaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Demanda", demandaId));

        String tituloTruncado = demanda.getTitulo().length() > 80
                ? demanda.getTitulo().substring(0, 80)
                : demanda.getTitulo();

        String titulo = tipoAgente.displayName + " — " + tituloTruncado;

        AgenteSessao sessao = AgenteSessao.builder()
                .demandaId(demandaId)
                .tipoAgente(tipoAgente)
                .titulo(titulo)
                .build();

        sessao = sessaoRepository.save(sessao);

        log.info("Sessao de agente criada: id={}, tipo={}, demanda={}", sessao.getId(), tipoAgente, demandaId);
        return AgenteSessaoResponse.from(sessao);
    }

    @Transactional(readOnly = true)
    public List<AgenteSessaoResponse> listarSessoes(UUID demandaId) {
        return sessaoRepository.findByDemandaId(demandaId).stream()
                .map(AgenteSessaoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgenteMensagemResponse> listarMensagens(UUID sessaoId) {
        return mensagemRepository.findBySessaoIdOrderByCriadoEmAsc(sessaoId).stream()
                .map(AgenteMensagemResponse::from)
                .toList();
    }

    public SseEmitter enviarMensagem(UUID sessaoId, String conteudo) {
        SseEmitter emitter = new SseEmitter(90_000L);

        executor.submit(() -> {
            try {
                processarMensagem(sessaoId, conteudo, emitter);
            } catch (Exception e) {
                log.error("Erro ao processar mensagem do agente {}: {}", sessaoId, e.getMessage());
                try {
                    emitter.send(SseEmitter.event().name("error").data(e.getMessage()));
                } catch (IOException ignored) {}
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    // -----------------------------------------------------------------------

    private void processarMensagem(UUID sessaoId, String conteudoUsuario, SseEmitter emitter) throws IOException {
        AgenteSessao sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sessão de agente", sessaoId));

        Demanda demanda = demandaRepository.findById(sessao.getDemandaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Demanda", sessao.getDemandaId()));

        salvarMensagem(sessaoId, "USUARIO", conteudoUsuario);

        List<AgenteMensagem> historicoSalvo = mensagemRepository.findBySessaoIdOrderByCriadoEmAsc(sessaoId);

        List<ChatMessage> historico = new ArrayList<>();
        historico.add(ChatMessage.system(buildSystemPrompt(sessao, demanda)));
        for (AgenteMensagem m : historicoSalvo) {
            String role = "USUARIO".equals(m.getPapel()) ? "user" : "assistant";
            historico.add(new ChatMessage(role, m.getConteudo()));
        }

        AtomicReference<StringBuilder> respostaRef = new AtomicReference<>(new StringBuilder());

        openAIClient.chatStream(historico,
                token -> {
                    respostaRef.get().append(token);
                    try {
                        emitter.send(SseEmitter.event().name("token").data(token));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                },
                () -> {
                    String respostaCompleta = respostaRef.get().toString();
                    salvarMensagem(sessaoId, "AGENTE", respostaCompleta);
                    try {
                        emitter.send(SseEmitter.event().name("done").data(""));
                        emitter.complete();
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                }
        );
    }

    private AgenteMensagem salvarMensagem(UUID sessaoId, String papel, String conteudo) {
        AgenteMensagem msg = AgenteMensagem.builder()
                .sessaoId(sessaoId)
                .papel(papel)
                .conteudo(conteudo)
                .build();
        return mensagemRepository.save(msg);
    }

    private String buildSystemPrompt(AgenteSessao sessao, Demanda demanda) {
        String promptBase = carregarPrompt("prompts/" + sessao.getTipoAgente().promptFile);
        String tipo = demanda.getTipo() != null ? demanda.getTipo().name() : "Não informado";
        String area = demanda.getAreaDemandante() != null ? demanda.getAreaDemandante() : "Não informada";
        String descricao = demanda.getDescricao() != null ? demanda.getDescricao() : "Não informada";

        return promptBase
                .replace("{TITULO}", demanda.getTitulo())
                .replace("{TIPO}", tipo)
                .replace("{AREA}", area)
                .replace("{DESCRICAO}", descricao);
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
