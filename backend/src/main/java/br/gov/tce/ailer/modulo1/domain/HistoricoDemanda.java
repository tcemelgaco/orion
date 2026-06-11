package br.gov.tce.ailer.modulo1.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "historico_demandas")
public class HistoricoDemanda {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demanda_id", nullable = false)
    private Demanda demanda;

    @Column(nullable = false, length = 50)
    private String acao;

    @Column(name = "descricao_alteracao", columnDefinition = "TEXT")
    private String descricaoAlteracao;

    @Column(name = "status_anterior", length = 30)
    private String statusAnterior;

    @Column(name = "status_novo", length = 30)
    private String statusNovo;

    @Column(name = "alterado_por", nullable = false, length = 50)
    private String alteradoPor;

    @Column(name = "alterado_em", nullable = false)
    private LocalDateTime alteradoEm;

    @Builder
    public HistoricoDemanda(Demanda demanda, String acao, String descricaoAlteracao,
                             String statusAnterior, String statusNovo, String alteradoPor) {
        this.demanda = demanda;
        this.acao = acao;
        this.descricaoAlteracao = descricaoAlteracao;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.alteradoPor = alteradoPor;
        this.alteradoEm = LocalDateTime.now();
    }
}
