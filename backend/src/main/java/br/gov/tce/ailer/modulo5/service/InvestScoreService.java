package br.gov.tce.ailer.modulo5.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo5.domain.HistoriaUsuario;
import br.gov.tce.ailer.modulo5.dto.response.HistoriaUsuarioResponse;
import br.gov.tce.ailer.modulo5.repository.HistoriaUsuarioRepository;
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
public class InvestScoreService {

    private final HistoriaUsuarioRepository historiaRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public HistoriaUsuarioResponse avaliar(UUID historiaId) {
        HistoriaUsuario h = historiaRepo.findById(historiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "História não encontrada"));

        String contexto = buildContexto(h);
        String prompt   = loadPrompt();

        log.info("Avaliando INVEST para história {}", historiaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt),
                ChatMessage.user(contexto)
        ));

        parseAndSave(h, jsonResp);
        return HistoriaUsuarioResponse.from(historiaRepo.save(h));
    }

    private String buildContexto(HistoriaUsuario h) {
        StringBuilder sb = new StringBuilder();
        sb.append("Como ").append(h.getComoPapel()).append(", ");
        sb.append("quero ").append(h.getQueroAcao());
        if (h.getParaBeneficio() != null) sb.append(", para ").append(h.getParaBeneficio());
        sb.append("\n");
        if (h.getCriteriosAceitacao() != null)
            sb.append("Critérios de Aceitação: ").append(h.getCriteriosAceitacao()).append("\n");
        if (h.getStoryPoints() != null)
            sb.append("Story Points estimados: ").append(h.getStoryPoints()).append("\n");
        return sb.toString();
    }

    private void parseAndSave(HistoriaUsuario h, String json) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            JsonNode root = objectMapper.readTree(limpo);
            h.setInvestScore(root.path("score").asInt(0));
            h.setInvestDetalhes(limpo);
        } catch (IOException e) {
            log.error("Falha ao parsear resposta INVEST para história {}: {}", h.getId(), limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar avaliação INVEST da IA");
        }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/invest-avaliacao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt invest-avaliacao.txt não encontrado", e);
        }
    }
}
