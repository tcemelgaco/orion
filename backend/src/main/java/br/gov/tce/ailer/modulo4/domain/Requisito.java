package br.gov.tce.ailer.modulo4.domain;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo4.domain.enums.StatusRequisito;
import br.gov.tce.ailer.modulo4.domain.enums.TipoRequisito;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "requisitos")
public class Requisito extends BaseEntity {

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private TipoRequisito tipo;

    @Column(nullable = false, length = 12)
    private String codigo;

    @Column(nullable = false, length = 300)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private PrioridadeDemanda prioridade = PrioridadeDemanda.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusRequisito status = StatusRequisito.RASCUNHO;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String fonte = "MANUAL";

    @Column(name = "criterio_aceitacao", columnDefinition = "TEXT")
    private String criterioAceitacao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "ordem_exibicao", nullable = false)
    @Builder.Default
    private Integer ordemExibicao = 0;

    @Column(name = "aprovado_por", length = 150)
    private String aprovadoPor;

    @Column(name = "aprovado_em")
    private OffsetDateTime aprovadoEm;

    @Column(name = "smart_score")
    private Integer smartScore;

    @Column(name = "smart_detalhes", columnDefinition = "TEXT")
    private String smartDetalhes;
}
