package br.gov.tce.ailer.modulo2.repository;

import br.gov.tce.ailer.modulo2.domain.SumarioLevantamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SumarioLevantamentoRepository extends JpaRepository<SumarioLevantamento, UUID> {

    Optional<SumarioLevantamento> findByEntrevistaId(UUID entrevistaId);
}
