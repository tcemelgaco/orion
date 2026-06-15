package br.gov.tce.ailer.modulo14.domain;

import br.gov.tce.ailer.modulo14.domain.enums.TipoAgente;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "agentes_sessoes")
public class AgenteSessao extends BaseEntity {

    @Column(name = "demanda_id", nullable = false)
    private UUID demandaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_agente", nullable = false, length = 30)
    private TipoAgente tipoAgente;

    @Column(name = "titulo", length = 200)
    private String titulo;

    @Builder
    public AgenteSessao(UUID demandaId, TipoAgente tipoAgente, String titulo) {
        this.demandaId = demandaId;
        this.tipoAgente = tipoAgente;
        this.titulo = titulo;
    }
}
