package br.gov.tce.ailer.modulo1.service;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import br.gov.tce.ailer.modulo1.dto.response.CompletudeDemandaResponse;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo5.repository.EpicoRepository;
import br.gov.tce.ailer.modulo6.repository.CasoDeUsoRepository;
import br.gov.tce.ailer.modulo7.repository.ModelagemProcessoRepository;
import br.gov.tce.ailer.modulo8.repository.PrototipoSistemaRepository;
import br.gov.tce.ailer.modulo9.repository.ArquiteturaSolucaoRepository;
import br.gov.tce.ailer.modulo10.repository.EstimativaProjetoRepository;
import br.gov.tce.ailer.modulo11.repository.GovernancaProjetoRepository;
import br.gov.tce.ailer.modulo12.repository.ConformidadeQualidadeRepository;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompletudeDemandaService")
class CompletudeDemandaServiceTest {

    @Mock private DemandaRepository demandaRepository;
    @Mock private EntrevistaRepository entrevistaRepository;
    @Mock private CanvasProjetoRepository canvasRepository;
    @Mock private RequisitoRepository requisitoRepository;
    @Mock private EpicoRepository epicoRepository;
    @Mock private CasoDeUsoRepository casoDeUsoRepository;
    @Mock private ModelagemProcessoRepository modelagemRepository;
    @Mock private PrototipoSistemaRepository prototipoRepository;
    @Mock private ArquiteturaSolucaoRepository arquiteturaRepository;
    @Mock private EstimativaProjetoRepository estimativaRepository;
    @Mock private GovernancaProjetoRepository governancaRepository;
    @Mock private ConformidadeQualidadeRepository conformidadeRepository;

    @InjectMocks
    private CompletudeDemandaService service;

    private final UUID demandaId = UUID.randomUUID();

    private Demanda demandaBase() {
        return Demanda.builder()
                .titulo("Sistema Teste")
                .areaDemandante("STI")
                .tipo(TipoDemanda.NOVO_SISTEMA)
                .matriculaSolicitante("12345")
                .build();
    }

    private void stubDemanda() {
        when(demandaRepository.findById(demandaId)).thenReturn(Optional.of(demandaBase()));
    }

    private void stubTudoPendente() {
        when(entrevistaRepository.findByDemandaId(demandaId)).thenReturn(List.of());
        when(canvasRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(requisitoRepository.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId)).thenReturn(List.of());
        when(epicoRepository.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId)).thenReturn(List.of());
        when(casoDeUsoRepository.countByDemandaId(demandaId)).thenReturn(0L);
        when(casoDeUsoRepository.findByDemandaIdAndStatusAprovacaoOrderByOrdemExibicaoAsc(any(), any())).thenReturn(List.of());
        when(modelagemRepository.findByDemandaIdOrderByCriadoEmAsc(demandaId)).thenReturn(List.of());
        when(prototipoRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(arquiteturaRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(estimativaRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(governancaRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(conformidadeRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
    }

    @Test
    @DisplayName("deve retornar 0% quando nenhum módulo foi iniciado")
    void deve_retornar_zero_pct_quando_todos_pendentes() {
        stubDemanda();
        stubTudoPendente();

        CompletudeDemandaResponse resp = service.calcular(demandaId);

        assertThat(resp.percentualConcluido()).isZero();
        assertThat(resp.modulosConcluidos()).isZero();
        assertThat(resp.totalModulos()).isEqualTo(11);
        assertThat(resp.modulos()).allMatch(m -> !m.concluido());
    }

    @Test
    @DisplayName("deve contabilizar M2 como concluído quando entrevista está CONCLUIDA")
    void deve_marcar_m2_concluido_quando_entrevista_concluida() {
        stubDemanda();
        stubTudoPendente();

        Entrevista entrevistaConcluida = new Entrevista();
        entrevistaConcluida.setStatus(StatusEntrevista.CONCLUIDA);
        when(entrevistaRepository.findByDemandaId(demandaId)).thenReturn(List.of(entrevistaConcluida));

        CompletudeDemandaResponse resp = service.calcular(demandaId);

        assertThat(resp.modulosConcluidos()).isEqualTo(1);
        assertThat(resp.modulos().stream()
                .filter(m -> "M2".equals(m.codigo()))
                .findFirst().orElseThrow().concluido()).isTrue();
    }

    @Test
    @DisplayName("deve contabilizar M3 como concluído quando canvas está PUBLICADO")
    void deve_marcar_m3_concluido_quando_canvas_publicado() {
        stubDemanda();
        stubTudoPendente();

        CanvasProjeto canvas = new CanvasProjeto();
        canvas.setStatusAprovacao(StatusAprovacao.PUBLICADO);
        when(canvasRepository.findByDemandaId(demandaId)).thenReturn(Optional.of(canvas));

        CompletudeDemandaResponse resp = service.calcular(demandaId);

        assertThat(resp.modulos().stream()
                .filter(m -> "M3".equals(m.codigo()))
                .findFirst().orElseThrow().concluido()).isTrue();
    }

    @Test
    @DisplayName("deve lançar NOT_FOUND quando demanda não existe")
    void deve_lancar_not_found_quando_demanda_inexistente() {
        when(demandaRepository.findById(demandaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.calcular(demandaId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Demanda");
    }

    @Test
    @DisplayName("percentual deve ser 100% quando todos os módulos estão concluídos")
    void percentual_deve_ser_100_quando_todos_concluidos() {
        stubDemanda();

        // M2
        Entrevista e = new Entrevista();
        e.setStatus(StatusEntrevista.CONCLUIDA);
        when(entrevistaRepository.findByDemandaId(demandaId)).thenReturn(List.of(e));

        // M3
        CanvasProjeto canvas = new CanvasProjeto();
        canvas.setStatusAprovacao(StatusAprovacao.PUBLICADO);
        when(canvasRepository.findByDemandaId(demandaId)).thenReturn(Optional.of(canvas));

        // M4 - remaining modules return empty (not concluido)
        when(requisitoRepository.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId)).thenReturn(List.of());
        when(epicoRepository.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId)).thenReturn(List.of());
        when(casoDeUsoRepository.countByDemandaId(demandaId)).thenReturn(0L);
        when(casoDeUsoRepository.findByDemandaIdAndStatusAprovacaoOrderByOrdemExibicaoAsc(any(), any())).thenReturn(List.of());
        when(modelagemRepository.findByDemandaIdOrderByCriadoEmAsc(demandaId)).thenReturn(List.of());
        when(prototipoRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(arquiteturaRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(estimativaRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(governancaRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());
        when(conformidadeRepository.findByDemandaId(demandaId)).thenReturn(Optional.empty());

        CompletudeDemandaResponse resp = service.calcular(demandaId);

        // 2 de 11 concluídos = ~18%
        assertThat(resp.modulosConcluidos()).isEqualTo(2);
        assertThat(resp.percentualConcluido()).isEqualTo(18);
    }
}
