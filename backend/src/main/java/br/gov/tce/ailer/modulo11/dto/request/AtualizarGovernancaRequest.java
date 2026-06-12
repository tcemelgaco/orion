package br.gov.tce.ailer.modulo11.dto.request;

public record AtualizarGovernancaRequest(
        String matrizRaci, String stakeholdersMapeados, String dependenciasExternas,
        String premissas, String restricoes, String riscos, String planoMitigacao
) {}
