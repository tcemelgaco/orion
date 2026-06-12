package br.gov.tce.ailer.modulo10.domain;

import br.gov.tce.ailer.modulo10.domain.enums.StatusEstimativa;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "estimativas_projeto")
public class EstimativaProjeto extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Column(name = "story_points_total") private Integer storyPointsTotal;

    @Column(name = "horas_analista", precision = 8, scale = 1) private BigDecimal horasAnalista;
    @Column(name = "horas_dev",      precision = 8, scale = 1) private BigDecimal horasDev;
    @Column(name = "horas_qa",       precision = 8, scale = 1) private BigDecimal horasQa;
    @Column(name = "horas_ux",       precision = 8, scale = 1) private BigDecimal horasUx;

    @Column(name = "prazo_sprints") private Integer prazoSprints;

    @Column(name = "recursos_sugeridos", columnDefinition = "TEXT") private String recursosSugeridos;
    @Column(name = "matriz_esforco",     columnDefinition = "TEXT") private String matrizEsforco;
    @Column(name = "resumo_executivo",   columnDefinition = "TEXT") private String resumoExecutivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusEstimativa statusAprovacao = StatusEstimativa.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120) private String aprovadoPor;
    @Column(name = "aprovado_em") private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";
}
