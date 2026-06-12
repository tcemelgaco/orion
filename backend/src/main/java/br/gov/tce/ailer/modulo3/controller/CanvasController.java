package br.gov.tce.ailer.modulo3.controller;

import br.gov.tce.ailer.modulo3.dto.request.AtualizarCanvasRequest;
import br.gov.tce.ailer.modulo3.dto.response.CanvasProjetoResponse;
import br.gov.tce.ailer.modulo3.service.CanvasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Módulo 3 — Canvas do Projeto")
public class CanvasController {

    private final CanvasService canvasService;

    @PostMapping("/demandas/{demandaId}/canvas")
    @Operation(summary = "Gerar ou regenerar canvas com IA para a demanda")
    public ResponseEntity<CanvasProjetoResponse> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(canvasService.gerar(demandaId));
    }

    @GetMapping("/demandas/{demandaId}/canvas")
    @Operation(summary = "Buscar canvas existente da demanda")
    public ResponseEntity<CanvasProjetoResponse> buscar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(canvasService.buscar(demandaId));
    }

    @PutMapping("/canvas/{canvasId}")
    @Operation(summary = "Atualizar seções do canvas manualmente")
    public ResponseEntity<CanvasProjetoResponse> atualizar(
            @PathVariable UUID canvasId,
            @RequestBody AtualizarCanvasRequest request) {
        return ResponseEntity.ok(canvasService.atualizar(canvasId, request));
    }

    @PatchMapping("/canvas/{canvasId}/revisar")
    @Operation(summary = "Abrir canvas para revisão (RASCUNHO_IA → EM_REVISAO)")
    public ResponseEntity<CanvasProjetoResponse> abrirRevisao(@PathVariable UUID canvasId) {
        return ResponseEntity.ok(canvasService.abrirRevisao(canvasId));
    }

    @PatchMapping("/canvas/{canvasId}/aprovar")
    @Operation(summary = "Aprovar canvas formalmente (EM_REVISAO → APROVADO)")
    public ResponseEntity<CanvasProjetoResponse> aprovar(
            @PathVariable UUID canvasId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(canvasService.aprovar(canvasId, user.getUsername()));
    }

    @PatchMapping("/canvas/{canvasId}/publicar")
    @Operation(summary = "Publicar canvas para a equipe de desenvolvimento (APROVADO → PUBLICADO)")
    public ResponseEntity<CanvasProjetoResponse> publicar(@PathVariable UUID canvasId) {
        return ResponseEntity.ok(canvasService.publicar(canvasId));
    }
}
