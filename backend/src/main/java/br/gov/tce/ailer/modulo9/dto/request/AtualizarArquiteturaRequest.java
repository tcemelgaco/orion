package br.gov.tce.ailer.modulo9.dto.request;

import br.gov.tce.ailer.modulo9.domain.enums.VisaoArquitetural;

public record AtualizarArquiteturaRequest(
        VisaoArquitetural visaoArquitetural,
        String componentes, String integracoes, String modeloDados,
        String adrs, String recomendacoes, String diagramaMermaid
) {}
