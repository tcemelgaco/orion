# /entrevista — Simular Entrevista Inteligente (Módulo 2)

Use este comando para simular, testar ou depurar o fluxo de entrevista inteligente do AILER.

## O que fazer

1. Leia `escopo.md` seção "Módulo 2 – Entrevista Inteligente Assistida por IA"
2. Leia o contexto de projeto informado (ou solicite se não fornecido)
3. Simule o papel do **Agente Analista de Negócio** conduzindo a entrevista

## Modo: Simular Entrevista

Se o usuário forneceu um contexto de demanda, conduza a entrevista fazendo:

1. **Pergunta de abertura**: Qual é o problema ou oportunidade que motivou esta demanda?
2. **Perguntas de contexto**: Quem são os usuários? Qual processo atual?
3. **Perguntas de negócio**: Quais regras de negócio existem? Quais restrições?
4. **Perguntas complementares automáticas**: Baseadas nas respostas anteriores, identifique lacunas e faça perguntas específicas
5. **Identificação de inconsistências**: Aponte contradições nas respostas
6. **Consolidação**: Ao final, gere um sumário estruturado do levantamento

## Modo: Analisar Implementação

Se o usuário quer revisar o código do Módulo 2:

1. Leia os arquivos do módulo de entrevista
2. Verifique se o fluxo conversacional está correto
3. Verifique os prompts enviados à OpenAI
4. Identifique se as capacidades descritas no escopo estão implementadas:
   - Compreensão de contexto
   - Raciocínio sobre processos
   - Identificação de regras de negócio
   - Identificação de integrações
   - Identificação de perfis de usuário

## Output Esperado da Entrevista

```markdown
## Sumário do Levantamento — [nome do projeto]

### Contexto
[descrição do problema e contexto]

### Usuários Identificados
- [perfil 1]: [responsabilidades]
- [perfil 2]: [responsabilidades]

### Processo Atual
[descrição do AS-IS]

### Necessidades Identificadas
- [necessidade 1]
- [necessidade 2]

### Regras de Negócio Preliminares
- RN001: [regra]
- RN002: [regra]

### Integrações Necessárias
- [sistema 1]: [propósito]

### Restrições e Premissas
- [restrição 1]
- [premissa 1]

### Informações Ausentes (Gap Analysis)
- [informação que precisa ser coletada]

### Próximos Passos
- [ ] [ação]
```
