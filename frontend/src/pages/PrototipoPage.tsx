import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  buscarPrototipo,
  gerarPrototipo,
  revisarPrototipo,
  aprovarPrototipo,
  publicarPrototipo,
  buscarDemanda,
} from '../services/api'
import type { PrototipoSistema, Tela, ComponentePrincipal, TecnologiaSugerida, FluxoNavegacao, StatusPrototipo } from '../types/prototipo'

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeParseArray<T>(json?: string): T[] {
  if (!json) return []
  try { const p = JSON.parse(json); return Array.isArray(p) ? p : [] }
  catch { return [] }
}

function safeParseObject<T extends Record<string, unknown>>(json?: string): T | null {
  if (!json) return null
  try { const p = JSON.parse(json); return p && typeof p === 'object' && !Array.isArray(p) ? (p as T) : null }
  catch { return null }
}

// ── Constantes visuais ────────────────────────────────────────────────────────

const STATUS_CHIP: Record<StatusPrototipo, string> = {
  RASCUNHO_IA: 'bg-amber-100 text-amber-700',
  EM_REVISAO:  'bg-sky-100 text-sky-700',
  APROVADO:    'bg-emerald-100 text-emerald-700',
  PUBLICADO:   'bg-violet-100 text-violet-700',
}

const STATUS_LABEL: Record<StatusPrototipo, string> = {
  RASCUNHO_IA: 'Rascunho IA',
  EM_REVISAO:  'Em Revisão',
  APROVADO:    'Aprovado',
  PUBLICADO:   'Publicado',
}

type TabId = 'visao-geral' | 'telas' | 'fluxo' | 'componentes' | 'acessibilidade'

const TABS: { id: TabId; label: string }[] = [
  { id: 'visao-geral',    label: 'Visão Geral' },
  { id: 'telas',          label: 'Telas' },
  { id: 'fluxo',          label: 'Fluxo' },
  { id: 'componentes',    label: 'Componentes' },
  { id: 'acessibilidade', label: 'Acessibilidade' },
]

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-700 mb-3">{children}</h3>
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400 italic">{children}</p>
}

