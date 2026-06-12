package br.gov.tce.ailer.repositorio.repository;

import br.gov.tce.ailer.repositorio.domain.Artefato;
import br.gov.tce.ailer.repositorio.dto.ArtefatoInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArtefatoRepository extends JpaRepository<Artefato, UUID> {

    List<ArtefatoInfo> findByDemandaIdOrderByCriadoEmDesc(UUID demandaId);

    long countByDemandaId(UUID demandaId);
}
