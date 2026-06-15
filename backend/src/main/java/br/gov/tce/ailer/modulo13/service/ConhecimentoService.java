package br.gov.tce.ailer.modulo13.service;

import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo13.domain.DocumentoConhecimento;
import br.gov.tce.ailer.modulo13.domain.EmbeddingConverter;
import br.gov.tce.ailer.modulo13.dto.request.IngerirDocumentoRequest;
import br.gov.tce.ailer.modulo13.dto.response.BuscaSemanticaResponse;
import br.gov.tce.ailer.modulo13.dto.response.DocumentoConhecimentoResponse;
import br.gov.tce.ailer.modulo13.repository.ConhecimentoRepository;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConhecimentoService {

    private static final String BUSCA_SEMANTICA_SQL = """
            SELECT id, titulo, conteudo, tipo, tags, fonte,
                   tokens_estimados, versao, criado_em, atualizado_em, criado_por, atualizado_por,
                   CAST(1.0 - (embedding::vector(1536) <=> CAST(? AS vector(1536))) AS FLOAT8) AS score
            FROM conhecimento_documentos
            WHERE embedding IS NOT NULL
            ORDER BY embedding::vector(1536) <=> CAST(? AS vector(1536))
            LIMIT ?
            """;

    private final ConhecimentoRepository repository;
    private final OpenAIClient openAIClient;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public DocumentoConhecimentoResponse ingerir(IngerirDocumentoRequest req, String criadoPor) {
        log.info("Iniciando ingestão de documento. titulo={}", req.titulo());

        // OpenAI call ocorre antes de qualquer operação de banco (open-in-view=false,
        // HikariCP só adquire conexão no primeiro acesso JPA), portanto não segura conexão.
        float[] embedding = openAIClient.embedding(req.titulo() + "\n" + req.conteudo());
        int tokensEstimados = req.conteudo().length() / 4;

        DocumentoConhecimento doc = DocumentoConhecimento.builder()
                .titulo(req.titulo())
                .conteudo(req.conteudo())
                .tipo(req.tipo())
                .tags(req.tags())
                .fonte(req.fonte())
                .embedding(embedding)
                .tokensEstimados(tokensEstimados)
                .build();

        DocumentoConhecimento salvo = repository.save(doc);
        log.info("Documento ingerido. id={}, dimensoes={}, tokens_estimados={}",
                salvo.getId(), embedding.length, tokensEstimados);

        return DocumentoConhecimentoResponse.from(salvo);
    }

    @Transactional(readOnly = true)
    public List<DocumentoConhecimentoResponse> listar() {
        return repository.findAll()
                .stream()
                .map(DocumentoConhecimentoResponse::from)
                .toList();
    }

    public List<BuscaSemanticaResponse> buscar(String query, int limite) {
        log.info("Busca semântica iniciada. limite={}", limite);

        float[] queryVetor = openAIClient.embedding(query);
        String queryVetorStr = EmbeddingConverter.format(queryVetor);

        List<BuscaSemanticaResponse> resultados = jdbcTemplate.query(
                BUSCA_SEMANTICA_SQL,
                (rs, rowNum) -> {
                    Timestamp criadoEm = rs.getTimestamp("criado_em");
                    Timestamp atualizadoEm = rs.getTimestamp("atualizado_em");
                    DocumentoConhecimentoResponse doc = new DocumentoConhecimentoResponse(
                            UUID.fromString(rs.getString("id")),
                            rs.getString("titulo"),
                            rs.getString("conteudo"),
                            rs.getString("tipo"),
                            rs.getString("tags"),
                            rs.getString("fonte"),
                            rs.getObject("tokens_estimados", Integer.class),
                            rs.getObject("versao", Integer.class),
                            criadoEm != null ? criadoEm.toLocalDateTime() : null,
                            atualizadoEm != null ? atualizadoEm.toLocalDateTime() : null,
                            rs.getString("criado_por"),
                            rs.getString("atualizado_por")
                    );
                    return new BuscaSemanticaResponse(doc, rs.getDouble("score"));
                },
                queryVetorStr, queryVetorStr, limite
        );

        log.info("Busca semântica concluída. resultados={}", resultados.size());
        return resultados;
    }

    @Transactional
    public void excluir(UUID id) {
        DocumentoConhecimento doc = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Documento de conhecimento não encontrado: " + id));
        repository.delete(doc);
        log.info("Documento excluído da base de conhecimento. id={}", id);
    }
}
