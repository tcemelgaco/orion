package br.gov.tce.ailer.modulo8.repository;

import br.gov.tce.ailer.modulo8.domain.PrototipoSistema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PrototipoSistemaRepository extends JpaRepository<PrototipoSistema, UUID> {
    Optional<PrototipoSistema> findByDemandaId(UUID demandaId);
}
