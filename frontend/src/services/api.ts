import axios from 'axios'
import type { CriarDemandaPayload, AdicionarStakeholderPayload } from '../types/demanda'
import type { CriarRequisitoPayload, AtualizarRequisitoPayload, TipoRequisito } from '../types/requisito'
import type { AtualizarHistoriaPayload } from '../types/backlog'
import type { TipoArtefato } from '../types/artefato'

const credentials = btoa('analista:ailer@dev')

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${credentials}`,
  },
})

// --- Módulo 1: Demandas ---

export function criarDemanda(payload: CriarDemandaPayload) {
  return api.post('/demandas', payload)
}

export function buscarDemandas(params?: {
  status?: string
  area?: string
  busca?: string
  page?: number
  size?: number
}) {
  return api.get('/demandas', { params })
}

export function buscarDemanda(id: string) {
  return api.get(`/demandas/${id}`)
}

export function atualizarDemanda(id: string, payload: Partial<CriarDemandaPayload> & { status?: string }) {
  return api.put(`/demandas/${id}`, payload)
}

export function excluirDemanda(id: string) {
  return api.delete(`/demandas/${id}`)
}

export function adicionarStakeholder(demandaId: string, payload: AdicionarStakeholderPayload) {
  return api.post(`/demandas/${demandaId}/stakeholders`, payload)
}

export function removerStakeholder(demandaId: string, stakeholderId: string) {
  return api.delete(`/demandas/${demandaId}/stakeholders/${stakeholderId}`)
}

export function buscarHistorico(demandaId: string, page = 0) {
  return api.get(`/demandas/${demandaId}/historico`, { params: { page, size: 20 } })
}

// --- Módulo 3: Canvas ---

export function gerarCanvas(demandaId: string) {
  return api.post(`/demandas/${demandaId}/canvas`)
}

export function buscarCanvas(demandaId: string) {
  return api.get(`/demandas/${demandaId}/canvas`)
}

export function atualizarCanvas(canvasId: string, payload: Record<string, string | undefined>) {
  return api.put(`/canvas/${canvasId}`, payload)
}

export function revisarCanvas(canvasId: string) {
  return api.patch(`/canvas/${canvasId}/revisar`)
}

export function aprovarCanvas(canvasId: string) {
  return api.patch(`/canvas/${canvasId}/aprovar`)
}

export function publicarCanvas(canvasId: string) {
  return api.patch(`/canvas/${canvasId}/publicar`)
}

// --- Módulo 4: Requisitos ---

export function gerarRequisitos(demandaId: string) {
  return api.post(`/demandas/${demandaId}/requisitos/gerar`)
}

export function listarRequisitos(demandaId: string, tipo?: TipoRequisito) {
  return api.get(`/demandas/${demandaId}/requisitos`, { params: tipo ? { tipo } : {} })
}

export function criarRequisito(demandaId: string, payload: CriarRequisitoPayload) {
  return api.post(`/demandas/${demandaId}/requisitos`, payload)
}

export function atualizarRequisito(id: string, payload: AtualizarRequisitoPayload) {
  return api.put(`/requisitos/${id}`, payload)
}

export function excluirRequisito(id: string) {
  return api.delete(`/requisitos/${id}`)
}

export function revisarRequisito(id: string) {
  return api.patch(`/requisitos/${id}/revisar`)
}

export function aprovarRequisito(id: string) {
  return api.patch(`/requisitos/${id}/aprovar`)
}

export function publicarRequisito(id: string) {
  return api.patch(`/requisitos/${id}/publicar`)
}

export function avaliarSmartRequisito(id: string) {
  return api.post(`/requisitos/${id}/avaliar-smart`)
}

export function checklistCobertura(demandaId: string) {
  return api.post(`/demandas/${demandaId}/requisitos/checklist-cobertura`)
}

export function detectarDuplicatas(demandaId: string) {
  return api.post(`/demandas/${demandaId}/requisitos/detectar-duplicatas`)
}

// --- Exportação DOCX / PDF ---

export async function exportarDocx(demandaId: string): Promise<void> {
  const resp = await api.get(`/demandas/${demandaId}/exportar/docx`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([resp.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = `especificacao-${demandaId}.docx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function exportarPdf(demandaId: string): Promise<void> {
  const resp = await api.get(`/demandas/${demandaId}/exportar/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `especificacao-${demandaId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// --- Módulo 5: Backlog ---

export function gerarBacklog(demandaId: string) {
  return api.post(`/demandas/${demandaId}/backlog/gerar`)
}

export function listarBacklog(demandaId: string) {
  return api.get(`/demandas/${demandaId}/backlog`)
}

export function atualizarHistoria(id: string, payload: AtualizarHistoriaPayload) {
  return api.put(`/historias/${id}`, payload)
}

export function excluirHistoria(id: string) {
  return api.delete(`/historias/${id}`)
}

export function revisarEpico(id: string) {
  return api.patch(`/epicos/${id}/revisar`)
}

export function aprovarEpico(id: string) {
  return api.patch(`/epicos/${id}/aprovar`)
}

export function publicarEpico(id: string) {
  return api.patch(`/epicos/${id}/publicar`)
}

export function avaliarInvestHistoria(id: string) {
  return api.post(`/historias/${id}/avaliar-invest`)
}

// --- Módulo 2: Entrevistas ---

export function criarEntrevista(demandaId: string) {
  return api.post(`/demandas/${demandaId}/entrevistas`)
}

export function buscarEntrevista(id: string) {
  return api.get(`/entrevistas/${id}`)
}

export function consolidarEntrevista(id: string) {
  return api.post(`/entrevistas/${id}/consolidar`)
}

export function buscarSumario(id: string) {
  return api.get(`/entrevistas/${id}/sumario`)
}

export function streamMensagem(
  entrevistaId: string,
  conteudo: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  fetch(`/api/v1/entrevistas/${entrevistaId}/mensagens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ conteudo }),
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(`Erro HTTP ${response.status}`)
        return
      }
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (currentEvent === 'token') {
              onToken(data)
            } else if (currentEvent === 'done') {
              onDone()
              return
            } else if (currentEvent === 'error') {
              onError(data || 'Erro no servidor')
              return
            }
          } else if (line === '') {
            currentEvent = ''
          }
        }
      }
      onDone()
    })
    .catch((err) => onError(err.message))
}

// --- Repositório de Artefatos ---

export function listarArtefatos(demandaId: string) {
  return api.get(`/demandas/${demandaId}/artefatos`)
}

export function uploadArtefato(
  demandaId: string,
  file: File,
  tipo: TipoArtefato,
  descricao: string,
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tipo', tipo)
  if (descricao) formData.append('descricao', descricao)
  return axios.post(`/api/v1/demandas/${demandaId}/artefatos`, formData, {
    headers: { Authorization: `Basic ${credentials}` },
  })
}

export async function downloadArtefato(artefatoId: string, nomeOriginal: string): Promise<void> {
  const resp = await api.get(`/artefatos/${artefatoId}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([resp.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = nomeOriginal
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function excluirArtefato(artefatoId: string) {
  return api.delete(`/artefatos/${artefatoId}`)
}
