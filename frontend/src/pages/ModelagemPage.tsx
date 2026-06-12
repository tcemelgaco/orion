import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  listarModelagem, gerarModelagem, excluirModelagem,
  revisarModelagem, aprovarModelagem, publicarModelagem, buscarDemanda,
} from '../services/api'
import type {
  ModelagemProcesso, StatusModelagem, TipoFluxo,
  PontoDecisao, Integracao, PontoControle,
} from '../types/modelagem'

const STATUS_COLORS: Record<StatusModelagem, string> = {
  RASCUNHO_IA: 'bg-amber-600 text-white',
  EM_REVISAO:  'bg-sky-600 text-white',
  APROVADO:    'bg-emerald-600 text-white',
  PUBLICADO:   'bg-violet-600 text-white',
}

const STATUS_LABELS: Record<StatusModelagem, string> = {
  RASCUNHO_IA: 'Rascunho IA',
  EM_REVISAO:  'Em Revisão',
  APROVADO:    'Aprovado',
  PUBLICADO:   'Publicado',
}

function safeParseArray<T>(json?: string): T[] {
  if (!json) return []
  try { return JSON.parse(json) as T[] } catch { return [] }
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={handleCopy} aria-label="Copiar código"
      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
      </svg>
      {copied ? 'Copiado!' : label}
    </button>
  )
}

