# DOCUMENTO DE ESCOPO DO PROJETO

# PLATAFORMA CORPORATIVA DE ENGENHARIA DE REQUISITOS ASSISTIDA POR INTELIGÊNCIA ARTIFICIAL

## 1. IDENTIFICAÇÃO

**Nome do Projeto:** Plataforma Corporativa de Engenharia de Requisitos Assistida por Inteligência Artificial

**Nome Interno:** AILER – Assistente Inteligente de Levantamento e Especificação de Requisitos

**Área Responsável:** Diretoria de Desenvolvimento e Sustentação de Sistemas (D2S2)

**Patrocinador:** Secretaria de Tecnologia da Informação – STI

**Versão:** 3.0

**Classificação:** Projeto Estratégico de Transformação Digital da STI

---

## 2. VISÃO GERAL

A AILER é uma plataforma corporativa de Engenharia de Requisitos que utiliza Inteligência Artificial Generativa e Base de Conhecimento Institucional para acelerar e qualificar o processo de descoberta, análise, especificação e planejamento de soluções tecnológicas demandadas ao TCE-CE.

O diferencial central da plataforma não é apenas a geração de texto por IA — é a combinação de IA com o **conhecimento acumulado dos sistemas já desenvolvidos pelo TCE-CE**, tornando cada novo projeto beneficiário da experiência institucional anterior. Sem essa base de conhecimento, a plataforma seria equivalente ao uso direto de um modelo LLM genérico.

A solução atua como um assistente especializado que guia analistas e gestores por todo o ciclo de levantamento, desde a entrevista inicial até a aprovação formal dos artefatos, garantindo rastreabilidade, consistência terminológica e qualidade mensurável dos requisitos produzidos.

**Princípio fundamental:** Todo artefato gerado por IA deve ser revisado, validado e aprovado formalmente por um analista antes de ter validade para o desenvolvimento. A IA acelera e sugere — o analista decide e assina.

---

## 3. JUSTIFICATIVA

O processo atual de levantamento de requisitos no TCE-CE depende fortemente de analistas especializados, gerando gargalos que impactam:

- Tempo de resposta às demandas (média de semanas para especificação inicial)
- Capacidade operacional da STI frente ao volume crescente de demandas
- Qualidade e padronização das especificações produzidas
- Perda de conhecimento quando analistas experientes saem ou mudam de área
- Inconsistência entre projetos similares que repetem os mesmos requisitos com variações terminológicas
- Retrabalho no desenvolvimento causado por requisitos ambíguos ou incompletos

A adoção de IA com base de conhecimento institucional permitirá reduzir o tempo de especificação, elevar a qualidade dos artefatos e democratizar o processo — permitindo que analistas com menor experiência produzam especificações de nível senior com apoio do sistema.

---

## 4. OBJETIVOS

### Objetivo Geral

Reduzir em até 60% o tempo de levantamento e especificação de requisitos, elevando a qualidade e rastreabilidade dos artefatos produzidos pela STI, por meio de uma plataforma assistida por IA com base de conhecimento institucional.

### Objetivos Específicos

- Reduzir o tempo médio de especificação de requisitos de semanas para dias
- Garantir que 100% dos requisitos produzidos sejam rastreáveis à sua origem (entrevista, documento, analista)
- Eliminar ambiguidades detectáveis automaticamente antes da aprovação
- Reaproveitar padrões de requisitos de projetos anteriores do TCE-CE
- Padronizar os artefatos produzidos pela STI com vocabulário controlado
- Assegurar que artefatos gerados por IA tenham aprovação formal documentada antes do uso no desenvolvimento
- Garantir conformidade LGPD e acessibilidade WCAG nos requisitos desde a especificação

---

## 5. ESCOPO FUNCIONAL

---

### Módulo 1 – Gestão de Demandas e Projetos

#### Funcionalidades

- Cadastro e gestão de demandas
- Cadastro de projetos com tipologia (novo sistema, melhoria, integração, modernização, corretiva)
- Gestão de stakeholders com papéis e responsabilidades
- Classificação e priorização de demandas
- Controle de versões dos artefatos
- Histórico completo de alterações com autoria
- Registro de premissas, restrições e riscos
- Painel de acompanhamento do status dos artefatos por módulo
- Indicador de completude do projeto (% de módulos concluídos e aprovados)

