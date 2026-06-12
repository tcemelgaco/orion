package br.gov.tce.ailer.repositorio.dto;

import br.gov.tce.ailer.repositorio.domain.TipoArtefato;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Projection Spring Data — não carrega o campo conteudo (bytea) na listagem. */
public interface ArtefatoInfo {
    UUID getId();
    UUID getDemandaId();
    String getNome();
    String getNomeOriginal();
    String getDescricao();
    TipoArtefato getTipoArtefato();
    Long getTamanhoBytes();
    String getContentType();
    String getUploadadoPor();
    OffsetDateTime getCriadoEm();
    OffsetDateTime getAtualizadoEm();
}
