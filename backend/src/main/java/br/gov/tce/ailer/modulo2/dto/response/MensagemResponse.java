package br.gov.tce.ailer.modulo2.dto.response;

import br.gov.tce.ailer.modulo2.domain.MensagemEntrevista;
import br.gov.tce.ailer.modulo2.domain.enums.RoleMensagem;

import java.time.LocalDateTime;
import java.util.UUID;

public record MensagemResponse(
        UUID id,
        RoleMensagem role,
        String conteudo,
        LocalDateTime criadoEm
) {
    public static MensagemResponse from(MensagemEntrevista m) {
        return new MensagemResponse(m.getId(), m.getRole(), m.getConteudo(), m.getCriadoEm());
    }
}
