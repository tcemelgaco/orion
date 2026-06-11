package br.gov.tce.ailer.modulo2.repository;

import br.gov.tce.ailer.modulo2.domain.Entrevista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EntrevistaRepository extends JpaRepository<Entrevista, UUID> {

    @Query("SELECT e FROM Entrevista e WHERE e.demanda.id = :demandaId ORDER BY e.criadoEm DESC")
    List<Entrevista> findByDemandaId(UUID demandaId);
}
