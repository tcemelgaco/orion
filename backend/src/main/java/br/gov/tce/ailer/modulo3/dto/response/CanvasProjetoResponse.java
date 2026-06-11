package br.gov.tce.ailer.modulo3.dto.response;

import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;

import java.time.LocalDateTime;
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
                c.getGeradoPorIa(), c.getCriadoEm(), c.getAtualizadoEm()
        );
    }
}
