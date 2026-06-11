package br.gov.tce.ailer.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResponse(
        LocalDateTime timestamp,
        int status,
        String erro,
        String mensagem,
        String caminho,
        List<CampoErro> campos
) {
    public record CampoErro(String campo, String mensagem) {}

    public static ErroResponse of(int status, String erro, String mensagem, String caminho) {
        return new ErroResponse(LocalDateTime.now(), status, erro, mensagem, caminho, null);
    }

    public static ErroResponse ofCampos(int status, String mensagem, String caminho, List<CampoErro> campos) {
        return new ErroResponse(LocalDateTime.now(), status, "Erro de validação", mensagem, caminho, campos);
    }
}
