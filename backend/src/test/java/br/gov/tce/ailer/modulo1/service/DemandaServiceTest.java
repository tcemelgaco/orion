package br.gov.tce.ailer.modulo1.service;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import br.gov.tce.ailer.modulo1.dto.request.AtualizarDemandaRequest;
import br.gov.tce.ailer.modulo1.dto.request.CriarDemandaRequest;
import br.gov.tce.ailer.modulo1.dto.response.DemandaResponse;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo1.repository.HistoricoDemandaRepository;
import br.gov.tce.ailer.modulo1.repository.StakeholderRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DemandaService")
class DemandaServiceTest {

    @Mock private DemandaRepository demandaRepository;
    @Mock private StakeholderRepository stakeholderRepository;
    @Mock private HistoricoDemandaRepository historicoRepository;

    @InjectMocks
    private DemandaService service;

    private CriarDemandaRequest requestValido;
    private Demanda demandaSalva;

    @BeforeEach
    void setUp() {
        requestValido = new CriarDemandaRequest(
                "Sistema de Fiscalização", "Descrição da demanda",
                "SEFAZ", TipoDemanda.NOVO_SISTEMA, PrioridadeDemanda.ALTA,
                null, "12345", "João Silva", null, null, null
        );
        demandaSalva = Demanda.builder()
                .titulo("Sistema de Fiscalização")
                .areaDemandante("SEFAZ")
                .tipo(TipoDemanda.NOVO_SISTEMA)
                .matriculaSolicitante("12345")
                .build();
    }

    @Test
    @DisplayName("deve criar demanda com status RASCUNHO quando dados válidos")
    void deve_criar_demanda_quando_dados_validos() {
        when(demandaRepository.save(any(Demanda.class))).thenReturn(demandaSalva);
        when(historicoRepository.save(any())).thenReturn(null);

        DemandaResponse response = service.criar(requestValido);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo(StatusDemanda.RASCUNHO);
        assertThat(response.titulo()).isEqualTo("Sistema de Fiscalização");
        verify(demandaRepository).save(any(Demanda.class));
        verify(historicoRepository).save(any());
    }

    @Test
    @DisplayName("deve lançar RecursoNaoEncontradoException quando demanda não existe")
    void deve_lancar_excecao_quando_demanda_nao_encontrada() {
        UUID idInexistente = UUID.randomUUID();
        when(demandaRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(idInexistente))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining(idInexistente.toString());
    }

    @Test
    @DisplayName("deve lançar BusinessException ao excluir demanda em análise")
    void deve_rejeitar_exclusao_de_demanda_em_analise() {
        UUID id = UUID.randomUUID();
        Demanda demandaEmAnalise = Demanda.builder()
                .titulo("Demanda em análise").areaDemandante("TI")
                .tipo(TipoDemanda.MELHORIA).matriculaSolicitante("99999").build();
        demandaEmAnalise.setStatus(StatusDemanda.EM_ANALISE);
        when(demandaRepository.findById(id)).thenReturn(Optional.of(demandaEmAnalise));

        assertThatThrownBy(() -> service.excluir(id))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("excluídas");
    }

    @Test
    @DisplayName("deve rejeitar transição de status inválida CONCLUIDA → EM_ANALISE")
    void deve_rejeitar_transicao_status_invalida() {
        UUID id = UUID.randomUUID();
        Demanda demandaConcluida = Demanda.builder()
                .titulo("Demanda concluída").areaDemandante("TI")
                .tipo(TipoDemanda.MELHORIA).matriculaSolicitante("99999").build();
        demandaConcluida.setStatus(StatusDemanda.CONCLUIDA);
        when(demandaRepository.findById(id)).thenReturn(Optional.of(demandaConcluida));

        AtualizarDemandaRequest req = new AtualizarDemandaRequest(
                null, null, null, null, null, StatusDemanda.EM_ANALISE, null, null, null, null);

        assertThatThrownBy(() -> service.atualizar(id, req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Transição de status inválida");
    }
}
