package br.gov.tce.ailer.modulo5.dto.response;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo5.domain.HistoriaUsuario;
import br.gov.tce.ailer.modulo5.domain.enums.StatusHistoria;

import java.time.LocalDateTime;
import java.util.UUID;

public record HistoriaUsuarioResponse(
        UUID id,
        UUID featureId,
        UUID demandaId,
        String codigo,
        String comoPapel,
        String queroAcao,
        String paraBeneficio,
        String criteriosAceitacao,
        Integer storyPoints,
        PrioridadeDemanda prioridade,
        StatusHistoria status,
        String fonte,
        Integer ordemExibicao,
        Integer investScore,
        String investDetalhes,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static HistoriaUsuarioResponse from(HistoriaUsuario h) {
        return new HistoriaUsuarioResponse(
                h.getId(), h.getFeature().getId(), h.getDemandaId(),
                h.getCodigo(), h.getComoPapel(), h.getQueroAcao(), h.getParaBeneficio(),
                h.getCriteriosAceitacao(), h.getStoryPoints(),
                h.getPrioridade(), h.getStatus(), h.getFonte(),
                h.getOrdemExibicao(), h.getInvestScore(), h.getInvestDetalhes(),
                h.getCriadoEm(), h.getAtualizadoEm()
        );
    }
}
