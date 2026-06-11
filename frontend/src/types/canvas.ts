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
