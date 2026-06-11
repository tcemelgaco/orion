Ajude a diagnosticar e resolver o problema descrito.

## Processo de Debug

1. **Reproduza**: Confirme que você entendeu o problema e consegue reproduzi-lo
2. **Localize**: Identifique os arquivos e linhas relevantes
3. **Analise**: Leia o código e os logs disponíveis
4. **Hipóteses**: Liste as possíveis causas (do mais ao menos provável)
5. **Investigue**: Teste cada hipótese com evidências do código
6. **Corrija**: Proponha a correção mínima que resolve o problema
7. **Valide**: Explique como verificar que o fix funciona

## Contexto a Coletar

Para problemas no **backend Spring Boot**:
- Stack trace completo
- Request/response HTTP (curl ou log)
- Configuração relevante em application.yml
- Query SQL gerada (habilitar `spring.jpa.show-sql=true` em dev)

Para problemas no **frontend React**:
- Erro no console do browser
- Network tab (request/response)
- State do componente no momento do erro
- Versão do Node e dependências relevantes

Para problemas com **OpenAI API**:
- Status code e mensagem de erro retornados
- Prompt enviado (sem dados pessoais)
- Uso de tokens (se erro de limite)
- Timeout configurado vs tempo de resposta

Para problemas com **banco de dados (PostgreSQL)**:
- Query que falhou
- EXPLAIN ANALYZE se problema de performance
- Locks ativos se deadlock

## Formato da Resposta

```markdown
## Diagnóstico

**Causa Raiz:** [descrição clara]

**Evidências:**
- [arquivo:linha] — [o que encontrou]

**Correção Proposta:**
[código ou configuração]

**Como Validar:**
1. [passo 1]
2. [passo 2]
```
