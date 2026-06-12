package br.gov.tce.ailer.modulo11.controller;

import br.gov.tce.ailer.modulo11.dto.request.AtualizarGovernancaRequest;
import br.gov.tce.ailer.modulo11.dto.response.GovernancaProjetoResponse;
import br.gov.tce.ailer.modulo11.service.GovernancaProjetoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/governanca")
@RequiredArgsConstructor
@Tag(name = "Módulo 11 — Governança")
public class GovernancaProjetoController {

    private final GovernancaProjetoService service;

    @PostMapping("/gerar")
    @Operation(summary = "Gerar artefatos de governança com IA")
    public ResponseEntity<GovernancaProjetoResponse> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping
    @Operation(summary = "Buscar governança da demanda")
    public ResponseEntity<GovernancaProjetoResponse> buscar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.buscar(demandaId));
    }

    @PutMapping
    @Operation(summary = "Atualizar governança")
    public ResponseEntity<GovernancaProjetoResponse> atualizar(
            @PathVariable UUID demandaId,
            @RequestBody AtualizarGovernancaRequest request) {
        return ResponseEntity.ok(service.atualizar(demandaId, request));
    }

    @PatchMapping("/revisar")
    public ResponseEntity<GovernancaProjetoResponse> abrirRevisao(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.abrirRevisao(demandaId));
    }

    @PatchMapping("/aprovar")
    public ResponseEntity<GovernancaProjetoResponse> aprovar(
            @PathVariable UUID demandaId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.aprovar(demandaId, user.getUsername()));
    }

    @PatchMapping("/publicar")
    public ResponseEntity<GovernancaProjetoResponse> publicar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.publicar(demandaId));
    }
}
