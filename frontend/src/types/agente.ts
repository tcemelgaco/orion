export type TipoAgente =
  | 'ANALISTA_NEGOCIO'
  | 'ANALISTA_REQUISITOS'
  | 'PRODUCT_OWNER'
  | 'AGENTE_QA'
  | 'ARQUITETO'
  | 'AGENTE_GOVERNANCA'
  | 'ESTIMADOR'

export interface AgenteSessao {
  id: string
  demandaId: string
  tipoAgente: TipoAgente
  displayName: string
  titulo: string
  criadoEm: string
  atualizadoEm: string
}

export interface AgenteMensagem {
  id: string
  papel: 'AGENTE' | 'USUARIO'
  conteudo: string
  criadoEm: string
}

export const AGENTES_CONFIG: Record<TipoAgente, { label: string; descricao: string; cor: string }> = {
  ANALISTA_NEGOCIO:    { label: 'Analista de Negócio',    descricao: 'Elicitação, stakeholders e mapeamento de processos',     cor: 'blue' },
  ANALISTA_REQUISITOS: { label: 'Analista de Requisitos',  descricao: 'Especificação SMART: RF, RNF, RN, RI, RS',              cor: 'indigo' },
  PRODUCT_OWNER:       { label: 'Product Owner',           descricao: 'Backlog, épicos, histórias e priorização',              cor: 'violet' },
  AGENTE_QA:           { label: 'Agente QA',               descricao: 'Estratégia de testes e critérios de aceitação',         cor: 'emerald' },
  ARQUITETO:           { label: 'Arquiteto de Solução',    descricao: 'Decisões técnicas, ADRs e padrões arquiteturais',       cor: 'slate' },
  AGENTE_GOVERNANCA:   { label: 'Agente de Governança',    descricao: 'LGPD, RACI, riscos e conformidade',                    cor: 'amber' },
  ESTIMADOR:           { label: 'Estimador de Esforço',    descricao: 'Story points, horas, prazo e recursos',                cor: 'rose' },
}
