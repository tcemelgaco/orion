Gere um sumário de standup com base no trabalho recente.

1. Execute `git log --since="yesterday" --oneline --all` para ver os commits
2. Verifique arquivos modificados recentemente com `git diff --stat HEAD~3`
3. Gere o relatório no formato abaixo

## Formato do Standup

```markdown
## Standup — [data]

### O que foi feito ontem
- [módulo/área]: [o que foi concluído]
- [módulo/área]: [o que foi concluído]

### O que será feito hoje
- [módulo/área]: [o que está planejado]
- [módulo/área]: [o que está planejado]

### Impedimentos
- [impedimento, se houver]

### Métricas do Sprint
- Story Points concluídos: [X] / [X] planejados
- Fase atual: [Fase X — descrição]
- PRs abertos: [X]
- PRs pendentes de review: [X]
```

Se não houver commits recentes, pergunte ao usuário o que foi feito para gerar o standup manualmente.
