package br.gov.tce.ailer.modulo2.domain;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo2.domain.enums.StatusEntrevista;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "entrevistas")
public class Entrevista extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demanda_id", nullable = false)
    private Demanda demanda;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusEntrevista status = StatusEntrevista.EM_ANDAMENTO;

    @OneToMany(mappedBy = "entrevista", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("criadoEm ASC")
    private List<MensagemEntrevista> mensagens = new ArrayList<>();

    @OneToOne(mappedBy = "entrevista", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SumarioLevantamento sumario;

    @Builder
    public Entrevista(Demanda demanda) {
        this.demanda = demanda;
        this.status = StatusEntrevista.EM_ANDAMENTO;
    }
}
