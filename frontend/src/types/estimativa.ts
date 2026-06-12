export type StatusEstimativa = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface AtualizarEstimativaRequest {
  storyPointsTotal?: number
  horasAnalista?: number; horasDev?: number; horasQa?: number; horasUx?: number
  prazoSprints?: number
  recursosSugeridos?: string; matrizEsforco?: string; resumoExecutivo?: string
}

export interface RecursoSugerido { perfil: string; quantidade: number; dedicacao: string; sprints: string }
export interface ItemMatrizEsforco { modulo: string; storyPoints: number; percentual: number; complexidade: string }

export interface EstimativaProjeto {
  id: string; demandaId: string
  storyPointsTotal?: number
  horasAnalista?: number; horasDev?: number; horasQa?: number; horasUx?: number
  prazoSprints?: number
  recursosSugeridos?: string; matrizEsforco?: string; resumoExecutivo?: string
  statusAprovacao: StatusEstimativa
  aprovadoPor?: string; aprovadoEm?: string; fonte: string
  criadoEm: string; atualizadoEm: string
}
