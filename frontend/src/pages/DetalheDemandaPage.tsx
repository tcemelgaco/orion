import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { StatusBadge } from '../components/ui/StatusBadge'
import { PrioridadeBadge } from '../components/ui/PrioridadeBadge'
import { DemandaForm } from '../components/demandas/DemandaForm'
import { StakeholderModal } from '../components/demandas/StakeholderModal'
import {
  buscarDemanda, atualizarDemanda, excluirDemanda,
  adicionarStakeholder, removerStakeholder, buscarHistorico, criarEntrevista,
  exportarDocx, exportarPdf,
} from '../services/api'
import type {
  DemandaDetail, HistoricoItem, PageResponse,
  CriarDemandaPayload, AdicionarStakeholderPayload,
  PapelStakeholder, StatusDemanda,
} from '../types/demanda'

type Tab = 'dados' | 'stakeholders' | 'historico'

const papelLabel: Record<PapelStakeholder, string> = {
  PATROCINADOR: 'Patrocinador', GESTOR_DEMANDANTE: 'Gestor Demandante',
  USUARIO_FINAL: 'Usuário Final', ANALISTA_STI: 'Analista STI',
  DESENVOLVEDOR: 'Desenvolvedor', QA: 'QA', OUTRO: 'Outro',
}
const tipoLabel: Record<string, string> = {
  NOVO_SISTEMA: 'Novo Sistema', MELHORIA: 'Melhoria', CORRETIVA: 'Corretiva',
  INTEGRACAO: 'Integração', MODERNIZACAO: 'Modernização',
}
const transicoes: Record<StatusDemanda, StatusDemanda[]> = {
  RASCUNHO: ['EM_ANALISE', 'CANCELADA'],
  EM_ANALISE: ['APROVADA', 'CANCELADA'],
  APROVADA: ['EM_DESENVOLVIMENTO', 'CANCELADA'],
  EM_DESENVOLVIMENTO: ['CONCLUIDA', 'CANCELADA'],
  CONCLUIDA: [], CANCELADA: [],
}

const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
const fmtDT = (iso?: string) => iso ? new Date(iso).toLocaleString('pt-BR') : '—'

function Field({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</dt>
      <dd className="text-sm text-slate-800 leading-relaxed">
        {value || <span className="text-slate-300 italic">não informado</span>}
      </dd>
    </div>
  )
}

