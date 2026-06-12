package br.gov.tce.ailer.modulo6.dto.request;

import br.gov.tce.ailer.modulo6.domain.enums.StatusCasoDeUso;
import jakarta.validation.constraints.Size;

public record AtualizarCasoDeUsoRequest(
        @Size(max = 255) String nome,
        String descricao,
        String atores,
        String preCondicoes,
        String posCondicoes,
        String fluxoPrincipal,
        String fluxosAlternativos,
        String fluxosExcecao,
        String requisitosOrigem,
        String diagramaMermaid,
        StatusCasoDeUso statusAprovacao
) {}
