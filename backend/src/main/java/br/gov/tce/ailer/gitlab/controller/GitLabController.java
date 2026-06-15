package br.gov.tce.ailer.gitlab.controller;

import br.gov.tce.ailer.gitlab.dto.request.GitLabConfigRequest;
import br.gov.tce.ailer.gitlab.dto.response.GitLabConfigResponse;
import br.gov.tce.ailer.gitlab.dto.response.GitLabExportResponse;
import br.gov.tce.ailer.gitlab.service.GitLabExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/gitlab")
@RequiredArgsConstructor
@Tag(name = "Integração GitLab", description = "Configuração e exportação do backlog para GitLab Issues/Milestones")
public class GitLabController {

    private final GitLabExportService exportService;

    @PutMapping("/config")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Salvar configuração GitLab da demanda",
            description = "Valida o token e projeto no GitLab antes de persistir. Upsert — cria ou atualiza."
    )
    public GitLabConfigResponse salvarConfig(
            @PathVariable UUID demandaId,
            @Valid @RequestBody GitLabConfigRequest request) {
        return exportService.salvarConfig(demandaId, request);
    }

    @GetMapping("/config")
    @Operation(summary = "Obter configuração GitLab da demanda", description = "Token retornado mascarado (últimos 4 caracteres).")
    public GitLabConfigResponse buscarConfig(@PathVariable UUID demandaId) {
        return exportService.buscarConfig(demandaId);
    }

    @PostMapping("/exportar")
    @ResponseStatus(HttpStatus.OK)
    @Operation(
            summary = "Exportar backlog para GitLab",
            description = "Cria Milestones para Épicos e Issues para Histórias de Usuário. Itens já exportados são ignorados (idempotente)."
    )
    public GitLabExportResponse exportar(@PathVariable UUID demandaId) {
        return exportService.exportarBacklog(demandaId);
    }
}
