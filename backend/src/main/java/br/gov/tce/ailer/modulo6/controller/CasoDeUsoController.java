package br.gov.tce.ailer.modulo6.controller;

import br.gov.tce.ailer.modulo6.dto.request.AtualizarCasoDeUsoRequest;
import br.gov.tce.ailer.modulo6.dto.request.CriarCasoDeUsoRequest;
import br.gov.tce.ailer.modulo6.dto.response.CasoDeUsoResponse;
import br.gov.tce.ailer.modulo6.service.CasoDeUsoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Módulo 6 — Casos de Uso")
public class CasoDeUsoController {

    private final CasoDeUsoService service;

    @PostMapping("/demandas/{demandaId}/casos-de-uso/gerar")
    @Operation(summary = "Gerar casos de uso com IA a partir da demanda")
    public ResponseEntity<List<CasoDeUsoResponse>> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping("/demandas/{demandaId}/casos-de-uso")
    @Operation(summary = "Listar casos de uso da demanda")
    public ResponseEntity<List<CasoDeUsoResponse>> listar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.listar(demandaId));
    }

    @PostMapping("/demandas/{demandaId}/casos-de-uso")
    @Operation(summary = "Criar caso de uso manualmente")
    public ResponseEntity<CasoDeUsoResponse> criar(
            @PathVariable UUID demandaId,
            @Valid @RequestBody CriarCasoDeUsoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(demandaId, request));
    }

    @PutMapping("/casos-de-uso/{id}")
    @Operation(summary = "Atualizar caso de uso")
    public ResponseEntity<CasoDeUsoResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody AtualizarCasoDeUsoRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/casos-de-uso/{id}")
    @Operation(summary = "Excluir caso de uso")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/casos-de-uso/{id}/revisar")
    @Operation(summary = "Abrir caso de uso para revisão (RASCUNHO_IA → EM_REVISAO)")
    public ResponseEntity<CasoDeUsoResponse> abrirRevisao(@PathVariable UUID id) {
        return ResponseEntity.ok(service.abrirRevisao(id));
    }

    @PatchMapping("/casos-de-uso/{id}/aprovar")
    @Operation(summary = "Aprovar caso de uso (EM_REVISAO → APROVADO)")
    public ResponseEntity<CasoDeUsoResponse> aprovar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.aprovar(id, user.getUsername()));
    }

    @PatchMapping("/casos-de-uso/{id}/publicar")
    @Operation(summary = "Publicar caso de uso (APROVADO → PUBLICADO)")
    public ResponseEntity<CasoDeUsoResponse> publicar(@PathVariable UUID id) {
        return ResponseEntity.ok(service.publicar(id));
    }
}
