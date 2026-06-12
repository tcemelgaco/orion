package br.gov.tce.ailer.modulo5.dto.request;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo5.domain.enums.StatusHistoria;

public record AtualizarHistoriaRequest(
        String comoPapel,
        String queroAcao,
        String paraBeneficio,
        String criteriosAceitacao,
        Integer storyPoints,
        PrioridadeDemanda prioridade,
        StatusHistoria status
) {}
