package br.gov.tce.ailer.modulo13.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload para ingestão de um documento na base de conhecimento institucional.
 *
 * @param titulo  Título descritivo do documento (obrigatório).
 * @param conteudo Texto completo a ser indexado e vetorizado (obrigatório).
 * @param tipo    Categoria: "DOCUMENTO", "ESPECIFICACAO", "ATA", "MANUAL", etc.
 * @param tags    Array JSON como string, ex.: ["financeiro","2024"].
 * @param fonte   Referência de origem (sistema, processo, URL, etc.).
 */
public record IngerirDocumentoRequest(
        @NotBlank(message = "Título é obrigatório")
        String titulo,

        @NotBlank(message = "Conteúdo é obrigatório")
        String conteudo,

        String tipo,

        String tags,

        String fonte
) {}
