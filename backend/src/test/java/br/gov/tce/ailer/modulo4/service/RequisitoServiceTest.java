package br.gov.tce.ailer.modulo4.service;

import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.domain.enums.StatusRequisito;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import br.gov.tce.ailer.modulo4.dto.request.CriarRequisitoRequest;
import br.gov.tce.ailer.modulo4.dto.response.RequisitoResponse;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.repositorio.repository.ArtefatoRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RequisitoService")
class RequisitoServiceTest {

    @Mock private RequisitoRepository requisitoRepo;
    @Mock private DemandaRepository demandaRepo;
    @Mock private EntrevistaRepository entrevistaRepo;
    @Mock private CanvasProjetoRepository canvasRepo;
    @Mock private ArtefatoRepository artefatoRepo;
    @Mock private OpenAIClient openAIClient;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks
    private RequisitoService service;

    private UUID demandaId;
    private UUID requisitoId;
    private Demanda demanda;

    @BeforeEach
    void setUp() {
        demandaId    = UUID.randomUUID();
        requisitoId  = UUID.randomUUID();

        demanda = Demanda.builder()
                .titulo("Sistema de Protocolo")
                .areaDemandante("SEAD")
                .tipo(TipoDemanda.NOVO_SISTEMA)
                .matriculaSolicitante("10001")
                .build();
    }

    @Test
    @DisplayName("deve criar requisito manual com código gerado automaticamente")
    void deve_criar_requisito_com_codigo_gerado() {
        when(demandaRepo.findById(demandaId)).thenReturn(Optional.of(demanda));
        when(requisitoRepo.countByDemandaIdAndTipo(demandaId, TipoRequisito.RF)).thenReturn(0L);

        Requisito salvo = Requisito.builder()
                .demandaId(demandaId)
                .tipo(TipoRequisito.RF)
                .titulo("O sistema deve permitir login")
                .descricao("Autenticação via AD")
                .build();
        salvo.setCodigo("RF-001");
        salvo.setStatus(StatusRequisito.RASCUNHO);
        when(requisitoRepo.save(any(Requisito.class))).thenReturn(salvo);

        CriarRequisitoRequest req = new CriarRequisitoRequest(
                TipoRequisito.RF, "O sistema deve permitir login",
                "Autenticação via AD", null, null, null);

        RequisitoResponse resp = service.criar(demandaId, req);

        assertThat(resp).isNotNull();
        assertThat(resp.codigo()).isEqualTo("RF-001");
        assertThat(resp.status()).isEqualTo(StatusRequisito.RASCUNHO);
        verify(requisitoRepo).save(any(Requisito.class));
    }

    @Test
    @DisplayName("deve lançar NOT_FOUND ao aprovar requisito inexistente")
    void deve_lancar_not_found_ao_aprovar_requisito_inexistente() {
        when(requisitoRepo.findById(requisitoId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.aprovar(requisitoId, "analista"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Requisito");
    }

    @Test
    @DisplayName("deve aprovar requisito e registrar responsável")
    void deve_aprovar_requisito_e_registrar_responsavel() {
        Requisito req = Requisito.builder()
                .demandaId(demandaId).tipo(TipoRequisito.RF)
                .titulo("Login").descricao("Auth").build();
        req.setStatus(StatusRequisito.EM_REVISAO);
        when(requisitoRepo.findById(requisitoId)).thenReturn(Optional.of(req));
        when(requisitoRepo.save(any())).thenReturn(req);

        RequisitoResponse resp = service.aprovar(requisitoId, "ana.souza");

        assertThat(resp.status()).isEqualTo(StatusRequisito.APROVADO);
        assertThat(resp.aprovadoPor()).isEqualTo("ana.souza");
    }

    @Test
    @DisplayName("deve lançar BusinessException ao publicar requisito não aprovado")
    void deve_rejeitar_publicar_requisito_sem_aprovacao() {
        Requisito req = Requisito.builder()
                .demandaId(demandaId).tipo(TipoRequisito.RF)
                .titulo("Login").descricao("Auth").build();
        req.setStatus(StatusRequisito.EM_REVISAO);
        when(requisitoRepo.findById(requisitoId)).thenReturn(Optional.of(req));

        assertThatThrownBy(() -> service.publicar(requisitoId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("APROVADO");
    }

    @Test
    @DisplayName("deve publicar requisito aprovado com sucesso")
    void deve_publicar_requisito_aprovado() {
        Requisito req = Requisito.builder()
                .demandaId(demandaId).tipo(TipoRequisito.RF)
                .titulo("Login").descricao("Auth").build();
        req.setStatus(StatusRequisito.APROVADO);
        when(requisitoRepo.findById(requisitoId)).thenReturn(Optional.of(req));
        when(requisitoRepo.save(any())).thenReturn(req);

        RequisitoResponse resp = service.publicar(requisitoId);

        assertThat(resp.status()).isEqualTo(StatusRequisito.PUBLICADO);
    }

    @Test
    @DisplayName("deve lançar NOT_FOUND quando demanda não existe ao criar requisito")
    void deve_lancar_not_found_quando_demanda_inexistente() {
        when(demandaRepo.findById(demandaId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(demandaId, new CriarRequisitoRequest(
                TipoRequisito.RF, "Título", "Desc", null, null, null)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Demanda");
    }
}
