package br.gov.tce.ailer.modulo5.repository;

import br.gov.tce.ailer.modulo5.domain.Epico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EpicoRepository extends JpaRepository<Epico, UUID> {

    List<Epico> findByDemandaIdOrderByOrdemExibicaoAsc(UUID demandaId);

    long countByDemandaId(UUID demandaId);

    @Modifying
    @Query("DELETE FROM Epico e WHERE e.demandaId = :demandaId AND e.fonte = 'IA'")
    void deleteGeradosPorIa(UUID demandaId);
}
