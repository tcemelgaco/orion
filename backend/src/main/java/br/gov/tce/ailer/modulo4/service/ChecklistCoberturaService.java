package br.gov.tce.ailer.modulo4.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
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
public class ChecklistCoberturaService {

    private final RequisitoRepository requisitoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public JsonNode avaliar(UUID demandaId) {
        List<Requisito> requisitos = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId);
        if (requisitos.isEmpty()) {
            throw new BusinessException("Gere os requisitos antes de verificar a cobertura.");
        }

        String lista = buildLista(requisitos);
        String prompt = loadPrompt();

        log.info("Verificando cobertura para demanda {} ({} requisitos)", demandaId, requisitos.size());
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.user(prompt + lista)
        ));

        return parseJson(jsonResp);
    }

    private String buildLista(List<Requisito> requisitos) {
        StringBuilder sb = new StringBuilder();
        for (Requisito r : requisitos) {
            sb.append(r.getCodigo()).append(" [").append(r.getTipo()).append("] ")
              .append(r.getTitulo());
            if (r.getDescricao() != null) sb.append(" — ").append(r.getDescricao());
            sb.append("\n");
        }
        return sb.toString();
    }

    private JsonNode parseJson(String json) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            return objectMapper.readTree(limpo);
        } catch (IOException e) {
            log.error("Falha ao parsear checklist cobertura: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar análise de cobertura da IA");
        }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/requisitos-cobertura.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt requisitos-cobertura.txt não encontrado", e);
        }
    }
}
