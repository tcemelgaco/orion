package br.gov.tce.ailer.repositorio.controller;

import br.gov.tce.ailer.repositorio.domain.Artefato;
import br.gov.tce.ailer.repositorio.dto.ArtefatoResponse;
import br.gov.tce.ailer.repositorio.service.ArtefatoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Repositório de Artefatos")
public class ArtefatoController {

    private final ArtefatoService artefatoService;

    @PostMapping(value = "/demandas/{demandaId}/artefatos",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Fazer upload de artefato (lei, IN, resolução, contrato, manual, etc.)")
    public ArtefatoResponse upload(
            @PathVariable UUID demandaId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "tipo",      required = false) String tipo,
            @RequestPart(value = "descricao", required = false) String descricao,
            @AuthenticationPrincipal UserDetails user
    ) throws IOException {
        return artefatoService.upload(demandaId, file, tipo, descricao, user.getUsername());
    }

    @GetMapping("/demandas/{demandaId}/artefatos")
    @Operation(summary = "Listar artefatos da demanda (sem conteúdo binário)")
    public ResponseEntity<List<ArtefatoResponse>> listar(@PathVariable UUID demandaId) {
        return ResponseEntity.ok(artefatoService.listar(demandaId));
    }

    @GetMapping("/artefatos/{id}/download")
    @Operation(summary = "Download de artefato pelo ID")
    public ResponseEntity<byte[]> download(@PathVariable UUID id) {
        Artefato a = artefatoService.download(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename(a.getNomeOriginal(), StandardCharsets.UTF_8)
                        .build());
        headers.setContentType(MediaType.parseMediaType(a.getContentType()));
        return ResponseEntity.ok().headers(headers).body(a.getConteudo());
    }

    @DeleteMapping("/artefatos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir artefato")
    public void excluir(@PathVariable UUID id) {
        artefatoService.excluir(id);
    }
}
