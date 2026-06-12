import { useState, useEffect, useCallback, type MouseEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { listarBacklog, gerarBacklog, atualizarHistoria, excluirHistoria, buscarDemanda, revisarEpico, aprovarEpico, publicarEpico, avaliarInvestHistoria } from '../services/api'
import type { Epico, HistoriaUsuario, StatusHistoria, PrioridadeBacklog, AtualizarHistoriaPayload } from '../types/backlog'
import { AprovacaoBadge } from '../components/ui/AprovacaoBadge'
import { ScoreBadge } from '../components/ui/ScoreBadge'
import type { StatusAprovacao } from '../types/canvas'

const PRIORIDADE_COLORS: Record<PrioridadeBacklog, string> = {
  ALTA:  'bg-red-100 text-red-700 ring-red-200',
  MEDIA: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  BAIXA: 'bg-green-100 text-green-700 ring-green-200',
}

const STATUS_HISTORIA: Record<StatusHistoria, { label: string; color: string }> = {
  BACKLOG:      { label: 'Backlog',      color: 'bg-gray-100 text-gray-600' },
  PRONTO:       { label: 'Pronto',       color: 'bg-blue-100 text-blue-700' },
  EM_ANDAMENTO: { label: 'Em Andamento', color: 'bg-amber-100 text-amber-700' },
  CONCLUIDO:    { label: 'Concluído',    color: 'bg-green-100 text-green-700' },
  CANCELADO:    { label: 'Cancelado',    color: 'bg-red-50 text-red-400' },
}

const SP_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-emerald-100 text-emerald-700',
  3: 'bg-blue-100 text-blue-700',
  5: 'bg-indigo-100 text-indigo-700',
  8: 'bg-amber-100 text-amber-700',
  13: 'bg-red-100 text-red-700',
}

function spColor(sp: number | null) {
  if (!sp) return 'bg-gray-100 text-gray-500'
  return SP_COLORS[sp] ?? 'bg-gray-100 text-gray-500'
}

function totalSP(epicos: Epico[]) {
  return epicos.flatMap(e => e.features).flatMap(f => f.historias)
    .reduce((acc, h) => acc + (h.storyPoints ?? 0), 0)
}

function countHistorias(epico: Epico) {
  return epico.features.reduce((acc, f) => acc + f.historias.length, 0)
}

interface EditState {
  comoPapel: string
  queroAcao: string
  paraBeneficio: string
  criteriosAceitacao: string
  storyPoints: string
  prioridade: PrioridadeBacklog
  status: StatusHistoria
}

