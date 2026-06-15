package br.gov.tce.ailer.modulo13.domain;

import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "conhecimento_documentos")
public class DocumentoConhecimento extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Column(nullable = false, length = 50)
    private String tipo = "DOCUMENTO";

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(length = 300)
    private String fonte;

    // Armazenado como TEXT no formato "[0.1,0.2,...]" compatível com pgvector.
    // O índice HNSW (V21) usa cast funcional embedding::vector(1536).
    @Convert(converter = EmbeddingConverter.class)
    @Column(columnDefinition = "TEXT")
    private float[] embedding;

    @Column(name = "tokens_estimados")
    private Integer tokensEstimados;

    @Builder
    public DocumentoConhecimento(String titulo, String conteudo, String tipo,
                                 String tags, String fonte,
                                 float[] embedding, Integer tokensEstimados) {
        this.titulo = titulo;
        this.conteudo = conteudo;
        this.tipo = tipo != null ? tipo : "DOCUMENTO";
        this.tags = tags;
        this.fonte = fonte;
        this.embedding = embedding;
        this.tokensEstimados = tokensEstimados;
    }
}