#### Ciclo de Vida dos Artefatos (transversal a todos os módulos)

Todo artefato gerado ou editado no AILER segue o seguinte ciclo obrigatório:

```
RASCUNHO_IA → EM_REVISÃO → APROVADO → PUBLICADO
```

- **RASCUNHO_IA**: gerado automaticamente pela IA, não válido para uso no desenvolvimento
- **EM_REVISÃO**: analista abre para revisão, pode editar livremente
- **APROVADO**: analista ou supervisor registra aprovação formal (nome, matrícula, data/hora)
- **PUBLICADO**: disponível para consumo pelas equipes de desenvolvimento e QA

A trilha de auditoria deve registrar: quem gerou, com qual contexto, qual versão do modelo, quem aprovou, quando aprovaram, e quais alterações manuais foram feitas em relação à versão gerada pela IA.

---

### Módulo 2 – Entrevista Inteligente Assistida por IA

#### Funcionalidades

- Assistente conversacional com streaming em tempo real
- Condução guiada de entrevistas estruturadas por tipo de projeto
- Geração automática de perguntas contextuais e complementares
- **Identificação ativa de gaps**: ao detectar tema não abordado, o assistente sugere perguntas de follow-up
- **Indicador de suficiência da entrevista**: percentual de cobertura de tópicos essenciais por tipo de projeto (autenticação, integrações, regras de negócio, perfis de usuário, volumes, SLAs)
- **Gate de avanço**: o sistema alerta quando a entrevista está abaixo do threshold de suficiência antes de liberar a geração de requisitos
- Identificação e extração automática de: entidades de negócio, processos, regras, integrações, perfis de usuário, restrições
- Consolidação automática do levantamento em sumário estruturado
- Registro de incertezas e pontos a confirmar

#### Fontes de Entrada Complementares

- **Importação de documentos**: upload de atas de reunião, editais, contratos, e-mails, documentos Word/PDF — o sistema extrai requisitos candidatos automaticamente
- **Entrevista assíncrona**: geração de formulário estruturado para o gestor responder sem presença do analista
- **Transcrição de reunião**: upload de transcrição de texto para extração automática de informações

#### Técnicas de Elicitação Suportadas

- Entrevista guiada (modo principal)
- Análise de documentos existentes
- Questionário estruturado assíncrono
- Extração a partir de sistemas similares (via RAG — Módulo 13)

---

### Módulo 3 – Canvas do Projeto

#### Geração automática de:

- Contexto e situação atual
- Problema central e seus impactos
- Solução proposta
- Objetivos mensuráveis
- Benefícios esperados (quantificados quando possível)
- Stakeholders e seus interesses
- Premissas e restrições
- Dependências externas
- Riscos principais
- Indicadores de sucesso (KPIs)

#### Diferencial

- Geração baseada em projetos similares do TCE-CE (via RAG) para sugestão de indicadores e riscos recorrentes
- Edição manual completa com versionamento
- Ciclo de aprovação formal conforme descrito no Módulo 1

---

### Módulo 4 – Especificação de Requisitos

#### Tipos de Requisitos Gerados

- **RF** – Requisitos Funcionais
- **RNF** – Requisitos Não Funcionais (performance, disponibilidade, usabilidade, segurança)
- **RN** – Regras de Negócio
- **RI** – Requisitos de Integração
- **RS** – Requisitos de Segurança e Conformidade

#### Geração e Estrutura

- Geração automática a partir do sumário da entrevista e do canvas aprovado
- Cada requisito contém: código único, título, descrição, critério de aceitação, rastreabilidade de origem, prioridade, status, responsável

#### Qualidade Automática dos Requisitos

- **Score SMART por requisito**: avaliação automática de Específico, Mensurável, Alcançável, Relevante, Temporal — requisitos com score baixo são sinalizados para revisão
- **Detecção de ambiguidades**: termos vagos como "rápido", "fácil", "muitos", "adequado" são destacados com sugestão de melhoria
- **Detecção de requisitos compostos**: requisitos que contêm múltiplas funcionalidades são sinalizados para divisão
- **Detecção de conflitos**: análise semântica identifica requisitos contraditórios ou sobrepostos
- **Detecção de duplicatas**: similaridade semântica detecta requisitos equivalentes descritos de forma diferente
- **Checklist de cobertura**: verificação automática se os domínios essenciais foram cobertos (autenticação, autorização, auditoria, tratamento de erros, backup, LGPD, acessibilidade)

