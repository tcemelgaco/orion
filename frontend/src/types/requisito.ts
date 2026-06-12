export type TipoRequisito = 'RF' | 'RNF' | 'RN' | 'RI' | 'RS'
export type StatusRequisito = 'RASCUNHO' | 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO' | 'OBSOLETO'
export type PrioridadeRequisito = 'ALTA' | 'MEDIA' | 'BAIXA'

export interface Requisito {
  id: string
  demandaId: string
  tipo: TipoRequisito
  codigo: string
  titulo: string
  descricao: string | null
  prioridade: PrioridadeRequisito
  status: StatusRequisito
  fonte: 'MANUAL' | 'IA'
  criterioAceitacao: string | null
  observacoes: string | null
  ordemExibicao: number
  aprovadoPor: string | null
  aprovadoEm: string | null
  smartScore: number | null
  smartDetalhes: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface CriarRequisitoPayload {
  tipo: TipoRequisito
  titulo: string
  descricao?: string
  prioridade?: PrioridadeRequisito
  criterioAceitacao?: string
  observacoes?: string
}

export interface AtualizarRequisitoPayload {
  titulo?: string
  descricao?: string | null
  prioridade?: PrioridadeRequisito
  status?: StatusRequisito
  criterioAceitacao?: string | null
  observacoes?: string | null
}
