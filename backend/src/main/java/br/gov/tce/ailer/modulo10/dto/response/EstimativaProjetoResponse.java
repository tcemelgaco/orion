package br.gov.tce.ailer.modulo10.dto.response;

import br.gov.tce.ailer.modulo10.domain.EstimativaProjeto;
import br.gov.tce.ailer.modulo10.domain.enums.StatusEstimativa;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record EstimativaProjetoResponse(
        UUID id, UUID demandaId,
        Integer storyPointsTotal,
        BigDecimal horasAnalista, BigDecimal horasDev, BigDecimal horasQa, BigDecimal horasUx,
        Integer prazoSprints,
        String recursosSugeridos, String matrizEsforco, String resumoExecutivo,
        StatusEstimativa statusAprovacao,
        String aprovadoPor, LocalDateTime aprovadoEm,
        String fonte, LocalDateTime criadoEm, LocalDateTime atualizadoEm
) {
    public static EstimativaProjetoResponse from(EstimativaProjeto e) {
        return new EstimativaProjetoResponse(
                e.getId(), e.getDemandaId(),
                e.getStoryPointsTotal(),
                e.getHorasAnalista(), e.getHorasDev(), e.getHorasQa(), e.getHorasUx(),
                e.getPrazoSprints(),
                e.getRecursosSugeridos(), e.getMatrizEsforco(), e.getResumoExecutivo(),
                e.getStatusAprovacao(), e.getAprovadoPor(), e.getAprovadoEm(),
                e.getFonte(), e.getCriadoEm(), e.getAtualizadoEm()
        );
    }
}
