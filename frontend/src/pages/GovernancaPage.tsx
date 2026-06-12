import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  buscarGovernanca,
  gerarGovernanca,
  revisarGovernanca,
  aprovarGovernanca,
  publicarGovernanca,
  buscarDemanda,
} from '../services/api'
import type {
  GovernancaProjeto,
  RaciItem,
  StakeholderMapeado,
  Risco,
  MitigacaoRisco,
  DependenciaExterna,
} from '../types/governanca'
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

// ── Constantes ────────────────────────────────────────────────────────────────

type TabId = 'raci' | 'stakeholders' | 'riscos' | 'mitigacao' | 'dependencias'

const TABS: { id: TabId; label: string }[] = [
  { id: 'raci', label: 'Matriz RACI' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'riscos', label: 'Riscos' },
  { id: 'mitigacao', label: 'Plano de Mitigacao' },
  { id: 'dependencias', label: 'Dependencias' },
]

const NIVEL_COLOR: Record<string, string> = {
  ALTA:  'bg-red-100 text-red-700 ring-red-300',
  MEDIA: 'bg-amber-100 text-amber-700 ring-amber-300',
  BAIXA: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
  alta:  'bg-red-100 text-red-700 ring-red-300',
  media: 'bg-amber-100 text-amber-700 ring-amber-300',
  baixa: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
}

function nivelBadge(valor: string) {
  return NIVEL_COLOR[valor] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
}

function barColor(nivel: string): string {
  const n = nivel.toUpperCase()
  if (n === 'ALTA' || n === 'ALTO') return 'bg-red-500'
  if (n === 'MEDIA' || n === 'MEDIO') return 'bg-amber-400'
  return 'bg-emerald-500'
}

