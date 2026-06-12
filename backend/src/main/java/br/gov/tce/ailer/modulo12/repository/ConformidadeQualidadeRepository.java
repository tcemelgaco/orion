package br.gov.tce.ailer.modulo12.repository;

import br.gov.tce.ailer.modulo12.domain.ConformidadeQualidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConformidadeQualidadeRepository extends JpaRepository<ConformidadeQualidade, UUID> {
    Optional<ConformidadeQualidade> findByDemandaId(UUID demandaId);
}
