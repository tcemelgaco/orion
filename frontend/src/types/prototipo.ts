export type StatusPrototipo = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface Tela {
  id: string
  nome: string
  descricao: string
  elementos: string[]
  acoes: string[]
}

export interface FluxoNavegacao {
  descricao?: string
  passos?: string[]
  [key: string]: unknown
}

export interface ComponentePrincipal {
  nome: string
  descricao: string
  tipo?: string
}

export interface TecnologiaSugerida {
  nome: string
  categoria: string
  motivo?: string
}

export interface PrototipoSistema {
  id: string
  demandaId: string
  descricaoGeral?: string
  telas?: string          // JSON string
  fluxoNavegacao?: string // JSON string
  componentesPrincipais?: string // JSON string
  paleta?: string
  diretrizes?: string
  notasAcessibilidade?: string
  tecnologiasSugeridas?: string // JSON string
  statusAprovacao: StatusPrototipo
  aprovadoPor?: string
  aprovadoEm?: string
  fonte: string
  criadoEm: string
  atualizadoEm: string
}
