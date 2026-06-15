package br.gov.tce.ailer.modulo13.repository;

import br.gov.tce.ailer.modulo13.domain.DocumentoConhecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConhecimentoRepository extends JpaRepository<DocumentoConhecimento, UUID> {
    // Busca por similaridade via pgvector é feita com JdbcTemplate no ConhecimentoService
    // para suportar o operador <=> e o índice HNSW funcional criado em V21.
}