#### Rastreabilidade

- Cada requisito é vinculado à entrevista/documento de origem
- Rastreabilidade bidirecional: RF → origem → histórias de usuário → casos de uso → cenários de teste
- Grafo de dependências entre requisitos
- Análise de impacto: ao alterar um requisito, o sistema indica todos os artefatos afetados

#### Versionamento

- Histórico completo de versões de cada requisito
- Comparação visual entre versões
- Possibilidade de reverter para versão anterior

---

### Módulo 5 – Histórias de Usuário e Backlog

#### Geração automática de:

- Épicos com descrição e objetivos
- Features agrupadas por épico
- Histórias de Usuário no formato "Como [papel], quero [ação], para [benefício]"
- Critérios de Aceitação testáveis e mensuráveis
- Tarefas técnicas sugeridas
- Story Points estimados (Fibonacci)
- Backlog priorizado inicial

#### Qualidade Automática

- **Score INVEST por história**: avaliação de Independente, Negociável, Valiosa, Estimável, Small, Testável
- Histórias com score baixo são sinalizadas automaticamente
- Verificação de critérios de aceitação testáveis (detecção de linguagem vaga)

#### Rastreabilidade

- Cada história vinculada ao(s) requisito(s) de origem
- Detecção de requisitos funcionais sem histórias correspondentes ("requisitos órfãos")

#### Exportação

- GitLab Issues/Milestones
- Jira
- Taiga
- CSV/Planilha
- DOCX/PDF

---

### Módulo 6 – Casos de Uso

#### Geração automática de:

- Diagrama de casos de uso (textual/Mermaid)
- Descrição de atores
- Fluxo principal detalhado
- Fluxos alternativos
- Fluxos de exceção
- Pré e pós-condições
- Rastreabilidade para os requisitos funcionais de origem

---

### Módulo 7 – Modelagem de Processos

#### Geração automática de:

- Fluxograma textual
- BPMN simplificado (notação textual)
- Código Mermaid para renderização
- Fluxo AS-IS (processo atual, se informado)
- Fluxo TO-BE (processo proposto)
- Identificação de decisões, integrações e pontos de controle

---

### Módulo 8 – Prototipação Assistida

#### Geração automática de:

- Mapa de navegação do sistema
- Lista de telas com descrição funcional
- Wireframe textual por tela
- Componentes de interface sugeridos
- Fluxos de navegação entre telas
- Anotações de acessibilidade e UX por componente

---

### Módulo 9 – Arquitetura de Solução

#### Geração automática de:

- Visão arquitetural recomendada (monolito, microsserviços, serverless)
- Componentes principais da solução
- Integrações necessárias com sistemas externos
- APIs envolvidas (REST, SOAP, mensageria)
- Modelo de dados conceitual sugerido
- Necessidade de cache, mensageria, autenticação, armazenamento
- Decisões arquiteturais justificadas (ADRs preliminares)
- Recomendações baseadas em projetos similares do TCE-CE (via RAG)

---

### Módulo 10 – Estimativas

#### Geração automática de:

- Story Points por história (Fibonacci)
- Complexidade técnica por funcionalidade
- Horas estimadas por perfil (analista, desenvolvedor, QA, UX)
- Prazo estimado por sprint/fase
- Quantidade sugerida de recursos por perfil
- Matriz de esforço por módulo
- Comparação com projetos similares do TCE-CE (via RAG): "Projetos similares levaram em média X sprints"

---

### Módulo 11 – Governança

#### Geração automática de:

- Matriz RACI por fase do projeto
- Mapeamento completo de stakeholders
- Dependências externas com impacto estimado
- Premissas e restrições documentadas
- Registro e classificação de riscos (probabilidade × impacto)
- Plano de mitigação preliminar de riscos

---

### Módulo 12 – Conformidade e Qualidade

#### Análise de Segurança

- Verificação de requisitos de auditoria e rastreabilidade de ações
- Verificação de requisitos de controle de acesso e segregação de funções
- Detecção de ausência de requisitos de segurança para funcionalidades críticas

