package br.gov.tce.ailer.modulo4.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo2.domain.Entrevista;
import br.gov.tce.ailer.modulo2.domain.SumarioLevantamento;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.modulo2.repository.EntrevistaRepository;
import br.gov.tce.ailer.modulo3.domain.CanvasProjeto;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.domain.Requisito;
import br.gov.tce.ailer.modulo4.domain.enums.StatusRequisito;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import br.gov.tce.ailer.modulo4.dto.request.AtualizarRequisitoRequest;
import br.gov.tce.ailer.modulo4.dto.request.CriarRequisitoRequest;
import br.gov.tce.ailer.modulo4.dto.response.RequisitoResponse;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.repositorio.repository.ArtefatoRepository;
import br.gov.tce.ailer.shared.exception.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class RequisitoService {

    private final RequisitoRepository requisitoRepo;
    private final DemandaRepository demandaRepo;
    private final EntrevistaRepository entrevistaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final ArtefatoRepository artefatoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<RequisitoResponse> gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);

        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando requisitos para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt),
                ChatMessage.user(contexto)
        ));

        List<Requisito> novos = parseRequisitos(jsonResp, demandaId);

        requisitoRepo.deleteGeradosPorIa(demandaId);

        Map<TipoRequisito, Integer> seq = new EnumMap<>(TipoRequisito.class);
        int ordem = 0;
        for (Requisito r : novos) {
            int n = seq.getOrDefault(r.getTipo(), 0) + 1;
            seq.put(r.getTipo(), n);
            r.setCodigo(r.getTipo().name() + "-" + String.format("%03d", n));
            r.setOrdemExibicao(ordem++);
        }

        requisitoRepo.saveAll(novos);
        log.info("{} requisitos gerados para demanda {}", novos.size(), demandaId);
        return listar(demandaId, null);
    }

    @Transactional(readOnly = true)
    public List<RequisitoResponse> listar(UUID demandaId, TipoRequisito tipo) {
        findDemanda(demandaId);
        List<Requisito> lista = tipo == null
                ? requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(demandaId)
                : requisitoRepo.findByDemandaIdAndTipoOrderByOrdemExibicaoAsc(demandaId, tipo);
        return lista.stream().map(RequisitoResponse::from).toList();
    }

    @Transactional
    public RequisitoResponse criar(UUID demandaId, CriarRequisitoRequest req) {
        findDemanda(demandaId);
        long count = requisitoRepo.countByDemandaIdAndTipo(demandaId, req.tipo());
        String codigo = req.tipo().name() + "-" + String.format("%03d", count + 1);

        Requisito r = Requisito.builder()
                .demandaId(demandaId)
                .tipo(req.tipo())
                .codigo(codigo)
                .titulo(req.titulo())
                .descricao(req.descricao())
                .prioridade(req.prioridade() != null ? req.prioridade() : PrioridadeDemanda.MEDIA)
                .status(StatusRequisito.RASCUNHO)
                .fonte("MANUAL")
                .criterioAceitacao(req.criterioAceitacao())
                .observacoes(req.observacoes())
                .ordemExibicao((int) count)
                .build();

        return RequisitoResponse.from(requisitoRepo.save(r));
    }

    @Transactional
    public RequisitoResponse atualizar(UUID id, AtualizarRequisitoRequest req) {
        Requisito r = findRequisito(id);
        if (req.titulo()             != null) r.setTitulo(req.titulo());
        if (req.descricao()          != null) r.setDescricao(req.descricao());
        if (req.prioridade()         != null) r.setPrioridade(req.prioridade());
        if (req.status()             != null) r.setStatus(req.status());
        if (req.criterioAceitacao()  != null) r.setCriterioAceitacao(req.criterioAceitacao());
        if (req.observacoes()        != null) r.setObservacoes(req.observacoes());
        return RequisitoResponse.from(requisitoRepo.save(r));
    }

    @Transactional
    public void excluir(UUID id) {
        findRequisito(id);
        requisitoRepo.deleteById(id);
    }

    @Transactional
    public RequisitoResponse abrirRevisao(UUID id) {
        Requisito r = findRequisito(id);
        r.setStatus(StatusRequisito.EM_REVISAO);
        return RequisitoResponse.from(requisitoRepo.save(r));
    }

    @Transactional
    public RequisitoResponse aprovar(UUID id, String aprovadoPor) {
        Requisito r = findRequisito(id);
        r.setStatus(StatusRequisito.APROVADO);
        r.setAprovadoPor(aprovadoPor);
        r.setAprovadoEm(OffsetDateTime.now());
        return RequisitoResponse.from(requisitoRepo.save(r));
    }

    @Transactional
    public RequisitoResponse publicar(UUID id) {
        Requisito r = findRequisito(id);
        if (r.getStatus() != StatusRequisito.APROVADO) {
            throw new BusinessException("Requisito deve estar APROVADO antes de publicar.");
        }
        r.setStatus(StatusRequisito.PUBLICADO);
        return RequisitoResponse.from(requisitoRepo.save(r));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private Requisito findRequisito(UUID id) {
        return requisitoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requisito não encontrado"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao() != null)   sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");
        if (d.getPremissas() != null)   sb.append("PREMISSAS: ").append(d.getPremissas()).append("\n");
        if (d.getRestricoes() != null)  sb.append("RESTRIÇÕES: ").append(d.getRestricoes()).append("\n");

        canvasRepo.findByDemandaId(d.getId()).ifPresent(c -> appendCanvas(sb, c));

        var artefatos = artefatoRepo.findByDemandaIdOrderByCriadoEmDesc(d.getId());
        if (!artefatos.isEmpty()) {
            sb.append("\n--- DOCUMENTOS DE REFERÊNCIA ---\n");
            artefatos.forEach(a -> sb.append("- ")
                    .append(a.getNomeOriginal())
                    .append(" [").append(a.getTipoArtefato().name()).append("]")
                    .append(a.getDescricao() != null ? ": " + a.getDescricao() : "")
                    .append("\n"));
        }

        entrevistaRepo.findByDemandaId(d.getId()).stream()
                .filter(e -> e.getStatus() == StatusEntrevista.CONCLUIDA)
                .findFirst()
                .map(Entrevista::getSumario)
                .ifPresent(s -> appendSumario(sb, s));

        return sb.toString();
    }

    private void appendCanvas(StringBuilder sb, CanvasProjeto c) {
        sb.append("\n--- CANVAS DO PROJETO ---\n");
        if (c.getContexto()            != null) sb.append("Contexto: ").append(c.getContexto()).append("\n");
        if (c.getProblema()            != null) sb.append("Problema: ").append(c.getProblema()).append("\n");
        if (c.getSolucaoProposta()     != null) sb.append("Solução: ").append(c.getSolucaoProposta()).append("\n");
        if (c.getFuncionalidadesChave()!= null) sb.append("Funcionalidades: ").append(c.getFuncionalidadesChave()).append("\n");
        if (c.getRestricoes()          != null) sb.append("Restrições: ").append(c.getRestricoes()).append("\n");
        if (c.getIntegracoes()         != null) sb.append("Integrações: ").append(c.getIntegracoes()).append("\n");
    }

    private void appendSumario(StringBuilder sb, SumarioLevantamento s) {
        sb.append("\n--- SUMÁRIO DE LEVANTAMENTO ---\n");
        if (s.getContexto()             != null) sb.append("Contexto: ").append(s.getContexto()).append("\n");
        if (s.getNecessidades()         != null) sb.append("Necessidades: ").append(s.getNecessidades()).append("\n");
        if (s.getUsuariosIdentificados()!= null) sb.append("Usuários: ").append(s.getUsuariosIdentificados()).append("\n");
        if (s.getRegrasNegocio()        != null) sb.append("Regras: ").append(s.getRegrasNegocio()).append("\n");
        if (s.getIntegracoes()          != null) sb.append("Integrações: ").append(s.getIntegracoes()).append("\n");
        if (s.getRestricoesPremissas()  != null) sb.append("Restrições/Premissas: ").append(s.getRestricoesPremissas()).append("\n");
    }

    private List<Requisito> parseRequisitos(String json, UUID demandaId) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            JsonNode root = objectMapper.readTree(limpo);
            JsonNode arr  = root.get("requisitos");
            if (arr == null || !arr.isArray()) throw new IllegalStateException("Campo 'requisitos' ausente");

            return StreamSupport.stream(arr.spliterator(), false).map(node -> {
                TipoRequisito tipo = TipoRequisito.valueOf(
                        node.path("tipo").asText("RF").trim().toUpperCase());

                PrioridadeDemanda prio;
                try { prio = PrioridadeDemanda.valueOf(node.path("prioridade").asText("MEDIA")); }
                catch (IllegalArgumentException e) { prio = PrioridadeDemanda.MEDIA; }

                return Requisito.builder()
                        .demandaId(demandaId)
                        .tipo(tipo)
                        .codigo("") // atribuído após parse
                        .titulo(node.path("titulo").asText("Sem título"))
                        .descricao(node.path("descricao").asText(null))
                        .prioridade(prio)
                        .status(StatusRequisito.RASCUNHO_IA)
                        .fonte("IA")
                        .criterioAceitacao(node.path("criterioAceitacao").asText(null))
                        .build();
            }).toList();
        } catch (IOException e) {
            log.error("Falha ao parsear requisitos JSON: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA");
        }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/requisitos-geracao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt requisitos-geracao.txt não encontrado", e);
        }
    }
}
