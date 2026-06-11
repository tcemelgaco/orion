package br.gov.tce.ailer.modulo1.dto.response;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record DemandaSummaryResponse(
        UUID id,
        String titulo,
        String areaDemandante,
        StatusDemanda status,
        PrioridadeDemanda prioridade,
        TipoDemanda tipo,
        LocalDate prazoEstimado,
        String nomeSolicitante,
        LocalDateTime criadoEm,
        int totalStakeholders
) {
    public static DemandaSummaryResponse from(Demanda d) {
        return new DemandaSummaryResponse(
                d.getId(), d.getTitulo(), d.getAreaDemandante(),
                d.getStatus(), d.getPrioridade(), d.getTipo(),
                d.getPrazoEstimado(), d.getNomeSolicitante(), d.getCriadoEm(),
                d.getStakeholders().size()
        );
    }
}
