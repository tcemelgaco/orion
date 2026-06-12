package br.gov.tce.ailer.modulo5.dto.response;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo5.domain.Feature;
import br.gov.tce.ailer.modulo5.domain.enums.StatusBacklog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FeatureResponse(
        UUID id,
        UUID epicoId,
        UUID demandaId,
        String codigo,
        String titulo,
        String descricao,
        StatusBacklog status,
        PrioridadeDemanda prioridade,
        String fonte,
        Integer ordemExibicao,
        List<HistoriaUsuarioResponse> historias,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static FeatureResponse from(Feature f) {
        return new FeatureResponse(
                f.getId(), f.getEpico().getId(), f.getDemandaId(),
                f.getCodigo(), f.getTitulo(), f.getDescricao(),
                f.getStatus(), f.getPrioridade(), f.getFonte(), f.getOrdemExibicao(),
                f.getHistorias().stream().map(HistoriaUsuarioResponse::from).toList(),
                f.getCriadoEm(), f.getAtualizadoEm()
        );
    }
}
