package br.gov.tce.ailer.modulo13.service;

import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo13.domain.DocumentoConhecimento;
import br.gov.tce.ailer.modulo13.dto.request.IngerirDocumentoRequest;
import br.gov.tce.ailer.modulo13.dto.response.BuscaSemanticaResponse;
import br.gov.tce.ailer.modulo13.dto.response.DocumentoConhecimentoResponse;
import br.gov.tce.ailer.modulo13.repository.ConhecimentoRepository;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConhecimentoService")
class ConhecimentoServiceTest {

    @Mock private ConhecimentoRepository repository;
    @Mock private OpenAIClient openAIClient;
    @Mock private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ConhecimentoService service;

    private static final float[] EMBEDDING_FAKE = {0.1f, 0.2f, 0.3f};

    @Test
    @DisplayName("deve gerar embedding via OpenAI e persistir o documento")
    void deve_ingerir_documento() {
        IngerirDocumentoRequest req = new IngerirDocumentoRequest(
                "Manual LGPD", "Conteúdo do manual de privacidade.", "DOCUMENTO", null, "STI"
        );
        DocumentoConhecimento salvo = docFake("Manual LGPD");
        when(openAIClient.embedding(anyString())).thenReturn(EMBEDDING_FAKE);
        when(repository.save(any(DocumentoConhecimento.class))).thenReturn(salvo);

        DocumentoConhecimentoResponse response = service.ingerir(req, "usuario.teste");

        assertThat(response).isNotNull();
        assertThat(response.titulo()).isEqualTo("Manual LGPD");
        verify(openAIClient).embedding(contains("Manual LGPD"));
        verify(repository).save(any(DocumentoConhecimento.class));
    }

    @Test
    @DisplayName("deve delegar listagem ao repository sem transformação de embedding")
    void deve_listar_documentos() {
        when(repository.findAll()).thenReturn(List.of(docFake("Guia de Processos"), docFake("Manual TI")));

        List<DocumentoConhecimentoResponse> lista = service.listar();

        assertThat(lista).hasSize(2);
        assertThat(lista.get(0).titulo()).isEqualTo("Guia de Processos");
    }

    @Test
    @DisplayName("deve gerar embedding da query e delegar busca ao jdbcTemplate")
    void deve_executar_busca_semantica_via_jdbctemplate() {
        when(openAIClient.embedding(anyString())).thenReturn(EMBEDDING_FAKE);
        doReturn(List.<BuscaSemanticaResponse>of())
                .when(jdbcTemplate)
                .query(anyString(), ArgumentMatchers.<RowMapper<BuscaSemanticaResponse>>any(),
                        any(), any(), any());

        List<BuscaSemanticaResponse> resultado = service.buscar("LGPD dados pessoais", 5);

        assertThat(resultado).isNotNull();
        verify(openAIClient).embedding("LGPD dados pessoais");
        verify(jdbcTemplate).query(anyString(),
                ArgumentMatchers.<RowMapper<BuscaSemanticaResponse>>any(),
                any(), any(), eq(5));
    }

    @Test
    @DisplayName("deve passar o limite correto ao jdbcTemplate na busca semântica")
    void deve_passar_limite_correto_ao_jdbctemplate() {
        when(openAIClient.embedding(anyString())).thenReturn(EMBEDDING_FAKE);
        doReturn(List.<BuscaSemanticaResponse>of())
                .when(jdbcTemplate)
                .query(anyString(), ArgumentMatchers.<RowMapper<BuscaSemanticaResponse>>any(),
                        any(), any(), any());

        service.buscar("query", 10);

        verify(jdbcTemplate).query(anyString(),
                ArgumentMatchers.<RowMapper<BuscaSemanticaResponse>>any(),
                any(), any(), eq(10));
    }

    @Test
    @DisplayName("deve excluir documento existente")
    void deve_excluir_documento_existente() {
        UUID id = UUID.randomUUID();
        DocumentoConhecimento doc = docFake("Doc para exclusão");
        when(repository.findById(id)).thenReturn(Optional.of(doc));

        service.excluir(id);

        verify(repository).delete(doc);
    }

    @Test
    @DisplayName("deve lançar RecursoNaoEncontradoException ao excluir id inexistente")
    void deve_lancar_excecao_ao_excluir_id_inexistente() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.excluir(id))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining(id.toString());
    }

    private DocumentoConhecimento docFake(String titulo) {
        return DocumentoConhecimento.builder()
                .titulo(titulo)
                .conteudo("Conteúdo de teste.")
                .tipo("DOCUMENTO")
                .embedding(EMBEDDING_FAKE)
                .tokensEstimados(10)
                .build();
    }
}
