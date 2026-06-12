import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  buscarEstimativas,
  gerarEstimativas,
  revisarEstimativas,
  aprovarEstimativas,
  publicarEstimativas,
  buscarDemanda,
} from '../services/api'
import type { EstimativaProjeto, RecursoSugerido, ItemMatrizEsforco } from '../types/estimativa'
import { AprovacaoBadge } from '../components/ui/AprovacaoBadge'
import { AprovacaoBotoes } from '../components/ui/AprovacaoBotoes'
import type { StatusAprovacao } from '../types/canvas'

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeParseArray<T>(json?: string): T[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function MetricaCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: number | undefined
  unit?: string
  color: string
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-800">
          {value !== undefined && value !== null ? value : '—'}
        </span>
        {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
      </div>
    </div>
  )
}

const COMPLEXIDADE_COLOR: Record<string, string> = {
  BAIXA:   'bg-emerald-100 text-emerald-700',
  MEDIA:   'bg-amber-100 text-amber-700',
  ALTA:    'bg-red-100 text-red-700',
  baixa:   'bg-emerald-100 text-emerald-700',
  media:   'bg-amber-100 text-amber-700',
  alta:    'bg-red-100 text-red-700',
}

function complexidadeClass(c: string): string {
  return COMPLEXIDADE_COLOR[c] ?? 'bg-slate-100 text-slate-600'
}

// ── Pagina principal ─────────────────────────────────────────────────────────

export function EstimativasPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [est, setEst] = useState<EstimativaProjeto | null>(null)
  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, estResp] = await Promise.allSettled([
        buscarDemanda(demandaId),
        buscarEstimativas(demandaId),
      ])
      if (demResp.status === 'fulfilled') setDemandaTitulo(demResp.value.data.titulo ?? '')
      if (estResp.status === 'fulfilled') setEst(estResp.value.data)
      else setEst(null)
    } finally {
      setLoading(false)
    }
  }, [demandaId])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function handleGerar() {
    if (!demandaId) return
    setGerando(true)
    setErro('')
    try {
      const r = await gerarEstimativas(demandaId)
      setEst(r.data)
    } catch {
      setErro('Erro ao gerar estimativas. Verifique a configuracao da chave OpenAI.')
    } finally {
      setGerando(false)
    }
  }

  const recursos = safeParseArray<RecursoSugerido>(est?.recursosSugeridos)
  const matrizEsforco = safeParseArray<ItemMatrizEsforco>(est?.matrizEsforco)
  const maxSp = matrizEsforco.reduce((mx, item) => Math.max(mx, item.storyPoints ?? 0), 1)

  return (
    <AppLayout>
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => demandaId && navigate(`/demandas/${demandaId}`)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors shrink-0"
          aria-label="Voltar para demanda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Demanda
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700 flex-1 truncate">
          {demandaTitulo || 'Estimativas do Projeto'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2 py-0.5 rounded shrink-0">
          Modulo 10
        </span>
        {est && (
          <AprovacaoBadge
            status={est.statusAprovacao as StatusAprovacao}
            aprovadoPor={est.aprovadoPor}
            aprovadoEm={est.aprovadoEm}
          />
        )}
        {est && est.statusAprovacao !== 'PUBLICADO' && (
          <AprovacaoBotoes
            status={est.statusAprovacao as StatusAprovacao}
            onRevisar={async () => { const r = await revisarEstimativas(demandaId!); setEst(r.data) }}
            onAprovar={async () => { const r = await aprovarEstimativas(demandaId!); setEst(r.data) }}
            onPublicar={async () => { const r = await publicarEstimativas(demandaId!); setEst(r.data) }}
          />
        )}
        <button
          onClick={handleGerar}
          disabled={gerando}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors shrink-0"
          aria-label={gerando ? 'Gerando estimativas...' : 'Gerar estimativas com IA'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${gerando ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {gerando ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            )}
          </svg>
          {gerando ? 'Gerando...' : est ? 'Regenerar com IA' : 'Gerar com IA'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {erro && (
          <div role="alert" className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between items-center">
            {erro}
            <button onClick={() => setErro('')} aria-label="Fechar erro" className="text-red-400 hover:text-red-600 ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <svg className="animate-spin w-6 h-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Carregando estimativas...
          </div>
        ) : !est ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-1">Estimativas ainda nao geradas</p>
            <p className="text-slate-400 text-sm mb-5 max-w-sm">
              Clique em "Gerar com IA" para criar automaticamente as estimativas de esforco do projeto.
            </p>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {gerando ? 'Gerando...' : 'Gerar Estimativas com IA'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Painel de Resumo */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Resumo Executivo de Esforco</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricaCard
                  label="Story Points Total"
                  value={est.storyPointsTotal}
                  unit="SP"
                  color="bg-blue-50 border-blue-200"
                />
                <MetricaCard
                  label="Prazo"
                  value={est.prazoSprints}
                  unit="sprints"
                  color="bg-violet-50 border-violet-200"
                />
                <MetricaCard
                  label="Horas Analista"
                  value={est.horasAnalista}
                  unit="h"
                  color="bg-amber-50 border-amber-200"
                />
                <MetricaCard
                  label="Horas Desenvolvedor"
                  value={est.horasDev}
                  unit="h"
                  color="bg-cyan-50 border-cyan-200"
                />
                <MetricaCard
                  label="Horas QA"
                  value={est.horasQa}
                  unit="h"
                  color="bg-emerald-50 border-emerald-200"
                />
                <MetricaCard
                  label="Horas UX"
                  value={est.horasUx}
                  unit="h"
                  color="bg-rose-50 border-rose-200"
                />
              </div>
            </div>

            {/* Recursos Sugeridos */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Recursos Sugeridos</h3>
                <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
                  {recursos.length}
                </span>
              </div>
              {recursos.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum recurso definido</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Perfil</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Quantidade</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dedicacao</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sprints</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recursos.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-800">{r.perfil}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                              {r.quantidade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{r.dedicacao}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.sprints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Matriz de Esforco */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Matriz de Esforco por Modulo</h3>
                <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
                  {matrizEsforco.length} modulos
                </span>
              </div>
              {matrizEsforco.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum modulo na matriz</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Modulo</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Story Points</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">%</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Complexidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrizEsforco.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-800">{item.modulo}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-semibold">{item.storyPoints} SP</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${Math.min(100, (item.storyPoints / maxSp) * 100)}%` }}
                                  role="progressbar"
                                  aria-valuenow={item.percentual}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label={`${item.percentual}% do esforco total`}
                                />
                              </div>
                              <span className="text-xs text-slate-500 w-8 text-right">{item.percentual}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${complexidadeClass(item.complexidade)}`}>
                              {item.complexidade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resumo Executivo */}
            {est.resumoExecutivo && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Resumo Executivo</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{est.resumoExecutivo}</p>
              </div>
            )}

            {/* Metadados */}
            <div className="text-xs text-slate-400 flex items-center gap-4 pb-2">
              <span>Criado em {new Date(est.criadoEm).toLocaleDateString('pt-BR')}</span>
              <span>Atualizado em {new Date(est.atualizadoEm).toLocaleDateString('pt-BR')}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">{est.fonte}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
