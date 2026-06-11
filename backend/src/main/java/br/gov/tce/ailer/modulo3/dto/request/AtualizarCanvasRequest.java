package br.gov.tce.ailer.modulo3.dto.request;

public record AtualizarCanvasRequest(
        String contexto,
        String problema,
        String solucaoProposta,
        String usuarios,
        String funcionalidadesChave,
        String restricoes,
        String premissas,
        String riscos,
        String criteriosSucesso,
        String integracoes
) {}
