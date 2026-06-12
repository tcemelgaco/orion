package br.gov.tce.ailer.modulo11.dto.response;

import br.gov.tce.ailer.modulo11.domain.GovernancaProjeto;
import br.gov.tce.ailer.modulo11.domain.enums.StatusGovernanca;

import java.time.LocalDateTime;
import java.util.UUID;

public record GovernancaProjetoResponse(
        UUID id, UUID demandaId,
        String matrizRaci, String stakeholdersMapeados, String dependenciasExternas,
        String premissas, String restricoes, String riscos, String planoMitigacao,
        StatusGovernanca statusAprovacao,
        String aprovadoPor, LocalDateTime aprovadoEm,
        String fonte, LocalDateTime criadoEm, LocalDateTime atualizadoEm
) {
    public static GovernancaProjetoResponse from(GovernancaProjeto g) {
        return new GovernancaProjetoResponse(
                g.getId(), g.getDemandaId(),
                g.getMatrizRaci(), g.getStakeholdersMapeados(), g.getDependenciasExternas(),
                g.getPremissas(), g.getRestricoes(), g.getRiscos(), g.getPlanoMitigacao(),
                g.getStatusAprovacao(), g.getAprovadoPor(), g.getAprovadoEm(),
                g.getFonte(), g.getCriadoEm(), g.getAtualizadoEm()
        );
    }
}
