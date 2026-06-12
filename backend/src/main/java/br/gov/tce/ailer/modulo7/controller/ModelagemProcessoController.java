package br.gov.tce.ailer.modulo7.controller;

import br.gov.tce.ailer.modulo7.domain.enums.TipoFluxo;
import br.gov.tce.ailer.modulo7.dto.request.AtualizarModelagemRequest;
import br.gov.tce.ailer.modulo7.dto.request.CriarModelagemRequest;
import br.gov.tce.ailer.modulo7.dto.response.ModelagemProcessoResponse;
import br.gov.tce.ailer.modulo7.service.ModelagemProcessoService;
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
@Tag(name = "Módulo 7 — Modelagem de Processos")
public class ModelagemProcessoController {

    private final ModelagemProcessoService service;

    @PostMapping("/demandas/{demandaId}/modelagem/gerar")
    @Operation(summary = "Gerar modelagem AS-IS e TO-BE com IA")
    public ResponseEntity<List<ModelagemProcessoResponse>> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(service.gerar(demandaId));
    }

    @GetMapping("/demandas/{demandaId}/modelagem")
    @Operation(summary = "Listar modelagens da demanda, com filtro opcional por tipo de fluxo")
    public ResponseEntity<List<ModelagemProcessoResponse>> listar(
            @PathVariable UUID demandaId,
            @RequestParam(required = false) TipoFluxo tipoFluxo) {
        return ResponseEntity.ok(service.listar(demandaId, tipoFluxo));
    }

    @PostMapping("/demandas/{demandaId}/modelagem")
    @Operation(summary = "Criar modelagem de processo manualmente")
    public ResponseEntity<ModelagemProcessoResponse> criar(
            @PathVariable UUID demandaId,
            @Valid @RequestBody CriarModelagemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(demandaId, request));
    }

    @PutMapping("/modelagem/{id}")
    @Operation(summary = "Atualizar modelagem de processo")
    public ResponseEntity<ModelagemProcessoResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody AtualizarModelagemRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/modelagem/{id}")
    @Operation(summary = "Excluir modelagem de processo")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/modelagem/{id}/revisar")
    @Operation(summary = "Abrir modelagem para revisão (RASCUNHO_IA → EM_REVISAO)")
    public ResponseEntity<ModelagemProcessoResponse> abrirRevisao(@PathVariable UUID id) {
        return ResponseEntity.ok(service.abrirRevisao(id));
    }

    @PatchMapping("/modelagem/{id}/aprovar")
    @Operation(summary = "Aprovar modelagem (EM_REVISAO → APROVADO)")
    public ResponseEntity<ModelagemProcessoResponse> aprovar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(service.aprovar(id, user.getUsername()));
    }

    @PatchMapping("/modelagem/{id}/publicar")
    @Operation(summary = "Publicar modelagem (APROVADO → PUBLICADO)")
    public ResponseEntity<ModelagemProcessoResponse> publicar(@PathVariable UUID id) {
        return ResponseEntity.ok(service.publicar(id));
    }
}
