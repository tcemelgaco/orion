# ADR-001: Stack Tecnológica do AILER

**Status**: Aceito
**Data**: 2026-06-11
**Módulo(s) afetado(s)**: Todos os módulos

## Contexto

A STI/TCE-CE precisa definir a stack tecnológica para o desenvolvimento do AILER. A equipe da D2S2 tem experiência consolidada em Java/Spring Boot no backend e está adotando React no frontend. O sistema requer busca semântica para o Módulo 13 e integração com IA Generativa para os demais módulos.

Restrições:
- Executar em Kubernetes on-premise
- Integrar com Active Directory existente
- Conformidade com políticas de TI do TCE-CE
- Equipe com expertise em Java e adotando React

## Decisão

Adotar Spring Boot 3.x (Java 21) no backend, React + TypeScript + Tailwind no frontend, PostgreSQL com extensão pgvector para busca semântica, OpenAI API para IA Generativa, MinIO para armazenamento de documentos e Kubernetes para orquestração.

## Alternativas Consideradas

### Alternativa 1: Python + FastAPI no Backend
- **Descrição**: Backend em Python com FastAPI, mais nativo para IA/ML
- **Prós**: Integração nativa com LangChain, frameworks de RAG maduros, mais fácil para experimentar com IA
- **Contras**: Equipe sem expertise em Python; ruptura tecnológica significativa; menor integração com ecossistema Java da STI
- **Por que não escolhida**: Custo de migração e capacitação seria alto demais; a equipe tem expertise em Java

### Alternativa 2: Node.js + NestJS no Backend
- **Descrição**: Backend em TypeScript com NestJS, stack unificada front+back
- **Prós**: Stack única TypeScript, comunidade grande, bom suporte a streaming
- **Contras**: Equipe sem expertise; menor maturidade enterprise que Spring; ecossistema de testes menos robusto que JVM
- **Por que não escolhida**: Menor expertise da equipe; Spring Boot é o padrão da D2S2

### Alternativa 3: Oracle Database em vez de PostgreSQL
- **Descrição**: Usar o Oracle já licenciado pelo TCE-CE
- **Prós**: Licença já existe; familiaridade da equipe
- **Contras**: Sem suporte nativo a pgvector (busca semântica requer extensão); custo adicional de licença para novos schemas; migração futura mais difícil
- **Por que não escolhida**: pgvector é essencial para o Módulo 13; PostgreSQL é open source e totalmente compatível com K8s

## Consequências

### Positivas
- Equipe produtiva desde o início (Java/Spring é o padrão)
- PostgreSQL + pgvector resolve busca semântica sem serviço externo
- React adotado progressivamente na D2S2
- Spring Security com LDAP facilita integração com AD
- Ecossistema Java maduro para testes (JUnit, Testcontainers)

### Negativas / Trade-offs
- pgvector requer habilitação de extensão no PostgreSQL (configuração de DBA)
- Integração com OpenAI via HTTP (sem biblioteca nativa como LangChain para Python)
- Frontend React requer capacitação da equipe que ainda usa outras tecnologias

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Curva de aprendizado pgvector | Baixa | Médio | POC no início da Fase 3 |
| Performance pgvector em grande escala | Baixa | Alto | Benchmark com dados reais; índice HNSW |
| Custo OpenAI API maior que esperado | Média | Médio | Cache de embeddings; limites por projeto |
| Dificuldade integração AD | Média | Alto | POC de autenticação antes do MVP |

## Implicações LGPD

Os dados pessoais dos usuários (nome, matrícula, e-mail) serão armazenados no PostgreSQL e nunca enviados diretamente à OpenAI API sem anonimização prévia. Os prompts enviados à IA devem referenciar os dados por identificadores internos.

## Plano de Implementação

1. Setup inicial: repositórios, Dockerfiles, pipelines CI/CD básicos
2. POC de autenticação com Active Directory (Spring Security + LDAP)
3. Setup PostgreSQL + pgvector no K8s (Flyway para migrations)
4. Primeiro endpoint Spring Boot com conexão ao banco
5. Primeiro componente React integrado ao backend
6. POC de integração OpenAI API (Módulo 2 — Entrevista)
