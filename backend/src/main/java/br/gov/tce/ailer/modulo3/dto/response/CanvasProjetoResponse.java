package br.gov.tce.ailer.modulo3.dto.response;

import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CanvasProjetoResponse(
        UUID id,
        UUID demandaId,
        String tituloDemanda,
        String contexto,
        String problema,
        String solucaoProposta,
        String usuarios,
        String funcionalidadesChave,
        String restricoes,
        String premissas,
        String riscos,
        String criteriosSucesso,
        String integracoes,
        Boolean geradoPorIa,
        StatusAprovacao statusAprovacao,
        String aprovadoPor,
        OffsetDateTime aprovadoEm,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static CanvasProjetoResponse from(CanvasProjeto c, String tituloDemanda) {
        return new CanvasProjetoResponse(
                c.getId(), c.getDemandaId(), tituloDemanda,
                c.getContexto(), c.getProblema(), c.getSolucaoProposta(),
                c.getUsuarios(), c.getFuncionalidadesChave(),
                c.getRestricoes(), c.getPremissas(), c.getRiscos(),
                c.getCriteriosSucesso(), c.getIntegracoes(),
                c.getGeradoPorIa(), c.getStatusAprovacao(),
                c.getAprovadoPor(), c.getAprovadoEm(),
                c.getCriadoEm(), c.getAtualizadoEm()
        );
    }
}
