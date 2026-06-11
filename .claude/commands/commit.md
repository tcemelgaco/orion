Analise todas as mudanças staged (`git diff --cached`) e unstaged (`git diff`), então:

1. Agrupe as mudanças por tipo (feat, fix, refactor, docs, test, chore)
2. Identifique o módulo afetado (ex: `modulo-2-entrevista`, `modulo-4-requisitos`, `infra`, `auth`)
3. Gere uma mensagem de commit seguindo Conventional Commits em português
4. Mostre a mensagem proposta e aguarde aprovação
5. Execute `git add` apenas para arquivos relevantes (excluindo .env, secrets, application-prod.yml)
6. Faça o commit com a mensagem aprovada
7. Mostre o resultado do `git log --oneline -3`

Formato obrigatório:
```
tipo(modulo): descrição curta em português

- detalhe 1
- detalhe 2

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Exemplos válidos:
- `feat(modulo-2-entrevista): adicionar perguntas complementares automáticas`
- `fix(modulo-4-requisitos): corrigir numeração duplicada de RF`
- `refactor(ai-service): extrair cliente OpenAI para classe dedicada`
- `docs(escopo): atualizar roadmap da Fase 2`

NUNCA inclua arquivos .env, credenciais, chaves OpenAI ou application-prod.yml no commit.
