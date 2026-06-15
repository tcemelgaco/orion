package br.gov.tce.ailer.gitlab.domain;

import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "gitlab_config")
public class GitLabConfig extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Column(name = "gitlab_url", nullable = false, length = 500)
    private String gitlabUrl;

    @Column(name = "project_id", nullable = false, length = 200)
    private String projectId;

    // Armazenado em texto plano — rotacionar tokens curtos via GitLab Project Access Tokens.
    @Column(name = "access_token", nullable = false, length = 500)
    private String accessToken;

    @Column(nullable = false)
    private boolean ativo = true;

    @Builder
    public GitLabConfig(UUID demandaId, String gitlabUrl, String projectId, String accessToken) {
        this.demandaId = demandaId;
        this.gitlabUrl = gitlabUrl;
        this.projectId = projectId;
        this.accessToken = accessToken;
    }
}
