package br.gov.tce.ailer.modulo8.domain;

import br.gov.tce.ailer.modulo8.domain.enums.StatusPrototipo;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "prototipos_sistema")
public class PrototipoSistema extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Column(name = "descricao_geral",        columnDefinition = "TEXT") private String descricaoGeral;
    @Column(name = "telas",                  columnDefinition = "TEXT") private String telas;
    @Column(name = "fluxo_navegacao",        columnDefinition = "TEXT") private String fluxoNavegacao;
    @Column(name = "componentes_principais", columnDefinition = "TEXT") private String componentesPrincipais;
    @Column(name = "paleta",                 columnDefinition = "TEXT") private String paleta;
    @Column(name = "diretrizes",             columnDefinition = "TEXT") private String diretrizes;
    @Column(name = "notas_acessibilidade",   columnDefinition = "TEXT") private String notasAcessibilidade;
    @Column(name = "tecnologias_sugeridas",  columnDefinition = "TEXT") private String tecnologiasSugeridas;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusPrototipo statusAprovacao = StatusPrototipo.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120) private String aprovadoPor;
    @Column(name = "aprovado_em")                private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";
}
