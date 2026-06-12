export type StatusConformidade = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'

export interface ConformidadeQualidade {
  id: string; demandaId: string
  analiseLgpd?: string; analiseSeguranca?: string; analiseAcessibilidade?: string
  qualidadeRequisitos?: string; pendencias?: string; scoreGeral?: number
  statusAprovacao: StatusConformidade
  aprovadoPor?: string; aprovadoEm?: string; fonte: string
  criadoEm: string; atualizadoEm: string
}
