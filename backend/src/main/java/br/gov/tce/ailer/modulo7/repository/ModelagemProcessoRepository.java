package br.gov.tce.ailer.modulo7.repository;

import br.gov.tce.ailer.modulo7.domain.ModelagemProcesso;
import br.gov.tce.ailer.modulo7.domain.enums.TipoFluxo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ModelagemProcessoRepository extends JpaRepository<ModelagemProcesso, UUID> {

    List<ModelagemProcesso> findByDemandaIdOrderByCriadoEmAsc(UUID demandaId);

    List<ModelagemProcesso> findByDemandaIdAndTipoFluxoOrderByCriadoEmAsc(
            UUID demandaId, TipoFluxo tipoFluxo);
}
