package br.gov.tce.ailer.modulo14.controller;

import br.gov.tce.ailer.modulo14.domain.enums.TipoAgente;
import br.gov.tce.ailer.modulo14.dto.request.EnviarMensagemAgenteRequest;
import br.gov.tce.ailer.modulo14.dto.response.AgenteMensagemResponse;
import br.gov.tce.ailer.modulo14.dto.response.AgenteSessaoResponse;
import br.gov.tce.ailer.modulo14.service.AgenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/demandas/{demandaId}/agentes")
@Tag(name = "Módulo 14 — Agentes Especializados de IA", description = "Agentes de IA com papéis distintos para apoio ao ciclo de requisitos")
public class AgenteController {

    private final AgenteService agenteService;

    @PostMapping("/sessoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar nova sessão com um agente especializado")
    public AgenteSessaoResponse criarSessao(
            @PathVariable UUID demandaId,
            @RequestParam TipoAgente tipoAgente,
            Principal principal) {
        String criadoPor = principal != null ? principal.getName() : "sistema";
        return agenteService.criarSessao(demandaId, tipoAgente, criadoPor);
    }

    @GetMapping("/sessoes")
    @Operation(summary = "Listar sessões de agentes da demanda")
    public List<AgenteSessaoResponse> listarSessoes(@PathVariable UUID demandaId) {
        return agenteService.listarSessoes(demandaId);
    }

    @GetMapping("/sessoes/{sessaoId}/mensagens")
    @Operation(summary = "Listar mensagens de uma sessão de agente")
    public List<AgenteMensagemResponse> listarMensagens(
            @PathVariable UUID demandaId,
            @PathVariable UUID sessaoId) {
        return agenteService.listarMensagens(sessaoId);
    }

    @PostMapping(value = "/sessoes/{sessaoId}/mensagens",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Enviar mensagem ao agente (resposta via streaming SSE)")
    public SseEmitter enviarMensagem(
            @PathVariable UUID demandaId,
            @PathVariable UUID sessaoId,
            @Valid @RequestBody EnviarMensagemAgenteRequest request) {
        return agenteService.enviarMensagem(sessaoId, request.conteudo());
    }
}
