package br.gov.tce.ailer.modulo4.dto.request;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo4.domain.enums.StatusRequisito;

public record AtualizarRequisitoRequest(
        String titulo,
        String descricao,
        PrioridadeDemanda prioridade,
        StatusRequisito status,
        String criterioAceitacao,
        String observacoes
) {}
