package br.gov.tce.ailer.modulo9.domain;

import br.gov.tce.ailer.modulo9.domain.enums.StatusArquitetura;
import br.gov.tce.ailer.modulo9.domain.enums.VisaoArquitetural;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "arquiteturas_solucao")
public class ArquiteturaSolucao extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "visao_arquitetural", length = 30)
    private VisaoArquitetural visaoArquitetural;

    @Column(columnDefinition = "TEXT") private String componentes;
    @Column(columnDefinition = "TEXT") private String integracoes;
    @Column(name = "modelo_dados", columnDefinition = "TEXT") private String modeloDados;
    @Column(columnDefinition = "TEXT") private String adrs;
    @Column(columnDefinition = "TEXT") private String recomendacoes;
    @Column(name = "diagrama_mermaid", columnDefinition = "TEXT") private String diagramaMermaid;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusArquitetura statusAprovacao = StatusArquitetura.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120) private String aprovadoPor;
    @Column(name = "aprovado_em") private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";
}
