package br.gov.tce.ailer.modulo11.repository;

import br.gov.tce.ailer.modulo11.domain.GovernancaProjeto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GovernancaProjetoRepository extends JpaRepository<GovernancaProjeto, UUID> {
    Optional<GovernancaProjeto> findByDemandaId(UUID demandaId);
}
