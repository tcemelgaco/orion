import axios from 'axios'
import type { CriarDemandaPayload, AdicionarStakeholderPayload } from '../types/demanda'

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
