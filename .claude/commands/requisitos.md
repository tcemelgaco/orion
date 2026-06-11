# /requisitos — Gerar ou Revisar Especificação de Requisitos (Módulo 4)

Use este comando para gerar, revisar ou refinar requisitos com base no levantamento.

## Entradas Esperadas

Forneça um dos seguintes:
- Sumário da entrevista (output do /entrevista)
- Canvas do projeto (output do /canvas)
- Descrição da funcionalidade a especificar

## Processo

1. Analise o contexto fornecido
2. Identifique e categorize os requisitos:
   - **RF** — Requisitos Funcionais
   - **RNF** — Requisitos Não Funcionais
   - **RN** — Regras de Negócio
   - **RI** — Requisitos de Integração
   - **RS** — Requisitos de Segurança
3. Numere sequencialmente (RF001, RF002...)
4. Para cada requisito, garanta: ID, Descrição, Prioridade, Critério de Aceitação

## Formato de Saída

```markdown
## Especificação de Requisitos — [nome do projeto/módulo]

### Requisitos Funcionais

| ID | Descrição | Prioridade | Critério de Aceitação |
|----|-----------|-----------|----------------------|
| RF001 | [descrição clara e mensurável] | Alta/Média/Baixa | [como verificar] |
| RF002 | ... | ... | ... |

### Requisitos Não Funcionais

| ID | Descrição | Categoria | Métrica |
|----|-----------|-----------|---------|
| RNF001 | Tempo de resposta < 10s para geração de requisitos | Performance | p95 < 10s |
| RNF002 | Disponibilidade mínima de 99% | Disponibilidade | Uptime mensal |

### Regras de Negócio

| ID | Descrição | Módulo |
|----|-----------|--------|
| RN001 | [regra] | [módulo afetado] |

### Requisitos de Integração

| ID | Sistema | Tipo | Descrição |
|----|---------|------|-----------|
| RI001 | Active Directory | LDAP/OAuth2 | Autenticação de usuários |

### Requisitos de Segurança

| ID | Descrição | Conformidade |
|----|-----------|-------------|
| RS001 | Auditoria de todas as ações de criação/edição | LGPD |
| RS002 | Dados pessoais criptografados em repouso | LGPD / Segurança |

### Verificação de Qualidade
- [ ] Requisitos são atômicos (um requisito = uma coisa)
- [ ] Requisitos são mensuráveis
- [ ] Sem ambiguidades ("sistema deve ser rápido" → "p95 < 10s")
- [ ] Sem duplicidades
- [ ] Sem conflitos entre requisitos
- [ ] Rastreabilidade com o Módulo/Entrevista de origem
```

## Verificação de Conformidade

Após gerar, verifique automaticamente:
- Ambiguidades (palavras como "deve ser fácil", "performático", "eficiente" sem métrica)
- Duplicidades (requisitos com o mesmo comportamento)
- Conflitos (requisitos contraditórios)
- Requisitos ausentes baseados no escopo do módulo
