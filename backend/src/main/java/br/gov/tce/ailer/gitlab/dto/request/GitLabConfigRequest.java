package br.gov.tce.ailer.gitlab.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GitLabConfigRequest(

        @NotBlank(message = "URL do GitLab é obrigatória")
        @Pattern(regexp = "https?://.+", message = "URL deve começar com http:// ou https://")
        String gitlabUrl,

        @NotBlank(message = "ID ou caminho do projeto é obrigatório")
        String projectId,

        @NotBlank(message = "Token de acesso é obrigatório")
        String accessToken
) {}
