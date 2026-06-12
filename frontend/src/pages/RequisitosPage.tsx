import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  listarRequisitos, gerarRequisitos, criarRequisito,
  atualizarRequisito, excluirRequisito, buscarDemanda,
  revisarRequisito, aprovarRequisito, publicarRequisito, avaliarSmartRequisito,
  checklistCobertura, detectarDuplicatas,
} from '../services/api'
import type { Requisito, TipoRequisito, StatusRequisito, PrioridadeRequisito } from '../types/requisito'
import { AprovacaoBadge } from '../components/ui/AprovacaoBadge'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import type { StatusAprovacao } from '../types/canvas'

const TIPOS: { key: TipoRequisito | 'TODOS'; label: string; desc: string; color: string }[] = [
  { key: 'TODOS', label: 'Todos', desc: 'Todos os requisitos', color: 'bg-gray-100 text-gray-700 ring-gray-200' },
  { key: 'RF',    label: 'RF',   desc: 'Funcional',           color: 'bg-blue-100 text-blue-700 ring-blue-200' },
  { key: 'RNF',   label: 'RNF',  desc: 'Não Funcional',       color: 'bg-purple-100 text-purple-700 ring-purple-200' },
  { key: 'RN',    label: 'RN',   desc: 'Regra de Negócio',    color: 'bg-amber-100 text-amber-700 ring-amber-200' },
  { key: 'RI',    label: 'RI',   desc: 'Integração',          color: 'bg-cyan-100 text-cyan-700 ring-cyan-200' },
  { key: 'RS',    label: 'RS',   desc: 'Sistema',             color: 'bg-rose-100 text-rose-700 ring-rose-200' },
]

const PRIORIDADE_COLORS: Record<PrioridadeRequisito, string> = {
  ALTA:  'bg-red-100 text-red-700 ring-red-200',
  MEDIA: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  BAIXA: 'bg-green-100 text-green-700 ring-green-200',
}

const STATUS_COLORS: Record<StatusRequisito, string> = {
  RASCUNHO:    'bg-gray-100 text-gray-600',
  RASCUNHO_IA: 'bg-yellow-100 text-yellow-700',
  EM_REVISAO:  'bg-blue-100 text-blue-700',
  APROVADO:    'bg-green-100 text-green-700',
  PUBLICADO:   'bg-purple-100 text-purple-700',
  OBSOLETO:    'bg-red-50 text-red-400 line-through',
}

const APPROVAL_STATUSES = new Set<StatusRequisito>(['RASCUNHO_IA', 'EM_REVISAO', 'APROVADO', 'PUBLICADO'])

function tipoColor(tipo: TipoRequisito) {
  return TIPOS.find(t => t.key === tipo)?.color ?? 'bg-gray-100 text-gray-700 ring-gray-200'
}

interface NovoRequisito {
  tipo: TipoRequisito
  titulo: string
  descricao: string
  prioridade: PrioridadeRequisito
  criterioAceitacao: string
}

const NOVO_INICIAL: NovoRequisito = {
  tipo: 'RF', titulo: '', descricao: '', prioridade: 'MEDIA', criterioAceitacao: '',
}

