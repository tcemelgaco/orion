package br.gov.tce.ailer.modulo5.repository;

import br.gov.tce.ailer.modulo5.domain.Feature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeatureRepository extends JpaRepository<Feature, UUID> {

    List<Feature> findByEpicoIdOrderByOrdemExibicaoAsc(UUID epicoId);

    long countByEpicoId(UUID epicoId);
}
