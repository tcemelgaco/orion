package br.gov.tce.ailer.modulo10.dto.request;

import java.math.BigDecimal;

public record AtualizarEstimativaRequest(
        Integer storyPointsTotal,
        BigDecimal horasAnalista, BigDecimal horasDev, BigDecimal horasQa, BigDecimal horasUx,
        Integer prazoSprints,
        String recursosSugeridos, String matrizEsforco, String resumoExecutivo
) {}
