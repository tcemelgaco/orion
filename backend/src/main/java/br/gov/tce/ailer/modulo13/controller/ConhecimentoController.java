package br.gov.tce.ailer.modulo13.controller;

import br.gov.tce.ailer.modulo13.dto.request.IngerirDocumentoRequest;
import br.gov.tce.ailer.modulo13.dto.response.BuscaSemanticaResponse;
import br.gov.tce.ailer.modulo13.dto.response.DocumentoConhecimentoResponse;
import br.gov.tce.ailer.modulo13.service.ConhecimentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/conhecimento")
@RequiredArgsConstructor
@Tag(name = "Módulo 13 — Base de Conhecimento Institucional",
        description = "Ingestão e busca semântica (RAG) sobre documentos institucionais")
public class ConhecimentoController {

    private final ConhecimentoService conhecimentoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ingerir documento na base de conhecimento",
            description = "Gera embedding via OpenAI e armazena o documento para busca semântica futura.")
    public DocumentoConhecimentoResponse ingerir(
            @Valid @RequestBody IngerirDocumentoRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String criadoPor = principal != null ? principal.getUsername() : "sistema";
        return conhecimentoService.ingerir(request, criadoPor);
    }

    @GetMapping
    @Operation(summary = "Listar documentos da base de conhecimento",
            description = "Retorna todos os documentos cadastrados sem o campo embedding.")
    public List<DocumentoConhecimentoResponse> listar() {
        return conhecimentoService.listar();
    }

    @PostMapping("/buscar")
    @Operation(summary = "Busca semântica por similaridade",
            description = "Gera embedding da query e retorna os documentos mais similares ordenados por score.")
    public List<BuscaSemanticaResponse> buscar(@Valid @RequestBody BuscaRequest request) {
        return conhecimentoService.buscar(request.query(), request.limite());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir documento da base de conhecimento")
    public void excluir(@PathVariable UUID id) {
        conhecimentoService.excluir(id);
    }

    // -------------------------------------------------------------------------
    // DTO interno para o endpoint de busca semântica
    // -------------------------------------------------------------------------

    public record BuscaRequest(
            @NotBlank(message = "Query de busca é obrigatória")
            String query,

            @Min(value = 1, message = "Limite mínimo é 1")
            @Max(value = 20, message = "Limite máximo é 20")
            int limite
    ) {}
}
