package br.gov.tce.ailer.modulo1.repository;

import br.gov.tce.ailer.modulo1.domain.HistoricoDemanda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HistoricoDemandaRepository extends JpaRepository<HistoricoDemanda, UUID> {

    Page<HistoricoDemanda> findByDemandaIdOrderByAlteradoEmDesc(UUID demandaId, Pageable pageable);
}
