import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  buscarConformidade,
  gerarConformidade,
  revisarConformidade,
  aprovarConformidade,
  publicarConformidade,
  buscarDemanda,
} from '../services/api'
import type { ConformidadeQualidade } from '../types/conformidade'
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

function safeParseObject<T>(json?: string): T | null {
  if (!json) return null
  try {
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as T) : null
  } catch {
    return null
  }
}

// ── Constantes ────────────────────────────────────────────────────────────────

type TabId = 'lgpd' | 'seguranca' | 'acessibilidade' | 'qualidade' | 'pendencias'

const TABS: { id: TabId; label: string }[] = [
  { id: 'lgpd',          label: 'LGPD' },
  { id: 'seguranca',     label: 'Seguranca' },
  { id: 'acessibilidade',label: 'Acessibilidade' },
  { id: 'qualidade',     label: 'Qualidade de Requisitos' },
  { id: 'pendencias',    label: 'Pendencias' },
]

// score color
function scoreColor(score?: number): string {
  if (score === undefined || score === null) return 'text-slate-400'
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function scoreRingColor(score?: number): string {
  if (score === undefined || score === null) return 'ring-slate-200 bg-slate-50'
  if (score >= 80) return 'ring-emerald-200 bg-emerald-50'
  if (score >= 60) return 'ring-amber-200 bg-amber-50'
  return 'ring-red-200 bg-red-50'
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

interface ItemConformidade {
  item?: string
  descricao?: string
  status?: string
  observacao?: string
  recomendacao?: string
}

function StatusChip({ value }: { value?: string }) {
  if (!value) return null
  const v = value.toUpperCase()
  const cls =
    v === 'CONFORME' || v === 'OK' || v === 'APROVADO'
      ? 'bg-emerald-100 text-emerald-700'
      : v === 'NAO_CONFORME' || v === 'CRITICO' || v === 'REPROVADO'
      ? 'bg-red-100 text-red-700'
      : v === 'PARCIAL' || v === 'ATENCAO' || v === 'PENDENTE'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {value}
    </span>
  )
}

function ItemList({ items, emptyMsg }: { items: ItemConformidade[]; emptyMsg: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400 italic">{emptyMsg}</p>
  }
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className="text-sm font-semibold text-slate-800">{it.item ?? it.descricao ?? `Item ${i + 1}`}</p>
            <StatusChip value={it.status} />
          </div>
          {it.descricao && it.item && (
            <p className="text-xs text-slate-600 mb-2">{it.descricao}</p>
          )}
          {it.observacao && (
            <p className="text-xs text-slate-500 italic">{it.observacao}</p>
          )}
          {it.recomendacao && (
            <div className="mt-2 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <p className="text-xs text-blue-700">{it.recomendacao}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PlainTextSection({ value, emptyMsg }: { value?: string; emptyMsg: string }) {
  if (!value) return <p className="text-sm text-slate-400 italic">{emptyMsg}</p>
  // Try to parse as array of items first
  const items = safeParseArray<ItemConformidade>(value)
  if (items.length > 0) {
    return <ItemList items={items} emptyMsg={emptyMsg} />
  }
  // Try object fallback
  const obj = safeParseObject<ItemConformidade>(value)
  if (obj) {
    return <ItemList items={[obj]} emptyMsg={emptyMsg} />
  }
  // Plain text
  return <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{value}</p>
}

// ── Pagina principal ─────────────────────────────────────────────────────────

export function ConformidadePage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [conf, setConf] = useState<ConformidadeQualidade | null>(null)
  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<TabId>('lgpd')

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, confResp] = await Promise.allSettled([
        buscarDemanda(demandaId),
        buscarConformidade(demandaId),
      ])
      if (demResp.status === 'fulfilled') setDemandaTitulo(demResp.value.data.titulo ?? '')
      if (confResp.status === 'fulfilled') setConf(confResp.value.data)
      else setConf(null)
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
      const r = await gerarConformidade(demandaId)
      setConf(r.data)
    } catch {
      setErro('Erro ao gerar analise de conformidade. Verifique a configuracao da chave OpenAI.')
    } finally {
      setGerando(false)
    }
  }

  const tabContent: Record<TabId, string | undefined> = {
    lgpd:           conf?.analiseLgpd,
    seguranca:      conf?.analiseSeguranca,
    acessibilidade: conf?.analiseAcessibilidade,
    qualidade:      conf?.qualidadeRequisitos,
    pendencias:     conf?.pendencias,
  }

  const tabEmptyMsg: Record<TabId, string> = {
    lgpd:           'Nenhuma analise LGPD disponivel',
    seguranca:      'Nenhuma analise de seguranca disponivel',
    acessibilidade: 'Nenhuma analise de acessibilidade disponivel',
    qualidade:      'Nenhuma analise de qualidade disponivel',
    pendencias:     'Nenhuma pendencia identificada',
  }

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
          {demandaTitulo || 'Conformidade e Qualidade'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded shrink-0">
          Modulo 12
        </span>
        {conf && (
          <AprovacaoBadge
            status={conf.statusAprovacao as StatusAprovacao}
            aprovadoPor={conf.aprovadoPor}
            aprovadoEm={conf.aprovadoEm}
          />
        )}
        {conf && conf.statusAprovacao !== 'PUBLICADO' && (
          <AprovacaoBotoes
            status={conf.statusAprovacao as StatusAprovacao}
            onRevisar={async () => { const r = await revisarConformidade(demandaId!); setConf(r.data) }}
            onAprovar={async () => { const r = await aprovarConformidade(demandaId!); setConf(r.data) }}
            onPublicar={async () => { const r = await publicarConformidade(demandaId!); setConf(r.data) }}
          />
        )}
        <button
          onClick={handleGerar}
          disabled={gerando}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors shrink-0"
          aria-label={gerando ? 'Gerando analise...' : 'Gerar analise com IA'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${gerando ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {gerando ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            )}
          </svg>
          {gerando ? 'Gerando...' : conf ? 'Regenerar com IA' : 'Gerar com IA'}
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
            Carregando conformidade...
          </div>
        ) : !conf ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-1">Analise de conformidade ainda nao gerada</p>
            <p className="text-slate-400 text-sm mb-5 max-w-sm">
              Clique em "Gerar com IA" para criar automaticamente a analise de LGPD, seguranca, acessibilidade e qualidade dos requisitos.
            </p>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {gerando ? 'Gerando...' : 'Gerar Conformidade com IA'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score Geral */}
            {conf.scoreGeral !== undefined && conf.scoreGeral !== null && (
              <div className={`border rounded-xl p-5 flex items-center gap-5 ring-1 ${scoreRingColor(conf.scoreGeral)}`}>
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-current shrink-0"
                  style={{ borderColor: conf.scoreGeral >= 80 ? '#059669' : conf.scoreGeral >= 60 ? '#d97706' : '#dc2626' }}
                >
                  <span className={`text-2xl font-bold ${scoreColor(conf.scoreGeral)}`}>
                    {conf.scoreGeral}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">/100</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-0.5">Score Geral de Conformidade</p>
                  <p className="text-xs text-slate-500">
                    {conf.scoreGeral >= 80
                      ? 'Projeto apresenta boa conformidade geral.'
                      : conf.scoreGeral >= 60
                      ? 'Conformidade parcial — ha pontos de atencao.'
                      : 'Conformidade insuficiente — revisao necessaria.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div
                className="flex border-b border-slate-200 overflow-x-auto"
                role="tablist"
                aria-label="Secoes de conformidade"
              >
                {TABS.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={abaAtiva === tab.id}
                    onClick={() => setAbaAtiva(tab.id)}
                  >
                    {tab.label}
                  </TabButton>
                ))}
              </div>

              <div className="p-5" role="tabpanel" aria-label={TABS.find((t) => t.id === abaAtiva)?.label}>
                <PlainTextSection
                  value={tabContent[abaAtiva]}
                  emptyMsg={tabEmptyMsg[abaAtiva]}
                />
              </div>
            </div>

            {/* Metadados */}
            <div className="text-xs text-slate-400 flex items-center gap-4 pb-2">
              <span>Criado em {new Date(conf.criadoEm).toLocaleDateString('pt-BR')}</span>
              <span>Atualizado em {new Date(conf.atualizadoEm).toLocaleDateString('pt-BR')}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">{conf.fonte}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
