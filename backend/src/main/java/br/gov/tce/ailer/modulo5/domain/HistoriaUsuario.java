package br.gov.tce.ailer.modulo5.domain;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo5.domain.enums.StatusHistoria;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "historias_usuario")
public class HistoriaUsuario extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Column(nullable = false, length = 12)
    private String codigo;

    @Column(name = "como_papel", nullable = false, length = 200)
    private String comoPapel;

    @Column(name = "quero_acao", nullable = false, length = 500)
    private String queroAcao;

    @Column(name = "para_beneficio", length = 500)
    private String paraBeneficio;

    @Column(name = "criterios_aceitacao", columnDefinition = "TEXT")
    private String criteriosAceitacao;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private PrioridadeDemanda prioridade = PrioridadeDemanda.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusHistoria status = StatusHistoria.BACKLOG;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "MANUAL";

    @Column(name = "ordem_exibicao", nullable = false)
    @Builder.Default
    private Integer ordemExibicao = 0;

    @Column(name = "invest_score")
    private Integer investScore;

    @Column(name = "invest_detalhes", columnDefinition = "TEXT")
    private String investDetalhes;

    @Column(name = "gitlab_issue_iid")
    private Integer gitlabIssueIid;

    @Column(name = "gitlab_issue_url", length = 500)
    private String gitlabIssueUrl;

    @Column(name = "gitlab_exportado_em")
    private java.time.LocalDateTime gitlabExportadoEm;
}
