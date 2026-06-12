package br.gov.tce.ailer.modulo9.repository;

import br.gov.tce.ailer.modulo9.domain.ArquiteturaSolucao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ArquiteturaSolucaoRepository extends JpaRepository<ArquiteturaSolucao, UUID> {
    Optional<ArquiteturaSolucao> findByDemandaId(UUID demandaId);
}
