package br.gov.tce.ailer.modulo1.domain;

import br.gov.tce.ailer.modulo1.domain.enums.PrioridadeDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import br.gov.tce.ailer.modulo1.domain.enums.TipoDemanda;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "demandas")
public class Demanda extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "area_demandante", nullable = false, length = 100)
    private String areaDemandante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusDemanda status = StatusDemanda.RASCUNHO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PrioridadeDemanda prioridade = PrioridadeDemanda.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoDemanda tipo;

    @Column(name = "prazo_estimado")
    private LocalDate prazoEstimado;

    @Column(name = "matricula_solicitante", nullable = false, length = 20)
    private String matriculaSolicitante;

    @Column(name = "nome_solicitante", length = 100)
    private String nomeSolicitante;

    @Column(columnDefinition = "TEXT")
    private String premissas;

    @Column(columnDefinition = "TEXT")
    private String restricoes;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @OneToMany(mappedBy = "demanda", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Stakeholder> stakeholders = new ArrayList<>();

    @OneToMany(mappedBy = "demanda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("alteradoEm DESC")
    private List<HistoricoDemanda> historico = new ArrayList<>();

    @Builder
    public Demanda(String titulo, String descricao, String areaDemandante,
                   PrioridadeDemanda prioridade, TipoDemanda tipo,
                   LocalDate prazoEstimado, String matriculaSolicitante,
                   String nomeSolicitante, String premissas, String restricoes,
                   String observacoes) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.areaDemandante = areaDemandante;
        this.status = StatusDemanda.RASCUNHO;
        this.prioridade = prioridade != null ? prioridade : PrioridadeDemanda.MEDIA;
        this.tipo = tipo;
        this.prazoEstimado = prazoEstimado;
        this.matriculaSolicitante = matriculaSolicitante;
        this.nomeSolicitante = nomeSolicitante;
        this.premissas = premissas;
        this.restricoes = restricoes;
        this.observacoes = observacoes;
    }
}
