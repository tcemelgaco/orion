package br.gov.tce.ailer.repositorio.service;

import br.gov.tce.ailer.modulo1.repository.DemandaRepository;
import br.gov.tce.ailer.repositorio.domain.Artefato;
import br.gov.tce.ailer.repositorio.domain.TipoArtefato;
import br.gov.tce.ailer.repositorio.dto.ArtefatoInfo;
import br.gov.tce.ailer.repositorio.dto.ArtefatoResponse;
import br.gov.tce.ailer.repositorio.repository.ArtefatoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtefatoService {

    private final ArtefatoRepository artefatoRepo;
    private final DemandaRepository demandaRepo;

    @Transactional
    public ArtefatoResponse upload(UUID demandaId, MultipartFile file,
                                   String tipoStr, String descricao,
                                   String uploadadoPor) throws IOException {
        demandaRepo.findById(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio");
        }

        TipoArtefato tipo = parseTipo(tipoStr);
        String nomeOriginal = file.getOriginalFilename() != null ? file.getOriginalFilename() : "arquivo";
        String nome = sanitizarNome(nomeOriginal);
        String ct   = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        Artefato artefato = Artefato.builder()
                .demandaId(demandaId)
                .nome(nome)
                .nomeOriginal(nomeOriginal)
                .descricao(descricao)
                .tipoArtefato(tipo)
                .tamanhoBytes(file.getSize())
                .contentType(ct)
                .conteudo(file.getBytes())
                .uploadadoPor(uploadadoPor)
                .build();

        Artefato salvo = artefatoRepo.save(artefato);
        log.info("Artefato '{}' ({}) enviado para demanda {} por {}", nome, tipo, demandaId, uploadadoPor);
        return ArtefatoResponse.from(salvo);
    }

    @Transactional(readOnly = true)
    public List<ArtefatoResponse> listar(UUID demandaId) {
        demandaRepo.findById(demandaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demanda não encontrada"));
        return artefatoRepo.findByDemandaIdOrderByCriadoEmDesc(demandaId).stream()
                .map(ArtefatoResponse::from)
                .toList();
    }

    /** Carrega o artefato com conteudo binário — usar apenas no endpoint de download. */
    @Transactional(readOnly = true)
    public Artefato download(UUID id) {
        return artefatoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artefato não encontrado"));
    }

    @Transactional
    public void excluir(UUID id) {
        if (!artefatoRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artefato não encontrado");
        }
        artefatoRepo.deleteById(id);
        log.info("Artefato {} excluído", id);
    }

    /** Resumo leve (sem bytea) para uso no contexto de IA. */
    @Transactional(readOnly = true)
    public List<ArtefatoInfo> listarResumo(UUID demandaId) {
        return artefatoRepo.findByDemandaIdOrderByCriadoEmDesc(demandaId);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private TipoArtefato parseTipo(String valor) {
        if (valor == null || valor.isBlank()) return TipoArtefato.OUTRO;
        try { return TipoArtefato.valueOf(valor.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { return TipoArtefato.OUTRO; }
    }

    private String sanitizarNome(String nome) {
        return nome.replaceAll("[^\\w.\\-]", "_");
    }
}
