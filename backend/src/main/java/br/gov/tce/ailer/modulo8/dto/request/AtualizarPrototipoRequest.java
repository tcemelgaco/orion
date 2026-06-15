package br.gov.tce.ailer.modulo8.dto.request;

public record AtualizarPrototipoRequest(
        String descricaoGeral,
        String telas,
        String fluxoNavegacao,
        String componentesPrincipais,
        String paleta,
        String diretrizes,
        String notasAcessibilidade,
        String tecnologiasSugeridas
) {}
