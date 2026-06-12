package br.gov.tce.ailer.modulo13.repository;

import br.gov.tce.ailer.modulo13.domain.DocumentoConhecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConhecimentoRepository extends JpaRepository<DocumentoConhecimento, UUID> {

    /**
     * Retorna apenas documentos que já possuem embedding gerado,
     * utilizados na etapa de cálculo de similaridade coseno.
     */
    List<DocumentoConhecimento> findByEmbeddingIsNotNull();
}
