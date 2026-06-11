package br.gov.tce.ailer.shared.exception;

import java.util.UUID;

public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String recurso, UUID id) {
        super("%s com id '%s' não encontrado".formatted(recurso, id));
    }

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
