package br.gov.tce.ailer.modulo10.controller;

import br.gov.tce.ailer.modulo10.dto.request.AtualizarEstimativaRequest;
import br.gov.tce.ailer.modulo10.dto.response.EstimativaProjetoResponse;
import br.gov.tce.ailer.modulo10.service.EstimativaProjetoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/estimativas")
@RequiredArgsConstructor
@Tag(name = "Módulo 10 — Estimativas")
public class EstimativaProjetoController {

    private final EstimativaProjetoService service;

    @PostMapping("/gerar")
    @Operation(summary = "Gerar estimativas de esforço e prazo com IA")
    public ResponseEntity<EstimativaProjetoResponse> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping
    @Operation(summary = "Buscar estimativas da demanda")
    public ResponseEntity<EstimativaProjetoResponse> buscar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.buscar(demandaId));
    }

    @PutMapping
    @Operation(summary = "Atualizar estimativas")
    public ResponseEntity<EstimativaProjetoResponse> atualizar(
            @PathVariable UUID demandaId,
            @RequestBody AtualizarEstimativaRequest request) {
        return ResponseEntity.ok(service.atualizar(demandaId, request));
    }

    @PatchMapping("/revisar")
    public ResponseEntity<EstimativaProjetoResponse> abrirRevisao(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.abrirRevisao(demandaId));
    }

    @PatchMapping("/aprovar")
    public ResponseEntity<EstimativaProjetoResponse> aprovar(
            @PathVariable UUID demandaId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.aprovar(demandaId, user.getUsername()));
    }

    @PatchMapping("/publicar")
    public ResponseEntity<EstimativaProjetoResponse> publicar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.publicar(demandaId));
    }
}
