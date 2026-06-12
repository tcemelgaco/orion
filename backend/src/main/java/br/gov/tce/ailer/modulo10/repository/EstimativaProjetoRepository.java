package br.gov.tce.ailer.modulo10.repository;

import br.gov.tce.ailer.modulo10.domain.EstimativaProjeto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EstimativaProjetoRepository extends JpaRepository<EstimativaProjeto, UUID> {
    Optional<EstimativaProjeto> findByDemandaId(UUID demandaId);
}
