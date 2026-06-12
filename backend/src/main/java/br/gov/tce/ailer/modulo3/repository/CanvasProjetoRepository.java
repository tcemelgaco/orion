package br.gov.tce.ailer.modulo3.repository;

import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CanvasProjetoRepository extends JpaRepository<CanvasProjeto, UUID> {

    Optional<CanvasProjeto> findByDemandaId(UUID demandaId);
}
