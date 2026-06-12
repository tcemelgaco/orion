export type StatusArquitetura = 'RASCUNHO_IA' | 'EM_REVISAO' | 'APROVADO' | 'PUBLICADO'
export type VisaoArquitetural = 'MONOLITO' | 'MICROSSERVICOS' | 'MODULAR_MONOLITO' | 'SERVERLESS' | 'HIBRIDA'

export interface Componente { nome: string; responsabilidade: string; tecnologia: string }
export interface IntegracaoArq { sistema: string; tipo: string; protocolo: string; descricao: string }
export interface EntidadeDados { entidade: string; descricao: string; atributosPrincipais: string[] }
export interface Adr { id: string; titulo: string; contexto: string; decisao: string; consequencias: string }

export interface ArquiteturaSolucao {
  id: string; demandaId: string
  visaoArquitetural?: VisaoArquitetural
  componentes?: string; integracoes?: string; modeloDados?: string
  adrs?: string; recomendacoes?: string; diagramaMermaid?: string
  statusAprovacao: StatusArquitetura
  aprovadoPor?: string; aprovadoEm?: string; fonte: string
  criadoEm: string; atualizadoEm: string
}
