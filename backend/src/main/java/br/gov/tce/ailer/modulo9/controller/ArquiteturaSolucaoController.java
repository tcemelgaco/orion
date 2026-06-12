package br.gov.tce.ailer.modulo9.controller;

import br.gov.tce.ailer.modulo9.dto.request.AtualizarArquiteturaRequest;
import br.gov.tce.ailer.modulo9.dto.response.ArquiteturaSolucaoResponse;
import br.gov.tce.ailer.modulo9.service.ArquiteturaSolucaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/arquitetura")
@RequiredArgsConstructor
@Tag(name = "Módulo 9 — Arquitetura de Solução")
public class ArquiteturaSolucaoController {

    private final ArquiteturaSolucaoService service;

    @PostMapping("/gerar")
    @Operation(summary = "Gerar arquitetura de solução com IA")
    public ResponseEntity<ArquiteturaSolucaoResponse> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping
    @Operation(summary = "Buscar arquitetura de solução da demanda")
    public ResponseEntity<ArquiteturaSolucaoResponse> buscar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.buscar(demandaId));
    }

    @PutMapping
    @Operation(summary = "Atualizar arquitetura de solução")
    public ResponseEntity<ArquiteturaSolucaoResponse> atualizar(
            @PathVariable UUID demandaId,
            @RequestBody AtualizarArquiteturaRequest request) {
        return ResponseEntity.ok(service.atualizar(demandaId, request));
    }

    @PatchMapping("/revisar")
    @Operation(summary = "Abrir arquitetura para revisão (RASCUNHO_IA → EM_REVISAO)")
    public ResponseEntity<ArquiteturaSolucaoResponse> abrirRevisao(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.abrirRevisao(demandaId));
    }

    @PatchMapping("/aprovar")
    @Operation(summary = "Aprovar arquitetura (EM_REVISAO → APROVADO)")
    public ResponseEntity<ArquiteturaSolucaoResponse> aprovar(
            @PathVariable UUID demandaId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.aprovar(demandaId, user.getUsername()));
    }

    @PatchMapping("/publicar")
    @Operation(summary = "Publicar arquitetura (APROVADO → PUBLICADO)")
    public ResponseEntity<ArquiteturaSolucaoResponse> publicar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.publicar(demandaId));
    }
}
