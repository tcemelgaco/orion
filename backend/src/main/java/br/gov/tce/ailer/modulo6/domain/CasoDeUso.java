package br.gov.tce.ailer.modulo6.domain;

import br.gov.tce.ailer.modulo6.domain.enums.StatusCasoDeUso;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "casos_de_uso")
public class CasoDeUso extends BaseEntity {

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Column(nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(columnDefinition = "TEXT")
    private String atores;

    @Column(name = "pre_condicoes", columnDefinition = "TEXT")
    private String preCondicoes;

    @Column(name = "pos_condicoes", columnDefinition = "TEXT")
    private String posCondicoes;

    @Column(name = "fluxo_principal", columnDefinition = "TEXT")
    private String fluxoPrincipal;

    @Column(name = "fluxos_alternativos", columnDefinition = "TEXT")
    private String fluxosAlternativos;

    @Column(name = "fluxos_excecao", columnDefinition = "TEXT")
    private String fluxosExcecao;

    @Column(name = "requisitos_origem", columnDefinition = "TEXT")
    private String requisitosOrigem;

    @Column(name = "diagrama_mermaid", columnDefinition = "TEXT")
    private String diagramaMermaid;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusCasoDeUso statusAprovacao = StatusCasoDeUso.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120)
    private String aprovadoPor;

    @Column(name = "aprovado_em")
    private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";

    @Column(name = "ordem_exibicao", nullable = false)
    @Builder.Default
    private Integer ordemExibicao = 0;
}
