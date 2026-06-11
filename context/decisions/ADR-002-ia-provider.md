# ADR-002: Provedor de IA e Modelo

**Status**: Aceito
**Data**: 2026-06-11
**Módulo(s) afetado(s)**: 2 (Entrevista), 3 (Canvas), 4 (Requisitos), 5 (Histórias), 7 (BPMN), 9 (Arquitetura), 10 (Estimativas), 13 (RAG), 14 (Agentes)

## Contexto

O AILER depende fundamentalmente de um modelo de linguagem (LLM) para todas as suas capacidades de geração de artefatos. Precisamos definir o provedor, o modelo e a estratégia de integração. Considerações:

- A qualidade de saída impacta diretamente o valor entregue
- O custo por token é um fator importante para sustentabilidade
- Dados pessoais de servidores do TCE-CE não podem ser enviados a terceiros sem análise LGPD
- A infraestrutura do TCE-CE é on-premise; soluções locais têm limitações de hardware
- O escopo inclui RAG (embeddings) e geração (completions)

## Decisão

Usar **OpenAI API** com modelo **GPT-4o** para geração de artefatos (completions) e **text-embedding-3-small** para geração de embeddings no RAG. A integração será via cliente HTTP direto (sem LangChain) no backend Spring Boot.

## Alternativas Consideradas

### Alternativa 1: Modelo Open Source Local (Llama, Mistral)
- **Descrição**: Rodar modelo local no cluster Kubernetes (GPU nodes)
- **Prós**: Dados não saem da infraestrutura (LGPD simplificada); custo zero por token; sem dependência externa
- **Contras**: Qualidade inferior ao GPT-4o em tarefas complexas de raciocínio; requer GPU dedicada (custo de hardware); equipe sem experiência em MLOps; latência maior
- **Por que não escolhida**: Hardware GPU não disponível; qualidade insuficiente para geração de requisitos formais

### Alternativa 2: Google Gemini API
- **Descrição**: Usar Gemini Pro/Ultra via Google AI Studio ou Vertex AI
- **Prós**: Competitivo em qualidade com GPT-4o; preço similar; integração com Google Workspace
- **Contras**: Equipe sem experiência com a API; migração de prompts em caso de mudança de provider; mesmo problema LGPD que OpenAI
- **Por que não escolhida**: OpenAI é o padrão de mercado; a equipe já tem mais familiaridade; risco de vendor lock-in similar

### Alternativa 3: Azure OpenAI
- **Descrição**: Usar OpenAI via Microsoft Azure (região no Brasil)
- **Prós**: Dados em infraestrutura Azure Brasil; DPA mais robusto para setor público; mesmos modelos OpenAI
- **Contras**: Custo adicional de conta Azure; complexidade de setup; o TCE-CE não tem contrato Azure ativo
- **Por que não escolhida**: Sem contrato Azure ativo; adiciona complexidade sem ganho imediato; pode ser migração futura

## Consequências

### Positivas
- Melhor qualidade de saída disponível no mercado para geração de artefatos
- API amplamente documentada e suportada
- Streaming de resposta nativo (Server-Sent Events)
- text-embedding-3-small: boa relação custo/qualidade para RAG
- Sem necessidade de GPU no cluster

### Negativas / Trade-offs
- Custo recorrente por tokens (estimar e monitorar)
- Dados de projetos enviados à OpenAI (requer mitigação LGPD)
- Dependência de provedor externo (fallback necessário)
- Latência de rede (> 1s por chamada típica)

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Custo de tokens excede orçamento | Média | Médio | Cache de embeddings; limites por projeto/mês; monitoramento de uso |
| OpenAI API indisponível | Baixa | Alto | Graceful degradation; timeout com mensagem clara ao usuário |
| Dados pessoais enviados à IA | Alta (se não mitigado) | Alto | Anonimizar antes de enviar; nunca incluir CPF/e-mail/nome nos prompts |
| Mudança de preço/modelo pela OpenAI | Média | Médio | Abstração de cliente (trocar modelo = 1 config) |
| Resposta inválida/alucinação da IA | Média | Médio | Validação estrutural da resposta; revisão humana obrigatória antes de salvar |

## Implicações LGPD

**CRÍTICO**: Dados pessoais dos servidores do TCE-CE (nome, matrícula, cargo, e-mail) NÃO devem ser incluídos nos prompts enviados à OpenAI.

Estratégia de mitigação:
1. Substituir referências a pessoas por identificadores internos nos prompts (`Usuário ID 42` em vez de `João Silva`)
2. Verificar no code review se prompts contêm dados pessoais
3. Consultar jurídico/DPO sobre necessidade de DPA com a OpenAI antes do go-live

## Plano de Implementação

1. Criar cliente HTTP reutilizável para OpenAI API no pacote `br.gov.tce.ailer.ai`
2. Externalizar model IDs e parâmetros em `application.yml`
3. Implementar retry com backoff exponencial (3 tentativas, max 30s)
4. Implementar circuit breaker para degradação graciosa
5. Criar sistema de logging de uso de tokens (sem dados pessoais)
6. POC: Módulo 2 com streaming (EntrevistaService → OpenAI → frontend)
7. Avaliar migração para Azure OpenAI após aprovação de contrato (backlog Fase 3)
