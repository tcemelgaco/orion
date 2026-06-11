package br.gov.tce.ailer.modulo1.service;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.HistoricoDemanda;
import br.gov.tce.ailer.modulo1.domain.Stakeholder;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.dto.request.AdicionarStakeholderRequest;
import br.gov.tce.ailer.modulo1.dto.request.AtualizarDemandaRequest;
import br.gov.tce.ailer.modulo1.dto.request.CriarDemandaRequest;
import br.gov.tce.ailer.modulo1.dto.response.DemandaResponse;
import br.gov.tce.ailer.modulo1.dto.response.DemandaSummaryResponse;
import br.gov.tce.ailer.modulo1.dto.response.StakeholderResponse;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo1.repository.HistoricoDemandaRepository;
import br.gov.tce.ailer.modulo1.repository.StakeholderRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemandaService {

    private final DemandaRepository demandaRepository;
    private final StakeholderRepository stakeholderRepository;
    private final HistoricoDemandaRepository historicoRepository;

    @Transactional
    public DemandaResponse criar(CriarDemandaRequest req) {
        Demanda demanda = Demanda.builder()
                .titulo(req.titulo())
                .descricao(req.descricao())
                .areaDemandante(req.areaDemandante())
                .tipo(req.tipo())
                .prioridade(req.prioridade())
                .prazoEstimado(req.prazoEstimado())
                .matriculaSolicitante(req.matriculaSolicitante())
                .nomeSolicitante(req.nomeSolicitante())
                .premissas(req.premissas())
                .restricoes(req.restricoes())
                .observacoes(req.observacoes())
                .build();

        demanda = demandaRepository.save(demanda);
        registrarHistorico(demanda, "CRIADA", "Demanda criada", null, StatusDemanda.RASCUNHO.name());
        log.info("Demanda criada: id={}, titulo={}", demanda.getId(), demanda.getTitulo());
        return DemandaResponse.from(demanda);
    }

    @Transactional(readOnly = true)
    public Page<DemandaSummaryResponse> listar(StatusDemanda status, String area, String busca, Pageable pageable) {
        return demandaRepository.buscar(status, area, busca, pageable)
                .map(DemandaSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public DemandaResponse buscarPorId(UUID id) {
        return DemandaResponse.from(encontrarDemanda(id));
    }

    @Transactional
    public DemandaResponse atualizar(UUID id, AtualizarDemandaRequest req) {
        Demanda demanda = encontrarDemanda(id);

        String statusAnterior = demanda.getStatus().name();
        StringBuilder descAlteracao = new StringBuilder();

        if (req.titulo() != null && !req.titulo().equals(demanda.getTitulo())) {
            demanda.setTitulo(req.titulo());
            descAlteracao.append("Título atualizado. ");
        }
        if (req.descricao() != null) {
            demanda.setDescricao(req.descricao());
        }
        if (req.areaDemandante() != null) {
            demanda.setAreaDemandante(req.areaDemandante());
        }
        if (req.tipo() != null) {
            demanda.setTipo(req.tipo());
        }
        if (req.prioridade() != null) {
            demanda.setPrioridade(req.prioridade());
        }
        if (req.status() != null && req.status() != demanda.getStatus()) {
            validarTransicaoStatus(demanda.getStatus(), req.status());
            descAlteracao.append("Status: %s → %s. ".formatted(demanda.getStatus(), req.status()));
            demanda.setStatus(req.status());
        }
        if (req.prazoEstimado() != null) {
            demanda.setPrazoEstimado(req.prazoEstimado());
        }
        if (req.premissas() != null) {
            demanda.setPremissas(req.premissas());
        }
        if (req.restricoes() != null) {
            demanda.setRestricoes(req.restricoes());
        }
        if (req.observacoes() != null) {
            demanda.setObservacoes(req.observacoes());
        }

        demanda = demandaRepository.save(demanda);
        registrarHistorico(demanda, "ATUALIZADA", descAlteracao.toString().strip(), statusAnterior, demanda.getStatus().name());
        return DemandaResponse.from(demanda);
    }

    @Transactional
    public void excluir(UUID id) {
        Demanda demanda = encontrarDemanda(id);
        if (demanda.getStatus() != StatusDemanda.RASCUNHO && demanda.getStatus() != StatusDemanda.CANCELADA) {
            throw new BusinessException("Somente demandas em Rascunho ou Canceladas podem ser excluídas.");
        }
        demandaRepository.delete(demanda);
        log.info("Demanda excluída: id={}", id);
    }

    @Transactional
    public StakeholderResponse adicionarStakeholder(UUID demandaId, AdicionarStakeholderRequest req) {
        Demanda demanda = encontrarDemanda(demandaId);
        Stakeholder stakeholder = Stakeholder.builder()
                .demanda(demanda)
                .nome(req.nome())
                .matricula(req.matricula())
                .area(req.area())
                .papel(req.papel())
                .contato(req.contato())
                .build();
        return StakeholderResponse.from(stakeholderRepository.save(stakeholder));
    }

    @Transactional
    public void removerStakeholder(UUID demandaId, UUID stakeholderId) {
        encontrarDemanda(demandaId);
        stakeholderRepository.deleteByDemandaIdAndId(demandaId, stakeholderId);
    }

    @Transactional(readOnly = true)
    public Page<HistoricoResponse> listarHistorico(UUID demandaId, Pageable pageable) {
        encontrarDemanda(demandaId);
        return historicoRepository.findByDemandaIdOrderByAlteradoEmDesc(demandaId, pageable)
                .map(h -> new HistoricoResponse(
                        h.getId(), h.getAcao(), h.getDescricaoAlteracao(),
                        h.getStatusAnterior(), h.getStatusNovo(),
                        h.getAlteradoPor(), h.getAlteradoEm()));
    }

    private Demanda encontrarDemanda(UUID id) {
        return demandaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Demanda", id));
    }

    private void registrarHistorico(Demanda demanda, String acao, String descricao,
                                    String statusAnterior, String statusNovo) {
        String usuario = usuarioAtual();
        HistoricoDemanda historico = HistoricoDemanda.builder()
                .demanda(demanda)
                .acao(acao)
                .descricaoAlteracao(descricao)
                .statusAnterior(statusAnterior)
                .statusNovo(statusNovo)
                .alteradoPor(usuario)
                .build();
        historicoRepository.save(historico);
    }

    private void validarTransicaoStatus(StatusDemanda atual, StatusDemanda novo) {
        boolean invalido = switch (atual) {
            case RASCUNHO -> novo == StatusDemanda.CONCLUIDA || novo == StatusDemanda.EM_DESENVOLVIMENTO;
            case CONCLUIDA, CANCELADA -> true;
            default -> false;
        };
        if (invalido) {
            throw new BusinessException("Transição de status inválida: %s → %s".formatted(atual, novo));
        }
    }

    private String usuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "sistema";
    }

    public record HistoricoResponse(
            java.util.UUID id, String acao, String descricaoAlteracao,
            String statusAnterior, String statusNovo,
            String alteradoPor, java.time.LocalDateTime alteradoEm) {}
}
