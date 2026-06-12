package br.gov.tce.ailer.modulo4.controller;

import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import br.gov.tce.ailer.modulo4.dto.request.AtualizarRequisitoRequest;
import br.gov.tce.ailer.modulo4.dto.request.CriarRequisitoRequest;
import br.gov.tce.ailer.modulo4.dto.response.RequisitoResponse;
import br.gov.tce.ailer.modulo4.service.ChecklistCoberturaService;
import br.gov.tce.ailer.modulo4.service.DuplicatasService;
import br.gov.tce.ailer.modulo4.service.RequisitoService;
import br.gov.tce.ailer.modulo4.service.SmartScoreService;
import com.fasterxml.jackson.databind.JsonNode;
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
@Tag(name = "Módulo 4 — Especificação de Requisitos")
public class RequisitoController {

    private final RequisitoService requisitoService;
    private final SmartScoreService smartScoreService;
    private final ChecklistCoberturaService checklistCoberturaService;
    private final DuplicatasService duplicatasService;

    @PostMapping("/demandas/{demandaId}/requisitos/gerar")
    @Operation(summary = "Gerar requisitos com IA para a demanda")
    public ResponseEntity<List<RequisitoResponse>> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(requisitoService.gerar(demandaId));
    }

    @GetMapping("/demandas/{demandaId}/requisitos")
    @Operation(summary = "Listar requisitos da demanda, com filtro opcional por tipo")
    public ResponseEntity<List<RequisitoResponse>> listar(
            @PathVariable UUID demandaId,
            @RequestParam(required = false) TipoRequisito tipo) {
        return ResponseEntity.ok(requisitoService.listar(demandaId, tipo));
    }

    @PostMapping("/demandas/{demandaId}/requisitos")
    @Operation(summary = "Criar requisito manualmente para a demanda")
    public ResponseEntity<RequisitoResponse> criar(
            @PathVariable UUID demandaId,
            @Valid @RequestBody CriarRequisitoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requisitoService.criar(demandaId, request));
    }

    @PutMapping("/requisitos/{id}")
    @Operation(summary = "Atualizar requisito")
    public ResponseEntity<RequisitoResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody AtualizarRequisitoRequest request) {
        return ResponseEntity.ok(requisitoService.atualizar(id, request));
    }

    @DeleteMapping("/requisitos/{id}")
    @Operation(summary = "Excluir requisito")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        requisitoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/requisitos/{id}/revisar")
    @Operation(summary = "Abrir requisito para revisão (RASCUNHO_IA → EM_REVISAO)")
    public ResponseEntity<RequisitoResponse> abrirRevisao(@PathVariable UUID id) {
        return ResponseEntity.ok(requisitoService.abrirRevisao(id));
    }

    @PatchMapping("/requisitos/{id}/aprovar")
    @Operation(summary = "Aprovar requisito formalmente (EM_REVISAO → APROVADO)")
    public ResponseEntity<RequisitoResponse> aprovar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(requisitoService.aprovar(id, user.getUsername()));
    }

    @PatchMapping("/requisitos/{id}/publicar")
    @Operation(summary = "Publicar requisito para a equipe de desenvolvimento (APROVADO → PUBLICADO)")
    public ResponseEntity<RequisitoResponse> publicar(@PathVariable UUID id) {
        return ResponseEntity.ok(requisitoService.publicar(id));
    }

    @PostMapping("/requisitos/{id}/avaliar-smart")
    @Operation(summary = "Avaliar qualidade SMART do requisito com IA")
    public ResponseEntity<RequisitoResponse> avaliarSmart(@PathVariable UUID id) {
        return ResponseEntity.ok(smartScoreService.avaliar(id));
    }

    @PostMapping("/demandas/{demandaId}/requisitos/checklist-cobertura")
    @Operation(summary = "Verificar cobertura dos domínios essenciais nos requisitos da demanda")
    public ResponseEntity<JsonNode> checklistCobertura(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(checklistCoberturaService.avaliar(demandaId));
    }

    @PostMapping("/demandas/{demandaId}/requisitos/detectar-duplicatas")
    @Operation(summary = "Detectar requisitos semanticamente similares ou duplicados")
    public ResponseEntity<JsonNode> detectarDuplicatas(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(duplicatasService.detectar(demandaId));
    }
}
