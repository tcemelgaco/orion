package br.gov.tce.ailer.repositorio.dto;

import br.gov.tce.ailer.repositorio.domain.Artefato;
import br.gov.tce.ailer.repositorio.domain.TipoArtefato;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ArtefatoResponse(
        UUID id,
        UUID demandaId,
        String nome,
        String nomeOriginal,
        String descricao,
        TipoArtefato tipoArtefato,
        Long tamanhoBytes,
        String contentType,
        String uploadadoPor,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
    public static ArtefatoResponse from(Artefato a) {
        return new ArtefatoResponse(
                a.getId(), a.getDemandaId(), a.getNome(), a.getNomeOriginal(),
                a.getDescricao(), a.getTipoArtefato(), a.getTamanhoBytes(),
                a.getContentType(), a.getUploadadoPor(), a.getCriadoEm(), a.getAtualizadoEm()
        );
    }

    public static ArtefatoResponse from(ArtefatoInfo i) {
        return new ArtefatoResponse(
                i.getId(), i.getDemandaId(), i.getNome(), i.getNomeOriginal(),
                i.getDescricao(), i.getTipoArtefato(), i.getTamanhoBytes(),
                i.getContentType(), i.getUploadadoPor(), i.getCriadoEm(), i.getAtualizadoEm()
        );
    }
}
