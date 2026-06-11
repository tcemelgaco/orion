package br.gov.tce.ailer.modulo2.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnviarMensagemRequest(
        @NotBlank(message = "Conteúdo da mensagem é obrigatório")
        @Size(max = 5000, message = "Mensagem muito longa")
        String conteudo
) {}