function ModelagemCard({
  modelagem,
  onRevisar,
  onAprovar,
  onPublicar,
  onExcluir,
  actionLoading,
}: {
  modelagem: ModelagemProcesso
  onRevisar: () => void
  onAprovar: () => void
  onPublicar: () => void
  onExcluir: () => void
  actionLoading: string | null
}) {
  const [abaSelecionada, setAbaSelecionada] = useState<'descricao' | 'mermaid' | 'bpmn' | 'detalhes'>('descricao')
  const pontosDecisao = safeParseArray<PontoDecisao>(modelagem.pontosDecisao)
  const integracoes = safeParseArray<Integracao>(modelagem.integracoes)
  const pontosControle = safeParseArray<PontoControle>(modelagem.pontosControle)
  const isLoading = (act: string) => actionLoading === `${modelagem.id}-${act}`

  const abas = [
    { key: 'descricao', label: 'Descrição', show: !!modelagem.descricaoTexto },
    { key: 'mermaid',   label: 'Diagrama',  show: !!modelagem.codigoMermaid },
    { key: 'bpmn',      label: 'BPMN',      show: !!modelagem.bpmnTextual },
    { key: 'detalhes',  label: 'Detalhes',  show: pontosDecisao.length > 0 || integracoes.length > 0 || pontosControle.length > 0 },
  ].filter(a => a.show)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{modelagem.titulo}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400">{modelagem.fonte === 'IA' ? '✦ Gerado por IA' : 'Manual'}</span>
            {modelagem.aprovadoPor && (
              <span className="text-[10px] text-slate-400">· Aprovado por {modelagem.aprovadoPor}</span>
            )}
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${STATUS_COLORS[modelagem.statusAprovacao]}`}>
          {STATUS_LABELS[modelagem.statusAprovacao]}
        </span>
      </div>

      {/* Tabs */}
      {abas.length > 0 && (
        <div className="flex border-b border-slate-100 px-5 gap-4">
          {abas.map((aba) => (
            <button
              key={aba.key}
              onClick={() => setAbaSelecionada(aba.key as typeof abaSelecionada)}
              className={`py-2.5 text-xs font-medium border-b-2 transition-colors ${
                abaSelecionada === aba.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="px-5 py-4">
        {abaSelecionada === 'descricao' && modelagem.descricaoTexto && (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{modelagem.descricaoTexto}</p>
        )}

        {abaSelecionada === 'mermaid' && modelagem.codigoMermaid && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Código Mermaid</p>
              <CopyButton text={modelagem.codigoMermaid} />
            </div>
            <pre className="text-xs bg-slate-900 text-green-300 p-4 rounded-xl overflow-x-auto leading-relaxed font-mono">
              {modelagem.codigoMermaid}
            </pre>
            <p className="mt-2 text-[11px] text-slate-400">
              Visualize em{' '}
              <a href="https://mermaid.live" target="_blank" rel="noreferrer"
                className="text-blue-500 hover:underline">mermaid.live</a>
            </p>
          </div>
        )}

        {abaSelecionada === 'bpmn' && modelagem.bpmnTextual && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição BPMN</p>
              <CopyButton text={modelagem.bpmnTextual} />
            </div>
            <pre className="text-xs bg-slate-50 text-slate-700 border border-slate-200 p-4 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
              {modelagem.bpmnTextual}
            </pre>
          </div>
        )}

        {abaSelecionada === 'detalhes' && (
          <div className="space-y-5">
            {pontosDecisao.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pontos de Decisão</p>
                <div className="space-y-2">
                  {pontosDecisao.map((pd) => (
                    <div key={pd.id} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-700">{pd.id} — {pd.descricao}</p>
                      {pd.condicoes.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {pd.condicoes.map((c, i) => (
                            <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                              <span className="text-amber-400">→</span>{c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {integracoes.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Integrações</p>
                <div className="space-y-2">
                  {integracoes.map((int, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                      <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        int.tipo === 'entrada' ? 'bg-green-600 text-white' :
                        int.tipo === 'saida'   ? 'bg-orange-500 text-white' :
                                                 'bg-blue-600 text-white'
                      }`}>
                        {int.tipo === 'entrada' ? '← Entrada' : int.tipo === 'saida' ? 'Saída →' : '↔ Bidirecional'}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-blue-700">{int.sistema}</p>
                        <p className="text-xs text-blue-600 mt-0.5">{int.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pontosControle.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pontos de Controle</p>
                <div className="space-y-2">
                  {pontosControle.map((pc) => (
                    <div key={pc.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <span className="shrink-0 text-[10px] font-bold text-slate-500 font-mono">{pc.id}</span>
                      <div>
                        <p className="text-xs text-slate-700">{pc.descricao}</p>
                        {pc.responsavel && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Responsável: {pc.responsavel}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100">
        {modelagem.statusAprovacao === 'RASCUNHO_IA' && (
          <button onClick={onRevisar} disabled={!!actionLoading}
            className="px-3 py-1.5 text-xs font-medium border border-sky-200 text-sky-700 rounded-lg hover:bg-sky-50 disabled:opacity-50 transition-colors">
            {isLoading('revisar') ? '…' : 'Abrir Revisão'}
          </button>
        )}
        {modelagem.statusAprovacao === 'EM_REVISAO' && (
          <button onClick={onAprovar} disabled={!!actionLoading}
            className="px-3 py-1.5 text-xs font-medium border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors">
            {isLoading('aprovar') ? '…' : 'Aprovar'}
          </button>
        )}
        {modelagem.statusAprovacao === 'APROVADO' && (
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
  )
}

export function ModelagemPage() {
  const { demandaId } = useParams<{ demandaId: string }>()

  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [modelagens, setModelagens] = useState<ModelagemProcesso[]>([])
  const [gerando, setGerando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tabFluxo, setTabFluxo] = useState<TipoFluxo | 'TODOS'>('TODOS')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    setErro('')
    try {
      const [demResp, modResp] = await Promise.all([
        buscarDemanda(demandaId),
        listarModelagem(demandaId),
      ])
      setDemandaTitulo(demResp.data.titulo)
      setModelagens(modResp.data)
    } catch {
      setErro('Não foi possível carregar as modelagens.')
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
      const resp = await gerarModelagem(demandaId)
      setModelagens(resp.data)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { mensagem?: string } } })?.response?.data?.mensagem
      setErro(msg ?? 'Erro ao gerar modelagem com IA.')
    } finally {
      setGerando(false)
    }
  }

  const withAction = async (id: string, act: string, fn: () => Promise<{ data: ModelagemProcesso }>) => {
    setActionLoading(`${id}-${act}`)
    try {
      const resp = await fn()
      setModelagens(prev => prev.map(m => m.id === id ? resp.data : m))
    } catch {
      setErro('Ação falhou. Tente novamente.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleExcluir = async (id: string) => {
    setActionLoading(`${id}-excluir`)
    try {
      await excluirModelagem(id)
      setModelagens(prev => prev.filter(m => m.id !== id))
    } catch {
      setErro('Erro ao excluir modelagem.')
    } finally {
      setActionLoading(null)
    }
  }

  const modelagensFiltradas = tabFluxo === 'TODOS'
    ? modelagens
    : modelagens.filter(m => m.tipoFluxo === tabFluxo)

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-0.5">Módulo 7</p>
              <h1 className="text-base font-bold text-slate-900 truncate">
                Modelagem de Processos — {demandaTitulo || '…'}
              </h1>
            </div>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
              aria-label={gerando ? 'Gerando modelagem' : 'Gerar modelagem com IA'}
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
                  Gerar AS-IS / TO-BE
                </>
              )}
            </button>
          </div>

          {/* Filtro de fluxo */}
          {modelagens.length > 0 && (
            <div className="flex gap-2 mt-3">
              {(['TODOS', 'AS_IS', 'TO_BE'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTabFluxo(tipo)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    tabFluxo === tipo
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tipo === 'TODOS' ? 'Todos' : tipo === 'AS_IS' ? 'AS-IS (Atual)' : 'TO-BE (Proposto)'}
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {tipo === 'TODOS' ? modelagens.length : modelagens.filter(m => m.tipoFluxo === tipo).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6 max-w-5xl mx-auto">
          {erro && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {erro}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Carregando…</div>
          ) : modelagens.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-1">Nenhuma modelagem</h2>
              <p className="text-sm text-slate-400 mb-5">
                Gere os fluxos AS-IS e TO-BE com IA a partir do contexto desta demanda.
              </p>
              <button onClick={handleGerar} disabled={gerando}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors">
                Gerar Modelagem
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tabFluxo === 'TODOS' && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(['AS_IS', 'TO_BE'] as const).map((tipo) => {
                    const count = modelagens.filter(m => m.tipoFluxo === tipo).length
                    return (
                      <div key={tipo} className={`rounded-xl p-4 border ${
                        tipo === 'AS_IS' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                      }`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                          tipo === 'AS_IS' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{tipo === 'AS_IS' ? 'Processo Atual' : 'Processo Proposto'}</p>
                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                        <p className="text-xs text-slate-500">fluxo{count !== 1 ? 's' : ''} {tipo === 'AS_IS' ? 'AS-IS' : 'TO-BE'}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {modelagensFiltradas.map((m) => (
                <div key={m.id}>
                  {tabFluxo === 'TODOS' && (
                    <div className={`flex items-center gap-2 mb-2 ${
                      m.tipoFluxo === 'AS_IS' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      <div className={`h-px flex-1 ${m.tipoFluxo === 'AS_IS' ? 'bg-amber-200' : 'bg-emerald-200'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {m.tipoFluxo === 'AS_IS' ? '← Atual (AS-IS)' : 'Proposto (TO-BE) →'}
                      </span>
                      <div className={`h-px flex-1 ${m.tipoFluxo === 'AS_IS' ? 'bg-amber-200' : 'bg-emerald-200'}`} />
                    </div>
                  )}
                  <ModelagemCard
                    modelagem={m}
                    onRevisar={() => withAction(m.id, 'revisar', () => revisarModelagem(m.id))}
                    onAprovar={() => withAction(m.id, 'aprovar', () => aprovarModelagem(m.id))}
                    onPublicar={() => withAction(m.id, 'publicar', () => publicarModelagem(m.id))}
                    onExcluir={() => handleExcluir(m.id)}
                    actionLoading={actionLoading}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
