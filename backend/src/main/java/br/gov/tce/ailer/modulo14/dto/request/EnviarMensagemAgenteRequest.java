package br.gov.tce.ailer.modulo14.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnviarMensagemAgenteRequest(
        @NotBlank(message = "Conteúdo da mensagem é obrigatório")
        @Size(max = 5000, message = "Mensagem muito longa")
        String conteudo
) {}
