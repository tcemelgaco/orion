package br.gov.tce.ailer.modulo14.service;

import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo14.domain.AgenteMensagem;
import br.gov.tce.ailer.modulo14.domain.AgenteSessao;
import br.gov.tce.ailer.modulo14.domain.enums.TipoAgente;
import br.gov.tce.ailer.modulo14.dto.response.AgenteMensagemResponse;
import br.gov.tce.ailer.modulo14.dto.response.AgenteSessaoResponse;
import br.gov.tce.ailer.modulo14.repository.AgenteMensagemRepository;
import br.gov.tce.ailer.modulo14.repository.AgenteSessaoRepository;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AgenteService")
class AgenteServiceTest {

    @Mock private AgenteSessaoRepository sessaoRepository;
    @Mock private AgenteMensagemRepository mensagemRepository;
    @Mock private DemandaRepository demandaRepository;
    @Mock private OpenAIClient openAIClient;

    @InjectMocks
    private AgenteService service;

    @Test
    @DisplayName("deve criar sessão com título composto por tipo + título da demanda")
    void deve_criar_sessao_com_titulo_correto() {
        UUID demandaId = UUID.randomUUID();
        Demanda demanda = demandaFake(demandaId, "Sistema de Contabilidade");
        AgenteSessao sessaoSalva = AgenteSessao.builder()
                .demandaId(demandaId)
                .tipoAgente(TipoAgente.ANALISTA_REQUISITOS)
                .titulo("Analista de Requisitos — Sistema de Contabilidade")
                .build();

        when(demandaRepository.findById(demandaId)).thenReturn(Optional.of(demanda));
        when(sessaoRepository.save(any(AgenteSessao.class))).thenReturn(sessaoSalva);

        AgenteSessaoResponse response = service.criarSessao(demandaId, TipoAgente.ANALISTA_REQUISITOS, "usuario");

        assertThat(response.tipoAgente()).isEqualTo(TipoAgente.ANALISTA_REQUISITOS);
        assertThat(response.titulo()).contains("Analista de Requisitos");
        assertThat(response.titulo()).contains("Sistema de Contabilidade");
        verify(sessaoRepository).save(any(AgenteSessao.class));
    }

    @Test
    @DisplayName("deve truncar título da demanda em 80 caracteres no título da sessão")
    void deve_truncar_titulo_longo_da_demanda() {
        UUID demandaId = UUID.randomUUID();
        String tituloLongo = "A".repeat(100);
        Demanda demanda = demandaFake(demandaId, tituloLongo);
        AgenteSessao sessaoSalva = AgenteSessao.builder()
                .demandaId(demandaId)
                .tipoAgente(TipoAgente.ESTIMADOR)
                .titulo("Estimador de Esforço — " + "A".repeat(80))
                .build();

        when(demandaRepository.findById(demandaId)).thenReturn(Optional.of(demanda));
        when(sessaoRepository.save(any(AgenteSessao.class))).thenReturn(sessaoSalva);

        AgenteSessaoResponse response = service.criarSessao(demandaId, TipoAgente.ESTIMADOR, "usuario");

        assertThat(response.titulo()).doesNotContain("A".repeat(81));
    }

    @Test
    @DisplayName("deve lançar RecursoNaoEncontradoException ao criar sessão com demanda inexistente")
    void deve_rejeitar_sessao_com_demanda_inexistente() {
        UUID demandaId = UUID.randomUUID();
        when(demandaRepository.findById(demandaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criarSessao(demandaId, TipoAgente.ESTIMADOR, "usuario"))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining(demandaId.toString());
    }

    @Test
    @DisplayName("deve listar sessões de uma demanda delegando ao repository")
    void deve_listar_sessoes_da_demanda() {
        UUID demandaId = UUID.randomUUID();
        AgenteSessao sessao = AgenteSessao.builder()
                .demandaId(demandaId)
                .tipoAgente(TipoAgente.PRODUCT_OWNER)
                .titulo("Product Owner — Demanda X")
                .build();
        when(sessaoRepository.findByDemandaId(demandaId)).thenReturn(List.of(sessao));

        List<AgenteSessaoResponse> sessoes = service.listarSessoes(demandaId);

        assertThat(sessoes).hasSize(1);
        assertThat(sessoes.get(0).tipoAgente()).isEqualTo(TipoAgente.PRODUCT_OWNER);
        assertThat(sessoes.get(0).displayName()).isEqualTo("Product Owner");
    }

    @Test
    @DisplayName("deve listar mensagens de uma sessão em ordem cronológica")
    void deve_listar_mensagens_em_ordem_cronologica() {
        UUID sessaoId = UUID.randomUUID();
        AgenteMensagem msg1 = AgenteMensagem.builder()
                .sessaoId(sessaoId).papel("USUARIO").conteudo("Olá").build();
        AgenteMensagem msg2 = AgenteMensagem.builder()
                .sessaoId(sessaoId).papel("AGENTE").conteudo("Como posso ajudar?").build();
        when(mensagemRepository.findBySessaoIdOrderByCriadoEmAsc(sessaoId))
                .thenReturn(List.of(msg1, msg2));

        List<AgenteMensagemResponse> msgs = service.listarMensagens(sessaoId);

        assertThat(msgs).hasSize(2);
        assertThat(msgs.get(0).papel()).isEqualTo("USUARIO");
        assertThat(msgs.get(1).papel()).isEqualTo("AGENTE");
        assertThat(msgs.get(1).conteudo()).isEqualTo("Como posso ajudar?");
    }

    @Test
    @DisplayName("deve retornar lista vazia quando demanda não tem sessões")
    void deve_retornar_lista_vazia_sem_sessoes() {
        UUID demandaId = UUID.randomUUID();
        when(sessaoRepository.findByDemandaId(demandaId)).thenReturn(List.of());

        assertThat(service.listarSessoes(demandaId)).isEmpty();
    }

    private Demanda demandaFake(UUID id, String titulo) {
        return Demanda.builder()
                .titulo(titulo)
                .areaDemandante("TCE-CE")
                .tipo(TipoDemanda.NOVO_SISTEMA)
                .matriculaSolicitante("12345")
                .build();
    }
}
