package br.gov.tce.ailer.modulo1.dto.response;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record DemandaResponse(
        UUID id,
        String titulo,
        String descricao,
        String areaDemandante,
        StatusDemanda status,
        PrioridadeDemanda prioridade,
        TipoDemanda tipo,
        LocalDate prazoEstimado,
        String matriculaSolicitante,
        String nomeSolicitante,
        String premissas,
        String restricoes,
        String observacoes,
        Integer versao,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        String criadoPor,
        List<StakeholderResponse> stakeholders
) {
    public static DemandaResponse from(Demanda d) {
        return new DemandaResponse(
                d.getId(), d.getTitulo(), d.getDescricao(), d.getAreaDemandante(),
                d.getStatus(), d.getPrioridade(), d.getTipo(), d.getPrazoEstimado(),
                d.getMatriculaSolicitante(), d.getNomeSolicitante(),
                d.getPremissas(), d.getRestricoes(), d.getObservacoes(),
                d.getVersao(), d.getCriadoEm(), d.getAtualizadoEm(), d.getCriadoPor(),
                d.getStakeholders().stream().map(StakeholderResponse::from).toList()
        );
    }
}
