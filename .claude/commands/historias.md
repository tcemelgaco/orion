# /historias — Gerar Histórias de Usuário e Backlog (Módulo 5)

Use este comando para gerar ou refinar o backlog de histórias de usuário.

## Entradas Esperadas

Forneça um dos seguintes:
- Especificação de Requisitos (output do /requisitos)
- Lista de funcionalidades do módulo
- Descrição da feature a decompor

## Processo

1. Analise os requisitos fornecidos
2. Organize em hierarquia: Épico → Feature → História de Usuário
3. Para cada US, gere critérios de aceitação em Gherkin
4. Estime complexidade relativa (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
5. Identifique tarefas técnicas necessárias

## Formato de Saída

```markdown
## Backlog — [nome do módulo/projeto]

---

### ÉPICO: [nome do épico]

**Objetivo:** [o que este épico entrega ao usuário]
**Valor de negócio:** [por que é importante]

#### Feature: [nome da feature]

##### US001 — [título da história]

**Como** [perfil de usuário]
**Quero** [ação desejada]
**Para** [benefício/objetivo]

**Critérios de Aceitação:**
```gherkin
Dado que [contexto inicial]
Quando [ação do usuário]
Então [resultado esperado]
E [resultado adicional se necessário]
```

**Story Points:** [1/2/3/5/8/13]
**Prioridade:** Alta/Média/Baixa
**Dependências:** [US que deve ser concluída antes, se houver]

**Tarefas Técnicas:**
- [ ] Backend: [descrição]
- [ ] Frontend: [descrição]
- [ ] Testes: [descrição]
- [ ] Infra: [descrição, se necessário]

---
```

## Verificação de Qualidade

- [ ] Histórias seguem formato "Como... Quero... Para..."
- [ ] Critérios de aceitação são verificáveis
- [ ] Cada US é independente e entregável
- [ ] Story points são razoáveis (sem US > 13 pontos)
- [ ] US > 8 pontos deve ser quebrada
- [ ] Dependências circulares verificadas
- [ ] Todos os perfis de usuário do escopo cobertos

## Exportação (quando implementado)

Após aprovação, o backlog pode ser exportado para:
- **GitLab**: Issues com labels de épico e milestone
- **Jira**: Epics, Stories e Sub-tasks
- **Taiga**: Epics e User Stories
- **Planilha**: CSV com todos os campos
