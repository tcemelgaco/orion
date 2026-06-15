# AILER — Assistente Inteligente de Levantamento e Especificação de Requisitos

> Plataforma Corporativa de Engenharia de Requisitos Assistida por IA — TCE-CE  
> Diretoria de Desenvolvimento e Sustentação de Sistemas (D2S2) / STI

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura](#3-arquitetura)
4. [Módulos do Sistema](#4-módulos-do-sistema)
5. [Fluxo Principal de Uso](#5-fluxo-principal-de-uso)
6. [Como a IA Funciona — Contexto por Módulo](#6-como-a-ia-funciona--contexto-por-módulo)
7. [Ciclo de Aprovação de Artefatos](#7-ciclo-de-aprovação-de-artefatos)
8. [Estrutura de Pacotes (Backend)](#8-estrutura-de-pacotes-backend)
9. [Banco de Dados e Migrações](#9-banco-de-dados-e-migrações)
10. [Segurança e Autenticação](#10-segurança-e-autenticação)
11. [Como Executar](#11-como-executar)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)
13. [Roadmap de Fases](#13-roadmap-de-fases)
14. [Git Workflow](#14-git-workflow)

---

## 1. Visão Geral

O **AILER** é uma plataforma web corporativa que acelera e qualifica o processo de levantamento, análise e especificação de requisitos de software no TCE-CE. Combina IA Generativa (GPT-4o) com o conhecimento acumulado de projetos anteriores da instituição para guiar analistas por todo o ciclo: da primeira entrevista até a aprovação formal dos artefatos.

**Princípio fundamental:** todo artefato gerado pela IA deve ser revisado, validado e aprovado formalmente por um analista antes de ter validade para o desenvolvimento. A IA acelera e sugere — o analista decide e assina.

**Objetivo:** reduzir em até 60% o tempo de especificação de requisitos, de semanas para dias.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript + Tailwind CSS | React 18 |
| Backend | Spring Boot + Java | Java 25, Spring Boot 4.1 |
| Banco de Dados | PostgreSQL + pgvector | PG 16 |
| IA Generativa | OpenAI API | GPT-4o |
| Streaming | Server-Sent Events (SSE) | — |
| Armazenamento | MinIO | S3-compatible |
| Infraestrutura | Kubernetes + Docker | — |
| Autenticação | Active Directory (LDAP/OAuth2) | — |
| Migrations | Flyway | — |
| Build Backend | Maven | — |
| Build Frontend | Vite | — |

---

## 3. Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/TS)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Gestão de    │  │  Chat /      │  │  Editor de        │  │
│  │ Demandas     │  │  Entrevista  │  │  Artefatos        │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │   REST + SSE   │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot)                      │
│                                                              │
│  ┌─────────────┐    ┌──────────────────┐   ┌─────────────┐  │
│  │  REST       │    │  AI Orchestration│   │   Export    │  │
│  │  Controllers│───▶│  Service         │   │   Service   │  │
│  └─────────────┘    └────────┬─────────┘   └──────┬──────┘  │
│                              │                    │          │
│  ┌─────────────┐    ┌────────▼─────────┐   ┌──────▼──────┐  │
│  │  JPA        │    │  OpenAI Client   │   │   MinIO     │  │
│  │  Repositories│   │  (HTTP/SSE)      │   │   Client    │  │
│  └──────┬──────┘    └────────┬─────────┘   └─────────────┘  │
└─────────┼────────────────────┼─────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌─────────────────┐
│   PostgreSQL     │  │  OpenAI API     │
│   + pgvector     │  │  (GPT-4o)       │
└──────────────────┘  └─────────────────┘
```

### Comunicação Frontend → Backend

- **Operações normais** (CRUD, consultas): `axios` via REST (`/api/v1/...`)
- **Streaming de IA** (entrevista): `fetch` + `ReadableStream` consumindo SSE (`text/event-stream`)
- **Proxy de desenvolvimento**: Vite (`vite.config.ts`) redireciona `/api` → `localhost:8080`
- **Proxy de produção**: Nginx (`frontend/nginx.conf`) redireciona `/api/` → `http://backend:8080/api/`

---

## 4. Módulos do Sistema

| # | Módulo | Status | Fase |
|---|--------|--------|------|
| 1 | Gestão de Demandas e Projetos | Implementado | MVP |
| 2 | Entrevista Inteligente | Implementado | MVP |
| 3 | Canvas do Projeto | Implementado | MVP |
| 4 | Especificação de Requisitos | Implementado | MVP |
| 5 | Histórias de Usuário e Backlog | Implementado | MVP |
| 6 | Casos de Uso | Planejado | Fase 2 |
| 7 | Modelagem de Processos (BPMN) | Planejado | Fase 2 |
| 8 | Prototipação Assistida | Planejado | Fase 3 |
| 9 | Arquitetura de Solução | Planejado | Fase 3 |
| 10 | Estimativas | Planejado | Fase 3 |
| 11 | Governança / RACI | Planejado | Fase 3 |
| 12 | Conformidade e Qualidade (LGPD/WCAG) | Parcial | MVP/Fase 2 |
| 13 | Base de Conhecimento Institucional (RAG) | Planejado | Fase 2 |
| 14 | Agentes Especializados Multi-agente | Planejado | Fase 4 |

---

## 5. Fluxo Principal de Uso

A sequência padrão de trabalho em uma demanda segue esta cadeia — cada módulo consome os artefatos do anterior:

```
┌──────────────────────────────────────────────────────────────────┐
│  MÓDULO 1 — Gestão de Demandas                                   │
│  Analista cadastra a demanda com título, área, tipo,             │
│  prioridade, prazo, stakeholders e premissas/restrições.         │
└──────────────────────────┬───────────────────────────────────────┘
                           │ demanda_id
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  MÓDULO 2 — Entrevista Inteligente                               │
│  IA conduz entrevista guiada com streaming em tempo real.        │
│  Cada mensagem reenvia o histórico completo para a OpenAI.       │
│  Ao finalizar, consolida em sumário estruturado (JSON).          │
└──────────────────────────┬───────────────────────────────────────┘
                           │ sumário do levantamento
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  MÓDULO 3 — Canvas do Projeto                                    │
│  IA gera canvas em single-shot usando dados da demanda           │
│  + sumário da entrevista. Analista revisa e aprova.              │
└──────────────────────────┬───────────────────────────────────────┘
                           │ canvas aprovado
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  MÓDULO 4 — Especificação de Requisitos                          │
│  IA gera RF, RNF, RN, RI, RS a partir do canvas + sumário.      │
│  Score SMART por requisito. Analista revisa e aprova.            │
└──────────────────────────┬───────────────────────────────────────┘
                           │ requisitos aprovados
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  MÓDULO 5 — Backlog / Histórias de Usuário                       │
│  IA gera Épicos → Features → Histórias de Usuário com            │
│  critérios de aceitação e story points. Score INVEST.            │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
                  Exportação DOCX / PDF
```

---

## 6. Como a IA Funciona — Contexto por Módulo

Esta é a seção mais importante para entender o comportamento do sistema.

---

### 6.1 Módulo 2 — Entrevista Inteligente (conversacional / stateful)

#### Inicialização da entrevista

Ao criar uma entrevista (`POST /api/v1/demandas/{id}/entrevistas`), o backend executa:

```java
// EntrevistaService.iniciar()
String systemPrompt = carregarPrompt("prompts/entrevista-sistema.txt");
String contextoDemanda = """
    Contexto da demanda:
    Título: %s
    Área demandante: %s
    Tipo: %s
    Descrição: %s
    """.formatted(...);

// Salva no banco como mensagem SYSTEM
salvarMensagem(entrevista, RoleMensagem.SYSTEM, systemPrompt + "\n\n" + contextoDemanda);
```

O prompt do sistema define o papel da IA (analista de negócios especializado no TCE-CE) e o contexto da demanda é injetado diretamente.

#### A cada mensagem do usuário

Quando o frontend envia uma mensagem (`POST /api/v1/entrevistas/{id}/mensagens`), o fluxo é:

```
1. Salva a mensagem do usuário no banco (role = USER)
      ↓
2. Busca o histórico COMPLETO do banco ordenado por criado_em ASC
      ↓
3. Monta List<ChatMessage> com TODAS as mensagens (SYSTEM + USER + ASSISTANT)
      ↓
4. Envia para OpenAI /v1/chat/completions com stream: true
      ↓
5. Tokens chegam → enviados ao frontend via SSE (event: token)
      ↓
6. Ao terminar → salva resposta completa no banco (role = ASSISTANT)
                → envia SSE (event: done)
```

#### Crescimento do contexto por iteração

A IA não tem memória própria — o backend reconstrói o contexto a cada chamada:

| Turno | O que é enviado para a OpenAI |
|-------|-------------------------------|
| 1 | `[SYSTEM, USER_1]` |
| 2 | `[SYSTEM, USER_1, ASSISTANT_1, USER_2]` |
| 3 | `[SYSTEM, USER_1, ASSISTANT_1, USER_2, ASSISTANT_2, USER_3]` |
| N | Todo o histórico acumulado |

**Implicação de custo:** uma entrevista com 20 trocas envia ~20 pares de mensagens na última chamada. O consumo de tokens cresce linearmente. O GPT-4o suporta 128k tokens de contexto — entrevistas muito longas podem atingir o limite.

#### Payload enviado para a OpenAI (cada turno)

```json
{
  "model": "gpt-4o",
  "temperature": 0.3,
  "max_tokens": 2000,
  "stream": true,
  "messages": [
    { "role": "system",    "content": "<prompt-sistema> + <contexto-demanda>" },
    { "role": "user",      "content": "primeira pergunta do analista" },
    { "role": "assistant", "content": "resposta da IA no turno 1" },
    { "role": "user",      "content": "segunda pergunta do analista" },
    ...
  ]
}
```

#### Consolidação da entrevista

Ao consolidar (`POST /api/v1/entrevistas/{id}/consolidar`), o fluxo é diferente — **não é conversacional**:

```
1. Monta uma transcrição textual de todas as mensagens (exceto SYSTEM):
      "USUÁRIO: <mensagem1>\n\nANALISTA IA: <resposta1>\n\n..."
      ↓
2. Carrega prompts/entrevista-consolidacao.txt + transcrição
      ↓
3. Envia como ÚNICA mensagem USER (chamada síncrona, sem stream)
      ↓
4. OpenAI retorna JSON estruturado com:
      { contexto, usuariosIdentificados, processoAtual, necessidades,
        regrasNegocio, integracoes, restricoesPremissas,
        informacoesAusentes, suficiencia, avaliacaoSuficiencia }
      ↓
5. Backend parseia o JSON e salva como SumarioLevantamento no banco
```

---

### 6.2 Módulo 3 — Canvas do Projeto (single-shot)

Sem histórico conversacional. Exatamente **2 mensagens** por chamada:

```java
// CanvasService.gerar()
String jsonResposta = openAIClient.chat(List.of(
    ChatMessage.system(promptTemplate),   // prompts/canvas-geracao.txt
    ChatMessage.user(contexto)            // dados montados pelo buildContexto()
));
```

O método `buildContexto()` monta o contexto do usuário com:

```
TÍTULO DA DEMANDA: <titulo>
TIPO: <tipo>
ÁREA DEMANDANTE: <area>
DESCRIÇÃO: <descricao>
PREMISSAS INFORMADAS: <premissas>
RESTRIÇÕES INFORMADAS: <restricoes>
STAKEHOLDERS CADASTRADOS: <nome> (<papel>), ...

--- SUMÁRIO DO LEVANTAMENTO DE REQUISITOS ---   ← incluído se houver entrevista concluída
Contexto: <contexto>
Necessidades: <necessidades>
Usuários: <usuariosIdentificados>
Processo atual: <processoAtual>
Regras de negócio: <regrasNegocio>
Integrações: <integracoes>
Restrições/Premissas: <restricoesPremissas>
```

A OpenAI retorna um JSON com os campos do canvas:
`contexto`, `problema`, `solucaoProposta`, `usuarios`, `funcionalidadesChave`, `restricoes`, `premissas`, `riscos`, `criteriosSucesso`, `integracoes`.

---

### 6.3 Módulos 4 e 5 — Requisitos e Backlog (single-shot)

Mesmo padrão do Canvas: uma chamada síncrona com 2 mensagens.

**Módulo 4 — Requisitos:**
```
[SYSTEM: prompts/requisitos-geracao.txt]
[USER:   dados da demanda + sumário da entrevista + canvas aprovado]
```
A IA devolve uma lista de requisitos categorizados (RF, RNF, RN, RI, RS) em JSON.

**Módulo 5 — Backlog:**
```
[SYSTEM: prompts/backlog-geracao.txt]
[USER:   dados da demanda + requisitos aprovados]
```
A IA devolve a hierarquia `Épicos → Features → Histórias` com critérios de aceitação e story points em JSON.

---

### 6.4 OpenAIClient — Infraestrutura Comum

Todos os módulos usam o mesmo `OpenAIClient`. Ele tem dois modos:

**Streaming (`chatStream`)** — usado na Entrevista:
```
Frontend ──POST──▶ Backend (SseEmitter) ──POST──▶ OpenAI /v1/chat/completions (stream: true)
                        │                              │
                        │◀──── SSE token a token ──────┘
                        │
Frontend ◀──SSE──── Backend (event: token, data: <pedaço do texto>)
                   Backend (event: done,  data: "")
```

**Síncrono (`chat`)** — usado em Canvas, Requisitos, Backlog:
```
Backend ──POST──▶ OpenAI /v1/chat/completions (stream: false)
Backend ◀──────── JSON completo com choices[0].message.content
```

**Retry com backoff exponencial** (apenas chamadas síncronas):
- Tentativas: 3
- Status com retry: 429, 500, 502, 503, 504
- Espera: 1s → 2s → (falha)

**Configuração** (via `application.yml` + `OpenAIProperties`):
```yaml
openai:
  api-key: ${OPENAI_API_KEY}
  base-url: https://api.openai.com
  model: gpt-4o
  temperature: 0.3
  max-tokens: 2000
```

---

## 7. Ciclo de Aprovação de Artefatos

Todo artefato gerado pela IA passa obrigatoriamente por este ciclo antes de ser válido para desenvolvimento:

```
RASCUNHO_IA  ──▶  EM_REVISAO  ──▶  APROVADO  ──▶  PUBLICADO
    │                  │                │               │
  (gerado           (analista        (aprovação       (disponível
  pela IA,          abre para        formal com       para devs
  não válido)       edição)          nome + data)     e QA)
```

Este ciclo é implementado na entidade `StatusAprovacao` (`br.gov.tce.ailer.shared.domain.enums`) e está presente em:
- `canvas_projeto.status_aprovacao` (Módulo 3)
- `requisitos.status` (Módulo 4)
- `epicos.status_aprovacao` (Módulo 5)

A migration `V7__add_ciclo_aprovacao.sql` adicionou as colunas `status_aprovacao`, `aprovado_por` e `aprovado_em` nas tabelas relevantes.

---

## 8. Estrutura de Pacotes (Backend)

```
br.gov.tce.ailer
├── ai/
│   ├── client/
│   │   ├── OpenAIClient.java          # Cliente HTTP para OpenAI (streaming + sync)
│   │   └── ChatMessage.java           # Record: role + content
│   └── config/
│       └── OpenAIProperties.java      # @ConfigurationProperties para openai.*
│
├── config/
│   └── SecurityConfig.java            # Spring Security + usuários in-memory (dev)
│
├── modulo1/                           # Gestão de Demandas
│   ├── controller/DemandaController.java
│   ├── service/DemandaService.java
│   ├── repository/DemandaRepository.java
│   ├── domain/
│   │   ├── Demanda.java
│   │   ├── Stakeholder.java
│   │   ├── HistoricoDemanda.java
│   │   └── enums/StatusDemanda.java
│   └── dto/request|response/
│
├── modulo2/                           # Entrevista Inteligente
│   ├── controller/EntrevistaController.java
│   ├── service/EntrevistaService.java
│   ├── domain/
│   │   ├── Entrevista.java
│   │   ├── MensagemEntrevista.java    # Histórico persistido no banco
│   │   └── SumarioLevantamento.java  # JSON consolidado da entrevista
│   └── ...
│
├── modulo3/                           # Canvas do Projeto
│   ├── controller/CanvasController.java
│   ├── service/CanvasService.java
│   ├── domain/CanvasProjeto.java
│   └── ...
│
├── modulo4/                           # Especificação de Requisitos
│   ├── controller/RequisitoController.java
│   ├── service/RequisitoService.java
│   ├── domain/Requisito.java
│   └── ...
│
├── modulo5/                           # Backlog / Histórias de Usuário
│   ├── controller/BacklogController.java
│   ├── service/BacklogService.java
│   ├── domain/
│   │   ├── Epico.java
│   │   ├── Feature.java
│   │   └── HistoriaUsuario.java
│   └── ...
│
├── exportacao/                        # Exportação DOCX/PDF
│
└── shared/
    ├── domain/
    │   ├── BaseEntity.java            # id, criadoEm, atualizadoEm
    │   └── enums/StatusAprovacao.java # RASCUNHO_IA → EM_REVISAO → APROVADO → PUBLICADO
    ├── exception/
    │   ├── BusinessException.java
    │   └── RecursoNaoEncontradoException.java
    ├── handler/GlobalExceptionHandler.java
    └── dto/ErroResponse.java
```

---

## 9. Banco de Dados e Migrações

O banco usa **PostgreSQL 16 + pgvector** (para busca semântica no Módulo 13 futuro).

As migrações são gerenciadas pelo **Flyway** e ficam em `backend/src/main/resources/db/migration/`:

| Arquivo | Conteúdo |
|---------|----------|
| `V1__init_modulo1_demandas.sql` | Tabelas `demandas`, `stakeholders`, `historico_demandas` |
| `V2__init_modulo2_entrevistas.sql` | Tabelas `entrevistas`, `mensagens_entrevista`, `sumarios_levantamento` |
| `V3__init_modulo3_canvas.sql` | Tabela `canvas_projeto` |
| `V4__enable_pgvector.sql` | Habilita extensão `pgvector` |
| `V5__init_modulo4_requisitos.sql` | Tabela `requisitos` |
| `V6__init_modulo5_backlog.sql` | Tabelas `epicos`, `features`, `historias_usuario` |
| `V7__add_ciclo_aprovacao.sql` | Adiciona `status_aprovacao`, `aprovado_por`, `aprovado_em` em canvas, requisitos e épicos |

**Importante:** `ddl-auto: validate` — o Hibernate **não cria nem altera tabelas automaticamente**. Toda mudança de schema deve ser feita via migration Flyway. Se houver divergência entre entidade Java e schema do banco, o backend falha na inicialização.

---

## 10. Segurança e Autenticação

### Ambiente de Desenvolvimento (`@Profile("dev")`)

`SecurityConfig.java` ativa apenas no perfil `dev` e cria dois usuários in-memory:

| Usuário | Senha | Role |
|---------|-------|------|
| `analista` | `ailer@dev` | `ANALISTA` |
| `admin` | `ailer@dev` | `ADMIN`, `ANALISTA` |

O frontend envia `Authorization: Basic <base64(analista:ailer@dev)>` em todas as requisições.

### Produção

Integração com **Active Directory** via LDAP/OAuth2 (planejado). RBAC por perfil com granularidade por módulo e ação.

---

## 11. Como Executar

### Opção A — Docker Compose (recomendado)

Sobe PostgreSQL + Backend + Frontend em containers:

```bash
# Na raiz do projeto
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

Para parar:
```bash
docker-compose down
```

Para recriar tudo do zero (inclusive banco):
```bash
docker-compose down -v
docker-compose up --build
```

### Opção B — Desenvolvimento local (hot reload)

**1. Sobe apenas o PostgreSQL via Docker:**
```bash
docker-compose up -d postgres
```

**2. Inicia o backend (com hot reload):**
```bash
cd backend
./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"
```

**3. Inicia o frontend (com hot reload):**
```bash
cd frontend
npm install
npm run dev
```

- Frontend (Vite dev server): http://localhost:5173
- Backend: http://localhost:8080
- O Vite faz proxy automático de `/api` → `localhost:8080`

---

## 12. Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OPENAI_API_KEY` | Chave da API OpenAI (**obrigatória**) | — |
| `DB_USERNAME` | Usuário do PostgreSQL | `postgres` |
| `DB_PASSWORD` | Senha do PostgreSQL | `postgres` |
| `SPRING_PROFILES_ACTIVE` | Perfil Spring (`dev`, `test`, `prod`) | — |

Para desenvolvimento local, crie um arquivo `.env` na raiz:

```env
OPENAI_API_KEY=sk-...
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

O `docker-compose.yml` lê automaticamente o `.env` da raiz.

**Nunca commite o arquivo `.env` ou qualquer chave de API.**

---

## 13. Roadmap de Fases

| Fase | Módulos | Status |
|------|---------|--------|
| **MVP (Fase 1)** | 1, 2, 3, 4, 5 + Ciclo de Aprovação + Exportação DOCX/PDF | Em desenvolvimento |
| **Fase 2** | 13 (RAG Institucional), 6 (Casos de Uso), 7 (BPMN), 12 (Conformidade completa), Integração GitLab | Planejado |
| **Fase 3** | 9 (Arquitetura), 10 (Estimativas), 11 (Governança), 8 (Prototipação) | Planejado |
| **Fase 4** | 14 (Agentes Multi-agente), análise de impacto automatizada | Planejado |

O **Módulo 13 (RAG)** é o principal diferencial da plataforma — permite que a IA aprenda com projetos anteriores do TCE-CE em vez de usar apenas conhecimento genérico. Sua antecipação para a Fase 2 é estratégica.

---

## 14. Git Workflow

```
main                  # branch principal — nunca commitar diretamente
feat/modulo-X-desc    # features novas
fix/descricao-bug     # correções
```

**Padrão de commits (Conventional Commits em pt-BR):**

```
feat(modulo2): adiciona indicador de suficiência da entrevista
fix(modulo1): corrige paginação na listagem de demandas
refactor(canvas): extrai buildContexto para método separado
docs: atualiza README com fluxo de aprovação
test(modulo4): adiciona testes de integração para RequisitoService
chore: atualiza dependências do pom.xml
```

**PRs:**
- Sempre abrir PR da branch de feature para `main`
- Descrição obrigatória: o quê e por quê
- Nunca `git push --force` sem confirmação explícita

---

## Referências Internas

- `escopo.md` — Documento de escopo completo com todos os módulos e requisitos
- `context/architecture.md` — Diagrama de componentes e decisões arquiteturais
- `context/decisions/ADR-001-stack-tecnica.md` — Justificativa da stack escolhida
- `context/decisions/ADR-002-ia-provider.md` — Justificativa do provedor de IA (OpenAI)
- `backend/src/main/resources/prompts/` — Todos os prompts do sistema

---

*AILER — TCE-CE / D2S2 / STI*