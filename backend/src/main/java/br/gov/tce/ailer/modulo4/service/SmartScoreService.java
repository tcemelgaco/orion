package br.gov.tce.ailer.modulo4.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.dto.response.RequisitoResponse;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmartScoreService {

    private final RequisitoRepository requisitoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public RequisitoResponse avaliar(UUID requisitoId) {
        Requisito r = requisitoRepo.findById(requisitoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requisito não encontrado"));

        String contexto = buildContexto(r);
        String prompt   = loadPrompt();

        log.info("Avaliando SMART para requisito {}", requisitoId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt),
                ChatMessage.user(contexto)
        ));

        parseAndSave(r, jsonResp);
        return RequisitoResponse.from(requisitoRepo.save(r));
    }

    private String buildContexto(Requisito r) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tipo: ").append(r.getTipo().name()).append("\n");
        sb.append("Título: ").append(r.getTitulo()).append("\n");
        if (r.getDescricao() != null)          sb.append("Descrição: ").append(r.getDescricao()).append("\n");
        if (r.getCriterioAceitacao() != null)  sb.append("Critério de Aceitação: ").append(r.getCriterioAceitacao()).append("\n");
        return sb.toString();
    }

    private void parseAndSave(Requisito r, String json) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            JsonNode root = objectMapper.readTree(limpo);
            r.setSmartScore(root.path("score").asInt(0));
            r.setSmartDetalhes(limpo);
        } catch (IOException e) {
            log.error("Falha ao parsear resposta SMART para requisito {}: {}", r.getId(), limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar avaliação SMART da IA");
        }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/smart-avaliacao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt smart-avaliacao.txt não encontrado", e);
        }
    }
}
