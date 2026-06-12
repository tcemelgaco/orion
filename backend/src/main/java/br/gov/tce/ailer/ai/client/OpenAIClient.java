package br.gov.tce.ailer.ai.client;

import br.gov.tce.ailer.ai.config.OpenAIProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
            if (response.statusCode() != 200) {
                log.error("OpenAI API retornou status {}: {}", response.statusCode(), response.body());
                if (response.statusCode() == 429) {
                    boolean quotaEsgotada = response.body().contains("insufficient_quota");
                    String msg = quotaEsgotada
                            ? "Cota da OpenAI esgotada. Adicione créditos em platform.openai.com/settings/billing."
                            : "Limite de requisições da OpenAI atingido. Aguarde alguns instantes e tente novamente.";
                    throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, msg);
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Erro na comunicação com a OpenAI (status " + response.statusCode() + ")");
            }
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                log.error("Resposta OpenAI sem choices: {}", response.body());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Resposta inválida da OpenAI: sem conteúdo gerado.");
            }
            return choices.get(0).path("message").path("content").asText();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao comunicar com OpenAI API", e);
        }
    }

    public String embedding(String texto) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", properties.embeddingModel());
            requestBody.put("input", texto);
            String body = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.baseUrl() + "/v1/embeddings"))
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.error("OpenAI Embeddings API retornou status {}", response.statusCode());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Erro na geração de embedding (status " + response.statusCode() + ")");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode embeddingArray = root.path("data").get(0).path("embedding");
            if (!embeddingArray.isArray()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Resposta inválida da OpenAI Embeddings: campo 'embedding' ausente.");
            }

            int usage = root.path("usage").path("total_tokens").asInt(0);
            log.debug("Embedding gerado. tokens_usados={}", usage);

            return objectMapper.writeValueAsString(embeddingArray);
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao gerar embedding via OpenAI API", e);
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
