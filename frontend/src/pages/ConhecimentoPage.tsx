import { useEffect, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import {
  listarConhecimento,
  ingerirDocumento,
  buscarConhecimento,
  excluirDocumento,
} from '../services/api'
import type {
  DocumentoConhecimento,
  BuscaSemanticaResult,
  IngerirDocumentoPayload,
  TipoDocumento,
} from '../types/conhecimento'

// ── helpers ───────────────────────────────────────────────────────────────────

function parseTags(json?: string): string[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const TIPOS_DOCUMENTO: TipoDocumento[] = [
  'DOCUMENTO',
  'ESPECIFICACAO',
  'ATA',
  'MANUAL',
  'NORMA',
  'OUTRO',
]

// ── subcomponents ─────────────────────────────────────────────────────────────

interface CardDocumentoProps {
  doc: DocumentoConhecimento
  score?: number
  onExcluir: (id: string) => void
}

function CardDocumento({ doc, score, onExcluir }: CardDocumentoProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{doc.titulo}</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {doc.conteudo.slice(0, 150)}…
          </p>
        </div>
        {score !== undefined && (
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
            {Math.round(score * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
          {doc.tipo}
        </span>
        {parseTags(doc.tags).map((t) => (
          <span key={t} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded">
            {t}
          </span>
        ))}
        {doc.fonte && (
          <span className="text-[10px] text-slate-400 ml-auto truncate max-w-[160px]">
            {doc.fonte}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          {doc.tokensEstimados !== undefined
            ? `${doc.tokensEstimados.toLocaleString('pt-BR')} tokens estimados`
            : 'tokens não calculados'}
        </span>
        <button
          onClick={() => onExcluir(doc.id)}
          className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
          aria-label={`Remover documento ${doc.titulo}`}
        >
          Remover
        </button>
      </div>
    </div>
  )
}

// ── form state ────────────────────────────────────────────────────────────────

interface FormState {
  titulo: string
  conteudo: string
  tipo: TipoDocumento
  fonte: string
  tags: string
}

const FORM_INICIAL: FormState = {
  titulo: '',
  conteudo: '',
  tipo: 'DOCUMENTO',
  fonte: '',
  tags: '',
}

// ── page ──────────────────────────────────────────────────────────────────────

export function ConhecimentoPage() {
  const [docs, setDocs] = useState<DocumentoConhecimento[]>([])
  const [resultados, setResultados] = useState<BuscaSemanticaResult[]>([])
  const [query, setQuery] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [modoResultados, setModoResultados] = useState(false)

  // ── carregamento inicial ──────────────────────────────────────────────────

  async function carregarDocs() {
    setLoading(true)
    setErro(null)
    try {
      const resp = await listarConhecimento()
      const data = Array.isArray(resp.data)
        ? resp.data
        : (resp.data?.content ?? resp.data?.data ?? [])
      setDocs(data)
    } catch {
      setErro('Não foi possível carregar a base de conhecimento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDocs()
  }, [])

  // ── busca semântica ───────────────────────────────────────────────────────

  async function handleBuscar() {
    const q = query.trim()
    if (!q) {
      setModoResultados(false)
      setResultados([])
      return
    }
    setBuscando(true)
    setErro(null)
    try {
      const resp = await buscarConhecimento(q, 8)
      const data: BuscaSemanticaResult[] = Array.isArray(resp.data)
        ? resp.data
        : (resp.data?.resultados ?? resp.data?.data ?? [])
      setResultados(data)
      setModoResultados(true)
    } catch {
      setErro('Erro ao executar busca semântica.')
    } finally {
      setBuscando(false)
    }
  }

  function handleQueryKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleBuscar()
  }

  function handleLimparBusca() {
    setQuery('')
    setResultados([])
    setModoResultados(false)
  }

  // ── ingestão ──────────────────────────────────────────────────────────────

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim() || !form.conteudo.trim()) return

    const payload: IngerirDocumentoPayload = {
      titulo: form.titulo.trim(),
      conteudo: form.conteudo.trim(),
      tipo: form.tipo,
      fonte: form.fonte.trim() || undefined,
      tags: form.tags.trim()
        ? JSON.stringify(
            form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          )
        : undefined,
    }

    setSalvando(true)
    setErro(null)
    try {
      await ingerirDocumento(payload)
      setForm(FORM_INICIAL)
      setShowForm(false)
      await carregarDocs()
    } catch {
      setErro('Erro ao ingerir documento.')
    } finally {
      setSalvando(false)
    }
  }

  // ── exclusão ──────────────────────────────────────────────────────────────

  async function handleExcluir(id: string) {
    if (!window.confirm('Deseja remover este documento da base de conhecimento?')) return
    setErro(null)
    try {
      await excluirDocumento(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      setResultados((prev) => prev.filter((r) => r.documento.id !== id))
    } catch {
      setErro('Erro ao remover documento.')
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  const itensExibidos = modoResultados
    ? resultados.map((r) => ({ doc: r.documento, score: r.score }))
    : docs.map((doc) => ({ doc, score: undefined }))

  return (
    <AppLayout>
      {/* skip link */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Ir para o conteúdo principal
      </a>

      <div id="conteudo-principal" className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── cabeçalho ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Base de Conhecimento Institucional
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              M13 — RAG com busca semântica por similaridade vetorial
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm"
            aria-expanded={showForm}
            aria-controls="painel-ingestao"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ingerir
          </button>
        </div>

        {/* ── mensagem de erro global ── */}
        {erro && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
          >
            {erro}
          </div>
        )}

        {/* ── painel de ingestão ── */}
        {showForm && (
          <section
            id="painel-ingestao"
            aria-label="Formulário de ingestão de documento"
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4"
          >
            <h2 className="text-base font-semibold text-slate-800">Adicionar Documento</h2>

            <form onSubmit={handleSalvar} className="space-y-4" noValidate>
              {/* título */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">
                  Título <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  required
                  value={form.titulo}
                  onChange={handleFormChange}
                  placeholder="Título do documento"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* tipo */}
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={form.tipo}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* conteúdo */}
              <div>
                <label
                  htmlFor="conteudo"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Conteúdo <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="conteudo"
                  name="conteudo"
                  required
                  rows={8}
                  value={form.conteudo}
                  onChange={handleFormChange}
                  placeholder="Cole ou digite o conteúdo do documento aqui..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ minHeight: '200px' }}
                />
              </div>

              {/* fonte */}
              <div>
                <label htmlFor="fonte" className="block text-sm font-medium text-slate-700 mb-1">
                  Fonte <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="fonte"
                  name="fonte"
                  type="text"
                  value={form.fonte}
                  onChange={handleFormChange}
                  placeholder="Ex.: SEI 12345, Wiki Interna, Manual v2"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
                  Tags <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={form.tags}
                  onChange={handleFormChange}
                  placeholder="tag1, tag2, tag3"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separe as tags por vírgula.
                </p>
              </div>

              {/* ações */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={salvando || !form.titulo.trim() || !form.conteudo.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setForm(FORM_INICIAL)
                  }}
                  className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── busca semântica ── */}
        <section aria-label="Busca semântica">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleQueryKeyDown}
                placeholder="Pesquisa semântica na base de conhecimento..."
                aria-label="Campo de busca semântica"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleBuscar}
              disabled={buscando || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0"
              aria-label="Executar busca semântica"
            >
              {buscando ? 'Buscando…' : 'Buscar'}
            </button>
            {modoResultados && (
              <button
                onClick={handleLimparBusca}
                className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 transition-colors shrink-0"
                aria-label="Limpar resultados da busca"
              >
                Limpar
              </button>
            )}
          </div>

          {modoResultados && (
            <p className="text-xs text-slate-500 mt-2">
              {resultados.length === 0
                ? 'Nenhum resultado encontrado para esta busca.'
                : `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''} por similaridade semântica`}
            </p>
          )}
        </section>

        {/* ── conteúdo principal ── */}
        <section aria-label={modoResultados ? 'Resultados da busca' : 'Documentos na base de conhecimento'}>
          {/* cabeçalho da seção */}
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            {modoResultados ? 'Resultados da Busca' : 'Documentos'}
            {!loading && !modoResultados && (
              <span className="ml-2 text-slate-400 font-normal">({docs.length})</span>
            )}
          </h2>

          {/* loading */}
          {loading && (
            <div className="flex items-center gap-3 py-12 justify-center text-slate-400 text-sm">
              <svg
                className="animate-spin w-5 h-5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Carregando documentos…
            </div>
          )}

          {/* empty state */}
          {!loading && itensExibidos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-slate-200 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <p className="text-slate-400 text-sm">
                {modoResultados
                  ? 'Nenhum documento encontrado para esta busca.'
                  : 'Nenhum documento na base de conhecimento.'}
              </p>
              <p className="text-slate-300 text-xs mt-1">
                {modoResultados
                  ? 'Tente outros termos ou limpe a busca.'
                  : 'Clique em "+ Ingerir" para adicionar o primeiro documento.'}
              </p>
            </div>
          )}

          {/* grid de cards */}
          {!loading && itensExibidos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {itensExibidos.map(({ doc, score }) => (
                <CardDocumento
                  key={doc.id}
                  doc={doc}
                  score={score}
                  onExcluir={handleExcluir}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