export function DetalheDemandaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [demanda, setDemanda] = useState<DemandaDetail | null>(null)
  const [historico, setHistorico] = useState<PageResponse<HistoricoItem> | null>(null)
  const [tab, setTab] = useState<Tab>('dados')
  const [editMode, setEditMode] = useState(false)
  const [showStakeholderModal, setShowStakeholderModal] = useState(false)
  const [removendoId, setRemovendoId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [exportando, setExportando] = useState<'docx' | 'pdf' | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    buscarDemanda(id).then((r) => setDemanda(r.data)).catch(() => setErro('Demanda não encontrada.')).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (tab === 'historico' && id && !historico)
      buscarHistorico(id).then((r) => setHistorico(r.data))
  }, [tab, id, historico])

  async function handleEditar(values: CriarDemandaPayload) {
    if (!id) return
    const r = await atualizarDemanda(id, values)
    setDemanda(r.data); setEditMode(false)
  }
  async function handleAlterarStatus(s: StatusDemanda) {
    if (!id) return
    setAlterandoStatus(true)
    try { const r = await atualizarDemanda(id, { status: s }); setDemanda(r.data); setHistorico(null) }
    catch { setErro('Erro ao alterar status.') }
    finally { setAlterandoStatus(false) }
  }
  async function handleExcluir() {
    if (!id) return
    try { await excluirDemanda(id); navigate('/demandas') }
    catch { setErro('Não é possível excluir demanda neste status.'); setConfirmDelete(false) }
  }
  async function handleAddStakeholder(payload: AdicionarStakeholderPayload) {
    if (!id) return
    const r = await adicionarStakeholder(id, payload); setDemanda(r.data)
  }
  async function handleRemoveStakeholder(sid: string) {
    if (!id) return
    setRemovendoId(sid)
    try { const r = await removerStakeholder(id, sid); setDemanda(r.data) }
    catch { setErro('Erro ao remover stakeholder.') }
    finally { setRemovendoId(null) }
  }
  async function handleIniciarEntrevista() {
    if (!id) return
    setIniciando(true)
    try { const r = await criarEntrevista(id); navigate(`/entrevistas/${r.data.id}`) }
    catch { setErro('Erro ao iniciar entrevista.'); setIniciando(false) }
  }
  async function handleExportar(tipo: 'docx' | 'pdf') {
    if (!id) return
    setExportando(tipo)
    setShowExportMenu(false)
    try {
      if (tipo === 'docx') await exportarDocx(id)
      else await exportarPdf(id)
    } catch { setErro(`Erro ao exportar ${tipo.toUpperCase()}.`) }
    finally { setExportando(null) }
  }

  if (loading) return (
    <AppLayout>
      <div className="flex h-full items-center justify-center py-40 text-slate-400">
        <svg className="animate-spin w-6 h-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Carregando…
      </div>
    </AppLayout>
  )
  if (erro && !demanda) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="text-red-500 mb-3">{erro}</p>
        <button onClick={() => navigate('/demandas')} className="text-blue-600 text-sm hover:underline">← Voltar</button>
      </div>
    </AppLayout>
  )
  if (!demanda) return null

  const proximo = transicoes[demanda.status]

  return (
    <AppLayout>
      {/* Sticky page header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/demandas')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Demandas
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700 truncate flex-1">{demanda.titulo}</span>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigate(`/demandas/${id}/canvas`)}
            className="flex items-center gap-1 px-3 py-1.5 border border-teal-200 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Canvas
          </button>
          <button onClick={() => navigate(`/demandas/${id}/requisitos`)}
            className="flex items-center gap-1 px-3 py-1.5 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Requisitos
          </button>
          <button onClick={() => navigate(`/demandas/${id}/backlog`)}
            className="flex items-center gap-1 px-3 py-1.5 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Backlog
          </button>
          <button onClick={() => navigate(`/demandas/${id}/artefatos`)}
            className="flex items-center gap-1 px-3 py-1.5 border border-orange-200 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Artefatos
          </button>
          <button onClick={handleIniciarEntrevista} disabled={iniciando}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {iniciando ? 'Iniciando…' : 'Iniciar Entrevista'}
          </button>
          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(v => !v)}
              disabled={exportando !== null}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {exportando ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              )}
              {exportando ? `Exportando ${exportando.toUpperCase()}…` : 'Exportar'}
              {!exportando && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[140px] overflow-hidden">
                <button onClick={() => handleExportar('docx')}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Exportar DOCX
                </button>
                <button onClick={() => handleExportar('pdf')}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Exportar PDF
                </button>
              </div>
            )}
          </div>
          <button onClick={() => { setEditMode(true); setTab('dados') }}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Editar
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
            </svg>
            Excluir
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Error banner */}
        {erro && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between">
            {erro}
            <button onClick={() => setErro('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {/* Info row — full width, 4 panels */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</span>
            <div className="mt-1"><StatusBadge status={demanda.status} /></div>
            {proximo.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Avançar para:</span>
                <div className="flex flex-wrap gap-1">
                  {proximo.map((s) => (
                    <button key={s} onClick={() => handleAlterarStatus(s)} disabled={alterandoStatus}
                      className="text-[11px] px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                      {alterandoStatus ? '…' : s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prioridade</span>
            <div className="mt-1"><PrioridadeBadge prioridade={demanda.prioridade} /></div>
            <span className="text-xs text-slate-400 mt-1">{tipoLabel[demanda.tipo] ?? demanda.tipo}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prazo Estimado</span>
            <span className="text-lg font-semibold text-slate-800 mt-1">{fmt(demanda.prazoEstimado)}</span>
            <span className="text-xs text-slate-400">Criada em {fmt(demanda.criadoEm)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col gap-1 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Stakeholders</span>
            <span className="text-3xl font-bold text-blue-600 mt-1">{demanda.stakeholders.length}</span>
            <button onClick={() => setTab('stakeholders')}
              className="text-xs text-blue-500 hover:underline text-left mt-1">Ver todos →</button>
          </div>
        </div>

        {/* Title card */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{demanda.titulo}</h1>
          {demanda.descricao && <p className="text-slate-500 text-sm mt-2 leading-relaxed">{demanda.descricao}</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-slate-400">
            <span>{demanda.areaDemandante}</span>
            <span>Solicitante: {demanda.nomeSolicitante || demanda.matriculaSolicitante}</span>
            {demanda.criadoPor && <span>Criado por: {demanda.criadoPor}</span>}
            <span>Versão {demanda.versao}</span>
          </div>
        </div>

        {/* Tabs + content */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-4">
            {(['dados', 'stakeholders', 'historico'] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setEditMode(false) }}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}>
                {t === 'dados' && 'Dados Gerais'}
                {t === 'stakeholders' && <>Stakeholders{demanda.stakeholders.length > 0 && <span className="ml-1.5 text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">{demanda.stakeholders.length}</span>}</>}
                {t === 'historico' && 'Histórico'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Dados — view */}
            {tab === 'dados' && !editMode && (
              <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
                <Field label="Matrícula Solicitante" value={demanda.matriculaSolicitante} />
                <Field label="Nome Solicitante" value={demanda.nomeSolicitante} />
                <Field label="Área Demandante" value={demanda.areaDemandante} />
                <Field label="Tipo" value={tipoLabel[demanda.tipo] ?? demanda.tipo} />
                <Field label="Prazo Estimado" value={fmt(demanda.prazoEstimado)} />
                <Field label="Criada em" value={fmtDT(demanda.criadoEm)} />
                <Field label="Atualizada em" value={fmtDT(demanda.atualizadoEm)} />
                <Field label="Versão" value={String(demanda.versao)} />
                {demanda.premissas && <Field label="Premissas" value={demanda.premissas} wide />}
                {demanda.restricoes && <Field label="Restrições" value={demanda.restricoes} wide />}
                {demanda.observacoes && <Field label="Observações" value={demanda.observacoes} wide />}
              </dl>
            )}

            {/* Dados — edit */}
            {tab === 'dados' && editMode && (
              <DemandaForm
                initialValues={{
                  titulo: demanda.titulo, descricao: demanda.descricao,
                  areaDemandante: demanda.areaDemandante, tipo: demanda.tipo,
                  prioridade: demanda.prioridade,
                  prazoEstimado: demanda.prazoEstimado?.split('T')[0],
                  matriculaSolicitante: demanda.matriculaSolicitante,
                  nomeSolicitante: demanda.nomeSolicitante,
                  premissas: demanda.premissas, restricoes: demanda.restricoes,
                  observacoes: demanda.observacoes,
                }}
                onSubmit={handleEditar}
                onCancel={() => setEditMode(false)}
                submitLabel="Salvar Alterações"
              />
            )}

            {/* Stakeholders */}
            {tab === 'stakeholders' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-slate-500">
                    {demanda.stakeholders.length === 0 ? 'Nenhum stakeholder cadastrado' : `${demanda.stakeholders.length} stakeholder${demanda.stakeholders.length !== 1 ? 's' : ''}`}
                  </p>
                  <button onClick={() => setShowStakeholderModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Adicionar
                  </button>
                </div>
                {demanda.stakeholders.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">Adicione os envolvidos nesta demanda.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {demanda.stakeholders.map((s) => (
                      <div key={s.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                          {s.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{s.nome}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{papelLabel[s.papel] ?? s.papel}</p>
                          {s.matricula && <p className="text-xs text-slate-400">Mat. {s.matricula}</p>}
                          {s.area && <p className="text-xs text-slate-400 truncate">{s.area}</p>}
                          {s.contato && <p className="text-xs text-slate-400 truncate">{s.contato}</p>}
                        </div>
                        <button onClick={() => handleRemoveStakeholder(s.id)} disabled={removendoId === s.id}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 disabled:opacity-30 transition-all"
                          aria-label="Remover">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Histórico */}
            {tab === 'historico' && (
              <div>
                {!historico ? (
                  <div className="py-8 text-center text-slate-400 text-sm">Carregando histórico…</div>
                ) : historico.content.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">Nenhum registro no histórico.</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {historico.content.map((h) => (
                      <div key={h.id} className="flex gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">{h.acao}</p>
                            <time className="text-[11px] text-slate-400 shrink-0">{fmtDT(h.alteradoEm)}</time>
                          </div>
                          <p className="text-sm text-slate-600 mt-0.5">{h.descricaoAlteracao}</p>
                          {h.statusAnterior && h.statusNovo && (
                            <p className="text-xs text-slate-400 mt-1">{h.statusAnterior} → {h.statusNovo}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">por {h.alteradoPor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showStakeholderModal && (
        <StakeholderModal onClose={() => setShowStakeholderModal(false)} onSalvar={handleAddStakeholder} />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Confirmar Exclusão</h2>
            <p className="text-sm text-slate-600 mb-5">
              Excluir <strong>"{demanda.titulo}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={handleExcluir} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
