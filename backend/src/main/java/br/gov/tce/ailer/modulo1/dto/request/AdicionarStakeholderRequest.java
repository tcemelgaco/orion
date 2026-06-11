package br.gov.tce.ailer.modulo1.dto.request;

import br.gov.tce.ailer.modulo1.domain.enums.PapelStakeholder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdicionarStakeholderRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        String matricula,
        String area,

        @NotNull(message = "Papel do stakeholder é obrigatório")
        PapelStakeholder papel,

        String contato
) {}
