package br.gov.tce.ailer.modulo6.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarCasoDeUsoRequest(
        @NotBlank @Size(max = 255) String nome,
        String descricao,
        String atores,
        String preCondicoes,
        String posCondicoes,
        String fluxoPrincipal,
        String fluxosAlternativos,
        String fluxosExcecao,
        String requisitosOrigem,
        String diagramaMermaid
) {}
