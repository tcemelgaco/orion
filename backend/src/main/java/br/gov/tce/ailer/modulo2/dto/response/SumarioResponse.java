package br.gov.tce.ailer.modulo2.dto.response;

import br.gov.tce.ailer.modulo2.domain.SumarioLevantamento;

import java.time.LocalDateTime;
import java.util.UUID;

public record SumarioResponse(
        UUID id,
        UUID entrevistaId,
        String contexto,
        String usuariosIdentificados,
        String processoAtual,
        String necessidades,
        String regrasNegocio,
        String integracoes,
        String restricoesPremissas,
        String informacoesAusentes,
        String conteudoCompleto,
        Integer suficiencia,
        String avaliacaoSuficiencia,
        LocalDateTime criadoEm
) {
    public static SumarioResponse from(SumarioLevantamento s) {
        return new SumarioResponse(
                s.getId(), s.getEntrevista().getId(),
                s.getContexto(), s.getUsuariosIdentificados(),
                s.getProcessoAtual(), s.getNecessidades(),
                s.getRegrasNegocio(), s.getIntegracoes(),
                s.getRestricoesPremissas(), s.getInformacoesAusentes(),
                s.getConteudoCompleto(), s.getSuficiencia(), s.getAvaliacaoSuficiencia(),
                s.getCriadoEm()
        );
    }
}
