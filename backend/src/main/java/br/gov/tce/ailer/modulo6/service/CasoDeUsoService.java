package br.gov.tce.ailer.modulo6.service;

import br.gov.tce.ailer.ai.client.ChatMessage;
import br.gov.tce.ailer.ai.client.OpenAIClient;
import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.modulo3.repository.CanvasProjetoRepository;
import br.gov.tce.ailer.modulo4.repository.RequisitoRepository;
import br.gov.tce.ailer.modulo6.domain.CasoDeUso;
import br.gov.tce.ailer.modulo6.domain.enums.StatusCasoDeUso;
import br.gov.tce.ailer.modulo6.dto.request.AtualizarCasoDeUsoRequest;
import br.gov.tce.ailer.modulo6.dto.request.CriarCasoDeUsoRequest;
import br.gov.tce.ailer.modulo6.dto.response.CasoDeUsoResponse;
import br.gov.tce.ailer.modulo6.repository.CasoDeUsoRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class CasoDeUsoService {

    private final CasoDeUsoRepository casoDeUsoRepo;
    private final DemandaRepository demandaRepo;
    private final CanvasProjetoRepository canvasRepo;
    private final RequisitoRepository requisitoRepo;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<CasoDeUsoResponse> gerar(UUID demandaId) {
        Demanda demanda = findDemanda(demandaId);

        String contexto = buildContexto(demanda);
        String prompt   = loadPrompt();

        log.info("Gerando casos de uso para demanda {}", demandaId);
        String jsonResp = openAIClient.chat(List.of(
                ChatMessage.system(prompt),
                ChatMessage.user(contexto)
        ));

        List<CasoDeUso> novos = parseCasosDeUso(jsonResp, demandaId);
        casoDeUsoRepo.deleteGeradosPorIa(demandaId);

        int ordem = 0;
        int seq = 1;
        for (CasoDeUso c : novos) {
            c.setCodigo("UC-" + String.format("%03d", seq++));
            c.setOrdemExibicao(ordem++);
        }

        casoDeUsoRepo.saveAll(novos);
        log.info("{} casos de uso gerados para demanda {}", novos.size(), demandaId);
        return listar(demandaId);
    }

    @Transactional(readOnly = true)
    public List<CasoDeUsoResponse> listar(UUID demandaId) {
        findDemanda(demandaId);
        return casoDeUsoRepo.findByDemandaIdOrderByOrdemExibicaoAsc(demandaId)
                .stream().map(CasoDeUsoResponse::from).toList();
    }

    @Transactional
    public CasoDeUsoResponse criar(UUID demandaId, CriarCasoDeUsoRequest req) {
        findDemanda(demandaId);
        long count = casoDeUsoRepo.countByDemandaId(demandaId);

        CasoDeUso c = CasoDeUso.builder()
                .demandaId(demandaId)
                .codigo("UC-" + String.format("%03d", count + 1))
                .nome(req.nome())
                .descricao(req.descricao())
                .atores(req.atores())
                .preCondicoes(req.preCondicoes())
                .posCondicoes(req.posCondicoes())
                .fluxoPrincipal(req.fluxoPrincipal())
                .fluxosAlternativos(req.fluxosAlternativos())
                .fluxosExcecao(req.fluxosExcecao())
                .requisitosOrigem(req.requisitosOrigem())
                .diagramaMermaid(req.diagramaMermaid())
                .statusAprovacao(StatusCasoDeUso.RASCUNHO_IA)
                .fonte("MANUAL")
                .ordemExibicao((int) count)
                .build();

        return CasoDeUsoResponse.from(casoDeUsoRepo.save(c));
    }

    @Transactional
    public CasoDeUsoResponse atualizar(UUID id, AtualizarCasoDeUsoRequest req) {
        CasoDeUso c = findCaso(id);
        if (req.nome()                != null) c.setNome(req.nome());
        if (req.descricao()           != null) c.setDescricao(req.descricao());
        if (req.atores()              != null) c.setAtores(req.atores());
        if (req.preCondicoes()        != null) c.setPreCondicoes(req.preCondicoes());
        if (req.posCondicoes()        != null) c.setPosCondicoes(req.posCondicoes());
        if (req.fluxoPrincipal()      != null) c.setFluxoPrincipal(req.fluxoPrincipal());
        if (req.fluxosAlternativos()  != null) c.setFluxosAlternativos(req.fluxosAlternativos());
        if (req.fluxosExcecao()       != null) c.setFluxosExcecao(req.fluxosExcecao());
        if (req.requisitosOrigem()    != null) c.setRequisitosOrigem(req.requisitosOrigem());
        if (req.diagramaMermaid()     != null) c.setDiagramaMermaid(req.diagramaMermaid());
        if (req.statusAprovacao()     != null) c.setStatusAprovacao(req.statusAprovacao());
        return CasoDeUsoResponse.from(casoDeUsoRepo.save(c));
    }

    @Transactional
    public void excluir(UUID id) {
        findCaso(id);
        casoDeUsoRepo.deleteById(id);
    }

    @Transactional
    public CasoDeUsoResponse abrirRevisao(UUID id) {
        CasoDeUso c = findCaso(id);
        c.setStatusAprovacao(StatusCasoDeUso.EM_REVISAO);
        return CasoDeUsoResponse.from(casoDeUsoRepo.save(c));
    }

    @Transactional
    public CasoDeUsoResponse aprovar(UUID id, String aprovadoPor) {
        CasoDeUso c = findCaso(id);
        if (c.getStatusAprovacao() != StatusCasoDeUso.EM_REVISAO) {
            throw new BusinessException("Caso de uso deve estar EM_REVISAO para ser aprovado.");
        }
        c.setStatusAprovacao(StatusCasoDeUso.APROVADO);
        c.setAprovadoPor(aprovadoPor);
        c.setAprovadoEm(LocalDateTime.now());
        return CasoDeUsoResponse.from(casoDeUsoRepo.save(c));
    }

    @Transactional
    public CasoDeUsoResponse publicar(UUID id) {
        CasoDeUso c = findCaso(id);
        if (c.getStatusAprovacao() != StatusCasoDeUso.APROVADO) {
            throw new BusinessException("Caso de uso deve estar APROVADO antes de publicar.");
        }
        c.setStatusAprovacao(StatusCasoDeUso.PUBLICADO);
        return CasoDeUsoResponse.from(casoDeUsoRepo.save(c));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Demanda findDemanda(UUID id) {
        return demandaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
    }

    private CasoDeUso findCaso(UUID id) {
        return casoDeUsoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Caso de uso não encontrado"));
    }

    private String buildContexto(Demanda d) {
        StringBuilder sb = new StringBuilder();
        sb.append("DEMANDA: ").append(d.getTitulo()).append("\n");
        sb.append("TIPO: ").append(d.getTipo().name()).append("\n");
        sb.append("ÁREA: ").append(d.getAreaDemandante()).append("\n");
        if (d.getDescricao()   != null) sb.append("DESCRIÇÃO: ").append(d.getDescricao()).append("\n");
        if (d.getPremissas()   != null) sb.append("PREMISSAS: ").append(d.getPremissas()).append("\n");
        if (d.getRestricoes()  != null) sb.append("RESTRIÇÕES: ").append(d.getRestricoes()).append("\n");

        canvasRepo.findByDemandaId(d.getId()).ifPresent(c -> {
            sb.append("\n--- CANVAS ---\n");
            if (c.getContexto()             != null) sb.append("Contexto: ").append(c.getContexto()).append("\n");
            if (c.getProblema()             != null) sb.append("Problema: ").append(c.getProblema()).append("\n");
            if (c.getSolucaoProposta()      != null) sb.append("Solução: ").append(c.getSolucaoProposta()).append("\n");
            if (c.getFuncionalidadesChave() != null) sb.append("Funcionalidades: ").append(c.getFuncionalidadesChave()).append("\n");
        });

        var requisitos = requisitoRepo.findByDemandaIdOrderByTipoAscOrdemExibicaoAsc(d.getId());
        if (!requisitos.isEmpty()) {
            sb.append("\n--- REQUISITOS FUNCIONAIS ---\n");
            requisitos.stream()
                    .filter(r -> r.getTipo().name().equals("RF"))
                    .limit(20)
                    .forEach(r -> sb.append(r.getCodigo()).append(": ").append(r.getTitulo()).append("\n"));
        }

        return sb.toString();
    }

    private List<CasoDeUso> parseCasosDeUso(String json, UUID demandaId) {
        String limpo = json.strip();
        if (limpo.startsWith("```")) {
            int ini = limpo.indexOf('{'), fim = limpo.lastIndexOf('}');
            if (ini >= 0 && fim > ini) limpo = limpo.substring(ini, fim + 1);
        }
        try {
            JsonNode root = objectMapper.readTree(limpo);
            JsonNode arr  = root.get("casosDeUso");
            if (arr == null || !arr.isArray()) throw new IllegalStateException("Campo 'casosDeUso' ausente");

            List<CasoDeUso> lista = new ArrayList<>();
            StreamSupport.stream(arr.spliterator(), false).forEach(node -> {
                CasoDeUso c = CasoDeUso.builder()
                        .demandaId(demandaId)
                        .codigo("")
                        .nome(node.path("nome").asText("Sem nome"))
                        .descricao(node.path("descricao").asText(null))
                        .atores(safeJson(node.get("atores")))
                        .preCondicoes(node.path("preCondicoes").asText(null))
                        .posCondicoes(node.path("posCondicoes").asText(null))
                        .fluxoPrincipal(safeJson(node.get("fluxoPrincipal")))
                        .fluxosAlternativos(safeJson(node.get("fluxosAlternativos")))
                        .fluxosExcecao(safeJson(node.get("fluxosExcecao")))
                        .requisitosOrigem(safeJson(node.get("requisitosOrigem")))
                        .diagramaMermaid(node.path("diagramaMermaid").asText(null))
                        .statusAprovacao(StatusCasoDeUso.RASCUNHO_IA)
                        .fonte("IA")
                        .build();
                lista.add(c);
            });
            return lista;
        } catch (IOException e) {
            log.error("Falha ao parsear casos de uso JSON: {}", limpo, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao interpretar resposta da IA para casos de uso");
        }
    }

    private String safeJson(JsonNode node) {
        if (node == null || node.isNull()) return null;
        try {
            return objectMapper.writeValueAsString(node);
        } catch (IOException e) {
            return null;
        }
    }

    private String loadPrompt() {
        try {
            return new ClassPathResource("prompts/casosdeuso-geracao.txt")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Prompt casosdeuso-geracao.txt não encontrado", e);
        }
    }
}
