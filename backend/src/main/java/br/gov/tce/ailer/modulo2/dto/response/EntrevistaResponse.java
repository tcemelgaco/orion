package br.gov.tce.ailer.modulo2.dto.response;

import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EntrevistaResponse(
        UUID id,
        UUID demandaId,
        String tituloDemanda,
        StatusEntrevista status,
        LocalDateTime criadoEm,
        List<MensagemResponse> mensagens
) {
    public static EntrevistaResponse from(Entrevista e) {
        return new EntrevistaResponse(
                e.getId(),
                e.getDemanda().getId(),
                e.getDemanda().getTitulo(),
                e.getStatus(),
                e.getCriadoEm(),
                e.getMensagens().stream()
                        .filter(m -> m.getRole() != br.gov.tce.ailer.modulo2.domain.enums.RoleMensagem.SYSTEM)
                        .map(MensagemResponse::from)
                        .toList()
        );
    }
}
