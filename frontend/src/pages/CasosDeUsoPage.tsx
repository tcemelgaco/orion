import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  listarCasosDeUso, gerarCasosDeUso, excluirCasoDeUso,
  revisarCasoDeUso, aprovarCasoDeUso, publicarCasoDeUso, buscarDemanda,
} from '../services/api'
import type { CasoDeUso, StatusCasoDeUso, FluxoPasso, FluxoAlternativo, FluxoExcecao } from '../types/casoDeUso'

const STATUS_COLORS: Record<StatusCasoDeUso, string> = {
  RASCUNHO_IA: 'bg-amber-600 text-white',
  EM_REVISAO:  'bg-sky-600 text-white',
  APROVADO:    'bg-emerald-600 text-white',
  PUBLICADO:   'bg-violet-600 text-white',
}

const STATUS_LABELS: Record<StatusCasoDeUso, string> = {
  RASCUNHO_IA: 'Rascunho IA',
  EM_REVISAO:  'Em Revisão',
  APROVADO:    'Aprovado',
  PUBLICADO:   'Publicado',
}

function safeParseArray<T>(json?: string): T[] {
  if (!json) return []
  try { return JSON.parse(json) as T[] } catch { return [] }
}

function FluxoPassos({ passos }: { passos: FluxoPasso[] }) {
  if (!passos.length) return null
  return (
    <ol className="space-y-1.5 mt-2">
      {passos.map((p) => (
        <li key={p.passo} className="flex gap-2 text-sm">
          <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
            {p.passo}
          </span>
          <span className="text-slate-700">{p.descricao}</span>
        </li>
      ))}
    </ol>
  )
}

