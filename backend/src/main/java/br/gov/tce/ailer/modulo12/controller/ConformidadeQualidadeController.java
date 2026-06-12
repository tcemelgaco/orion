package br.gov.tce.ailer.modulo12.controller;

import br.gov.tce.ailer.modulo12.dto.response.ConformidadeQualidadeResponse;
import br.gov.tce.ailer.modulo12.service.ConformidadeQualidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/conformidade")
@RequiredArgsConstructor
@Tag(name = "Módulo 12 — Conformidade e Qualidade")
public class ConformidadeQualidadeController {

    private final ConformidadeQualidadeService service;

    @PostMapping("/gerar")
    @Operation(summary = "Gerar análise de conformidade (LGPD, segurança, acessibilidade, qualidade) com IA")
    public ResponseEntity<ConformidadeQualidadeResponse> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping
    @Operation(summary = "Buscar análise de conformidade da demanda")
    public ResponseEntity<ConformidadeQualidadeResponse> buscar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.buscar(demandaId));
    }

    @PatchMapping("/revisar")
    public ResponseEntity<ConformidadeQualidadeResponse> abrirRevisao(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.abrirRevisao(demandaId));
    }

    @PatchMapping("/aprovar")
    public ResponseEntity<ConformidadeQualidadeResponse> aprovar(
            @PathVariable UUID demandaId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.aprovar(demandaId, user.getUsername()));
    }

    @PatchMapping("/publicar")
    public ResponseEntity<ConformidadeQualidadeResponse> publicar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.publicar(demandaId));
    }
}
