package br.gov.tce.ailer.modulo14.repository;

import br.gov.tce.ailer.modulo14.domain.AgenteMensagem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AgenteMensagemRepository extends JpaRepository<AgenteMensagem, UUID> {

    List<AgenteMensagem> findBySessaoIdOrderByCriadoEmAsc(UUID sessaoId);
}
