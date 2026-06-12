package br.gov.tce.ailer.modulo12.domain;

import br.gov.tce.ailer.modulo12.domain.enums.StatusConformidade;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "conformidade_qualidade")
public class ConformidadeQualidade extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Column(name = "analise_lgpd",            columnDefinition = "TEXT") private String analiseLgpd;
    @Column(name = "analise_seguranca",        columnDefinition = "TEXT") private String analiseSeguranca;
    @Column(name = "analise_acessibilidade",   columnDefinition = "TEXT") private String analiseAcessibilidade;
    @Column(name = "qualidade_requisitos",     columnDefinition = "TEXT") private String qualidadeRequisitos;
    @Column(columnDefinition = "TEXT") private String pendencias;
    @Column(name = "score_geral") private Integer scoreGeral;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusConformidade statusAprovacao = StatusConformidade.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120) private String aprovadoPor;
    @Column(name = "aprovado_em") private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";
}
