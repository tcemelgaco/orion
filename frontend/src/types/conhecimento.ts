export type TipoDocumento = 'DOCUMENTO' | 'ESPECIFICACAO' | 'ATA' | 'MANUAL' | 'NORMA' | 'OUTRO'

export interface DocumentoConhecimento {
  id: string
  titulo: string
  conteudo: string
  tipo: TipoDocumento
  tags?: string        // JSON array string: '["tag1","tag2"]'
  fonte?: string
  tokensEstimados?: number
  criadoEm: string
  atualizadoEm: string
  criadoPor?: string
}

export interface BuscaSemanticaResult {
  documento: DocumentoConhecimento
  score: number        // cosine similarity 0–1
}

export interface IngerirDocumentoPayload {
  titulo: string
  conteudo: string
  tipo: TipoDocumento
  tags?: string
  fonte?: string
}
