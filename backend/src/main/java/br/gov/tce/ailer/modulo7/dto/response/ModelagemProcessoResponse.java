package br.gov.tce.ailer.modulo7.dto.response;

import br.gov.tce.ailer.modulo7.domain.ModelagemProcesso;
import br.gov.tce.ailer.modulo7.domain.enums.StatusModelagem;
import br.gov.tce.ailer.modulo7.domain.enums.TipoFluxo;

import java.time.LocalDateTime;
import java.util.UUID;

public record ModelagemProcessoResponse(
        UUID id,
        UUID demandaId,
        TipoFluxo tipoFluxo,
        String titulo,
        String descricaoTexto,
        String codigoMermaid,
        String bpmnTextual,
        String pontosDecisao,
        String integracoes,
        String pontosControle,
        StatusModelagem statusAprovacao,
        String aprovadoPor,
        LocalDateTime aprovadoEm,
        String fonte,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static ModelagemProcessoResponse from(ModelagemProcesso m) {
        return new ModelagemProcessoResponse(
                m.getId(), m.getDemandaId(), m.getTipoFluxo(), m.getTitulo(),
                m.getDescricaoTexto(), m.getCodigoMermaid(), m.getBpmnTextual(),
                m.getPontosDecisao(), m.getIntegracoes(), m.getPontosControle(),
                m.getStatusAprovacao(), m.getAprovadoPor(), m.getAprovadoEm(),
                m.getFonte(), m.getCriadoEm(), m.getAtualizadoEm()
        );
    }
}