export function RequisitosPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [requisitos, setRequisitos] = useState<Requisito[]>([])
  const [filtroTipo, setFiltroTipo] = useState<TipoRequisito | 'TODOS'>('TODOS')
  const [gerando, setGerando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [novo, setNovo] = useState<NovoRequisito>(NOVO_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Requisito>>({})
  const [expandido, setExpandido] = useState<Set<string>>(new Set())
  const [loadingSmartId, setLoadingSmartId] = useState<string | null>(null)
  const [painel, setPainel] = useState<{ tipo: 'cobertura' | 'duplicatas'; dados: unknown } | null>(null)
  const [loadingPainel, setLoadingPainel] = useState<'cobertura' | 'duplicatas' | null>(null)

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, reqResp] = await Promise.all([
        buscarDemanda(demandaId),
        listarRequisitos(demandaId),
      ])
      setDemandaTitulo(demResp.data.titulo)
      setRequisitos(reqResp.data)
    } finally {
      setLoading(false)
    }
  }, [demandaId])

  useEffect(() => {
    const t = setTimeout(carregar, 0)
    return () => clearTimeout(t)
  }, [carregar])

  const handleGerar = async () => {
    if (!demandaId) return
    setGerando(true)
    try {
      const resp = await gerarRequisitos(demandaId)
      setRequisitos(resp.data)
    } finally {
      setGerando(false)
    }
  }

  const handleCriar = async () => {
    if (!demandaId || !novo.titulo.trim()) return
    setSalvando(true)
    try {
      await criarRequisito(demandaId, {
        tipo: novo.tipo,
        titulo: novo.titulo,
        descricao: novo.descricao || undefined,
        prioridade: novo.prioridade,
        criterioAceitacao: novo.criterioAceitacao || undefined,
      })
      await carregar()
      setShowForm(false)
      setNovo(NOVO_INICIAL)
    } finally {
      setSalvando(false)
    }
  }

  const handleSalvarEdicao = async (id: string) => {
    setSalvando(true)
    try {
      await atualizarRequisito(id, editValues)
      await carregar()
      setEditando(null)
      setEditValues({})
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este requisito?')) return
    await excluirRequisito(id)
    await carregar()
  }

  const handleRevisarReq = async (id: string) => {
    await revisarRequisito(id)
    await carregar()
  }

  const handleAprovarReq = async (id: string) => {
    await aprovarRequisito(id)
    await carregar()
  }

  const handlePublicarReq = async (id: string) => {
    await publicarRequisito(id)
    await carregar()
  }

  const handleAvaliarSmart = async (id: string) => {
    setLoadingSmartId(id)
    try {
      await avaliarSmartRequisito(id)
      await carregar()
    } finally {
      setLoadingSmartId(null)
    }
  }

  const handleCobertura = async () => {
    if (!demandaId) return
    setLoadingPainel('cobertura')
    try {
      const resp = await checklistCobertura(demandaId)
      setPainel({ tipo: 'cobertura', dados: resp.data })
    } finally {
      setLoadingPainel(null)
    }
  }

  const handleDuplicatas = async () => {
    if (!demandaId) return
    setLoadingPainel('duplicatas')
    try {
      const resp = await detectarDuplicatas(demandaId)
      setPainel({ tipo: 'duplicatas', dados: resp.data })
    } finally {
      setLoadingPainel(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandido(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const filtrados = filtroTipo === 'TODOS'
    ? requisitos
    : requisitos.filter(r => r.tipo === filtroTipo)

  const countByTipo = (tipo: TipoRequisito) => requisitos.filter(r => r.tipo === tipo).length

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                <button onClick={() => navigate('/demandas')} className="hover:text-blue-600">Demandas</button>
                <span>/</span>
                <button onClick={() => navigate(`/demandas/${demandaId}`)} className="hover:text-blue-600 max-w-xs truncate">{demandaTitulo || '...'}</button>
                <span>/</span>
                <span className="text-gray-900 font-medium">Requisitos</span>
              </nav>
              <h1 className="text-xl font-bold text-gray-900">Especificação de Requisitos</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {requisitos.length > 0 && (
                <>
                  <button
                    onClick={handleCobertura}
                    disabled={loadingPainel !== null}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-teal-300 text-teal-700 text-sm font-medium hover:bg-teal-50 disabled:opacity-50"
                    title="Verificar se domínios essenciais estão cobertos"
                  >
                    {loadingPainel === 'cobertura' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                    )}
                    Cobertura
                  </button>
                  <button
                    onClick={handleDuplicatas}
                    disabled={loadingPainel !== null}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-300 text-orange-700 text-sm font-medium hover:bg-orange-50 disabled:opacity-50"
                    title="Detectar requisitos semanticamente similares"
                  >
                    {loadingPainel === 'duplicatas' ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                    )}
                    Duplicatas
                  </button>
                </>
              )}
              <button
                onClick={() => { setShowForm(true); setEditando(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Novo Requisito
              </button>
              <button
                onClick={handleGerar}
                disabled={gerando}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d1f3c] text-white text-sm font-medium hover:bg-[#1a3460] disabled:opacity-60"
              >
                {gerando ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Gerando com IA...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    {requisitos.length > 0 ? 'Regenerar com IA' : 'Gerar com IA'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats + filtros */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {TIPOS.map(t => {
              const count = t.key === 'TODOS' ? requisitos.length : countByTipo(t.key as TipoRequisito)
              const active = filtroTipo === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setFiltroTipo(t.key as TipoRequisito | 'TODOS')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-[#0d1f3c] text-white border-[#0d1f3c]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Painel Cobertura / Duplicatas */}
        {painel && (
          <div className={`mx-6 mt-4 rounded-xl border p-5 shadow-sm ${
            painel.tipo === 'cobertura' ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${painel.tipo === 'cobertura' ? 'text-teal-800' : 'text-orange-800'}`}>
                {painel.tipo === 'cobertura' ? 'Checklist de Cobertura' : 'Detecção de Duplicatas'}
              </h3>
              <button onClick={() => setPainel(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {painel.tipo === 'cobertura' && (() => {
              const dados = painel.dados as { dominios: { dominio: string; coberto: boolean; requisitosRelacionados: string[]; observacao: string }[]; scoreCobertura: number; recomendacao: string }
              return (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-lg font-bold px-3 py-1 rounded-full ${dados.scoreCobertura >= 70 ? 'bg-green-100 text-green-800' : dados.scoreCobertura >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {dados.scoreCobertura}%
                    </span>
                    <span className="text-sm text-gray-600">{dados.recomendacao}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {dados.dominios?.map((d) => (
                      <div key={d.dominio} className={`rounded-lg p-2.5 text-xs border ${d.coberto ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        <div className="flex items-center gap-1.5 font-semibold mb-1">
                          {d.coberto ? '✓' : '✗'} {d.dominio}
                        </div>
                        <p className="text-[10px] opacity-80">{d.observacao}</p>
                        {d.requisitosRelacionados.length > 0 && (
                          <p className="text-[10px] mt-1 font-mono">{d.requisitosRelacionados.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {painel.tipo === 'duplicatas' && (() => {
              const dados = painel.dados as { grupos: { requisitos: string[]; similaridade: number; tipo: string; justificativa: string }[]; totalGrupos: number; recomendacao: string }
              return (
                <div>
                  <p className="text-sm text-gray-600 mb-3">{dados.recomendacao}</p>
                  {dados.grupos?.length === 0 ? (
                    <p className="text-sm text-green-700 font-medium">Nenhuma duplicata identificada.</p>
                  ) : (
                    <div className="space-y-2">
                      {dados.grupos?.map((g, i) => (
                        <div key={i} className="bg-white rounded-lg border border-orange-200 p-3 text-xs">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {g.requisitos.map(r => (
                              <span key={r} className="font-mono bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">{r}</span>
                            ))}
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${g.similaridade >= 80 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {g.similaridade}% similar
                            </span>
                            <span className="text-gray-400">{g.tipo.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-gray-600">{g.justificativa}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Formulário novo requisito */}
        {showForm && (
          <div className="mx-6 mt-4 bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Novo Requisito Manual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo *</label>
                <select
                  value={novo.tipo}
                  onChange={e => setNovo(p => ({ ...p, tipo: e.target.value as TipoRequisito }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {TIPOS.filter(t => t.key !== 'TODOS').map(t => (
                    <option key={t.key} value={t.key}>{t.key} — {t.desc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prioridade</label>
                <select
                  value={novo.prioridade}
                  onChange={e => setNovo(p => ({ ...p, prioridade: e.target.value as PrioridadeRequisito }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={novo.titulo}
                  onChange={e => setNovo(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Frase imperativa descrevendo o requisito"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={novo.descricao}
                  onChange={e => setNovo(p => ({ ...p, descricao: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Critério de Aceitação</label>
                <textarea
                  rows={2}
                  value={novo.criterioAceitacao}
                  onChange={e => setNovo(p => ({ ...p, criterioAceitacao: e.target.value }))}
                  placeholder="O sistema deve..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setNovo(NOVO_INICIAL) }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button
                onClick={handleCriar}
                disabled={salvando || !novo.titulo.trim()}
                className="px-4 py-2 bg-[#0d1f3c] text-white text-sm rounded-lg hover:bg-[#1a3460] disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar Requisito'}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="font-medium">Nenhum requisito encontrado</p>
              <p className="text-xs mt-1">Use "Gerar com IA" ou crie manualmente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map(r => {
                const isEdit = editando === r.id
                const isExpanded = expandido.has(r.id)
                return (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3 p-4">
                      {/* Tipo + código */}
                      <div className="flex flex-col items-center gap-1 min-w-[56px]">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ring-1 ${tipoColor(r.tipo)}`}>{r.tipo}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{r.codigo}</span>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        {isEdit ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editValues.titulo ?? r.titulo}
                              onChange={e => setEditValues(p => ({ ...p, titulo: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <textarea
                              rows={3}
                              value={editValues.descricao ?? r.descricao ?? ''}
                              onChange={e => setEditValues(p => ({ ...p, descricao: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                              placeholder="Descrição"
                            />
                            <textarea
                              rows={2}
                              value={editValues.criterioAceitacao ?? r.criterioAceitacao ?? ''}
                              onChange={e => setEditValues(p => ({ ...p, criterioAceitacao: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                              placeholder="Critério de Aceitação"
                            />
                            <div className="flex items-center gap-3">
                              <select
                                value={editValues.prioridade ?? r.prioridade}
                                onChange={e => setEditValues(p => ({ ...p, prioridade: e.target.value as PrioridadeRequisito }))}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                              >
                                <option value="ALTA">Alta</option>
                                <option value="MEDIA">Média</option>
                                <option value="BAIXA">Baixa</option>
                              </select>
                              <select
                                value={editValues.status ?? r.status}
                                onChange={e => setEditValues(p => ({ ...p, status: e.target.value as StatusRequisito }))}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                              >
                                <option value="RASCUNHO">Rascunho</option>
                                <option value="RASCUNHO_IA">Rascunho IA</option>
                                <option value="EM_REVISAO">Em Revisão</option>
                                <option value="APROVADO">Aprovado</option>
                                <option value="PUBLICADO">Publicado</option>
                                <option value="OBSOLETO">Obsoleto</option>
                              </select>
                              <button onClick={() => handleSalvarEdicao(r.id)} disabled={salvando} className="px-3 py-1 bg-[#0d1f3c] text-white text-xs rounded-lg disabled:opacity-60">
                                {salvando ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button onClick={() => { setEditando(null); setEditValues({}) }} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900 leading-snug">{r.titulo}</p>
                            {isExpanded && (
                              <div className="mt-2 space-y-2">
                                {r.descricao && (
                                  <p className="text-sm text-gray-600 whitespace-pre-line">{r.descricao}</p>
                                )}
                                {r.criterioAceitacao && (
                                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-green-700 mb-1">Critério de Aceitação</p>
                                    <p className="text-xs text-green-800 whitespace-pre-line">{r.criterioAceitacao}</p>
                                  </div>
                                )}
                                {r.observacoes && (
                                  <p className="text-xs text-gray-500 italic">{r.observacoes}</p>
                                )}
                              </div>
                            )}
                            {(r.descricao || r.criterioAceitacao) && (
                              <button
                                onClick={() => toggleExpand(r.id)}
                                className="mt-1 text-xs text-blue-600 hover:underline"
                              >
                                {isExpanded ? 'Recolher' : 'Ver detalhes'}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Badges + ações */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <ScoreBadge
                            score={r.smartScore ?? null}
                            label="SMART"
                            detalhes={r.smartDetalhes}
                            onAvaliar={!isEdit ? () => handleAvaliarSmart(r.id) : undefined}
                            loading={loadingSmartId === r.id}
                          />
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${PRIORIDADE_COLORS[r.prioridade]}`}>
                            {r.prioridade}
                          </span>
                          {APPROVAL_STATUSES.has(r.status) ? (
                            <AprovacaoBadge
                              status={r.status as StatusAprovacao}
                              aprovadoPor={r.aprovadoPor}
                              aprovadoEm={r.aprovadoEm}
                            />
                          ) : (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>
                              {r.status}
                            </span>
                          )}
                          {r.fonte === 'IA' && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">IA</span>
                          )}
                          {!isEdit && (
                            <>
                              <button
                                onClick={() => { setEditando(r.id); setEditValues({}); setShowForm(false) }}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="Editar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleExcluir(r.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Excluir"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        {!isEdit && APPROVAL_STATUSES.has(r.status) && r.status !== 'PUBLICADO' && (
                          <div className="flex items-center gap-1.5">
                            {r.status === 'RASCUNHO_IA' && (
                              <button
                                onClick={() => handleRevisarReq(r.id)}
                                className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
                                aria-label="Abrir para revisão"
                              >
                                Abrir Revisão
                              </button>
                            )}
                            {r.status === 'EM_REVISAO' && (
                              <button
                                onClick={() => handleAprovarReq(r.id)}
                                className="rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-green-700"
                                aria-label="Aprovar"
                              >
                                Aprovar
                              </button>
                            )}
                            {r.status === 'APROVADO' && (
                              <button
                                onClick={() => handlePublicarReq(r.id)}
                                className="rounded-md bg-purple-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-purple-700"
                                aria-label="Publicar"
                              >
                                Publicar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
