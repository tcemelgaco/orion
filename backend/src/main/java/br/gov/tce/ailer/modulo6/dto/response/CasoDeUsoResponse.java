package br.gov.tce.ailer.modulo6.dto.response;

import br.gov.tce.ailer.modulo6.domain.CasoDeUso;
import br.gov.tce.ailer.modulo6.domain.enums.StatusCasoDeUso;

import java.time.LocalDateTime;
import java.util.UUID;

public record CasoDeUsoResponse(
        UUID id,
        UUID demandaId,
        String codigo,
        String nome,
        String descricao,
        String atores,
        String preCondicoes,
        String posCondicoes,
        String fluxoPrincipal,
        String fluxosAlternativos,
        String fluxosExcecao,
        String requisitosOrigem,
        String diagramaMermaid,
        StatusCasoDeUso statusAprovacao,
        String aprovadoPor,
        LocalDateTime aprovadoEm,
        String fonte,
        Integer ordemExibicao,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static CasoDeUsoResponse from(CasoDeUso c) {
        return new CasoDeUsoResponse(
                c.getId(), c.getDemandaId(), c.getCodigo(), c.getNome(),
                c.getDescricao(), c.getAtores(), c.getPreCondicoes(), c.getPosCondicoes(),
                c.getFluxoPrincipal(), c.getFluxosAlternativos(), c.getFluxosExcecao(),
                c.getRequisitosOrigem(), c.getDiagramaMermaid(),
                c.getStatusAprovacao(), c.getAprovadoPor(), c.getAprovadoEm(),
                c.getFonte(), c.getOrdemExibicao(),
                c.getCriadoEm(), c.getAtualizadoEm()
        );
    }
}
