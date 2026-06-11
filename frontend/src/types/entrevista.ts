export type RoleMensagem = 'USER' | 'ASSISTANT' | 'SYSTEM'
export type StatusEntrevista = 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'

export interface Mensagem {
  id: string
  role: RoleMensagem
  conteudo: string
  criadoEm: string
}

export interface Entrevista {
  id: string
  demandaId: string
  tituloDemanda: string
  status: StatusEntrevista
  criadoEm: string
  mensagens: Mensagem[]
}

export interface Sumario {
  id: string
  entrevistaId: string
  contexto: string
  usuariosIdentificados: string
  processoAtual: string
  necessidades: string
  regrasNegocio: string
  integracoes: string
  restricoesPremissas: string
  informacoesAusentes: string
  conteudoCompleto: string
  criadoEm: string
}
