package br.gov.tce.ailer.modulo1.controller;

import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.dto.request.AdicionarStakeholderRequest;
import br.gov.tce.ailer.modulo1.dto.request.AtualizarDemandaRequest;
import br.gov.tce.ailer.modulo1.dto.request.CriarDemandaRequest;
import br.gov.tce.ailer.modulo1.dto.response.DemandaResponse;
import br.gov.tce.ailer.modulo1.dto.response.DemandaSummaryResponse;
import br.gov.tce.ailer.modulo1.dto.response.StakeholderResponse;
import br.gov.tce.ailer.modulo1.service.DemandaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas")
@RequiredArgsConstructor
@Tag(name = "Módulo 1 — Gestão de Demandas", description = "Cadastro e gestão de demandas e projetos")
public class DemandaController {

    private final DemandaService demandaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar nova demanda")
    public DemandaResponse criar(@Valid @RequestBody CriarDemandaRequest request) {
        return demandaService.criar(request);
    }

    @GetMapping
    @Operation(summary = "Listar demandas com filtros e paginação")
    public Page<DemandaSummaryResponse> listar(
            @RequestParam(required = false) StatusDemanda status,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        return demandaService.listar(status, area, busca, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar demanda por ID")
    public DemandaResponse buscarPorId(@PathVariable UUID id) {
        return demandaService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar demanda")
    public DemandaResponse atualizar(@PathVariable UUID id,
                                     @Valid @RequestBody AtualizarDemandaRequest request) {
        return demandaService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir demanda (apenas Rascunho ou Cancelada)")
    public void excluir(@PathVariable UUID id) {
        demandaService.excluir(id);
    }

    @PostMapping("/{id}/stakeholders")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Adicionar stakeholder à demanda")
    public StakeholderResponse adicionarStakeholder(@PathVariable UUID id,
                                                     @Valid @RequestBody AdicionarStakeholderRequest request) {
        return demandaService.adicionarStakeholder(id, request);
    }

    @DeleteMapping("/{id}/stakeholders/{stakeholderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remover stakeholder da demanda")
    public void removerStakeholder(@PathVariable UUID id, @PathVariable UUID stakeholderId) {
        demandaService.removerStakeholder(id, stakeholderId);
    }

    @GetMapping("/{id}/historico")
    @Operation(summary = "Histórico de alterações da demanda")
    public Page<DemandaService.HistoricoResponse> listarHistorico(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return demandaService.listarHistorico(id, pageable);
    }
}
