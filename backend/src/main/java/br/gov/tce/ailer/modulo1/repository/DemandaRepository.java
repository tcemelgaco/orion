package br.gov.tce.ailer.modulo1.repository;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface DemandaRepository extends JpaRepository<Demanda, UUID>, JpaSpecificationExecutor<Demanda> {

    Page<Demanda> findByStatus(StatusDemanda status, Pageable pageable);
}
