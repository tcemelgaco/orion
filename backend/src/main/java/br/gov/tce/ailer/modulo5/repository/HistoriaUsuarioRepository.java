package br.gov.tce.ailer.modulo5.repository;

import br.gov.tce.ailer.modulo5.domain.HistoriaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HistoriaUsuarioRepository extends JpaRepository<HistoriaUsuario, UUID> {

    List<HistoriaUsuario> findByFeatureIdOrderByOrdemExibicaoAsc(UUID featureId);

    List<HistoriaUsuario> findByDemandaIdOrderByOrdemExibicaoAsc(UUID demandaId);

    long countByFeatureId(UUID featureId);

    List<HistoriaUsuario> findByFeature_EpicoIdOrderByOrdemExibicaoAsc(UUID epicoId);
}
