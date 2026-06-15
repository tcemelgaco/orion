package br.gov.tce.ailer.shared.handler;

import br.gov.tce.ailer.shared.dto.ErroResponse;
import br.gov.tce.ailer.shared.exception.BusinessException;
import br.gov.tce.ailer.shared.exception.RecursoNaoEncontradoException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErroResponse handleNaoEncontrado(RecursoNaoEncontradoException ex, HttpServletRequest req) {
        return ErroResponse.of(404, "Não encontrado", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_CONTENT)
    public ErroResponse handleBusiness(BusinessException ex, HttpServletRequest req) {
        return ErroResponse.of(422, "Regra de negócio", ex.getMessage(), req.getRequestURI());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public ErroResponse handleMaxUploadSize(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return ErroResponse.of(413, "Arquivo muito grande", "O arquivo ultrapassa o limite de 50 MB.", req.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErroResponse handleValidacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ErroResponse.CampoErro> campos = ex.getBindingResult().getAllErrors().stream()
                .map(e -> {
                    String campo = e instanceof FieldError fe ? fe.getField() : e.getObjectName();
                    return new ErroResponse.CampoErro(campo, e.getDefaultMessage());
                })
                .toList();
        return ErroResponse.ofCampos(400, "Dados inválidos na requisição", req.getRequestURI(), campos);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErroResponse> handleResponseStatus(ResponseStatusException ex, HttpServletRequest req) {
        int status = ex.getStatusCode().value();
        String titulo = ex.getStatusCode() instanceof HttpStatus hs ? hs.getReasonPhrase() : "Erro";
        String mensagem = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        return ResponseEntity.status(ex.getStatusCode())
                .body(ErroResponse.of(status, titulo, mensagem, req.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErroResponse handleGeneral(Exception ex, HttpServletRequest req) {
        log.error("[{}] {} — path={}", ex.getClass().getSimpleName(), ex.getMessage(), req.getRequestURI(), ex);
        return ErroResponse.of(500, "Erro interno", "Ocorreu um erro inesperado. Tente novamente.", req.getRequestURI());
    }
}