function CasoDeUsoCard({
  caso,
  expandido,
  onToggle,
  onRevisar,
  onAprovar,
  onPublicar,
  onExcluir,
  actionLoading,
}: {
  caso: CasoDeUso
  expandido: boolean
  onToggle: () => void
  onRevisar: () => void
  onAprovar: () => void
  onPublicar: () => void
  onExcluir: () => void
  actionLoading: string | null
}) {
  const atores = safeParseArray<string>(caso.atores)
  const fluxoPrincipal = safeParseArray<FluxoPasso>(caso.fluxoPrincipal)
  const fluxosAlternativos = safeParseArray<FluxoAlternativo>(caso.fluxosAlternativos)
  const fluxosExcecao = safeParseArray<FluxoExcecao>(caso.fluxosExcecao)
  const requisitosOrigem = safeParseArray<string>(caso.requisitosOrigem)
  const isLoading = (act: string) => actionLoading === `${caso.id}-${act}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={expandido}
      >
        <span className="shrink-0 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
          {caso.codigo}
        </span>
        <span className="flex-1 text-sm font-semibold text-slate-900 truncate">{caso.nome}</span>
        {atores.length > 0 && (
          <div className="hidden sm:flex gap-1 shrink-0">
            {atores.slice(0, 2).map((a) => (
              <span key={a} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                {a}
              </span>
            ))}
            {atores.length > 2 && (
              <span className="text-[10px] text-slate-400">+{atores.length - 2}</span>
            )}
          </div>
        )}
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${STATUS_COLORS[caso.statusAprovacao]}`}>
          {STATUS_LABELS[caso.statusAprovacao]}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expandido ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      {expandido && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-5">
          {/* Atores, Pré/Pós */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {atores.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Atores</p>
                <div className="flex flex-wrap gap-1.5">
                  {atores.map((a) => (
                    <span key={a} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {caso.preCondicoes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pré-condições</p>
                <p className="text-sm text-slate-600">{caso.preCondicoes}</p>
              </div>
            )}
            {caso.posCondicoes && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pós-condições</p>
                <p className="text-sm text-slate-600">{caso.posCondicoes}</p>
              </div>
            )}
          </div>

          {/* Descrição */}
          {caso.descricao && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Descrição</p>
              <p className="text-sm text-slate-600">{caso.descricao}</p>
            </div>
          )}

          {/* Fluxo Principal */}
          {fluxoPrincipal.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Fluxo Principal</p>
              <FluxoPassos passos={fluxoPrincipal} />
            </div>
          )}

          {/* Fluxos Alternativos */}
          {fluxosAlternativos.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Fluxos Alternativos</p>
              <div className="space-y-3">
                {fluxosAlternativos.map((fa) => (
                  <div key={fa.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-700">{fa.id} — {fa.gatilho}</p>
                    <FluxoPassos passos={fa.passos} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fluxos de Exceção */}
          {fluxosExcecao.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Fluxos de Exceção</p>
              <div className="space-y-3">
                {fluxosExcecao.map((fe) => (
                  <div key={fe.id} className="rounded-lg border border-red-100 bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-700">{fe.id} — {fe.gatilho}</p>
                    <FluxoPassos passos={fe.passos} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requisitos de Origem */}
          {requisitosOrigem.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Requisitos de Origem</p>
              <div className="flex flex-wrap gap-1.5">
                {requisitosOrigem.map((r) => (
                  <span key={r} className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diagrama Mermaid */}
          {caso.diagramaMermaid && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Diagrama (Mermaid)</p>
                <button
                  onClick={() => navigator.clipboard.writeText(caso.diagramaMermaid!)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  aria-label="Copiar código Mermaid"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copiar
                </button>
              </div>
              <pre className="text-xs bg-slate-900 text-green-300 p-4 rounded-xl overflow-x-auto leading-relaxed font-mono">
                {caso.diagramaMermaid}
              </pre>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            {caso.statusAprovacao === 'RASCUNHO_IA' && (
              <button onClick={onRevisar} disabled={!!actionLoading}
                className="px-3 py-1.5 text-xs font-medium border border-sky-200 text-sky-700 rounded-lg hover:bg-sky-50 disabled:opacity-50 transition-colors">
                {isLoading('revisar') ? '…' : 'Abrir Revisão'}
              </button>
            )}
            {caso.statusAprovacao === 'EM_REVISAO' && (
              <button onClick={onAprovar} disabled={!!actionLoading}
                className="px-3 py-1.5 text-xs font-medium border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors">
                {isLoading('aprovar') ? '…' : 'Aprovar'}
              </button>
            )}
            {caso.statusAprovacao === 'APROVADO' && (
              <button onClick={onPublicar} disabled={!!actionLoading}
                className="px-3 py-1.5 text-xs font-medium border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 disabled:opacity-50 transition-colors">
                {isLoading('publicar') ? '…' : 'Publicar'}
              </button>
            )}
            <button onClick={onExcluir} disabled={!!actionLoading}
              className="ml-auto px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function CasosDeUsoPage() {
  const { demandaId } = useParams<{ demandaId: string }>()

  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [casos, setCasos] = useState<CasoDeUso[]>([])
  const [gerando, setGerando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    setErro('')
    try {
      const [demResp, casosResp] = await Promise.all([
        buscarDemanda(demandaId),
        listarCasosDeUso(demandaId),
      ])
      setDemandaTitulo(demResp.data.titulo)
      setCasos(casosResp.data)
    } catch {
      setErro('Não foi possível carregar os casos de uso.')
    } finally {
      setLoading(false)
    }
  }, [demandaId])

  useEffect(() => { carregar() }, [carregar])

  const handleGerar = async () => {
    if (!demandaId) return
    setGerando(true)
    setErro('')
    try {
      const resp = await gerarCasosDeUso(demandaId)
      setCasos(resp.data)
      setExpandido(new Set())
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { mensagem?: string } } })?.response?.data?.mensagem
      setErro(msg ?? 'Erro ao gerar casos de uso com IA.')
    } finally {
      setGerando(false)
    }
  }

  const withAction = async (id: string, act: string, fn: () => Promise<{ data: CasoDeUso }>) => {
    setActionLoading(`${id}-${act}`)
    try {
      const resp = await fn()
      setCasos(prev => prev.map(c => c.id === id ? resp.data : c))
    } catch {
      setErro('Ação falhou. Tente novamente.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleExcluir = async (id: string) => {
    setActionLoading(`${id}-excluir`)
    try {
      await excluirCasoDeUso(id)
      setCasos(prev => prev.filter(c => c.id !== id))
    } catch {
      setErro('Erro ao excluir caso de uso.')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleExpandido = (id: string) =>
    setExpandido(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">Módulo 6</p>
              <h1 className="text-base font-bold text-slate-900 truncate">
                Casos de Uso — {demandaTitulo || '…'}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {casos.length > 0 && (
                <button
                  onClick={() => setExpandido(prev =>
                    prev.size === casos.length ? new Set() : new Set(casos.map(c => c.id))
                  )}
                  className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {expandido.size === casos.length ? 'Recolher todos' : 'Expandir todos'}
                </button>
              )}
              <button
                onClick={handleGerar}
                disabled={gerando}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
                aria-label={gerando ? 'Gerando casos de uso' : 'Gerar casos de uso com IA'}
              >
                {gerando ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Gerando…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Gerar com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 max-w-5xl mx-auto">
          {erro && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {erro}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Carregando…</div>
          ) : casos.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-1">Nenhum caso de uso</h2>
              <p className="text-sm text-slate-400 mb-5">
                Gere casos de uso com IA a partir dos requisitos e canvas desta demanda.
              </p>
              <button onClick={handleGerar} disabled={gerando}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors">
                Gerar Casos de Uso
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">{casos.length} caso{casos.length !== 1 ? 's' : ''} de uso</p>
              {casos.map((caso) => (
                <CasoDeUsoCard
                  key={caso.id}
                  caso={caso}
                  expandido={expandido.has(caso.id)}
                  onToggle={() => toggleExpandido(caso.id)}
                  onRevisar={() => withAction(caso.id, 'revisar', () => revisarCasoDeUso(caso.id))}
                  onAprovar={() => withAction(caso.id, 'aprovar', () => aprovarCasoDeUso(caso.id))}
                  onPublicar={() => withAction(caso.id, 'publicar', () => publicarCasoDeUso(caso.id))}
                  onExcluir={() => handleExcluir(caso.id)}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
