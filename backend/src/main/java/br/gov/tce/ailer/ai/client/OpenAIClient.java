package br.gov.tce.ailer.ai.client;

import br.gov.tce.ailer.ai.config.OpenAIProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAIClient {

    private final OpenAIProperties properties;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public void chatStream(List<ChatMessage> mensagens, Consumer<String> onToken, Runnable onDone) {
        try {
            String body = buildRequestBody(mensagens, true);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.baseUrl() + "/v1/chat/completions"))
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .header("Content-Type", "application/json")
                    .header("Accept", "text/event-stream")
                    .timeout(Duration.ofSeconds(90))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            httpClient.send(request, HttpResponse.BodyHandlers.ofLines()).body()
                    .forEach(line -> parseStreamLine(line, onToken));

            onDone.run();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao comunicar com OpenAI API", e);
        }
    }

    public String chat(List<ChatMessage> mensagens) {
        try {
            String body = buildRequestBody(mensagens, false);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.baseUrl() + "/v1/chat/completions"))
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao comunicar com OpenAI API", e);
        }
    }

    private String buildRequestBody(List<ChatMessage> mensagens, boolean stream) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("model", properties.model());
            root.put("temperature", properties.temperature());
            root.put("max_tokens", properties.maxTokens());
            root.put("stream", stream);

            ArrayNode msgs = root.putArray("messages");
            for (ChatMessage m : mensagens) {
                ObjectNode msg = msgs.addObject();
                msg.put("role", m.role());
                msg.put("content", m.content());
            }
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao serializar requisição OpenAI", e);
        }
    }

    private void parseStreamLine(String line, Consumer<String> onToken) {
        if (!line.startsWith("data: ")) return;
        String data = line.substring(6).trim();
        if ("[DONE]".equals(data)) return;
        try {
            JsonNode root = objectMapper.readTree(data);
            String content = root.path("choices").get(0).path("delta").path("content").asText(null);
            if (content != null && !content.isEmpty()) {
                onToken.accept(content);
            }
        } catch (Exception e) {
            log.debug("Falha ao parsear linha SSE: {}", line);
        }
    }
}
