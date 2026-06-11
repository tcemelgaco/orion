package br.gov.tce.ailer.modulo1.repository;

import br.gov.tce.ailer.modulo1.domain.Stakeholder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StakeholderRepository extends JpaRepository<Stakeholder, UUID> {

    List<Stakeholder> findByDemandaId(UUID demandaId);

    void deleteByDemandaIdAndId(UUID demandaId, UUID stakeholderId);
}
