export type TipoFluxo = 'AS_IS' | 'TO_BE'
export type StatusModelagem = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface PontoDecisao {
  id: string
  descricao: string
  condicoes: string[]
}

export interface Integracao {
  sistema: string
  tipo: 'entrada' | 'saida' | 'bidirecional'
  descricao: string
}

export interface PontoControle {
  id: string
  descricao: string
  responsavel: string
}

export interface ModelagemProcesso {
  id: string
  demandaId: string
  tipoFluxo: TipoFluxo
  titulo: string
  descricaoTexto?: string
  codigoMermaid?: string
  bpmnTextual?: string
  pontosDecisao?: string
  integracoes?: string
  pontosControle?: string
  statusAprovacao: StatusModelagem
  aprovadoPor?: string
  aprovadoEm?: string
  fonte: string
  criadoEm: string
  atualizadoEm: string
}

export interface CriarModelagemPayload {
  tipoFluxo: TipoFluxo
  titulo: string
  descricaoTexto?: string
  codigoMermaid?: string
  bpmnTextual?: string
  pontosDecisao?: string
  integracoes?: string
  pontosControle?: string
}
