package br.gov.tce.ailer.modulo1.service;

import br.gov.tce.ailer.modulo1.dto.response.CompletudeDemandaResponse;
import br.gov.tce.ailer.modulo1.dto.response.CompletudeDemandaResponse.StatusModulo;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.domain.enums.StatusRequisito;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo5.repository.EpicoRepository;
import br.gov.tce.ailer.modulo6.domain.enums.StatusCasoDeUso;
import br.gov.tce.ailer.modulo6.repository.CasoDeUsoRepository;
import br.gov.tce.ailer.modulo7.domain.enums.StatusModelagem;
import br.gov.tce.ailer.modulo7.repository.ModelagemProcessoRepository;
import br.gov.tce.ailer.modulo8.domain.enums.StatusPrototipo;
import br.gov.tce.ailer.modulo8.repository.PrototipoSistemaRepository;
import br.gov.tce.ailer.modulo9.domain.enums.StatusArquitetura;
import br.gov.tce.ailer.modulo9.repository.ArquiteturaSolucaoRepository;
import br.gov.tce.ailer.modulo10.domain.enums.StatusEstimativa;
import br.gov.tce.ailer.modulo10.repository.EstimativaProjetoRepository;
import br.gov.tce.ailer.modulo11.domain.enums.StatusGovernanca;
import br.gov.tce.ailer.modulo11.repository.GovernancaProjetoRepository;
import br.gov.tce.ailer.modulo12.domain.enums.StatusConformidade;
import br.gov.tce.ailer.modulo12.repository.ConformidadeQualidadeRepository;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompletudeDemandaService {

    private final DemandaRepository demandaRepository;
    private final EntrevistaRepository entrevistaRepository;
    private final CanvasProjetoRepository canvasRepository;
    private final RequisitoRepository requisitoRepository;
    private final EpicoRepository epicoRepository;
    private final CasoDeUsoRepository casoDeUsoRepository;
    private final ModelagemProcessoRepository modelagemRepository;
    private final PrototipoSistemaRepository prototipoRepository;
    private final ArquiteturaSolucaoRepository arquiteturaRepository;
    private final EstimativaProjetoRepository estimativaRepository;
    private final GovernancaProjetoRepository governancaRepository;
    private final ConformidadeQualidadeRepository conformidadeRepository;

    @Transactional(readOnly = true)
    public CompletudeDemandaResponse calcular(UUID demandaId) {
        demandaRepository.findById(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));

        List<StatusModulo> modulos = new ArrayList<>();

        // M2 — Entrevista
        boolean m2 = entrevistaRepository.findByDemandaId(demandaId).stream()
                .anyMatch(e -> StatusEntrevista.CONCLUIDA == e.getStatus());
        modulos.add(new StatusModulo("M2", "Entrevista Inteligente", m2,
                m2 ? "CONCLUIDA" : "PENDENTE"));

        // M3 — Canvas
        var canvas = canvasRepository.findByDemandaId(demandaId);
        boolean m3 = canvas.map(c -> StatusAprovacao.PUBLICADO == c.getStatusAprovacao()).orElse(false);
        modulos.add(new StatusModulo("M3", "Canvas do Projeto", m3,
                canvas.map(c -> c.getStatusAprovacao() != null ? c.getStatusAprovacao().name() : "PENDENTE")
                      .orElse("PENDENTE")));

        // M4 — Requisitos: ao menos um PUBLICADO
        var requisitos = requisitoRepository.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId);
        boolean m4 = requisitos.stream().anyMatch(r -> StatusRequisito.PUBLICADO == r.getStatus());
        modulos.add(new StatusModulo("M4", "Especificação de Requisitos", m4,
                m4 ? "PUBLICADO" : (requisitos.isEmpty() ? "PENDENTE" : "EM_REVISAO")));

        // M5 — Backlog: statusAprovacao do épico raiz PUBLICADO
        var epicos = epicoRepository.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId);
        boolean m5 = epicos.stream().anyMatch(e -> StatusAprovacao.PUBLICADO == e.getStatusAprovacao());
        modulos.add(new StatusModulo("M5", "Histórias de Usuário e Backlog", m5,
                m5 ? "PUBLICADO" : (epicos.isEmpty() ? "PENDENTE" : "EM_ANDAMENTO")));

        // M6 — Casos de Uso
        long totalCasos = casoDeUsoRepository.countByDemandaId(demandaId);
        boolean m6 = !casoDeUsoRepository
                .findByDemandaIdAndStatusAprovacaoOrderByOrdemExibicaoAsc(demandaId, StatusCasoDeUso.PUBLICADO)
                .isEmpty();
        modulos.add(new StatusModulo("M6", "Casos de Uso", m6,
                m6 ? "PUBLICADO" : (totalCasos > 0 ? "EM_REVISAO" : "PENDENTE")));

        // M7 — Modelagem
        var modelagens = modelagemRepository.findByDemandaIdOrderByCriadoEmAsc(demandaId);
        boolean m7 = modelagens.stream().anyMatch(m -> StatusModelagem.PUBLICADO == m.getStatusAprovacao());
        modulos.add(new StatusModulo("M7", "Modelagem de Processos", m7,
                m7 ? "PUBLICADO" : (modelagens.isEmpty() ? "PENDENTE" : "EM_REVISAO")));

        // M8 — Prototipação
        var proto = prototipoRepository.findByDemandaId(demandaId);
        boolean m8 = proto.map(p -> StatusPrototipo.PUBLICADO == p.getStatusAprovacao()).orElse(false);
        modulos.add(new StatusModulo("M8", "Prototipação Assistida", m8,
                proto.map(p -> p.getStatusAprovacao() != null ? p.getStatusAprovacao().name() : "PENDENTE")
                     .orElse("PENDENTE")));

        // M9 — Arquitetura
        var arq = arquiteturaRepository.findByDemandaId(demandaId);
        boolean m9 = arq.map(a -> StatusArquitetura.PUBLICADO == a.getStatusAprovacao()).orElse(false);
        modulos.add(new StatusModulo("M9", "Arquitetura de Solução", m9,
                arq.map(a -> a.getStatusAprovacao() != null ? a.getStatusAprovacao().name() : "PENDENTE")
                   .orElse("PENDENTE")));

        // M10 — Estimativas
        var est = estimativaRepository.findByDemandaId(demandaId);
        boolean m10 = est.map(e -> StatusEstimativa.PUBLICADO == e.getStatusAprovacao()).orElse(false);
        modulos.add(new StatusModulo("M10", "Estimativas", m10,
                est.map(e -> e.getStatusAprovacao() != null ? e.getStatusAprovacao().name() : "PENDENTE")
                   .orElse("PENDENTE")));

        // M11 — Governança
        var gov = governancaRepository.findByDemandaId(demandaId);
        boolean m11 = gov.map(g -> StatusGovernanca.PUBLICADO == g.getStatusAprovacao()).orElse(false);
        modulos.add(new StatusModulo("M11", "Governança", m11,
                gov.map(g -> g.getStatusAprovacao() != null ? g.getStatusAprovacao().name() : "PENDENTE")
                   .orElse("PENDENTE")));

        // M12 — Conformidade
        var conf = conformidadeRepository.findByDemandaId(demandaId);
        boolean m12 = conf.map(c -> StatusConformidade.PUBLICADO == c.getStatusAprovacao()).orElse(false);
        modulos.add(new StatusModulo("M12", "Conformidade e Qualidade", m12,
                conf.map(c -> c.getStatusAprovacao() != null ? c.getStatusAprovacao().name() : "PENDENTE")
                    .orElse("PENDENTE")));

        long concluidos = modulos.stream().filter(StatusModulo::concluido).count();
        int total = modulos.size();
        int pct = total > 0 ? (int) Math.round((concluidos * 100.0) / total) : 0;

        return new CompletudeDemandaResponse(demandaId, pct, (int) concluidos, total, modulos);
    }
}