#### Análise LGPD

- Identificação automática de dados pessoais nos requisitos
- Identificação de dados sensíveis (saúde, financeiros, biométricos)
- Verificação de base legal para cada tratamento identificado
- Verificação de requisitos de consentimento, retenção e exclusão
- **Alerta de envio para IA**: quando dados pessoais ou sensíveis são detectados no contexto enviado à OpenAI, o sistema registra e alerta

#### Análise de Acessibilidade

- Verificação de requisitos mínimos WCAG 2.1 AA
- Identificação de componentes de interface sem requisitos de acessibilidade

#### Qualidade de Requisitos

- Score SMART consolidado por projeto
- Score INVEST consolidado para histórias
- Relatório de ambiguidades pendentes de resolução
- Relatório de conflitos não resolvidos
- Relatório de requisitos órfãos (sem rastreabilidade bidirecional completa)
- Indicador de cobertura funcional (domínios essenciais cobertos vs. total)
- Relatório de requisitos sem critério de aceitação definido

#### Glossário e Consistência Terminológica

- Manutenção de glossário controlado de termos do domínio
- Detecção automática de sinônimos entre módulos (mesmo conceito, nomes diferentes)
- Sugestão de padronização terminológica
- Verificação de consistência do glossário entre todos os artefatos do projeto

---

### Módulo 13 – Base de Conhecimento Institucional (RAG)

> **Posicionamento revisado:** Este módulo é o principal diferencial da plataforma em relação ao uso direto de LLMs genéricos. Sua antecipação para a Fase 2 é estratégica — sem ele, o AILER não entrega o valor diferencial proposto.

#### Funcionalidades

- Indexação semântica de projetos anteriores do TCE-CE (requisitos, histórias, casos de uso, arquiteturas)
- Busca semântica sobre a base institucional
- **Sugestão contextual**: ao iniciar um novo projeto, o sistema identifica projetos similares e sugere requisitos, integrações e padrões reutilizáveis
- **Comparação quantitativa**: "Projetos de [tipo] similares tiveram em média X requisitos funcionais. Este projeto tem Y. Áreas possivelmente não cobertas: [lista]"
- **Identificação de padrões recorrentes**: requisitos que aparecem em 80%+ dos projetos de um determinado tipo são sugeridos automaticamente
- Reaproveitamento de: requisitos, integrações, regras de negócio, fluxos, arquiteturas, estimativas
- Consulta semântica livre pelo analista

#### Projetos-base para Indexação Inicial

- Comunicação de Irregularidades
- eContas
- SRP (Sistema de Recursos e Processos)
- Portal do Cidadão
- Ouvidoria
- DOE (Diário Oficial Eletrônico)
- Integração GOV.BR
- Peticionamento Eletrônico
- Sistemas de Fiscalização
- Demais sistemas corporativos da STI

#### Governança da Base

- Curadoria humana obrigatória antes da indexação de um projeto
- Controle de versão da base de conhecimento
- Mecanismo de deprecação de padrões obsoletos

---

### Módulo 14 – Agentes Especializados de IA

Agentes com papéis, prompts e contextos especializados que atuam de forma coordenada:

| Agente | Responsabilidade |
|--------|-----------------|
| **Analista de Negócio** | Condução das entrevistas, identificação de gaps, perguntas de follow-up |
| **Analista de Requisitos** | Geração, classificação e qualificação de requisitos |
| **Product Owner** | Geração de backlog, épicos, features, histórias e priorização |
| **Arquiteto de Solução** | Definição de arquitetura, decisões técnicas, integrações |
| **Agente QA** | Geração de cenários de teste, critérios de aceitação, análise de testabilidade |
| **Agente de Qualidade** | Análise SMART/INVEST, detecção de conflitos, verificação de completude |
| **Agente de Conformidade** | Análise LGPD, segurança, acessibilidade WCAG |
| **Agente Estimador** | Estimativas de esforço, story points, comparação histórica |

---

## 6. PERFIS DE USUÁRIO

