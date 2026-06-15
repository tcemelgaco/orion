package br.gov.tce.ailer.gitlab.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class GitLabClient {

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public GitLabMilestoneResult criarMilestone(String gitlabUrl, String projectId,
                                                String token, String titulo, String descricao) {
        try {
            String url = baseApiUrl(gitlabUrl, projectId) + "/milestones";

            ObjectNode body = objectMapper.createObjectNode();
            body.put("title", titulo);
            if (descricao != null && !descricao.isBlank()) {
                body.put("description", descricao);
            }

            JsonNode response = post(url, token, body);
            int id = response.path("id").asInt();
            String webUrl = response.path("web_url").asText();
            log.info("Milestone criado no GitLab. id={}, url={}", id, webUrl);
            return new GitLabMilestoneResult(id, webUrl);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao criar milestone no GitLab: " + e.getMessage(), e);
        }
    }

    public GitLabIssueResult criarIssue(String gitlabUrl, String projectId, String token,
                                        String titulo, String descricao,
                                        Integer milestoneId, String labels) {
        try {
            String url = baseApiUrl(gitlabUrl, projectId) + "/issues";

            ObjectNode body = objectMapper.createObjectNode();
            body.put("title", titulo);
            if (descricao != null && !descricao.isBlank()) {
                body.put("description", descricao);
            }
            if (milestoneId != null) {
                body.put("milestone_id", milestoneId);
            }
            if (labels != null && !labels.isBlank()) {
                body.put("labels", labels);
            }

            JsonNode response = post(url, token, body);
            int iid = response.path("iid").asInt();
            String webUrl = response.path("web_url").asText();
            log.info("Issue criada no GitLab. iid={}, url={}", iid, webUrl);
            return new GitLabIssueResult(iid, webUrl);

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao criar issue no GitLab: " + e.getMessage(), e);
        }
    }

    public JsonNode buscarProjeto(String gitlabUrl, String projectId, String token) {
        try {
            String url = baseApiUrl(gitlabUrl, projectId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("PRIVATE-TOKEN", token)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 401 || response.statusCode() == 403) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Token GitLab inválido ou sem permissão no projeto.");
            }
            if (response.statusCode() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Projeto GitLab não encontrado: " + projectId);
            }
            return objectMapper.readTree(response.body());

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao consultar projeto GitLab: " + e.getMessage(), e);
        }
    }

    // -------------------------------------------------------------------------

    private String baseApiUrl(String gitlabUrl, String projectId) {
        String base = gitlabUrl.replaceAll("/+$", "");
        String encodedId = URLEncoder.encode(projectId, StandardCharsets.UTF_8);
        return base + "/api/v4/projects/" + encodedId;
    }

    private JsonNode post(String url, String token, ObjectNode body)
            throws IOException, InterruptedException {

        String bodyStr = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("PRIVATE-TOKEN", token)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(bodyStr))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 401 || response.statusCode() == 403) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Token GitLab inválido ou sem permissão para criar recursos.");
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            log.error("GitLab API retornou status {}: {}", response.statusCode(), response.body());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro na API do GitLab (status " + response.statusCode() + ")");
        }
        return objectMapper.readTree(response.body());
    }

    public record GitLabMilestoneResult(int id, String url) {}
    public record GitLabIssueResult(int iid, String url) {}
}
