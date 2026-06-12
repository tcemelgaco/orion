import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  buscarArquitetura,
  gerarArquitetura,
  revisarArquitetura,
  aprovarArquitetura,
  publicarArquitetura,
  buscarDemanda,
} from '../services/api'
import type {
  ArquiteturaSolucao,
  VisaoArquitetural,
  Componente,
  IntegracaoArq,
  EntidadeDados,
  Adr,
} from '../types/arquitetura'
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


// ── Constantes visuais ───────────────────────────────────────────────────────

const VISAO_CHIP: Record<VisaoArquitetural, string> = {
  MONOLITO:         'bg-slate-100 text-slate-700 ring-slate-300',
  MICROSSERVICOS:   'bg-blue-100 text-blue-700 ring-blue-300',
  MODULAR_MONOLITO: 'bg-indigo-100 text-indigo-700 ring-indigo-300',
  SERVERLESS:       'bg-violet-100 text-violet-700 ring-violet-300',
  HIBRIDA:          'bg-amber-100 text-amber-700 ring-amber-300',
}

const VISAO_LABEL: Record<VisaoArquitetural, string> = {
  MONOLITO:         'Monolito',
  MICROSSERVICOS:   'Microsserviços',
  MODULAR_MONOLITO: 'Monolito Modular',
  SERVERLESS:       'Serverless',
  HIBRIDA:          'Híbrida',
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {count !== undefined && (
        <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-medium">
          {count}
        </span>
      )}
    </div>
  )
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}

