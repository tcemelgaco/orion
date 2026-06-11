Gere ou atualize documentação para o código ou módulo especificado.

## Tipos de Documentação

### 1. OpenAPI / Swagger (Backend)
Para novos endpoints, gere a documentação `@Operation`, `@ApiResponse` e `@Schema`:
```java
@Operation(summary = "Inicia entrevista inteligente", 
           description = "Cria uma nova sessão de entrevista para o projeto especificado")
@ApiResponse(responseCode = "200", description = "Sessão criada com sucesso")
@ApiResponse(responseCode = "404", description = "Projeto não encontrado")
@ApiResponse(responseCode = "403", description = "Sem permissão para este projeto")
```

### 2. README de Módulo
Para um novo módulo Spring Boot ou React:
```markdown
## [Nome do Módulo]

### Responsabilidade
[O que este módulo faz no contexto do AILER]

### Endpoints (Backend)
- GET /api/v1/[recurso] — [descrição]
- POST /api/v1/[recurso] — [descrição]

### Componentes (Frontend)
- [NomeComponente] — [descrição]

### Como testar
[comando para executar os testes do módulo]

### Configuração necessária
[variáveis de ambiente ou configurações específicas]
```

### 3. ADR (Architecture Decision Record)
Use o template em `context/decisions/ADR-000-template.md` e salve em `context/decisions/ADR-[número]-[titulo].md`.

### 4. Atualizar context/architecture.md
Se houve mudança arquitetural significativa, atualize a seção relevante em `context/architecture.md`.

## Regras

- Documentação em Português (PT-BR) para o negócio
- Código e APIs em inglês (nomes de campos, endpoints)
- Não adicione comentários óbvios — só onde a lógica não é auto-evidente
- Mantenha a documentação próxima do código (não em wiki separada)
- Após gerar, confirme que está alinhada com o código atual
