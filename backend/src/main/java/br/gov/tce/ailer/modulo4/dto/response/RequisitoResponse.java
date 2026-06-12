package br.gov.tce.ailer.modulo4.dto.response;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.domain.enums.StatusRequisito;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record RequisitoResponse(
        UUID id,
        UUID demandaId,
        TipoRequisito tipo,
        String codigo,
        String titulo,
        String descricao,
        PrioridadeDemanda prioridade,
        StatusRequisito status,
        String fonte,
        String criterioAceitacao,
        String observacoes,
        Integer ordemExibicao,
        String aprovadoPor,
        OffsetDateTime aprovadoEm,
        Integer smartScore,
        String smartDetalhes,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static RequisitoResponse from(Requisito r) {
        return new RequisitoResponse(
                r.getId(), r.getDemandaId(), r.getTipo(), r.getCodigo(),
                r.getTitulo(), r.getDescricao(), r.getPrioridade(), r.getStatus(),
                r.getFonte(), r.getCriterioAceitacao(), r.getObservacoes(),
                r.getOrdemExibicao(), r.getAprovadoPor(), r.getAprovadoEm(),
                r.getSmartScore(), r.getSmartDetalhes(),
                r.getCriadoEm(), r.getAtualizadoEm()
        );
    }
}
