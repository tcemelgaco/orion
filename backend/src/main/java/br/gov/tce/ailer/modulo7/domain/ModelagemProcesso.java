package br.gov.tce.ailer.modulo7.domain;

import br.gov.tce.ailer.modulo7.domain.enums.StatusModelagem;
import br.gov.tce.ailer.modulo7.domain.enums.TipoFluxo;
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
@Table(name = "modelagens_processo")
public class ModelagemProcesso extends BaseEntity {

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_fluxo", nullable = false, length = 10)
    private TipoFluxo tipoFluxo;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(name = "descricao_texto", columnDefinition = "TEXT")
    private String descricaoTexto;

    @Column(name = "codigo_mermaid", columnDefinition = "TEXT")
    private String codigoMermaid;

    @Column(name = "bpmn_textual", columnDefinition = "TEXT")
    private String bpmnTextual;

    @Column(name = "pontos_decisao", columnDefinition = "TEXT")
    private String pontosDecisao;

    @Column(columnDefinition = "TEXT")
    private String integracoes;

    @Column(name = "pontos_controle", columnDefinition = "TEXT")
    private String pontosControle;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusModelagem statusAprovacao = StatusModelagem.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120)
    private String aprovadoPor;

    @Column(name = "aprovado_em")
    private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";
}