function AdrCard({ adr }: { adr: Adr }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
            {adr.id}
          </span>
          <span className="text-sm font-medium text-slate-800">{adr.titulo}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-4 space-y-3 bg-white">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contexto</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{adr.contexto || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Decisao</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{adr.decisao || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Consequencias</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{adr.consequencias || 'Não informado'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export function ArquiteturaPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [arq, setArq] = useState<ArquiteturaSolucao | null>(null)
  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, arqResp] = await Promise.allSettled([
        buscarDemanda(demandaId),
        buscarArquitetura(demandaId),
      ])
      if (demResp.status === 'fulfilled') setDemandaTitulo(demResp.value.data.titulo ?? '')
      if (arqResp.status === 'fulfilled') setArq(arqResp.value.data)
      else setArq(null)
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
      const r = await gerarArquitetura(demandaId)
      setArq(r.data)
    } catch {
      setErro('Erro ao gerar arquitetura. Verifique a configuracao da chave OpenAI.')
    } finally {
      setGerando(false)
    }
  }

  function handleCopiarMermaid() {
    if (!arq?.diagramaMermaid) return
    navigator.clipboard.writeText(arq.diagramaMermaid).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  const componentes = safeParseArray<Componente>(arq?.componentes)
  const integracoes = safeParseArray<IntegracaoArq>(arq?.integracoes)
  const modeloDados = safeParseArray<EntidadeDados>(arq?.modeloDados)
  const adrs = safeParseArray<Adr>(arq?.adrs)

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
          {demandaTitulo || 'Arquitetura de Solucao'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
          Modulo 9
        </span>
        {arq && (
          <AprovacaoBadge
            status={arq.statusAprovacao as StatusAprovacao}
            aprovadoPor={arq.aprovadoPor}
            aprovadoEm={arq.aprovadoEm}
          />
        )}
        {arq && arq.statusAprovacao !== 'PUBLICADO' && (
          <AprovacaoBotoes
            status={arq.statusAprovacao as StatusAprovacao}
            onRevisar={async () => { const r = await revisarArquitetura(demandaId!); setArq(r.data) }}
            onAprovar={async () => { const r = await aprovarArquitetura(demandaId!); setArq(r.data) }}
            onPublicar={async () => { const r = await publicarArquitetura(demandaId!); setArq(r.data) }}
          />
        )}
        <button
          onClick={handleGerar}
          disabled={gerando}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors shrink-0"
          aria-label={gerando ? 'Gerando arquitetura...' : 'Gerar arquitetura com IA'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${gerando ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {gerando ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            )}
          </svg>
          {gerando ? 'Gerando...' : arq ? 'Regenerar com IA' : 'Gerar com IA'}
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
            Carregando arquitetura...
          </div>
        ) : !arq ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-1">Arquitetura ainda nao gerada</p>
            <p className="text-slate-400 text-sm mb-5 max-w-sm">
              Clique em "Gerar com IA" para criar automaticamente a arquitetura de solucao com base na demanda.
            </p>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors"
            >
              {gerando ? 'Gerando...' : 'Gerar Arquitetura com IA'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Visao Arquitetural */}
            <Section>
              <SectionHeader title="Visao Arquitetural" />
              {arq.visaoArquitetural ? (
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ring-1 ${VISAO_CHIP[arq.visaoArquitetural]}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                    </svg>
                    {VISAO_LABEL[arq.visaoArquitetural]}
                  </span>
                  <span className="text-xs text-slate-400">Padrao arquitetural principal adotado</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Nao informado</p>
              )}
            </Section>

            {/* Recomendacoes */}
            {arq.recomendacoes && (
              <Section>
                <SectionHeader title="Recomendacoes" />
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{arq.recomendacoes}</p>
              </Section>
            )}

            {/* Componentes */}
            <Section>
              <SectionHeader title="Componentes" count={componentes.length} />
              {componentes.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum componente definido</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsabilidade</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tecnologia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentes.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-800">{c.nome}</td>
                          <td className="py-2.5 px-3 text-slate-600">{c.responsabilidade}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-mono px-2 py-0.5 rounded">
                              {c.tecnologia}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* Integracoes */}
            <Section>
              <SectionHeader title="Integracoes" count={integracoes.length} />
              {integracoes.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma integracao definida</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integracoes.map((integ, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800 text-sm">{integ.sistema}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded font-medium">{integ.tipo}</span>
                          <span className="text-[11px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">{integ.protocolo}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{integ.descricao || 'Sem descricao'}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Modelo de Dados */}
            <Section>
              <SectionHeader title="Modelo de Dados" count={modeloDados.length} />
              {modeloDados.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma entidade definida</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {modeloDados.map((ent, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-4">
                      <p className="font-semibold text-slate-800 text-sm mb-1">{ent.entidade}</p>
                      {ent.descricao && (
                        <p className="text-xs text-slate-500 mb-2">{ent.descricao}</p>
                      )}
                      {ent.atributosPrincipais && ent.atributosPrincipais.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ent.atributosPrincipais.map((attr, j) => (
                            <span key={j} className="text-[11px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                              {attr}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ADRs */}
            <Section>
              <SectionHeader title="Decisoes de Arquitetura (ADR)" count={adrs.length} />
              {adrs.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma ADR registrada</p>
              ) : (
                <div className="space-y-2">
                  {adrs.map((adr, i) => (
                    <AdrCard key={i} adr={adr} />
                  ))}
                </div>
              )}
            </Section>

            {/* Diagrama Mermaid */}
            {arq.diagramaMermaid && (
              <Section>
                <div className="flex items-center justify-between mb-3">
                  <SectionHeader title="Diagrama (Mermaid)" />
                  <button
                    onClick={handleCopiarMermaid}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors px-2.5 py-1 border border-slate-200 rounded-lg hover:border-blue-300"
                    aria-label="Copiar codigo Mermaid"
                  >
                    {copiado ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {arq.diagramaMermaid}
                </pre>
              </Section>
            )}

            {/* Metadados */}
            <div className="text-xs text-slate-400 flex items-center gap-4 pb-2">
              <span>Criado em {new Date(arq.criadoEm).toLocaleDateString('pt-BR')}</span>
              <span>Atualizado em {new Date(arq.atualizadoEm).toLocaleDateString('pt-BR')}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">{arq.fonte}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
