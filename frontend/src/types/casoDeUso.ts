export type StatusCasoDeUso = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface FluxoPasso {
  passo: number
  descricao: string
}

export interface FluxoAlternativo {
  id: string
  gatilho: string
  passos: FluxoPasso[]
}

export interface FluxoExcecao {
  id: string
  gatilho: string
  passos: FluxoPasso[]
}

export interface CasoDeUso {
  id: string
  demandaId: string
  codigo: string
  nome: string
  descricao?: string
  atores?: string
  preCondicoes?: string
  posCondicoes?: string
  fluxoPrincipal?: string
  fluxosAlternativos?: string
  fluxosExcecao?: string
  requisitosOrigem?: string
  diagramaMermaid?: string
  statusAprovacao: StatusCasoDeUso
  aprovadoPor?: string
  aprovadoEm?: string
  fonte: string
  ordemExibicao: number
  criadoEm: string
  atualizadoEm: string
}

export interface CriarCasoDeUsoPayload {
  nome: string
  descricao?: string
  atores?: string
  preCondicoes?: string
  posCondicoes?: string
  fluxoPrincipal?: string
  fluxosAlternativos?: string
  fluxosExcecao?: string
  requisitosOrigem?: string
  diagramaMermaid?: string
}
