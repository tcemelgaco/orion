export type StatusAprovacao = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface CanvasProjeto {
  id: string
  demandaId: string
  tituloDemanda: string
  contexto?: string
  problema?: string
  solucaoProposta?: string
  usuarios?: string
  funcionalidadesChave?: string
  restricoes?: string
  premissas?: string
  riscos?: string
  criteriosSucesso?: string
  integracoes?: string
  geradoPorIa: boolean
  statusAprovacao: StatusAprovacao
  aprovadoPor: string | null
  aprovadoEm: string | null
  criadoEm: string
  atualizadoEm: string
}

export interface AtualizarCanvasPayload {
  contexto?: string
  problema?: string
  solucaoProposta?: string
  usuarios?: string
  funcionalidadesChave?: string
  restricoes?: string
  premissas?: string
  riscos?: string
  criteriosSucesso?: string
  integracoes?: string
}
