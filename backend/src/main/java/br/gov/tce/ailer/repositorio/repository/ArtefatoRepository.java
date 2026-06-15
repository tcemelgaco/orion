package br.gov.tce.ailer.repositorio.repository;

import br.gov.tce.ailer.repositorio.domain.Artefato;
import br.gov.tce.ailer.repositorio.dto.ArtefatoInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ArtefatoRepository extends JpaRepository<Artefato, UUID> {

    // Seleciona apenas metadados — exclui o campo conteudo (bytea) da query
    @Query("""
            SELECT a.id            AS id,
                   a.demandaId     AS demandaId,
                   a.nome          AS nome,
                   a.nomeOriginal  AS nomeOriginal,
                   a.descricao     AS descricao,
                   a.tipoArtefato  AS tipoArtefato,
                   a.tamanhoBytes  AS tamanhoBytes,
                   a.contentType   AS contentType,
                   a.uploadadoPor  AS uploadadoPor,
                   a.criadoEm      AS criadoEm,
                   a.atualizadoEm  AS atualizadoEm
            FROM Artefato a
            WHERE a.demandaId = :demandaId
            ORDER BY a.criadoEm DESC
            """)
    List<ArtefatoInfo> findByDemandaIdOrderByCriadoEmDesc(UUID demandaId);

    long countByDemandaId(UUID demandaId);
}
