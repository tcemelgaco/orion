package br.gov.tce.ailer.modulo4.dto.request;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CriarRequisitoRequest(
        @NotNull  TipoRequisito tipo,
        @NotBlank String titulo,
        String descricao,
        PrioridadeDemanda prioridade,
        String criterioAceitacao,
        String observacoes
) {}
