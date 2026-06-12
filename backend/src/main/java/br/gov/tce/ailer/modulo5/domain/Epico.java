package br.gov.tce.ailer.modulo5.domain;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo5.domain.enums.StatusBacklog;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import br.gov.tce.ailer.shared.domain.enums.StatusAprovacao;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "epicos")
public class Epico extends BaseEntity {

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Column(nullable = false, length = 12)
    private String codigo;

    @Column(nullable = false, length = 300)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusBacklog status = StatusBacklog.ABERTO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private PrioridadeDemanda prioridade = PrioridadeDemanda.MEDIA;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "MANUAL";

    @Column(name = "ordem_exibicao", nullable = false)
    @Builder.Default
    private Integer ordemExibicao = 0;

    @OneToMany(mappedBy = "epico", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("ordemExibicao ASC")
    @Builder.Default
    private List<Feature> features = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 20)
    @Builder.Default
    private StatusAprovacao statusAprovacao = StatusAprovacao.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 150)
    private String aprovadoPor;

    @Column(name = "aprovado_em")
    private OffsetDateTime aprovadoEm;
}
