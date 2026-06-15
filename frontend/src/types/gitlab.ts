export interface GitLabConfig {
  id: string
  demandaId: string
  gitlabUrl: string
  projectId: string
  accessTokenMasked: string
  ativo: boolean
}

export interface GitLabConfigPayload {
  gitlabUrl: string
  projectId: string
  accessToken: string
}

export interface GitLabExportResult {
  epicosExportados: number
  historiaExportadas: number
  erros: number
  detalhes: string[]
}
