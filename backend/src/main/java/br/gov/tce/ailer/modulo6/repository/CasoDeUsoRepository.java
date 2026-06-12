package br.gov.tce.ailer.modulo6.repository;

import br.gov.tce.ailer.modulo6.domain.CasoDeUso;
import br.gov.tce.ailer.modulo6.domain.enums.StatusCasoDeUso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface CasoDeUsoRepository extends JpaRepository<CasoDeUso, UUID> {

    List<CasoDeUso> findByDemandaIdOrderByOrdemExibicaoAsc(UUID demandaId);

    List<CasoDeUso> findByDemandaIdAndStatusAprovacaoOrderByOrdemExibicaoAsc(
            UUID demandaId, StatusCasoDeUso status);

    long countByDemandaId(UUID demandaId);

    @Modifying
    @Query("DELETE FROM CasoDeUso c WHERE c.demandaId = :demandaId AND c.fonte = 'IA'")
    void deleteGeradosPorIa(UUID demandaId);
}
