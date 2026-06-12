import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatBubble } from '../components/chat/ChatBubble'
import { StreamingBubble } from '../components/chat/StreamingBubble'
import { ChatInput } from '../components/chat/ChatInput'
import { buscarEntrevista, consolidarEntrevista, streamMensagem } from '../services/api'
import type { Entrevista, Mensagem, Sumario } from '../types/entrevista'

function TceCeShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="28" height="28" rx="6" fill="#1d4ed8" />
      <path d="M14 4L22 9V19L14 24L6 19V9L14 4Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
      <text x="14" y="17.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="sans-serif">TCE</text>
    </svg>
  )
}

export function EntrevistaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entrevista, setEntrevista] = useState<Entrevista | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [consolidando, setConsolidando] = useState(false)
  const [sumario, setSumario] = useState<Sumario | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    buscarEntrevista(id)
      .then((res) => setEntrevista(res.data))
      .catch(() => setErro('Entrevista não encontrada.'))
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entrevista?.mensagens, streamingText])

  function handleEnviar(conteudo: string) {
    if (!id || enviando) return
    setEnviando(true)
    setErro('')
    setStreamingText('')

    const msgUsuario: Mensagem = {
      id: crypto.randomUUID(),
      role: 'USER',
      conteudo,
      criadoEm: new Date().toISOString(),
    }
    setEntrevista((prev) =>
      prev ? { ...prev, mensagens: [...prev.mensagens, msgUsuario] } : prev,
    )

    streamMensagem(
      id, conteudo,
      (token) => setStreamingText((prev) => prev + token),
      () => {
        buscarEntrevista(id).then((res) => {
          setEntrevista(res.data)
          setStreamingText('')
          setEnviando(false)
        })
      },
      (err) => { setErro(err); setEnviando(false); setStreamingText('') },
    )
  }

  async function handleConsolidar() {
    if (!id) return
    setConsolidando(true)
    setErro('')
    try {
      const res = await consolidarEntrevista(id)
      setSumario(res.data)
      setEntrevista((prev) => prev ? { ...prev, status: 'CONCLUIDA' } : prev)
    } catch {
      setErro('Erro ao consolidar entrevista.')
    } finally {
      setConsolidando(false)
    }
  }

  if (erro && !entrevista) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3"
        style={{ background: 'linear-gradient(135deg, #0d1f3c 0%, #0a1628 100%)' }}>
        <p className="text-red-400 text-sm">{erro}</p>
        <button onClick={() => navigate('/demandas')} className="text-blue-400 text-sm hover:underline">
          ← Voltar às Demandas
        </button>
      </div>
    )
  }

  if (!entrevista) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-3"
        style={{ background: 'linear-gradient(135deg, #0d1f3c 0%, #0a1628 100%)' }}>
        <svg className="animate-spin w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-slate-400 text-sm">Carregando entrevista…</span>
      </div>
    )
  }

  const emAndamento = entrevista.status === 'EM_ANDAMENTO'
  const podeConso = emAndamento && entrevista.mensagens.length >= 4

  return (
    <div className="flex flex-col h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="shrink-0 border-b border-slate-800 flex items-center gap-4 px-5 py-3"
        style={{ background: 'linear-gradient(90deg, #0d1f3c 0%, #0f2545 100%)' }}>

        <button onClick={() => navigate('/demandas')} aria-label="Voltar"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Demandas
        </button>

        <div className="w-px h-5 bg-slate-700 shrink-0" />

        <TceCeShield className="w-7 h-7 shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            {entrevista.tituloDemanda}
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Módulo 2 · Entrevista Inteligente · Analista de Negócios IA
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            emAndamento ? 'bg-green-900/60 text-green-300' : 'bg-slate-700 text-slate-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${emAndamento ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            {emAndamento ? 'Em andamento' : 'Concluída'}
          </span>

          {podeConso && (
            <button onClick={handleConsolidar} disabled={consolidando || enviando}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {consolidando ? 'Consolidando…' : 'Consolidar'}
            </button>
          )}
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {entrevista.mensagens.length === 0 && !enviando && (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold">Entrevista iniciada</p>
              <p className="text-slate-400 text-sm mt-1">
                O Analista de Negócios IA irá conduzir o levantamento de requisitos.
              </p>
            </div>
          )}

          {entrevista.mensagens.map((msg) => (
            <ChatBubble key={msg.id} mensagem={msg} />
          ))}

          {streamingText && <StreamingBubble conteudo={streamingText} />}

          {enviando && !streamingText && (
            <div className="flex items-end gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                IA
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {erro && (
            <p className="text-center text-red-500 text-sm mt-2 py-2" role="alert">{erro}</p>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── Sumário consolidado ── */}
      {sumario && (
        <div className="border-t border-green-200 bg-green-50 px-6 py-4 max-h-60 overflow-y-auto shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="flex items-center gap-2 font-semibold text-green-800 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sumário do Levantamento gerado com sucesso
              </h2>
              {sumario.suficiencia != null && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    sumario.suficiencia >= 70
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : sumario.suficiencia >= 40
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                  title={sumario.avaliacaoSuficiencia ?? undefined}
                >
                  Suficiência {sumario.suficiencia}%
                  {sumario.suficiencia < 70 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  )}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-900">
              {sumario.contexto && (
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-1">Contexto</p>
                  <p>{sumario.contexto}</p>
                </div>
              )}
              {sumario.necessidades && (
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-1">Necessidades</p>
                  <p>{sumario.necessidades}</p>
                </div>
              )}
              {sumario.informacoesAusentes && (
                <div className="bg-white/60 rounded-lg p-3 md:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-green-700 mb-1">Lacunas Identificadas</p>
                  <p>{sumario.informacoesAusentes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Input / Footer ── */}
      {emAndamento ? (
        <ChatInput onEnviar={handleEnviar} disabled={enviando} />
      ) : (
        <div className="border-t border-slate-200 bg-white px-6 py-4 text-center text-sm text-slate-500 shrink-0">
          Entrevista concluída.{' '}
          <button onClick={() => navigate('/demandas')} className="text-blue-600 hover:underline font-medium">
            Voltar às Demandas
          </button>
        </div>
      )}
    </div>
  )
}
