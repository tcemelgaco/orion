package br.gov.tce.ailer.modulo12.dto.response;

import br.gov.tce.ailer.modulo12.domain.ConformidadeQualidade;
import br.gov.tce.ailer.modulo12.domain.enums.StatusConformidade;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConformidadeQualidadeResponse(
        UUID id, UUID demandaId,
        String analiseLgpd, String analiseSeguranca, String analiseAcessibilidade,
        String qualidadeRequisitos, String pendencias, Integer scoreGeral,
        StatusConformidade statusAprovacao,
        String aprovadoPor, LocalDateTime aprovadoEm,
        String fonte, LocalDateTime criadoEm, LocalDateTime atualizadoEm
) {
    public static ConformidadeQualidadeResponse from(ConformidadeQualidade c) {
        return new ConformidadeQualidadeResponse(
                c.getId(), c.getDemandaId(),
                c.getAnaliseLgpd(), c.getAnaliseSeguranca(), c.getAnaliseAcessibilidade(),
                c.getQualidadeRequisitos(), c.getPendencias(), c.getScoreGeral(),
                c.getStatusAprovacao(), c.getAprovadoPor(), c.getAprovadoEm(),
                c.getFonte(), c.getCriadoEm(), c.getAtualizadoEm()
        );
    }
}
