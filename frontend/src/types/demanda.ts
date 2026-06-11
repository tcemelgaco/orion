export type StatusDemanda =
  | 'RASCUNHO'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'EM_DESENVOLVIMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA'

export type PrioridadeDemanda = 'ALTA' | 'MEDIA' | 'BAIXA'

export type TipoDemanda =
  | 'NOVO_SISTEMA'
  | 'MELHORIA'
  | 'CORRETIVA'
  | 'INTEGRACAO'
  | 'MODERNIZACAO'

export type PapelStakeholder =
  | 'PATROCINADOR'
  | 'GESTOR_DEMANDANTE'
  | 'USUARIO_FINAL'
  | 'ANALISTA_STI'
  | 'DESENVOLVEDOR'
  | 'QA'
  | 'OUTRO'

export interface Stakeholder {
  id: string
  nome: string
  matricula?: string
  area?: string
  papel: PapelStakeholder
  contato?: string
}

export interface HistoricoItem {
  id: string
  acao: string
  descricaoAlteracao: string
  statusAnterior?: string
  statusNovo?: string
  alteradoPor: string
  alteradoEm: string
}

export interface DemandaDetail {
  id: string
  titulo: string
  descricao?: string
  areaDemandante: string
  status: StatusDemanda
  prioridade: PrioridadeDemanda
  tipo: TipoDemanda
  prazoEstimado?: string
  matriculaSolicitante: string
  nomeSolicitante?: string
  premissas?: string
  restricoes?: string
  observacoes?: string
  versao: number
  criadoEm: string
  atualizadoEm: string
  criadoPor?: string
  stakeholders: Stakeholder[]
}

export interface DemandaSummary {
  id: string
  titulo: string
  areaDemandante: string
  status: StatusDemanda
  prioridade: PrioridadeDemanda
  tipo: TipoDemanda
  prazoEstimado?: string
  nomeSolicitante?: string
  criadoEm: string
  totalStakeholders: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CriarDemandaPayload {
  titulo: string
  descricao?: string
  areaDemandante: string
  tipo: TipoDemanda
  prioridade?: PrioridadeDemanda
  prazoEstimado?: string
  matriculaSolicitante: string
  nomeSolicitante?: string
  premissas?: string
  restricoes?: string
  observacoes?: string
}

export interface AdicionarStakeholderPayload {
  nome: string
  matricula?: string
  area?: string
  papel: PapelStakeholder
  contato?: string
}
