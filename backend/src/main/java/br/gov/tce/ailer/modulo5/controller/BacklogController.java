package br.gov.tce.ailer.modulo5.controller;

import br.gov.tce.ailer.modulo5.dto.request.AtualizarHistoriaRequest;
import br.gov.tce.ailer.modulo5.dto.response.EpicoResponse;
import br.gov.tce.ailer.modulo5.dto.response.HistoriaUsuarioResponse;
import br.gov.tce.ailer.modulo5.service.BacklogService;
import br.gov.tce.ailer.modulo5.service.InvestScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Módulo 5 — Histórias de Usuário e Backlog")
public class BacklogController {

    private final BacklogService backlogService;
    private final InvestScoreService investScoreService;

    @PostMapping("/demandas/{demandaId}/backlog/gerar")
    @Operation(summary = "Gerar backlog completo (épicos, features, histórias) com IA")
    public ResponseEntity<List<EpicoResponse>> gerar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(backlogService.gerar(demandaId));
    }

    @GetMapping("/demandas/{demandaId}/backlog")
    @Operation(summary = "Listar backlog da demanda (épicos com features e histórias aninhados)")
    public ResponseEntity<List<EpicoResponse>> listar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(backlogService.listar(demandaId));
    }

    @PutMapping("/historias/{id}")
    @Operation(summary = "Atualizar história de usuário")
    public ResponseEntity<HistoriaUsuarioResponse> atualizar(
            @PathVariable UUID id,
            @RequestBody AtualizarHistoriaRequest request) {
        return ResponseEntity.ok(backlogService.atualizarHistoria(id, request));
    }

    @DeleteMapping("/historias/{id}")
    @Operation(summary = "Excluir história de usuário")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        backlogService.excluirHistoria(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/epicos/{id}/revisar")
    @Operation(summary = "Abrir épico para revisão (RASCUNHO_IA → EM_REVISAO)")
    public ResponseEntity<EpicoResponse> abrirRevisao(@PathVariable UUID id) {
        return ResponseEntity.ok(backlogService.abrirRevisaoEpico(id));
    }

    @PatchMapping("/epicos/{id}/aprovar")
    @Operation(summary = "Aprovar épico formalmente (EM_REVISAO → APROVADO)")
    public ResponseEntity<EpicoResponse> aprovar(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(backlogService.aprovarEpico(id, user.getUsername()));
    }

    @PatchMapping("/epicos/{id}/publicar")
    @Operation(summary = "Publicar épico para a equipe de desenvolvimento (APROVADO → PUBLICADO)")
    public ResponseEntity<EpicoResponse> publicar(@PathVariable UUID id) {
        return ResponseEntity.ok(backlogService.publicarEpico(id));
    }

    @PostMapping("/historias/{id}/avaliar-invest")
    @Operation(summary = "Avaliar qualidade INVEST da história de usuário com IA")
    public ResponseEntity<HistoriaUsuarioResponse> avaliarInvest(@PathVariable UUID id) {
        return ResponseEntity.ok(investScoreService.avaliar(id));
    }
}
