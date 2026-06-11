package br.gov.tce.ailer.modulo1.domain;

import br.gov.tce.ailer.modulo1.domain.enums.PapelStakeholder;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "stakeholders")
public class Stakeholder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demanda_id", nullable = false)
    private Demanda demanda;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 20)
    private String matricula;

    @Column(length = 100)
    private String area;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PapelStakeholder papel;

    @Column(length = 100)
    private String contato;

    @Builder
    public Stakeholder(Demanda demanda, String nome, String matricula,
                       String area, PapelStakeholder papel, String contato) {
        this.demanda = demanda;
        this.nome = nome;
        this.matricula = matricula;
        this.area = area;
        this.papel = papel;
        this.contato = contato;
    }
}
