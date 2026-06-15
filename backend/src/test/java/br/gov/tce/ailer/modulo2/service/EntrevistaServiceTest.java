package br.gov.tce.ailer.modulo2.service;

import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.MensagemEntrevista;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.dto.response.EntrevistaResponse;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo2.repository.MensagemEntrevistaRepository;
import br.gov.tce.ailer.modulo2.repository.SumarioLevantamentoRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EntrevistaService")
class EntrevistaServiceTest {

    @Mock private EntrevistaRepository entrevistaRepository;
    @Mock private MensagemEntrevistaRepository mensagemRepository;
    @Mock private SumarioLevantamentoRepository sumarioRepository;
    @Mock private DemandaRepository demandaRepository;
    @Mock private OpenAIClient openAIClient;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks
    private EntrevistaService service;

    private UUID demandaId;
    private UUID entrevistaId;
    private Demanda demanda;
    private Entrevista entrevista;

    @BeforeEach
    void setUp() {
        demandaId    = UUID.randomUUID();
        entrevistaId = UUID.randomUUID();

        demanda = Demanda.builder()
                .titulo("Sistema de Controle")
                .areaDemandante("Auditoria")
                .tipo(TipoDemanda.NOVO_SISTEMA)
                .matriculaSolicitante("99001")
                .build();

        entrevista = new Entrevista();
        entrevista.setDemanda(demanda);
        entrevista.setStatus(StatusEntrevista.EM_ANDAMENTO);
        entrevista.setMensagens(new ArrayList<>());
    }

    @Test
    @DisplayName("deve iniciar entrevista e salvar mensagem SYSTEM quando demanda existe")
    void deve_iniciar_entrevista_quando_demanda_existe() {
        when(demandaRepository.findById(demandaId)).thenReturn(Optional.of(demanda));
        when(entrevistaRepository.save(any(Entrevista.class))).thenReturn(entrevista);
        when(entrevistaRepository.findByIdWithDetails(any())).thenReturn(Optional.of(entrevista));
        when(mensagemRepository.save(any(MensagemEntrevista.class))).thenReturn(null);

        EntrevistaResponse resp = service.iniciar(demandaId);

        assertThat(resp).isNotNull();
        verify(entrevistaRepository).save(any(Entrevista.class));
        verify(mensagemRepository).save(any(MensagemEntrevista.class));
    }

    @Test
    @DisplayName("deve lançar RecursoNaoEncontradoException quando demanda não existe ao iniciar")
    void deve_lancar_excecao_quando_demanda_inexistente_ao_iniciar() {
        when(demandaRepository.findById(demandaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.iniciar(demandaId))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Demanda");
    }

    @Test
    @DisplayName("deve lançar BusinessException ao consolidar entrevista CANCELADA")
    void deve_lancar_excecao_ao_consolidar_entrevista_cancelada() {
        entrevista.setStatus(StatusEntrevista.CANCELADA);
        when(entrevistaRepository.findByIdWithDetails(entrevistaId)).thenReturn(Optional.of(entrevista));

        assertThatThrownBy(() -> service.consolidar(entrevistaId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cancelada");
    }

    @Test
    @DisplayName("deve lançar RecursoNaoEncontradoException quando entrevista não existe ao buscar")
    void deve_lancar_excecao_quando_entrevista_nao_encontrada() {
        when(entrevistaRepository.findByIdWithDetails(entrevistaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscar(entrevistaId))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Entrevista");
    }

    @Test
    @DisplayName("deve retornar entrevista quando existe")
    void deve_retornar_entrevista_quando_existe() {
        when(entrevistaRepository.findByIdWithDetails(entrevistaId)).thenReturn(Optional.of(entrevista));

        EntrevistaResponse resp = service.buscar(entrevistaId);

        assertThat(resp).isNotNull();
        assertThat(resp.status()).isEqualTo(StatusEntrevista.EM_ANDAMENTO);
    }

    @Test
    @DisplayName("deve lançar RecursoNaoEncontradoException quando sumário não existe")
    void deve_lancar_excecao_quando_sumario_nao_encontrado() {
        when(sumarioRepository.findByEntrevistaId(entrevistaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarSumario(entrevistaId))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Sumário");
    }
}