export function BacklogPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [epicos, setEpicos] = useState<Epico[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [expandedEpicos, setExpandedEpicos] = useState<Set<string>>(new Set())
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const [expandedHistorias, setExpandedHistorias] = useState<Set<string>>(new Set())
  const [editandoHistoria, setEditandoHistoria] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<EditState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [loadingInvestId, setLoadingInvestId] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, backResp] = await Promise.all([
        buscarDemanda(demandaId),
        listarBacklog(demandaId),
      ])
      setDemandaTitulo(demResp.data.titulo)
      const data: Epico[] = backResp.data
      setEpicos(data)
      // expand all epics and features by default when first loaded
      if (data.length > 0) {
        setExpandedEpicos(new Set(data.map(e => e.id)))
        setExpandedFeatures(new Set(data.flatMap(e => e.features.map(f => f.id))))
      }
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
      const resp = await gerarBacklog(demandaId)
      const data: Epico[] = resp.data
      setEpicos(data)
      setExpandedEpicos(new Set(data.map(e => e.id)))
      setExpandedFeatures(new Set(data.flatMap(e => e.features.map(f => f.id))))
    } finally {
      setGerando(false)
    }
  }

  const handleEditarHistoria = (h: HistoriaUsuario) => {
    setEditandoHistoria(h.id)
    setEditValues({
      comoPapel: h.comoPapel,
      queroAcao: h.queroAcao,
      paraBeneficio: h.paraBeneficio ?? '',
      criteriosAceitacao: h.criteriosAceitacao ?? '',
      storyPoints: String(h.storyPoints ?? ''),
      prioridade: h.prioridade,
      status: h.status,
    })
  }

  const handleSalvarHistoria = async (id: string) => {
    if (!editValues) return
    setSalvando(true)
    try {
      const payload: AtualizarHistoriaPayload = {
        comoPapel: editValues.comoPapel || undefined,
        queroAcao: editValues.queroAcao || undefined,
        paraBeneficio: editValues.paraBeneficio || undefined,
        criteriosAceitacao: editValues.criteriosAceitacao || undefined,
        storyPoints: editValues.storyPoints ? parseInt(editValues.storyPoints) : undefined,
        prioridade: editValues.prioridade,
        status: editValues.status,
      }
      await atualizarHistoria(id, payload)
      await carregar()
      setEditandoHistoria(null)
      setEditValues(null)
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluirHistoria = async (id: string) => {
    if (!confirm('Excluir esta história de usuário?')) return
    await excluirHistoria(id)
    await carregar()
  }

  const handleRevisarEpico = async (e: MouseEvent, id: string) => {
    e.stopPropagation()
    await revisarEpico(id)
    await carregar()
  }

  const handleAprovarEpico = async (e: MouseEvent, id: string) => {
    e.stopPropagation()
    await aprovarEpico(id)
    await carregar()
  }

  const handlePublicarEpico = async (e: MouseEvent, id: string) => {
    e.stopPropagation()
    await publicarEpico(id)
    await carregar()
  }

  const handleAvaliarInvest = async (id: string) => {
    setLoadingInvestId(id)
    try {
      await avaliarInvestHistoria(id)
      await carregar()
    } finally {
      setLoadingInvestId(null)
    }
  }

  const toggleEpico = (id: string) => setExpandedEpicos(prev => {
    const next = new Set(prev)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    return next
  })

  const toggleFeature = (id: string) => setExpandedFeatures(prev => {
    const next = new Set(prev)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    return next
  })

  const toggleHistoria = (id: string) => setExpandedHistorias(prev => {
    const next = new Set(prev)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    return next
  })

  const sp = totalSP(epicos)

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
                <span className="text-gray-900 font-medium">Backlog</span>
              </nav>
              <h1 className="text-xl font-bold text-gray-900">Histórias de Usuário e Backlog</h1>
            </div>
            <div className="flex items-center gap-3">
              {sp > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="text-xs text-indigo-600 font-medium">{sp} story points</span>
                  <span className="text-xs text-indigo-400">·</span>
                  <span className="text-xs text-indigo-500">{epicos.length} épicos</span>
                </div>
              )}
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
                    {epicos.length > 0 ? 'Regenerar com IA' : 'Gerar com IA'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
          ) : epicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="font-medium">Nenhum backlog gerado</p>
              <p className="text-xs mt-1">Use "Gerar com IA" para criar épicos, features e histórias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {epicos.map(epico => (
                <div key={epico.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Épico header */}
                  <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleEpico(epico.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <div className={`transition-transform shrink-0 ${expandedEpicos.has(epico.id) ? 'rotate-90' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full ring-1 ring-violet-200 shrink-0">{epico.codigo}</span>
                      <span className="font-semibold text-gray-900 text-sm flex-1 truncate">{epico.titulo}</span>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${PRIORIDADE_COLORS[epico.prioridade]}`}>{epico.prioridade}</span>
                      {epico.statusAprovacao ? (
                        <AprovacaoBadge
                          status={epico.statusAprovacao as StatusAprovacao}
                          aprovadoPor={epico.aprovadoPor}
                          aprovadoEm={epico.aprovadoEm}
                        />
                      ) : null}
                      <span className="text-xs text-gray-400">{epico.features.length} features · {countHistorias(epico)} US</span>
                      {epico.fonte === 'IA' && <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">IA</span>}
                      {epico.statusAprovacao === 'RASCUNHO_IA' && (
                        <button onClick={e => handleRevisarEpico(e, epico.id)}
                          className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700">
                          Abrir Revisão
                        </button>
                      )}
                      {epico.statusAprovacao === 'EM_REVISAO' && (
                        <button onClick={e => handleAprovarEpico(e, epico.id)}
                          className="rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-green-700">
                          Aprovar
                        </button>
                      )}
                      {epico.statusAprovacao === 'APROVADO' && (
                        <button onClick={e => handlePublicarEpico(e, epico.id)}
                          className="rounded-md bg-purple-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-purple-700">
                          Publicar
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedEpicos.has(epico.id) && (
                    <div className="border-t border-gray-100">
                      {epico.descricao && (
                        <p className="text-xs text-gray-500 px-5 py-2 bg-violet-50/30 italic">{epico.descricao}</p>
                      )}
                      <div className="divide-y divide-gray-100">
                        {epico.features.map(feature => (
                          <div key={feature.id}>
                            {/* Feature header */}
                            <button
                              onClick={() => toggleFeature(feature.id)}
                              className="w-full flex items-center gap-3 px-5 pl-10 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className={`transition-transform ${expandedFeatures.has(feature.id) ? 'rotate-90' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                              </div>
                              <span className="text-[11px] font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full ring-1 ring-cyan-200 shrink-0">{feature.codigo}</span>
                              <span className="text-sm text-gray-800 font-medium flex-1">{feature.titulo}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 shrink-0 ${PRIORIDADE_COLORS[feature.prioridade]}`}>{feature.prioridade}</span>
                              <span className="text-xs text-gray-400 shrink-0">{feature.historias.length} US</span>
                            </button>

                            {expandedFeatures.has(feature.id) && (
                              <div>
                                {feature.descricao && (
                                  <p className="text-xs text-gray-400 px-5 pl-16 py-1.5 italic">{feature.descricao}</p>
                                )}
                                <div className="divide-y divide-gray-50">
                                  {feature.historias.map(historia => {
                                    const isEdit = editandoHistoria === historia.id
                                    const isExpanded = expandedHistorias.has(historia.id)
                                    return (
                                      <div key={historia.id} className="pl-16 pr-5 py-3 hover:bg-gray-50/50">
                                        {isEdit && editValues ? (
                                          <div className="space-y-3 bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                              <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Como (papel)</label>
                                                <input type="text" value={editValues.comoPapel}
                                                  onChange={e => setEditValues(p => p && ({ ...p, comoPapel: e.target.value }))}
                                                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Quero (ação)</label>
                                                <input type="text" value={editValues.queroAcao}
                                                  onChange={e => setEditValues(p => p && ({ ...p, queroAcao: e.target.value }))}
                                                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Para (benefício)</label>
                                                <input type="text" value={editValues.paraBeneficio}
                                                  onChange={e => setEditValues(p => p && ({ ...p, paraBeneficio: e.target.value }))}
                                                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                                              </div>
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-500 mb-1">Critérios de Aceitação</label>
                                              <textarea rows={3} value={editValues.criteriosAceitacao}
                                                onChange={e => setEditValues(p => p && ({ ...p, criteriosAceitacao: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <select value={editValues.storyPoints}
                                                onChange={e => setEditValues(p => p && ({ ...p, storyPoints: e.target.value }))}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
                                                <option value="">SP</option>
                                                {[1,2,3,5,8,13].map(n => <option key={n} value={n}>{n}</option>)}
                                              </select>
                                              <select value={editValues.prioridade}
                                                onChange={e => setEditValues(p => p && ({ ...p, prioridade: e.target.value as PrioridadeBacklog }))}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
                                                <option value="ALTA">Alta</option>
                                                <option value="MEDIA">Média</option>
                                                <option value="BAIXA">Baixa</option>
                                              </select>
                                              <select value={editValues.status}
                                                onChange={e => setEditValues(p => p && ({ ...p, status: e.target.value as StatusHistoria }))}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
                                                <option value="BACKLOG">Backlog</option>
                                                <option value="PRONTO">Pronto</option>
                                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                                <option value="CONCLUIDO">Concluído</option>
                                                <option value="CANCELADO">Cancelado</option>
                                              </select>
                                              <button onClick={() => handleSalvarHistoria(historia.id)} disabled={salvando}
                                                className="px-3 py-1 bg-[#0d1f3c] text-white text-xs rounded-lg disabled:opacity-60">
                                                {salvando ? 'Salvando...' : 'Salvar'}
                                              </button>
                                              <button onClick={() => { setEditandoHistoria(null); setEditValues(null) }}
                                                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">
                                                Cancelar
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-start gap-3">
                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded ring-1 ring-emerald-200 shrink-0 font-mono mt-0.5">{historia.codigo}</span>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm text-gray-800">
                                                <span className="text-gray-400">Como </span>
                                                <span className="font-medium text-gray-900">{historia.comoPapel}</span>
                                                <span className="text-gray-400">, quero </span>
                                                <span className="text-gray-800">{historia.queroAcao}</span>
                                                {historia.paraBeneficio && (
                                                  <>
                                                    <span className="text-gray-400">, para </span>
                                                    <span className="text-gray-600">{historia.paraBeneficio}</span>
                                                  </>
                                                )}
                                              </p>
                                              {isExpanded && historia.criteriosAceitacao && (
                                                <div className="mt-2 bg-green-50 border border-green-100 rounded-lg p-3">
                                                  <p className="text-xs font-semibold text-green-700 mb-1">Critérios de Aceitação</p>
                                                  <p className="text-xs text-green-800 whitespace-pre-line">{historia.criteriosAceitacao}</p>
                                                </div>
                                              )}
                                              {historia.criteriosAceitacao && (
                                                <button onClick={() => toggleHistoria(historia.id)}
                                                  className="mt-1 text-xs text-blue-500 hover:underline">
                                                  {isExpanded ? 'Recolher' : 'Ver critérios'}
                                                </button>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                              <ScoreBadge
                                                score={historia.investScore ?? null}
                                                label="INVEST"
                                                detalhes={historia.investDetalhes}
                                                onAvaliar={() => handleAvaliarInvest(historia.id)}
                                                loading={loadingInvestId === historia.id}
                                              />
                                              {historia.storyPoints != null && (
                                                <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${spColor(historia.storyPoints)}`}>
                                                  {historia.storyPoints}
                                                </span>
                                              )}
                                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ring-1 ${PRIORIDADE_COLORS[historia.prioridade]}`}>{historia.prioridade}</span>
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_HISTORIA[historia.status].color}`}>{STATUS_HISTORIA[historia.status].label}</span>
                                              {historia.fonte === 'IA' && <span className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">IA</span>}
                                              <button onClick={() => handleEditarHistoria(historia)}
                                                className="p-1 text-gray-300 hover:text-blue-600 rounded" title="Editar">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                </svg>
                                              </button>
                                              <button onClick={() => handleExcluirHistoria(historia.id)}
                                                className="p-1 text-gray-300 hover:text-red-500 rounded" title="Excluir">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
