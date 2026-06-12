package br.gov.tce.ailer.modulo13.service;

import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo13.domain.DocumentoConhecimento;
import br.gov.tce.ailer.modulo13.dto.request.IngerirDocumentoRequest;
import br.gov.tce.ailer.modulo13.dto.response.BuscaSemanticaResponse;
import br.gov.tce.ailer.modulo13.dto.response.DocumentoConhecimentoResponse;
import br.gov.tce.ailer.modulo13.repository.ConhecimentoRepository;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConhecimentoService {

    private final ConhecimentoRepository repository;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    /**
     * Ingere um documento na base de conhecimento:
     * estima tokens, gera embedding via OpenAI e persiste.
     */
    @Transactional
    public DocumentoConhecimentoResponse ingerir(IngerirDocumentoRequest req, String criadoPor) {
        log.info("Iniciando ingestão de documento. titulo={}", req.titulo());

        int tokensEstimados = req.conteudo().length() / 4;

        // O embedding é gerado FORA de qualquer transação aberta para não manter
        // conexão de banco durante a chamada de rede (boa prática AILER).
        // A anotação @Transactional desta service engloba apenas o save final,
        // portanto a chamada ao OpenAI ocorre antes do JPA iniciar um flush.
        String embeddingJson = openAIClient.embedding(req.titulo() + "\n" + req.conteudo());
        log.debug("Embedding gerado para documento '{}'", req.titulo());

        DocumentoConhecimento doc = DocumentoConhecimento.builder()
                .titulo(req.titulo())
                .conteudo(req.conteudo())
                .tipo(req.tipo())
                .tags(req.tags())
                .fonte(req.fonte())
                .embedding(embeddingJson)
                .tokensEstimados(tokensEstimados)
                .build();

        DocumentoConhecimento salvo = repository.save(doc);
        log.info("Documento ingerido com sucesso. id={}, tokens_estimados={}", salvo.getId(), tokensEstimados);

        return DocumentoConhecimentoResponse.from(salvo);
    }

    /**
     * Lista todos os documentos da base de conhecimento (sem embedding no response).
     */
    @Transactional(readOnly = true)
    public List<DocumentoConhecimentoResponse> listar() {
        return repository.findAll()
                .stream()
                .map(DocumentoConhecimentoResponse::from)
                .toList();
    }

    /**
     * Busca semântica por similaridade coseno entre o embedding da query
     * e os embeddings já armazenados. Retorna os top-N documentos ordenados
     * por score decrescente.
     *
     * @param query  Texto da consulta
     * @param limite Número máximo de resultados (1–20)
     */
    @Transactional(readOnly = true)
    public List<BuscaSemanticaResponse> buscar(String query, int limite) {
        log.info("Busca semântica iniciada. limite={}", limite);

        String queryEmbeddingJson = openAIClient.embedding(query);
        float[] queryVetor = parseEmbedding(queryEmbeddingJson);

        List<DocumentoConhecimento> candidatos = repository.findByEmbeddingIsNotNull();
        log.debug("Candidatos para busca semântica: {}", candidatos.size());

        List<BuscaSemanticaResponse> resultados = new ArrayList<>();

        for (DocumentoConhecimento doc : candidatos) {
            float[] docVetor = parseEmbedding(doc.getEmbedding());
            if (docVetor.length == 0) {
                log.warn("Documento id={} possui embedding inválido, ignorando.", doc.getId());
                continue;
            }
            double score = cosineSimilarity(queryVetor, docVetor);
            resultados.add(new BuscaSemanticaResponse(DocumentoConhecimentoResponse.from(doc), score));
        }

        resultados.sort(Comparator.comparingDouble(BuscaSemanticaResponse::score).reversed());

        List<BuscaSemanticaResponse> top = resultados.stream()
                .limit(limite)
                .toList();

        log.info("Busca semântica concluída. resultados_retornados={}", top.size());
        return top;
    }

    /**
     * Exclui um documento pelo ID. Lança 404 se não encontrado.
     */
    @Transactional
    public void excluir(UUID id) {
        DocumentoConhecimento doc = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Documento de conhecimento não encontrado: " + id));
        repository.delete(doc);
        log.info("Documento excluído da base de conhecimento. id={}", id);
    }

    // -------------------------------------------------------------------------
    // Métodos utilitários privados
    // -------------------------------------------------------------------------

    /**
     * Calcula a similaridade coseno entre dois vetores de floats.
     * Retorna 0.0 caso algum dos vetores seja nulo ou de norma zero.
     */
    private double cosineSimilarity(float[] a, float[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < Math.min(a.length, b.length); i++) {
            dot   += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        double denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom < 1e-10 ? 0.0 : dot / denom;
    }

    /**
     * Deserializa a string JSON de embedding (ex.: "[0.1,0.2,...]") em float[].
     * Retorna float[0] em caso de erro para que o documento seja ignorado na busca.
     */
    private float[] parseEmbedding(String json) {
        try {
            JsonNode arr = objectMapper.readTree(json);
            float[] result = new float[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                result[i] = (float) arr.get(i).asDouble();
            }
            return result;
        } catch (Exception e) {
            log.warn("Falha ao parsear embedding JSON: {}", e.getMessage());
            return new float[0];
        }
    }
}
