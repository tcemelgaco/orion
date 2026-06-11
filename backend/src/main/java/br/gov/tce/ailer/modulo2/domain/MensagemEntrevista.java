package br.gov.tce.ailer.modulo2.domain;

import br.gov.tce.ailer.modulo2.domain.enums.RoleMensagem;
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
@Table(name = "mensagens_entrevista")
public class MensagemEntrevista extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrevista_id", nullable = false)
    private Entrevista entrevista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RoleMensagem role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Builder
    public MensagemEntrevista(Entrevista entrevista, RoleMensagem role, String conteudo) {
        this.entrevista = entrevista;
        this.role = role;
        this.conteudo = conteudo;
    }
}
