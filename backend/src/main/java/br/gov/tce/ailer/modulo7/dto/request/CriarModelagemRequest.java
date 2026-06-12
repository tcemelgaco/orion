package br.gov.tce.ailer.modulo7.dto.request;

import br.gov.tce.ailer.modulo7.domain.enums.TipoFluxo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriarModelagemRequest(
        @NotNull TipoFluxo tipoFluxo,
        @NotBlank @Size(max = 255) String titulo,
        String descricaoTexto,
        String codigoMermaid,
        String bpmnTextual,
        String pontosDecisao,
        String integracoes,
        String pontosControle
) {}
