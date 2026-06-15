package br.gov.tce.ailer.modulo1.dto.response;

import java.util.List;
import java.util.UUID;

public record CompletudeDemandaResponse(
        UUID demandaId,
        int percentualConcluido,
        int modulosConcluidos,
        int totalModulos,
        List<StatusModulo> modulos
) {
    public record StatusModulo(
            String codigo,
            String nome,
            boolean concluido,
            String statusAtual
    ) {}
}
