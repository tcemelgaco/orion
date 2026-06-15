package br.gov.tce.ailer.gitlab.dto.response;

import br.gov.tce.ailer.gitlab.domain.GitLabConfig;

import java.util.UUID;

public record GitLabConfigResponse(
        UUID id,
        UUID demandaId,
        String gitlabUrl,
        String projectId,
        String accessTokenMasked,
        boolean ativo
) {
    public static GitLabConfigResponse from(GitLabConfig c) {
        String token = c.getAccessToken();
        String masked = token.length() > 4
                ? "****" + token.substring(token.length() - 4)
                : "****";
        return new GitLabConfigResponse(
                c.getId(), c.getDemandaId(),
                c.getGitlabUrl(), c.getProjectId(),
                masked, c.isAtivo()
        );
    }
}
