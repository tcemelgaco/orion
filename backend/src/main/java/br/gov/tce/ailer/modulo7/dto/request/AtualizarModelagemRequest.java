package br.gov.tce.ailer.modulo7.dto.request;

import br.gov.tce.ailer.modulo7.domain.enums.StatusModelagem;
import jakarta.validation.constraints.Size;

public record AtualizarModelagemRequest(
        @Size(max = 255) String titulo,
        String descricaoTexto,
        String codigoMermaid,
        String bpmnTextual,
        String pontosDecisao,
        String integracoes,
        String pontosControle,
        StatusModelagem statusAprovacao
) {}
