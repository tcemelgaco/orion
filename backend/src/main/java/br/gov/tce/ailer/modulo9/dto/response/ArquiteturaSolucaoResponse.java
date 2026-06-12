package br.gov.tce.ailer.modulo9.dto.response;

import br.gov.tce.ailer.modulo9.domain.ArquiteturaSolucao;
import br.gov.tce.ailer.modulo9.domain.enums.StatusArquitetura;
import br.gov.tce.ailer.modulo9.domain.enums.VisaoArquitetural;

import java.time.LocalDateTime;
import java.util.UUID;

public record ArquiteturaSolucaoResponse(
        UUID id, UUID demandaId,
        VisaoArquitetural visaoArquitetural,
        String componentes, String integracoes, String modeloDados,
        String adrs, String recomendacoes, String diagramaMermaid,
        StatusArquitetura statusAprovacao,
        String aprovadoPor, LocalDateTime aprovadoEm,
        String fonte, LocalDateTime criadoEm, LocalDateTime atualizadoEm
) {
    public static ArquiteturaSolucaoResponse from(ArquiteturaSolucao a) {
        return new ArquiteturaSolucaoResponse(
                a.getId(), a.getDemandaId(), a.getVisaoArquitetural(),
                a.getComponentes(), a.getIntegracoes(), a.getModeloDados(),
                a.getAdrs(), a.getRecomendacoes(), a.getDiagramaMermaid(),
                a.getStatusAprovacao(), a.getAprovadoPor(), a.getAprovadoEm(),
                a.getFonte(), a.getCriadoEm(), a.getAtualizadoEm()
        );
    }
}
