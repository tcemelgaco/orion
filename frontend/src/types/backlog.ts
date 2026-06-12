export type StatusBacklog = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
export type StatusHistoria = 'BACKLOG' | 'PRONTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'
export type PrioridadeBacklog = 'ALTA' | 'MEDIA' | 'BAIXA'
export type StatusAprovacao = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface HistoriaUsuario {
  id: string
  featureId: string
  demandaId: string
  codigo: string
  comoPapel: string
  queroAcao: string
  paraBeneficio: string | null
  criteriosAceitacao: string | null
  storyPoints: number | null
  prioridade: PrioridadeBacklog
  status: StatusHistoria
  fonte: 'MANUAL' | 'IA'
  ordemExibicao: number
  investScore: number | null
  investDetalhes: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface Feature {
  id: string
  epicoId: string
  demandaId: string
  codigo: string
  titulo: string
  descricao: string | null
  status: StatusBacklog
  prioridade: PrioridadeBacklog
  fonte: 'MANUAL' | 'IA'
  ordemExibicao: number
  historias: HistoriaUsuario[]
  criadoEm: string
  atualizadoEm: string
}

export interface Epico {
  id: string
  demandaId: string
  codigo: string
  titulo: string
  descricao: string | null
  status: StatusBacklog
  prioridade: PrioridadeBacklog
  fonte: 'MANUAL' | 'IA'
  ordemExibicao: number
  features: Feature[]
  statusAprovacao: StatusAprovacao
  aprovadoPor: string | null
  aprovadoEm: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface AtualizarHistoriaPayload {
  comoPapel?: string
  queroAcao?: string
  paraBeneficio?: string
  criteriosAceitacao?: string
  storyPoints?: number
  prioridade?: PrioridadeBacklog
  status?: StatusHistoria
}
