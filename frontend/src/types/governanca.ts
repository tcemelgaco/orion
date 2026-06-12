export type StatusGovernanca = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface AtualizarGovernancaRequest {
  matrizRaci?: string; stakeholdersMapeados?: string; dependenciasExternas?: string
  premissas?: string; restricoes?: string; riscos?: string; planoMitigacao?: string
}

export interface RaciItem { atividade: string; responsavel: string; aprovador: string; consultado: string; informado: string }
export interface StakeholderMapeado { nome: string; papel: string; area: string; interesse: string; influencia: string; engajamento: string }
export interface DependenciaExterna { sistema: string; tipo: string; criticidade: string; descricao: string; responsavel: string }
export interface Premissa { id: string; descricao: string; impactoSeNaoConfirmada: string }
export interface Restricao { id: string; tipo: string; descricao: string; impacto: string }
export interface Risco { id: string; descricao: string; probabilidade: string; impacto: string; categoria: string; status: string }
export interface MitigacaoRisco { riscoId: string; estrategia: string; acoes: string[]; responsavel: string; prazo: string }

export interface GovernancaProjeto {
  id: string; demandaId: string
  matrizRaci?: string; stakeholdersMapeados?: string; dependenciasExternas?: string
  premissas?: string; restricoes?: string; riscos?: string; planoMitigacao?: string
  statusAprovacao: StatusGovernanca
  aprovadoPor?: string; aprovadoEm?: string; fonte: string
  criadoEm: string; atualizadoEm: string
}
