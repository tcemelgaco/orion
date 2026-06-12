package br.gov.tce.ailer.exportacao.controller;

import br.gov.tce.ailer.exportacao.service.ExportacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demandas/{demandaId}/exportar")
@RequiredArgsConstructor
@Tag(name = "Exportação — DOCX / PDF")
public class ExportacaoController {

    private final ExportacaoService exportacaoService;

    @GetMapping("/docx")
    @Operation(summary = "Exportar especificação completa da demanda em DOCX")
    public ResponseEntity<byte[]> exportarDocx(@PathVariable UUID demandaId) {
        byte[] bytes = exportacaoService.gerarDocx(demandaId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("especificacao-" + demandaId + ".docx").build());
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @GetMapping("/pdf")
    @Operation(summary = "Exportar especificação completa da demanda em PDF")
    public ResponseEntity<byte[]> exportarPdf(@PathVariable UUID demandaId) {
        byte[] bytes = exportacaoService.gerarPdf(demandaId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("especificacao-" + demandaId + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}
