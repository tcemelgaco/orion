package br.gov.tce.ailer.modulo4.repository;

import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RequisitoRepository extends JpaRepository<Requisito, UUID> {

    List<Requisito> findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(UUID demandaId);

    List<Requisito> findByDemandaIdAndTipoOrderByOrdemExibicaoAsc(UUID demandaId, TipoRequisito tipo);

    long countByDemandaIdAndTipo(UUID demandaId, TipoRequisito tipo);

    @Modifying
    @Query("DELETE FROM Requisito r WHERE r.demandaId = :demandaId AND r.fonte = 'IA'")
    void deleteGeradosPorIa(UUID demandaId);
}
