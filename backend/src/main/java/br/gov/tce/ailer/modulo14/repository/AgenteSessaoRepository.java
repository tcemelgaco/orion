package br.gov.tce.ailer.modulo14.repository;

import br.gov.tce.ailer.modulo14.domain.AgenteSessao;
import br.gov.tce.ailer.modulo14.domain.enums.TipoAgente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AgenteSessaoRepository extends JpaRepository<AgenteSessao, UUID> {

    List<AgenteSessao> findByDemandaId(UUID demandaId);

    List<AgenteSessao> findByDemandaIdAndTipoAgente(UUID demandaId, TipoAgente tipoAgente);
}
