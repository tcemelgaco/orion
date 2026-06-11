import axios from 'axios'

const credentials = btoa('analista:ailer@dev')

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${credentials}`,
  },
})

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

export function buscarDemandas(params?: Record<string, string>) {
  return api.get('/demandas', { params })
}

export function buscarDemanda(id: string) {
  return api.get(`/demandas/${id}`)
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('event: token')) continue
          if (line.startsWith('data: ') && !line.includes('event: done')) {
            const data = line.slice(6)
            if (line.startsWith('data: ') && data !== '') {
              onToken(data)
            }
          }
          if (line.startsWith('event: done') || line.includes('event:done')) {
            onDone()
          }
          if (line.startsWith('event: error')) {
            onError('Erro no servidor')
          }
        }
      }
      onDone()
    })
    .catch((err) => onError(err.message))
}
