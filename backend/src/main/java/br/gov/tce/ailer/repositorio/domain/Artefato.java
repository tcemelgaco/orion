package br.gov.tce.ailer.repositorio.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "artefatos")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Artefato {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @Column(name = "nome_original", nullable = false, length = 500)
    private String nomeOriginal;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_artefato", nullable = false, length = 30)
    @Builder.Default
    private TipoArtefato tipoArtefato = TipoArtefato.OUTRO;

    @Column(name = "tamanho_bytes", nullable = false)
    @Builder.Default
    private Long tamanhoBytes = 0L;

    @Column(name = "content_type", nullable = false, length = 120)
    @Builder.Default
    private String contentType = "application/octet-stream";

    @Column(name = "conteudo", nullable = false, columnDefinition = "bytea")
    private byte[] conteudo;

    @Column(name = "uploadado_por", length = 150)
    private String uploadadoPor;

    @CreatedDate
    @Column(name = "criado_em", updatable = false)
    private OffsetDateTime criadoEm;

    @LastModifiedDate
    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;
}
