import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { buscarCanvas, gerarCanvas, atualizarCanvas, revisarCanvas, aprovarCanvas, publicarCanvas } from '../services/api'
import type { CanvasProjeto } from '../types/canvas'
import { AprovacaoBadge } from '../components/ui/AprovacaoBadge'
import { AprovacaoBotoes } from '../components/ui/AprovacaoBotoes'

interface Section {
  key: keyof CanvasProjeto
  label: string
  color: string
  icon: React.ReactNode
}

const SECTIONS: Section[] = [
  {
    key: 'contexto', label: 'Contexto', color: 'bg-blue-50 border-blue-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  },
  {
    key: 'problema', label: 'Problema / Necessidade', color: 'bg-red-50 border-red-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  },
  {
    key: 'solucaoProposta', label: 'Solução Proposta', color: 'bg-green-50 border-green-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
  },
  {
    key: 'usuarios', label: 'Usuários / Stakeholders', color: 'bg-purple-50 border-purple-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  },
  {
    key: 'funcionalidadesChave', label: 'Funcionalidades-Chave', color: 'bg-cyan-50 border-cyan-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>,
  },
  {
    key: 'integracoes', label: 'Integrações', color: 'bg-orange-50 border-orange-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  },
  {
    key: 'restricoes', label: 'Restrições', color: 'bg-rose-50 border-rose-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  },
  {
    key: 'premissas', label: 'Premissas', color: 'bg-yellow-50 border-yellow-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
  },
  {
    key: 'riscos', label: 'Riscos', color: 'bg-amber-50 border-amber-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>,
  },
  {
    key: 'criteriosSucesso', label: 'Critérios de Sucesso', color: 'bg-emerald-50 border-emerald-200',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
]

function CanvasCard({
  section, value, onSave,
}: {
  section: Section
  value?: string
  onSave: (key: string, val: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDraft(value ?? ''), 0)
    return () => clearTimeout(t)
  }, [value])

  async function handleSave() {
    setSaving(true)
    try { await onSave(section.key as string, draft) } finally { setSaving(false); setEditing(false) }
  }

  const lines = (value ?? '').split('\n').filter(Boolean)

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 h-full ${section.color}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          {section.icon}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{section.label}</span>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            placeholder={`• Item 1\n• Item 2\n• Item 3`}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setEditing(false); setDraft(value ?? '') }}
              className="px-3 py-1 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-white/60">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </>
      ) : value ? (
        <ul className="space-y-1.5 flex-1">
          {lines.map((line, i) => (
            <li key={i} className="text-sm text-slate-700 leading-snug">
              {line.startsWith('•') ? line : `• ${line}`}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400 italic flex-1">Não preenchido — clique no lápis para editar.</p>
      )}
    </div>
  )
}

export function CanvasPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()
  const [canvas, setCanvas] = useState<CanvasProjeto | null>(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!demandaId) return
    buscarCanvas(demandaId)
      .then((r) => setCanvas(r.data))
      .catch(() => setCanvas(null))
      .finally(() => setLoading(false))
  }, [demandaId])

  async function handleGerar() {
    if (!demandaId) return
    setGerando(true); setErro('')
    try {
      const r = await gerarCanvas(demandaId)
      setCanvas(r.data)
    } catch {
      setErro('Erro ao gerar canvas. Verifique a chave OpenAI.')
    } finally {
      setGerando(false)
    }
  }

  async function handleSave(key: string, val: string) {
    if (!canvas) return
    const r = await atualizarCanvas(canvas.id, { [key]: val })
    setCanvas(r.data)
  }

  return (
    <AppLayout>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        <button onClick={() => demandaId && navigate(`/demandas/${demandaId}`)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Demanda
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700 flex-1 truncate">
          {canvas?.tituloDemanda ?? 'Canvas do Projeto'}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Módulo 3</span>
        {canvas && (
          <AprovacaoBadge
            status={canvas.statusAprovacao}
            aprovadoPor={canvas.aprovadoPor}
            aprovadoEm={canvas.aprovadoEm}
          />
        )}
        {canvas && canvas.statusAprovacao !== 'PUBLICADO' && (
          <AprovacaoBotoes
            status={canvas.statusAprovacao}
            onRevisar={async () => { const r = await revisarCanvas(canvas.id); setCanvas(r.data) }}
            onAprovar={async () => { const r = await aprovarCanvas(canvas.id); setCanvas(r.data) }}
            onPublicar={async () => { const r = await publicarCanvas(canvas.id); setCanvas(r.data) }}
          />
        )}
        <button onClick={handleGerar} disabled={gerando}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {gerando ? 'Gerando…' : canvas ? 'Regenerar com IA' : 'Gerar com IA'}
        </button>
      </div>

      <div className="p-6">
        {erro && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between">
            {erro}
            <button onClick={() => setErro('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <svg className="animate-spin w-6 h-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Carregando canvas…
          </div>
        ) : !canvas ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-1">Canvas ainda não gerado</p>
            <p className="text-slate-400 text-sm mb-5">
              Clique em "Gerar com IA" para criar o canvas automaticamente com base na demanda e entrevista.
            </p>
            <button onClick={handleGerar} disabled={gerando}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors">
              {gerando ? 'Gerando…' : 'Gerar Canvas com IA'}
            </button>
          </div>
        ) : (
          /* ── Canvas grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {/* Row 1: Contexto (wide), Problema */}
            <div className="lg:col-span-2 min-h-40">
              <CanvasCard section={SECTIONS[0]} value={canvas.contexto} onSave={handleSave} />
            </div>
            <div className="min-h-40">
              <CanvasCard section={SECTIONS[1]} value={canvas.problema} onSave={handleSave} />
            </div>

            {/* Row 2: Solução (full width) */}
            <div className="md:col-span-2 lg:col-span-3 min-h-36">
              <CanvasCard section={SECTIONS[2]} value={canvas.solucaoProposta} onSave={handleSave} />
            </div>

            {/* Row 3: Usuários, Funcionalidades, Integrações */}
            {[SECTIONS[3], SECTIONS[4], SECTIONS[5]].map((s) => (
              <div key={s.key as string} className="min-h-44">
                <CanvasCard section={s} value={canvas[s.key] as string | undefined} onSave={handleSave} />
              </div>
            ))}

            {/* Row 4: Restrições, Premissas, Riscos */}
            {[SECTIONS[6], SECTIONS[7], SECTIONS[8]].map((s) => (
              <div key={s.key as string} className="min-h-44">
                <CanvasCard section={s} value={canvas[s.key] as string | undefined} onSave={handleSave} />
              </div>
            ))}

            {/* Row 5: Critérios de Sucesso (full width) */}
            <div className="md:col-span-2 lg:col-span-3 min-h-36">
              <CanvasCard section={SECTIONS[9]} value={canvas.criteriosSucesso} onSave={handleSave} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
