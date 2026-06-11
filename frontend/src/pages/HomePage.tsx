import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buscarDemandas, criarEntrevista } from '../services/api'

interface DemandaSummary {
  id: string
  titulo: string
  areaDemandante: string
  status: string
  prioridade: string
  nomeSolicitante: string
}

export function HomePage() {
  const navigate = useNavigate()
  const [demandas, setDemandas] = useState<DemandaSummary[]>([])
  const [carregando, setCarregando] = useState(true)
  const [iniciando, setIniciando] = useState<string | null>(null)

  useEffect(() => {
    buscarDemandas()
      .then((res) => setDemandas(res.data.content ?? []))
      .finally(() => setCarregando(false))
  }, [])

  async function handleIniciarEntrevista(demandaId: string) {
    setIniciando(demandaId)
    try {
      const res = await criarEntrevista(demandaId)
      navigate(`/entrevistas/${res.data.id}`)
    } catch {
      alert('Erro ao iniciar entrevista.')
      setIniciando(null)
    }
  }

  const statusColor: Record<string, string> = {
    RASCUNHO: 'bg-gray-100 text-gray-600',
    EM_ANALISE: 'bg-yellow-100 text-yellow-700',
    APROVADA: 'bg-green-100 text-green-700',
    EM_DESENVOLVIMENTO: 'bg-blue-100 text-blue-700',
    CONCLUIDA: 'bg-purple-100 text-purple-700',
    CANCELADA: 'bg-red-100 text-red-600',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-5 shadow">
        <h1 className="text-2xl font-bold">AILER</h1>
        <p className="text-blue-200 text-sm">
          Assistente Inteligente de Levantamento e Especificação de Requisitos · TCE-CE
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Demandas</h2>
        </div>

        {carregando ? (
          <p className="text-gray-500 text-center py-12">Carregando demandas…</p>
        ) : demandas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">Nenhuma demanda cadastrada.</p>
            <p className="text-sm">
              Use a API em{' '}
              <a href="/swagger-ui.html" target="_blank" className="text-blue-600 hover:underline">
                /swagger-ui.html
              </a>{' '}
              para criar uma demanda e iniciar a entrevista.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {demandas.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{d.titulo}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {d.areaDemandante} · {d.nomeSolicitante || 'Sem solicitante'}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                        statusColor[d.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleIniciarEntrevista(d.id)}
                    disabled={iniciando === d.id}
                    className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {iniciando === d.id ? 'Iniciando…' : 'Iniciar Entrevista'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
