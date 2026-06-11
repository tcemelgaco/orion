import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { StatusBadge } from '../components/ui/StatusBadge'
import { PrioridadeBadge } from '../components/ui/PrioridadeBadge'
import { buscarDemandas } from '../services/api'
import type { DemandaSummary, PageResponse, StatusDemanda } from '../types/demanda'

const tipoLabel: Record<string, string> = {
  NOVO_SISTEMA: 'Novo Sistema',
  MELHORIA: 'Melhoria',
  CORRETIVA: 'Corretiva',
  INTEGRACAO: 'Integração',
  MODERNIZACAO: 'Modernização',
}

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'APROVADA', label: 'Aprovada' },
  { value: 'EM_DESENVOLVIMENTO', label: 'Em Desenvolvimento' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function DemandasPage() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [area, setArea] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse<DemandaSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const fetchDemandas = useCallback(() => {
    setLoading(true)
    setErro('')
    const params: Record<string, string | number> = { page, size: 20 }
    if (status) params.status = status
    if (area.trim()) params.area = area.trim()
    if (busca.trim()) params.busca = busca.trim()
    buscarDemandas(params)
      .then((res) => setData(res.data))
      .catch(() => setErro('Backend indisponível. Verifique se o servidor está ativo na porta 8080.'))
      .finally(() => setLoading(false))
  }, [busca, status, area, page])

  useEffect(() => {
    const t = setTimeout(fetchDemandas, 300)
    return () => clearTimeout(t)
  }, [fetchDemandas])

  const demandas = data?.content ?? []
  const total = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const hasFilters = !!(busca || status || area)

  return (
    <AppLayout>
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Módulo 1
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Gestão de Demandas</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {loading ? 'Carregando…' : `${total} demanda${total !== 1 ? 's' : ''} cadastrada${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/demandas/nova')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova Demanda
        </button>
      </div>

      <div className="p-6 flex flex-col gap-4 h-[calc(100vh-10.5rem)] overflow-hidden">
        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shrink-0 shadow-sm">
          <div className="relative flex-1 min-w-52">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPage(0) }}
              placeholder="Buscar por título ou descrição…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0) }}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            value={area}
            onChange={(e) => { setArea(e.target.value); setPage(0) }}
            placeholder="Área demandante…"
            className="w-48 py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
          />
          {hasFilters && (
            <button
              onClick={() => { setBusca(''); setStatus(''); setArea(''); setPage(0) }}
              className="flex items-center gap-1.5 py-2 px-3 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Limpar
            </button>
          )}
        </div>

        {/* Table card — fills remaining vertical space */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <svg className="animate-spin w-7 h-7 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Carregando demandas…</span>
            </div>
          ) : erro ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-slate-700 font-medium mb-1">Serviço indisponível</p>
              <p className="text-slate-400 text-sm mb-4">{erro}</p>
              <button onClick={fetchDemandas} className="text-sm text-blue-600 hover:underline">Tentar novamente</button>
            </div>
          ) : demandas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              {hasFilters ? (
                <>
                  <p className="text-slate-700 font-semibold mb-1">Nenhuma demanda encontrada</p>
                  <p className="text-slate-400 text-sm">Ajuste os filtros de busca.</p>
                </>
              ) : (
                <>
                  <p className="text-slate-700 font-semibold mb-1">Nenhuma demanda cadastrada</p>
                  <p className="text-slate-400 text-sm mb-5">Inicie criando a primeira demanda do sistema.</p>
                  <button
                    onClick={() => navigate('/demandas/nova')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Criar primeira demanda
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Table scrollable */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 w-[35%]">
                        Título / Área
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 w-[12%]">
                        Tipo
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 w-[14%]">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 w-[10%]">
                        Prioridade
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 w-[10%]">
                        Prazo
                      </th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                        Solicitante
                      </th>
                      <th className="bg-slate-50 border-b border-slate-200 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {demandas.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => navigate(`/demandas/${d.id}`)}
                        className="hover:bg-blue-50/70 cursor-pointer transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                            {d.titulo}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{d.areaDemandante}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {tipoLabel[d.tipo] ?? d.tipo}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={d.status as StatusDemanda} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <PrioridadeBadge prioridade={d.prioridade} />
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(d.prazoEstimado)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">
                          {d.nomeSolicitante || '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination — pinned to bottom */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
                  <p className="text-xs text-slate-400">
                    Página {page + 1} de {totalPages} · {total} registros
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 0}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
