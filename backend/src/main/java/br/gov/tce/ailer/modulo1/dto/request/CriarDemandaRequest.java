package br.gov.tce.ailer.modulo1.dto.request;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CriarDemandaRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
        String titulo,

        String descricao,

        @NotBlank(message = "Área demandante é obrigatória")
        @Size(max = 100, message = "Área demandante deve ter no máximo 100 caracteres")
        String areaDemandante,

        @NotNull(message = "Tipo de demanda é obrigatório")
        TipoDemanda tipo,

        PrioridadeDemanda prioridade,

        LocalDate prazoEstimado,

        @NotBlank(message = "Matrícula do solicitante é obrigatória")
        String matriculaSolicitante,

        String nomeSolicitante,
        String premissas,
        String restricoes,
        String observacoes
) {}
