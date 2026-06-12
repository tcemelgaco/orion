package br.gov.tce.ailer.modulo13.dto.response;

/**
 * Resultado de uma busca semântica no módulo 13.
 * O campo {@code score} representa a similaridade coseno entre a query e o documento (0.0 a 1.0).
 */
public record BuscaSemanticaResponse(
        DocumentoConhecimentoResponse documento,
        double score
) {}
