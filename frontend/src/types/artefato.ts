export type TipoArtefato =
  | 'LEI'
  | 'INSTRUCAO_NORMATIVA'
  | 'RESOLUCAO'
  | 'CONTRATO'
  | 'MANUAL'
  | 'ESPECIFICACAO'
  | 'OUTRO'

export interface Artefato {
  id: string
  demandaId: string
  nome: string
  nomeOriginal: string
  descricao: string | null
  tipoArtefato: TipoArtefato
  tamanhoBytes: number
  contentType: string
  uploadadoPor: string | null
  criadoEm: string
  atualizadoEm: string
}
