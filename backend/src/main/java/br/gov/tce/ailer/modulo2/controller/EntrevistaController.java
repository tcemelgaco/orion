package br.gov.tce.ailer.modulo2.controller;

import br.gov.tce.ailer.modulo2.dto.request.EnviarMensagemRequest;
import br.gov.tce.ailer.modulo2.dto.response.EntrevistaResponse;
import br.gov.tce.ailer.modulo2.dto.response.SumarioResponse;
import br.gov.tce.ailer.modulo2.service.EntrevistaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Módulo 2 — Entrevista Inteligente", description = "Assistente conversacional de levantamento de requisitos")
public class EntrevistaController {

    private final EntrevistaService entrevistaService;

    @PostMapping("/api/v1/demandas/{demandaId}/entrevistas")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Iniciar nova entrevista para a demanda")
    public EntrevistaResponse iniciar(@PathVariable UUID demandaId) {
        return entrevistaService.iniciar(demandaId);
    }

    @GetMapping("/api/v1/entrevistas/{id}")
    @Operation(summary = "Buscar entrevista com histórico de mensagens")
    public EntrevistaResponse buscar(@PathVariable UUID id) {
        return entrevistaService.buscar(id);
    }

    @PostMapping(value = "/api/v1/entrevistas/{id}/mensagens",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Enviar mensagem (resposta via streaming SSE)")
    public SseEmitter enviarMensagem(@PathVariable UUID id,
                                     @Valid @RequestBody EnviarMensagemRequest request) {
        return entrevistaService.enviarMensagem(id, request);
    }

    @PostMapping("/api/v1/entrevistas/{id}/consolidar")
    @Operation(summary = "Consolidar entrevista e gerar sumário estruturado")
    public SumarioResponse consolidar(@PathVariable UUID id) {
        return entrevistaService.consolidar(id);
    }

    @GetMapping("/api/v1/entrevistas/{id}/sumario")
    @Operation(summary = "Buscar sumário do levantamento")
    public SumarioResponse buscarSumario(@PathVariable UUID id) {
        return entrevistaService.buscarSumario(id);
    }
}
