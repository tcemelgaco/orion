package br.gov.tce.ailer.modulo8.controller;

import br.gov.tce.ailer.modulo8.dto.request.AtualizarPrototipoRequest;
import br.gov.tce.ailer.modulo8.dto.response.PrototipoSistemaResponse;
import br.gov.tce.ailer.modulo8.service.PrototipoSistemaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/prototipo")
@RequiredArgsConstructor
@Tag(name = "Módulo 8 — Prototipação Assistida")
public class PrototipoSistemaController {

    private final PrototipoSistemaService service;

    @PostMapping("/gerar")
    @Operation(summary = "Gerar protótipo textual do sistema com IA (telas, fluxo, componentes, acessibilidade)")
    public ResponseEntity<PrototipoSistemaResponse> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping
    @Operation(summary = "Buscar protótipo da demanda")
    public ResponseEntity<PrototipoSistemaResponse> buscar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.buscar(demandaId));
    }

    @PutMapping
    @Operation(summary = "Atualizar campos do protótipo manualmente")
    public ResponseEntity<PrototipoSistemaResponse> atualizarManual(
            @PathVariable UUID demandaId,
            @RequestBody AtualizarPrototipoRequest request) {
        return ResponseEntity.ok(service.atualizarManual(demandaId, request));
    }

    @PatchMapping("/revisar")
    @Operation(summary = "Mover protótipo para status EM_REVISAO")
    public ResponseEntity<PrototipoSistemaResponse> abrirRevisao(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.abrirRevisao(demandaId));
    }

    @PatchMapping("/aprovar")
    @Operation(summary = "Aprovar protótipo (deve estar EM_REVISAO)")
    public ResponseEntity<PrototipoSistemaResponse> aprovar(
            @PathVariable UUID demandaId,
            @RequestParam(defaultValue = "sistema") String aprovadoPor,
            @AuthenticationPrincipal UserDetails user) {
        String responsavel = (user != null) ? user.getUsername() : aprovadoPor;
        return ResponseEntity.ok(service.aprovar(demandaId, responsavel));
    }

    @PatchMapping("/publicar")
    @Operation(summary = "Publicar protótipo (deve estar APROVADO)")
    public ResponseEntity<PrototipoSistemaResponse> publicar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.publicar(demandaId));
    }
}
