package br.gov.tce.ailer.gitlab.dto.response;

import java.util.List;

public record GitLabExportResponse(
        int epicosExportados,
        int historiaExportadas,
        int erros,
        List<String> detalhes
) {}
