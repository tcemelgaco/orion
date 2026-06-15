package br.gov.tce.ailer.modulo14.dto.response;

import br.gov.tce.ailer.modulo14.domain.AgenteMensagem;

import java.time.LocalDateTime;
import java.util.UUID;

public record AgenteMensagemResponse(
        UUID id,
        String papel,
        String conteudo,
        LocalDateTime criadoEm
) {
    public static AgenteMensagemResponse from(AgenteMensagem mensagem) {
        return new AgenteMensagemResponse(
                mensagem.getId(),
                mensagem.getPapel(),
                mensagem.getConteudo(),
                mensagem.getCriadoEm()
        );
    }
}
