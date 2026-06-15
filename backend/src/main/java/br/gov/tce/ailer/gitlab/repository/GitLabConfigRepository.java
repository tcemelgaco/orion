package br.gov.tce.ailer.gitlab.repository;

import br.gov.tce.ailer.gitlab.domain.GitLabConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GitLabConfigRepository extends JpaRepository<GitLabConfig, UUID> {

    Optional<GitLabConfig> findByDemandaId(UUID demandaId);

    boolean existsByDemandaId(UUID demandaId);
}