| Perfil | Responsabilidades | Capacidades no Sistema |
|--------|-------------------|------------------------|
| **Administrador** | Gestão da plataforma, curadoria da base de conhecimento | Acesso total, configuração de IA, gestão de usuários |
| **Analista de Sistemas** | Condução do levantamento, revisão e aprovação de artefatos | Criar/editar/aprovar todos os artefatos |
| **Supervisor / Coordenador** | Aprovação formal de artefatos de alto impacto | Aprovar e publicar artefatos para desenvolvimento |
| **Gestor Demandante** | Fornecimento de informações nas entrevistas, validação do canvas | Participar de entrevistas, visualizar e comentar artefatos |
| **Desenvolvedor** | Consumo dos artefatos especificados | Consulta somente leitura de artefatos aprovados |
| **UX Designer** | Validação de protótipos e fluxos | Consulta e comentário em protótipos |
| **QA** | Consumo de requisitos e critérios de aceitação | Consulta de requisitos e cenários de teste |

---

## 7. REQUISITOS NÃO FUNCIONAIS

### Segurança e Conformidade

- Integração com Active Directory (LDAP/OAuth2) para autenticação corporativa
- Controle de acesso baseado em perfil (RBAC) com granularidade por módulo e ação
- Auditoria completa de todas as ações dos usuários
- Criptografia em trânsito (TLS 1.3) e em repouso (dados sensíveis)
- **Acordo de Processamento de Dados (DPA) com a OpenAI**: obrigatório antes do go-live em produção — dados de projetos do TCE-CE podem conter informações de fiscalização, irregularidades e dados de jurisdicionados; o envio para APIs externas requer instrumento jurídico formal
- **Anonimização opcional**: para projetos com dados sensíveis, o sistema deve suportar substituição de identificadores antes do envio à IA
- Registro da origem IA de cada artefato na trilha de auditoria (modelo utilizado, data, contexto enviado)

### Qualidade e Rastreabilidade

- Rastreabilidade bidirecional completa entre todos os artefatos
- Versionamento de todos os artefatos com histórico de alterações
- Registro de aprovações formais (quem, quando, o quê)
- Indicadores de qualidade dos requisitos (SMART, INVEST) calculados automaticamente

### Performance

- Tempo de resposta para operações síncronas inferior a 3 segundos
- Streaming de respostas de IA com primeiro token em menos de 2 segundos
- Suporte a operações de RAG com resposta em menos de 5 segundos

### Disponibilidade

- Disponibilidade mínima de 99% em horário comercial
- Degradação graciosa: se a API de IA estiver indisponível, o sistema mantém funcionalidades de edição e consulta

### Escalabilidade

- Execução em Kubernetes com auto-scaling
- Suporte a múltiplos projetos simultâneos por analista

---

## 8. ARQUITETURA TECNOLÓGICA

| Camada | Tecnologia | Observação |
|--------|-----------|-----------|
| Frontend | React + TypeScript + Tailwind CSS | SPA responsiva |
| Backend | Spring Boot 3.x (Java 21+) | REST API + streaming SSE |
| Banco de Dados | PostgreSQL + pgvector | Dados relacionais + embeddings semânticos |
| IA Generativa | OpenAI API (GPT-4o) | Requer DPA antes do go-live |
| IA — Alternativa Futura | Modelo self-hosted (Llama/Mistral) | Para dados sensíveis sem DPA |
| Busca Semântica | pgvector + embeddings | Núcleo do Módulo 13 (RAG) |
| Armazenamento de Arquivos | MinIO | Upload de documentos para elicitação |
| Infraestrutura | Kubernetes | Orquestração de containers |
| Autenticação | Active Directory (LDAP/OAuth2) | SSO corporativo |
| Integração de IA no Backend | Spring AI (avaliação recomendada) | Alternativa ao cliente HTTP manual para gestão de prompts, RAG e structured output |

---

## 9. BENEFÍCIOS ESPERADOS

| Benefício | Métrica | Baseline Atual |
|-----------|---------|----------------|
| Redução do tempo de especificação | -60% no tempo médio | Semanas → dias |
| Redução de retrabalho por requisitos ambíguos | -40% de tickets de dúvida durante o desenvolvimento | A medir |
| Cobertura de domínios essenciais | 100% dos projetos com checklist de conformidade | Não sistemático |
| Rastreabilidade | 100% dos requisitos com origem registrada | Não rastreável atualmente |
| Reaproveitamento institucional | ≥30% de requisitos sugeridos a partir de projetos anteriores | Zero |
| Padronização | 100% dos projetos com artefatos no padrão STI | Inconsistente |
| Aprovação formal | 100% dos artefatos com aprovação registrada | Manual/informal |

