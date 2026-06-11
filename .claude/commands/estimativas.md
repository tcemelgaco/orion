# /estimativas — Gerar Estimativas de Esforço (Módulo 10)

Use este comando para estimar esforço, prazo e recursos de um projeto ou sprint.

## Entradas Esperadas

Forneça um dos seguintes:
- Backlog de histórias de usuário (output do /historias)
- Lista de funcionalidades com complexidade
- Sprint ou release a estimar

## Processo

1. Analise o backlog ou funcionalidades fornecidas
2. Estime Story Points por US (se não estimado)
3. Calcule velocidade esperada do time
4. Projete prazo e recursos necessários
5. Gere matriz de esforço por área

## Premissas para Cálculo

- Velocidade do time: solicitar ao usuário (ex: 30 SP/sprint de 2 semanas)
- Disponibilidade: solicitar ao usuário (% de dedicação)
- Overhead de gerenciamento: 20% do esforço técnico
- Fator de risco: 15-30% dependendo da complexidade

## Formato da Estimativa

```markdown
## Estimativa de Esforço — [nome do projeto/módulo]

### Sumário Executivo
| Item | Valor |
|------|-------|
| Total de Story Points | [X] SP |
| Velocidade do time | [X] SP/sprint |
| Sprints estimados | [X] sprints |
| Duração estimada | [X] semanas |
| Equipe sugerida | [X] pessoas |

### Estimativa por Épico

| Épico | US | SP Total | Sprints |
|-------|-----|---------|---------|
| [épico 1] | [quantidade] | [total SP] | [estimativa] |
| [épico 2] | ... | ... | ... |
| **Total** | **[total US]** | **[total SP]** | **[total sprints]** |

### Matriz de Esforço por Especialidade

| Área | Horas Estimadas | % do Total |
|------|----------------|-----------|
| Backend (Java/Spring) | [X]h | [X]% |
| Frontend (React/TS) | [X]h | [X]% |
| Banco de dados / Migrations | [X]h | [X]% |
| Integração OpenAI / IA | [X]h | [X]% |
| Testes | [X]h | [X]% |
| DevOps / Infra (K8s) | [X]h | [X]% |
| Gestão e revisões | [X]h | [X]% |
| **Total** | **[X]h** | 100% |

### Composição da Equipe Sugerida

| Papel | Quantidade | Dedicação |
|-------|-----------|-----------|
| Analista de Sistemas | [X] | [X]% |
| Desenvolvedor Backend (Java) | [X] | [X]% |
| Desenvolvedor Frontend (React) | [X] | [X]% |
| QA | [X] | [X]% |
| DevOps | [X] | [X]% |

### Cronograma por Fase (alinhado ao Roadmap AILER)

| Fase | Módulos | SP | Duração Estimada |
|------|---------|-----|-----------------|
| Fase 1 — MVP | 1, 2, 3, 4, 5 | [X] | [X] semanas |
| Fase 2 | 6, 7 + GitLab | [X] | [X] semanas |

### Riscos e Contingência

| Risco | Impacto em Prazo | Mitigação |
|-------|-----------------|-----------|
| Latência da OpenAI API | +1 sprint | Cache + retry |
| Curva de aprendizado pgvector | +0.5 sprint | POC antecipado |
| Integração AD complexa | +1 sprint | Autenticação mock em dev |

### Premissas da Estimativa
- Velocidade utilizada: [X] SP/sprint
- Overhead incluído: 20%
- Fator de risco aplicado: [X]%
- Base: [referência usada — backlog v[X] de [data]]
```
