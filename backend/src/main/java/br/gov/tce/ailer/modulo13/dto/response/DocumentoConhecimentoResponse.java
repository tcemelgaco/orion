package br.gov.tce.ailer.modulo13.dto.response;

import br.gov.tce.ailer.modulo13.domain.DocumentoConhecimento;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de resposta para DocumentoConhecimento.
 * O campo {@code embedding} é intencionalmente omitido por ser muito grande para exibição.
 */
public record DocumentoConhecimentoResponse(
        UUID id,
        String titulo,
        String conteudo,
        String tipo,
        String tags,
        String fonte,
        Integer tokensEstimados,
        Integer versao,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        String criadoPor,
        String atualizadoPor
) {
    public static DocumentoConhecimentoResponse from(DocumentoConhecimento d) {
        return new DocumentoConhecimentoResponse(
                d.getId(),
                d.getTitulo(),
                d.getConteudo(),
                d.getTipo(),
                d.getTags(),
                d.getFonte(),
                d.getTokensEstimados(),
                d.getVersao(),
                d.getCriadoEm(),
                d.getAtualizadoEm(),
                d.getCriadoPor(),
                d.getAtualizadoPor()
        );
    }
}
