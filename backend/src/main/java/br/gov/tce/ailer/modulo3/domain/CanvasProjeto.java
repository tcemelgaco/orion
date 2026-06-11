package br.gov.tce.ailer.modulo3.domain;

import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "canvas_projeto")
public class CanvasProjeto extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Column(columnDefinition = "TEXT")
    private String contexto;

    @Column(columnDefinition = "TEXT")
    private String problema;

    @Column(name = "solucao_proposta", columnDefinition = "TEXT")
    private String solucaoProposta;

    @Column(columnDefinition = "TEXT")
    private String usuarios;

    @Column(name = "funcionalidades_chave", columnDefinition = "TEXT")
    private String funcionalidadesChave;

    @Column(columnDefinition = "TEXT")
    private String restricoes;

    @Column(columnDefinition = "TEXT")
    private String premissas;

    @Column(columnDefinition = "TEXT")
    private String riscos;

    @Column(name = "criterios_sucesso", columnDefinition = "TEXT")
    private String criteriosSucesso;

    @Column(columnDefinition = "TEXT")
    private String integracoes;

    @Column(name = "gerado_por_ia", nullable = false)
    @Builder.Default
    private Boolean geradoPorIa = true;
}
