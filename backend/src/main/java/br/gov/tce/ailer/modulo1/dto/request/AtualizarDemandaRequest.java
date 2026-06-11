package br.gov.tce.ailer.modulo1.dto.request;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AtualizarDemandaRequest(
        @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
        String titulo,

        String descricao,

        @Size(max = 100, message = "Área demandante deve ter no máximo 100 caracteres")
        String areaDemandante,

        TipoDemanda tipo,
        PrioridadeDemanda prioridade,
        StatusDemanda status,
        LocalDate prazoEstimado,
        String premissas,
        String restricoes,
        String observacoes
) {}