function nivelToWidth(nivel: string): string {
  const n = nivel.toUpperCase()
  if (n === 'ALTA' || n === 'ALTO') return 'w-full'
  if (n === 'MEDIA' || n === 'MEDIO') return 'w-2/3'
  return 'w-1/3'
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

function RaciTable({ items }: { items: RaciItem[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400 italic">Nenhuma atividade na matriz</p>

  function Cell({ value, variant }: { value: string; variant: string }) {
    const colors: Record<string, string> = {
      R: 'bg-blue-100 text-blue-800 font-bold',
      A: 'bg-amber-100 text-amber-800 font-bold',
      C: 'bg-emerald-100 text-emerald-800',
      I: 'bg-slate-100 text-slate-600',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${colors[variant] ?? 'text-slate-600'}`}>
        <span className="font-semibold mr-1">{variant}</span> {value}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Atividade</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-blue-600">R — Responsavel</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-amber-600">A — Aprovador</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-emerald-600">C — Consultado</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">I — Informado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-medium text-slate-800">{row.atividade}</td>
              <td className="py-2.5 px-3"><Cell value={row.responsavel} variant="R" /></td>
              <td className="py-2.5 px-3"><Cell value={row.aprovador} variant="A" /></td>
              <td className="py-2.5 px-3"><Cell value={row.consultado} variant="C" /></td>
              <td className="py-2.5 px-3"><Cell value={row.informado} variant="I" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StakeholdersGrid({ items }: { items: StakeholderMapeado[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400 italic">Nenhum stakeholder mapeado</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((s, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-slate-800 text-sm">{s.nome}</p>
              <p className="text-xs text-slate-500">{s.papel} — {s.area}</p>
            </div>
          </div>
          {s.interesse && (
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">{s.interesse}</p>
          )}
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Influencia</span>
                <span className="text-[11px] text-slate-500">{s.influencia}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor(s.influencia)} ${nivelToWidth(s.influencia)}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Engajamento</span>
                <span className="text-[11px] text-slate-500">{s.engajamento}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor(s.engajamento)} ${nivelToWidth(s.engajamento)}`} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RiscosTable({ items }: { items: Risco[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400 italic">Nenhum risco identificado</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">ID</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descricao</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Probabilidade</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Impacto</th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{r.id}</td>
              <td className="py-2.5 px-3 text-slate-700">{r.descricao}</td>
              <td className="py-2.5 px-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${nivelBadge(r.probabilidade)}`}>
                  {r.probabilidade}
                </span>
              </td>
              <td className="py-2.5 px-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${nivelBadge(r.impacto)}`}>
                  {r.impacto}
                </span>
              </td>
              <td className="py-2.5 px-3 text-slate-600">{r.categoria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MitigacaoGrid({ items }: { items: MitigacaoRisco[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400 italic">Nenhum plano de mitigacao definido</p>

  return (
    <div className="space-y-3">
      {items.map((m, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Risco {m.riscoId}</span>
            <span className="text-xs text-slate-500">Responsavel: <strong className="text-slate-700">{m.responsavel}</strong></span>
          </div>
          <p className="text-sm font-medium text-slate-800 mb-2">{m.estrategia}</p>
          {m.acoes && m.acoes.length > 0 && (
            <ul className="space-y-1">
              {m.acoes.map((acao, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {acao}
                </li>
              ))}
            </ul>
          )}
          {m.prazo && (
            <p className="text-xs text-slate-400 mt-2">Prazo: {m.prazo}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function DependenciasGrid({ items }: { items: DependenciaExterna[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400 italic">Nenhuma dependencia externa mapeada</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((d, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold text-slate-800 text-sm">{d.sistema}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{d.tipo}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ring-1 ${nivelBadge(d.criticidade)}`}>
                {d.criticidade}
              </span>
            </div>
          </div>
          {d.descricao && <p className="text-xs text-slate-600 mb-2">{d.descricao}</p>}
          {d.responsavel && <p className="text-xs text-slate-400">Responsavel: <span className="text-slate-600">{d.responsavel}</span></p>}
        </div>
      ))}
    </div>
  )
}

// ── Pagina principal ─────────────────────────────────────────────────────────

export function GovernancaPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [gov, setGov] = useState<GovernancaProjeto | null>(null)
  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<TabId>('raci')

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, govResp] = await Promise.allSettled([
        buscarDemanda(demandaId),
        buscarGovernanca(demandaId),
      ])
      if (demResp.status === 'fulfilled') setDemandaTitulo(demResp.value.data.titulo ?? '')
      if (govResp.status === 'fulfilled') setGov(govResp.value.data)
      else setGov(null)
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
      const r = await gerarGovernanca(demandaId)
      setGov(r.data)
    } catch {
      setErro('Erro ao gerar governanca. Verifique a configuracao da chave OpenAI.')
    } finally {
      setGerando(false)
    }
  }

  const raciItems = safeParseArray<RaciItem>(gov?.matrizRaci)
  const stakeholders = safeParseArray<StakeholderMapeado>(gov?.stakeholdersMapeados)
  const riscos = safeParseArray<Risco>(gov?.riscos)
  const mitigacao = safeParseArray<MitigacaoRisco>(gov?.planoMitigacao)
  const dependencias = safeParseArray<DependenciaExterna>(gov?.dependenciasExternas)

  const contagemPorAba: Record<TabId, number> = {
    raci: raciItems.length,
    stakeholders: stakeholders.length,
    riscos: riscos.length,
    mitigacao: mitigacao.length,
    dependencias: dependencias.length,
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
          {demandaTitulo || 'Governanca do Projeto'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded shrink-0">
          Modulo 11
        </span>
        {gov && (
          <AprovacaoBadge
            status={gov.statusAprovacao as StatusAprovacao}
            aprovadoPor={gov.aprovadoPor}
            aprovadoEm={gov.aprovadoEm}
          />
        )}
        {gov && gov.statusAprovacao !== 'PUBLICADO' && (
          <AprovacaoBotoes
            status={gov.statusAprovacao as StatusAprovacao}
            onRevisar={async () => { const r = await revisarGovernanca(demandaId!); setGov(r.data) }}
            onAprovar={async () => { const r = await aprovarGovernanca(demandaId!); setGov(r.data) }}
            onPublicar={async () => { const r = await publicarGovernanca(demandaId!); setGov(r.data) }}
          />
        )}
        <button
          onClick={handleGerar}
          disabled={gerando}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors shrink-0"
          aria-label={gerando ? 'Gerando governanca...' : 'Gerar governanca com IA'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${gerando ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {gerando ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            )}
          </svg>
          {gerando ? 'Gerando...' : gov ? 'Regenerar com IA' : 'Gerar com IA'}
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
            Carregando governanca...
          </div>
        ) : !gov ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-1">Governanca ainda nao gerada</p>
            <p className="text-slate-400 text-sm mb-5 max-w-sm">
              Clique em "Gerar com IA" para criar automaticamente a matriz RACI, stakeholders e plano de riscos.
            </p>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {gerando ? 'Gerando...' : 'Gerar Governanca com IA'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div
                className="flex border-b border-slate-200 overflow-x-auto"
                role="tablist"
                aria-label="Secoes de governanca"
              >
                {TABS.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={abaAtiva === tab.id}
                    onClick={() => setAbaAtiva(tab.id)}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-[11px] rounded-full px-1.5 py-0.5 ${
                      abaAtiva === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {contagemPorAba[tab.id]}
                    </span>
                  </TabButton>
                ))}
              </div>

              <div className="p-5" role="tabpanel" aria-label={TABS.find((t) => t.id === abaAtiva)?.label}>
                {abaAtiva === 'raci' && <RaciTable items={raciItems} />}
                {abaAtiva === 'stakeholders' && <StakeholdersGrid items={stakeholders} />}
                {abaAtiva === 'riscos' && <RiscosTable items={riscos} />}
                {abaAtiva === 'mitigacao' && <MitigacaoGrid items={mitigacao} />}
                {abaAtiva === 'dependencias' && <DependenciasGrid items={dependencias} />}
              </div>
            </div>

            {/* Metadados */}
            <div className="text-xs text-slate-400 flex items-center gap-4 pb-2">
              <span>Criado em {new Date(gov.criadoEm).toLocaleDateString('pt-BR')}</span>
              <span>Atualizado em {new Date(gov.atualizadoEm).toLocaleDateString('pt-BR')}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">{gov.fonte}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
