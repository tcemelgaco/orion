package br.gov.tce.ailer.modulo1.repository;

import br.gov.tce.ailer.modulo1.domain.Demanda;
import br.gov.tce.ailer.modulo1.domain.enums.StatusDemanda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DemandaRepository extends JpaRepository<Demanda, UUID> {

    Page<Demanda> findByStatus(StatusDemanda status, Pageable pageable);

    @Query("""
            SELECT d FROM Demanda d
            WHERE (:status IS NULL OR d.status = :status)
              AND (:area IS NULL OR LOWER(d.areaDemandante) LIKE LOWER(CONCAT('%', :area, '%')))
              AND (:busca IS NULL OR LOWER(d.titulo) LIKE LOWER(CONCAT('%', :busca, '%'))
                                  OR LOWER(d.descricao) LIKE LOWER(CONCAT('%', :busca, '%')))
            """)
    Page<Demanda> buscar(
            @Param("status") StatusDemanda status,
            @Param("area") String area,
            @Param("busca") String busca,
            Pageable pageable
    );
}
