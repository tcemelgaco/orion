package br.gov.tce.ailer.modulo2.domain;

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
@Table(name = "sumarios_levantamento")
public class SumarioLevantamento extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrevista_id", nullable = false, unique = true)
    private Entrevista entrevista;

    @Column(columnDefinition = "TEXT")
    private String contexto;

    @Column(columnDefinition = "TEXT")
    private String usuariosIdentificados;

    @Column(name = "processo_atual", columnDefinition = "TEXT")
    private String processoAtual;

    @Column(columnDefinition = "TEXT")
    private String necessidades;

    @Column(name = "regras_negocio", columnDefinition = "TEXT")
    private String regrasNegocio;

    @Column(columnDefinition = "TEXT")
    private String integracoes;

    @Column(name = "restricoes_premissas", columnDefinition = "TEXT")
    private String restricoesPremissas;

    @Column(name = "informacoes_ausentes", columnDefinition = "TEXT")
    private String informacoesAusentes;

    @Column(name = "conteudo_completo", columnDefinition = "TEXT", nullable = false)
    private String conteudoCompleto;

    @Builder
    public SumarioLevantamento(Entrevista entrevista, String contexto, String usuariosIdentificados,
                                String processoAtual, String necessidades, String regrasNegocio,
                                String integracoes, String restricoesPremissas,
                                String informacoesAusentes, String conteudoCompleto) {
        this.entrevista = entrevista;
        this.contexto = contexto;
        this.usuariosIdentificados = usuariosIdentificados;
        this.processoAtual = processoAtual;
        this.necessidades = necessidades;
        this.regrasNegocio = regrasNegocio;
        this.integracoes = integracoes;
        this.restricoesPremissas = restricoesPremissas;
        this.informacoesAusentes = informacoesAusentes;
        this.conteudoCompleto = conteudoCompleto;
    }
}