---

## 10. ROADMAP REVISADO

### Fase 1 – MVP (em desenvolvimento)

- Módulo 1 – Gestão de Demandas
- Módulo 2 – Entrevista Inteligente (com indicador de suficiência e importação de documentos)
- Módulo 3 – Canvas
- Módulo 4 – Especificação de Requisitos (com score SMART e detecção de conflitos)
- Módulo 5 – Histórias de Usuário e Backlog (com score INVEST)
- Ciclo de Aprovação Formal (transversal — RASCUNHO_IA → APROVADO)
- Glossário e Consistência Terminológica (Módulo 12 parcial)
- Exportação DOCX/PDF

### Fase 2 – Conhecimento Institucional + Qualidade

> **Prioridade estratégica**: o Módulo 13 (RAG) é antecipado para esta fase por ser o principal diferencial da plataforma.

- **Módulo 13 – Base de Conhecimento Institucional (RAG)** ← antecipado da Fase 3
- Módulo 6 – Casos de Uso
- Módulo 7 – Modelagem de Processos (BPMN/Mermaid)
- Módulo 12 – Conformidade e Qualidade (completo: LGPD, SMART, cobertura)
- Integração GitLab
- DPA com OpenAI formalizado (pré-requisito para esta fase em produção)

### Fase 3 – Arquitetura e Planejamento

- Módulo 9 – Arquitetura de Solução
- Módulo 10 – Estimativas (com comparação histórica via RAG)
- Módulo 11 – Governança
- Módulo 8 – Prototipação Assistida

### Fase 4 – Automação Avançada

- Módulo 14 – Agentes Especializados (orquestração multi-agente)
- Análise de impacto de mudança automatizada
- Sugestão proativa de requisitos baseada em padrões institucionais
- Avaliação de opção por modelo self-hosted para dados sensíveis

---

## 11. CRITÉRIOS DE QUALIDADE DOS ARTEFATOS

Para que um artefato seja considerado aprovado e válido para uso no desenvolvimento, deve atender:

### Requisitos Funcionais
- Score SMART ≥ 70%
- Critério de aceitação definido e testável
- Rastreado à origem (entrevista ou documento)
- Sem conflito não resolvido com outros requisitos
- Aprovação registrada por analista responsável

### Histórias de Usuário
- Score INVEST ≥ 70%
- Formato "Como [papel], quero [ação], para [benefício]" completo
- Mínimo 2 critérios de aceitação testáveis
- Rastreada ao requisito funcional de origem

### Entrevistas
- Indicador de suficiência ≥ 80% antes de liberar geração de artefatos
- Todos os tópicos essenciais cobertos ou explicitamente marcados como "não aplicável"

---

## 12. RISCOS E MITIGAÇÕES

| Risco | Classificação | Mitigação |
|-------|--------------|-----------|
| Envio de dados sensíveis à OpenAI sem DPA | **Crítico — Bloqueador de Go-Live** | Formalizar DPA antes da produção; implementar anonimização para projetos sensíveis |
| Artefatos gerados por IA usados sem revisão | **Crítico** | Ciclo de aprovação obrigatório; bloquear exportação de artefatos em RASCUNHO_IA |
| RAG adiado enfraquece o diferencial | **Alto** | Antecipar Módulo 13 para Fase 2 |
| Analistas aceitando requisitos ambíguos | **Alto** | Score SMART/INVEST obrigatório; gate de qualidade antes da aprovação |
| Alucinação da IA em contextos específicos do TCE-CE | **Alto** | RAG com base institucional reduz o risco; revisão humana obrigatória |
| Resistência à adoção por analistas experientes | **Médio** | Modo de edição livre sem obrigatoriedade de usar sugestões da IA |
| Inconsistência terminológica entre projetos | **Médio** | Glossário controlado centralizado com verificação automática |
| Deriva de modelo (comportamento muda entre versões da OpenAI API) | **Médio** | Versionar o model ID nas configurações; testes de regressão de prompts |
