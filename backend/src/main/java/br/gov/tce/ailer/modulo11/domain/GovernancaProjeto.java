package br.gov.tce.ailer.modulo11.domain;

import br.gov.tce.ailer.modulo11.domain.enums.StatusGovernanca;
import br.gov.tce.ailer.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "governanca_projeto")
public class GovernancaProjeto extends BaseEntity {

    @Column(name = "demanda_id", nullable = false, unique = true)
    private UUID demandaId;

    @Column(name = "matriz_raci",            columnDefinition = "TEXT") private String matrizRaci;
    @Column(name = "stakeholders_mapeados",  columnDefinition = "TEXT") private String stakeholdersMapeados;
    @Column(name = "dependencias_externas",  columnDefinition = "TEXT") private String dependenciasExternas;
    @Column(columnDefinition = "TEXT") private String premissas;
    @Column(columnDefinition = "TEXT") private String restricoes;
    @Column(columnDefinition = "TEXT") private String riscos;
    @Column(name = "plano_mitigacao",        columnDefinition = "TEXT") private String planoMitigacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    @Builder.Default
    private StatusGovernanca statusAprovacao = StatusGovernanca.RASCUNHO_IA;

    @Column(name = "aprovado_por", length = 120) private String aprovadoPor;
    @Column(name = "aprovado_em") private LocalDateTime aprovadoEm;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String fonte = "IA";
}
