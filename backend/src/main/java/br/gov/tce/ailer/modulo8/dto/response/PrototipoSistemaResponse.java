package br.gov.tce.ailer.modulo8.dto.response;

import br.gov.tce.ailer.modulo8.domain.PrototipoSistema;
import br.gov.tce.ailer.modulo8.domain.enums.StatusPrototipo;

import java.time.LocalDateTime;
import java.util.UUID;

public record PrototipoSistemaResponse(
        UUID id,
        UUID demandaId,
        String descricaoGeral,
        String telas,
        String fluxoNavegacao,
        String componentesPrincipais,
        String paleta,
        String diretrizes,
        String notasAcessibilidade,
        String tecnologiasSugeridas,
        StatusPrototipo statusAprovacao,
        String aprovadoPor,
        LocalDateTime aprovadoEm,
        String fonte,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static PrototipoSistemaResponse from(PrototipoSistema p) {
        return new PrototipoSistemaResponse(
                p.getId(),
                p.getDemandaId(),
                p.getDescricaoGeral(),
                p.getTelas(),
                p.getFluxoNavegacao(),
                p.getComponentesPrincipais(),
                p.getPaleta(),
                p.getDiretrizes(),
                p.getNotasAcessibilidade(),
                p.getTecnologiasSugeridas(),
                p.getStatusAprovacao(),
                p.getAprovadoPor(),
                p.getAprovadoEm(),
                p.getFonte(),
                p.getCriadoEm(),
                p.getAtualizadoEm()
        );
    }
}
