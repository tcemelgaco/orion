package br.gov.tce.ailer.modulo2.repository;

import br.gov.tce.ailer.modulo2.domain.MensagemEntrevista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MensagemEntrevistaRepository extends JpaRepository<MensagemEntrevista, UUID> {

    List<MensagemEntrevista> findByEntrevistaIdOrderByCriadoEmAsc(UUID entrevistaId);
}