function TelaCard({ tela }: { tela: Tela }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors">
      <p className="text-sm font-semibold text-slate-800 mb-1">{tela.nome}</p>
      {tela.descricao && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{tela.descricao}</p>
      )}
      {tela.elementos && tela.elementos.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Elementos</p>
          <ul className="space-y-0.5">
            {tela.elementos.map((el, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                {el}
              </li>
            ))}
          </ul>
        </div>
      )}
      {tela.acoes && tela.acoes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Ações</p>
          <div className="flex flex-wrap gap-1">
            {tela.acoes.map((acao, i) => (
              <span
                key={i}
                className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium"
              >
                {acao}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ComponenteCard({ comp }: { comp: ComponentePrincipal }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-slate-800">{comp.nome}</p>
        {comp.tipo && (
          <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-mono shrink-0">
            {comp.tipo}
          </span>
        )}
      </div>
      {comp.descricao && (
        <p className="text-xs text-slate-500 leading-relaxed">{comp.descricao}</p>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export function PrototipoPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [prototipo, setPrototipo] = useState<PrototipoSistema | null>(null)
  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [tab, setTab] = useState<TabId>('visao-geral')

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, protoResp] = await Promise.allSettled([
        buscarDemanda(demandaId),
        buscarPrototipo(demandaId),
      ])
      if (demResp.status === 'fulfilled') setDemandaTitulo(demResp.value.data.titulo ?? '')
      if (protoResp.status === 'fulfilled') setPrototipo(protoResp.value.data)
      else setPrototipo(null)
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
      const r = await gerarPrototipo(demandaId)
      setPrototipo(r.data)
    } catch {
      setErro('Erro ao gerar protótipo. Verifique a configuração da chave OpenAI.')
    } finally {
      setGerando(false)
    }
  }

  async function handleRevisar() {
    if (!demandaId) return
    try { const r = await revisarPrototipo(demandaId); setPrototipo(r.data) }
    catch { setErro('Erro ao enviar para revisão.') }
  }

  async function handleAprovar() {
    if (!demandaId) return
    try { const r = await aprovarPrototipo(demandaId); setPrototipo(r.data) }
    catch { setErro('Erro ao aprovar protótipo.') }
  }

  async function handlePublicar() {
    if (!demandaId) return
    try { const r = await publicarPrototipo(demandaId); setPrototipo(r.data) }
    catch { setErro('Erro ao publicar protótipo.') }
  }

  // Parsed data
  const telas = safeParseArray<Tela>(prototipo?.telas)
  const componentes = safeParseArray<ComponentePrincipal>(prototipo?.componentesPrincipais)
  const tecnologias = safeParseArray<TecnologiaSugerida>(prototipo?.tecnologiasSugeridas)
  const fluxo = safeParseObject<FluxoNavegacao>(prototipo?.fluxoNavegacao)

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
          {demandaTitulo || 'Prototipação Assistida'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded shrink-0">
          Módulo 8
        </span>
        {prototipo && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CHIP[prototipo.statusAprovacao]}`}
            aria-label={`Status: ${STATUS_LABEL[prototipo.statusAprovacao]}`}
          >
            {STATUS_LABEL[prototipo.statusAprovacao]}
          </span>
        )}
        {/* Botões de aprovação */}
        {prototipo && prototipo.statusAprovacao === 'RASCUNHO_IA' && (
          <button
            onClick={handleRevisar}
            className="flex items-center gap-1 px-3 py-1.5 border border-sky-200 text-sky-700 rounded-lg text-xs font-medium hover:bg-sky-50 transition-colors shrink-0"
            aria-label="Enviar para revisão"
          >
            Enviar para Revisão
          </button>
        )}
        {prototipo && prototipo.statusAprovacao === 'EM_REVISAO' && (
          <button
            onClick={handleAprovar}
            className="flex items-center gap-1 px-3 py-1.5 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-50 transition-colors shrink-0"
            aria-label="Aprovar protótipo"
          >
            Aprovar
          </button>
        )}
        {prototipo && prototipo.statusAprovacao === 'APROVADO' && (
          <button
            onClick={handlePublicar}
            className="flex items-center gap-1 px-3 py-1.5 border border-violet-200 text-violet-700 rounded-lg text-xs font-medium hover:bg-violet-50 transition-colors shrink-0"
            aria-label="Publicar protótipo"
          >
            Publicar
          </button>
        )}
        <button
          onClick={handleGerar}
          disabled={gerando}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors shrink-0"
          aria-label={gerando ? 'Gerando protótipo...' : 'Gerar protótipo com IA'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3.5 h-3.5 ${gerando ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {gerando ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            )}
          </svg>
          {gerando ? 'Gerando...' : prototipo ? 'Regenerar com IA' : 'Gerar com IA'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Error banner */}
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

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <svg className="animate-spin w-6 h-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Carregando protótipo...
          </div>
        ) : !prototipo ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-1">Protótipo ainda não gerado</p>
            <p className="text-slate-400 text-sm mb-5 max-w-sm leading-relaxed">
              Clique em "Gerar Protótipo com IA" para criar automaticamente as telas, fluxo e componentes com base na demanda.
            </p>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
              aria-label="Gerar protótipo com IA"
            >
              {gerando ? 'Gerando...' : 'Gerar Protótipo com IA'}
            </button>
          </div>
        ) : (
          /* Content with tabs */
          <div className="space-y-4">
            {/* Metadados */}
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span>Criado em {new Date(prototipo.criadoEm).toLocaleDateString('pt-BR')}</span>
              <span>Atualizado em {new Date(prototipo.atualizadoEm).toLocaleDateString('pt-BR')}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">{prototipo.fonte}</span>
              {prototipo.aprovadoPor && (
                <span>Aprovado por {prototipo.aprovadoPor}</span>
              )}
            </div>

            {/* Tab bar */}
            <div
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
              role="tablist"
              aria-label="Seções do protótipo"
            >
              <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 overflow-x-auto">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    aria-controls={`tabpanel-${t.id}`}
                    id={`tab-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                      tab === t.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                    {t.id === 'telas' && telas.length > 0 && (
                      <span className="ml-1.5 text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                        {telas.length}
                      </span>
                    )}
                    {t.id === 'componentes' && componentes.length > 0 && (
                      <span className="ml-1.5 text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                        {componentes.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div
                className="p-6"
                role="tabpanel"
                id={`tabpanel-${tab}`}
                aria-labelledby={`tab-${tab}`}
              >
                {/* ── Visão Geral ─────────────────────────────────────────── */}
                {tab === 'visao-geral' && (
                  <div className="space-y-4">
                    {prototipo.descricaoGeral ? (
                      <Section>
                        <SectionTitle>Descrição Geral</SectionTitle>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {prototipo.descricaoGeral}
                        </p>
                      </Section>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Section>
                        <SectionTitle>Paleta de Cores</SectionTitle>
                        {prototipo.paleta ? (
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {prototipo.paleta}
                          </p>
                        ) : (
                          <EmptyText>Não informado</EmptyText>
                        )}
                      </Section>

                      <Section>
                        <SectionTitle>Diretrizes de Design</SectionTitle>
                        {prototipo.diretrizes ? (
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {prototipo.diretrizes}
                          </p>
                        ) : (
                          <EmptyText>Não informado</EmptyText>
                        )}
                      </Section>
                    </div>

                    {!prototipo.descricaoGeral && !prototipo.paleta && !prototipo.diretrizes && (
                      <EmptyText>Nenhuma informação geral disponível.</EmptyText>
                    )}
                  </div>
                )}

                {/* ── Telas ───────────────────────────────────────────────── */}
                {tab === 'telas' && (
                  <>
                    {telas.length === 0 ? (
                      <EmptyText>Nenhuma tela definida.</EmptyText>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {telas.map((tela) => (
                          <TelaCard key={tela.id} tela={tela} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── Fluxo ───────────────────────────────────────────────── */}
                {tab === 'fluxo' && (
                  <>
                    {!fluxo ? (
                      <EmptyText>Fluxo de navegação não disponível.</EmptyText>
                    ) : (
                      <div className="space-y-4">
                        {fluxo.descricao && (
                          <Section>
                            <SectionTitle>Descrição do Fluxo</SectionTitle>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {fluxo.descricao}
                            </p>
                          </Section>
                        )}
                        {fluxo.passos && fluxo.passos.length > 0 && (
                          <Section>
                            <SectionTitle>Passos</SectionTitle>
                            <ol className="space-y-2">
                              {fluxo.passos.map((passo, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="text-sm text-slate-700 leading-relaxed">{passo}</span>
                                </li>
                              ))}
                            </ol>
                          </Section>
                        )}
                        {/* Dados brutos adicionais */}
                        {Object.keys(fluxo).filter(k => k !== 'descricao' && k !== 'passos').length > 0 && (
                          <Section>
                            <SectionTitle>Dados Adicionais</SectionTitle>
                            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                              {JSON.stringify(
                                Object.fromEntries(
                                  Object.entries(fluxo).filter(([k]) => k !== 'descricao' && k !== 'passos')
                                ),
                                null,
                                2
                              )}
                            </pre>
                          </Section>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── Componentes ─────────────────────────────────────────── */}
                {tab === 'componentes' && (
                  <>
                    {componentes.length === 0 ? (
                      <EmptyText>Nenhum componente principal definido.</EmptyText>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {componentes.map((comp, i) => (
                          <ComponenteCard key={i} comp={comp} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── Acessibilidade ──────────────────────────────────────── */}
                {tab === 'acessibilidade' && (
                  <div className="space-y-4">
                    <Section>
                      <SectionTitle>Notas de Acessibilidade</SectionTitle>
                      {prototipo.notasAcessibilidade ? (
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {prototipo.notasAcessibilidade}
                        </p>
                      ) : (
                        <EmptyText>Não informado</EmptyText>
                      )}
                    </Section>

                    <Section>
                      <SectionTitle>Tecnologias Sugeridas</SectionTitle>
                      {tecnologias.length === 0 ? (
                        <EmptyText>Nenhuma tecnologia sugerida.</EmptyText>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tecnologias.map((tec, i) => (
                            <div key={i} className="border border-slate-200 rounded-lg p-4">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-800">{tec.nome}</p>
                                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium shrink-0">
                                  {tec.categoria}
                                </span>
                              </div>
                              {tec.motivo && (
                                <p className="text-xs text-slate-500 leading-relaxed">{tec.motivo}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Section>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
