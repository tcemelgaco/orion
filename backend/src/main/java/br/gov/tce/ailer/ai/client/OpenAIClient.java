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

    private static final int MAX_TENTATIVAS = 3;
    private static final long BACKOFF_BASE_MS = 1_000;

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
                    .timeout(Duration.ofSeconds(30))
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
        String body = buildRequestBody(mensagens, false);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(properties.baseUrl() + "/v1/chat/completions"))
                .header("Authorization", "Bearer " + properties.apiKey())
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return executeComRetry(request, "chat");
    }

    public float[] embedding(String texto) {
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

            HttpResponse<String> response = enviar(request);
            validarStatus(response, "embeddings");

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode embeddingArray = root.path("data").get(0).path("embedding");
            if (!embeddingArray.isArray()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Resposta inválida da OpenAI Embeddings: campo 'embedding' ausente.");
            }

            int usage = root.path("usage").path("total_tokens").asInt(0);
            log.info("openai.embedding model={} tokens={} dims={}",
                    properties.embeddingModel(), usage, embeddingArray.size());

            float[] vetor = new float[embeddingArray.size()];
            for (int i = 0; i < embeddingArray.size(); i++) {
                vetor[i] = (float) embeddingArray.get(i).asDouble();
            }
            return vetor;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao gerar embedding via OpenAI API", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Erro ao gerar embedding via OpenAI API", e);
        }
    }

    // ── Retry com backoff exponencial ────────────────────────────────────────

    private String executeComRetry(HttpRequest request, String operacao) {
        int tentativa = 0;
        while (true) {
            try {
                HttpResponse<String> response = enviar(request);
                if (deveRetry(response.statusCode()) && tentativa < MAX_TENTATIVAS - 1) {
                    long espera = BACKOFF_BASE_MS * (1L << tentativa);
                    log.warn("OpenAI {} status={} tentativa={}/{} aguardando {}ms",
                            operacao, response.statusCode(), tentativa + 1, MAX_TENTATIVAS, espera);
                    Thread.sleep(espera);
                    tentativa++;
                    continue;
                }
                validarStatus(response, operacao);
                return extrairConteudo(response, operacao);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrompido aguardando retry OpenAI", e);
            } catch (IOException e) {
                if (tentativa < MAX_TENTATIVAS - 1) {
                    long espera = BACKOFF_BASE_MS * (1L << tentativa);
                    log.warn("OpenAI {} IOException tentativa={}/{} aguardando {}ms: {}",
                            operacao, tentativa + 1, MAX_TENTATIVAS, espera, e.getMessage());
                    try { Thread.sleep(espera); } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrompido durante retry OpenAI", ie);
                    }
                    tentativa++;
                } else {
                    throw new RuntimeException("Erro ao comunicar com OpenAI API após " + MAX_TENTATIVAS + " tentativas", e);
                }
            }
        }
    }

    private boolean deveRetry(int status) {
        return status == 429 || status == 500 || status == 502 || status == 503 || status == 504;
    }

    private HttpResponse<String> enviar(HttpRequest request) throws IOException, InterruptedException {
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private void validarStatus(HttpResponse<String> response, String operacao) {
        int status = response.statusCode();
        if (status == 200) return;
        log.error("OpenAI {} status={} body={}", operacao, status, response.body());
        if (status == 429) {
            boolean quotaEsgotada = response.body().contains("insufficient_quota");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    quotaEsgotada
                            ? "Cota da OpenAI esgotada. Adicione créditos em platform.openai.com/settings/billing."
                            : "Limite de requisições da OpenAI atingido. Tente novamente em instantes.");
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Erro na comunicação com a OpenAI (status " + status + ")");
    }

    private String extrairConteudo(HttpResponse<String> response, String operacao) {
        try {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                log.error("OpenAI {} sem choices: {}", operacao, response.body());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Resposta inválida da OpenAI: sem conteúdo gerado.");
            }
            JsonNode usage = root.path("usage");
            log.info("openai.chat model={} prompt_tokens={} completion_tokens={} total_tokens={}",
                    properties.model(),
                    usage.path("prompt_tokens").asInt(0),
                    usage.path("completion_tokens").asInt(0),
                    usage.path("total_tokens").asInt(0));
            return choices.get(0).path("message").path("content").asText();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao parsear resposta da OpenAI", e);
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
