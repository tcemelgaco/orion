package br.gov.tce.ailer.modulo14.dto.response;

import br.gov.tce.ailer.modulo14.domain.AgenteSessao;
import br.gov.tce.ailer.modulo14.domain.enums.TipoAgente;

import java.time.LocalDateTime;
import java.util.UUID;

public record AgenteSessaoResponse(
        UUID id,
        UUID demandaId,
        TipoAgente tipoAgente,
        String displayName,
        String titulo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static AgenteSessaoResponse from(AgenteSessao sessao) {
        return new AgenteSessaoResponse(
                sessao.getId(),
                sessao.getDemandaId(),
                sessao.getTipoAgente(),
                sessao.getTipoAgente().displayName,
                sessao.getTitulo(),
                sessao.getCriadoEm(),
                sessao.getAtualizadoEm()
        );
    }
}
