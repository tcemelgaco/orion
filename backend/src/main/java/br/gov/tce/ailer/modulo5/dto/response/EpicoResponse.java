package br.gov.tce.ailer.modulo5.dto.response;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo5.domain.Epico;
import br.gov.tce.ailer.modulo5.domain.enums.StatusBacklog;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EpicoResponse(
        UUID id,
        UUID demandaId,
        String codigo,
        String titulo,
        String descricao,
        StatusBacklog status,
        PrioridadeDemanda prioridade,
        String fonte,
        Integer ordemExibicao,
        List<FeatureResponse> features,
        StatusAprovacao statusAprovacao,
        String aprovadoPor,
        OffsetDateTime aprovadoEm,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static EpicoResponse from(Epico e) {
        return new EpicoResponse(
                e.getId(), e.getDemandaId(),
                e.getCodigo(), e.getTitulo(), e.getDescricao(),
                e.getStatus(), e.getPrioridade(), e.getFonte(), e.getOrdemExibicao(),
                e.getFeatures().stream().map(FeatureResponse::from).toList(),
                e.getStatusAprovacao(), e.getAprovadoPor(), e.getAprovadoEm(),
                e.getCriadoEm(), e.getAtualizadoEm()
        );
    }
}
