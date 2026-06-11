package br.gov.tce.ailer.modulo1.dto.response;

import br.gov.tce.ailer.modulo1.domain.Stakeholder;
import br.gov.tce.ailer.modulo1.domain.enums.PapelStakeholder;

import java.util.UUID;

public record StakeholderResponse(
        UUID id,
        String nome,
        String matricula,
        String area,
        PapelStakeholder papel,
        String contato
) {
    public static StakeholderResponse from(Stakeholder s) {
        return new StakeholderResponse(
                s.getId(), s.getNome(), s.getMatricula(),
                s.getArea(), s.getPapel(), s.getContato()
        );
    }
}
