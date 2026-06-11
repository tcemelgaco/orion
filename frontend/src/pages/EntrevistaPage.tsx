import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChatBubble } from '../components/chat/ChatBubble'
import { StreamingBubble } from '../components/chat/StreamingBubble'
import { ChatInput } from '../components/chat/ChatInput'
import { buscarEntrevista, consolidarEntrevista, streamMensagem } from '../services/api'
import type { Entrevista, Mensagem, Sumario } from '../types/entrevista'

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
      id,
      conteudo,
      (token) => setStreamingText((prev) => prev + token),
      () => {
        buscarEntrevista(id).then((res) => {
          setEntrevista(res.data)
          setStreamingText('')
          setEnviando(false)
        })
      },
      (err) => {
        setErro(err)
        setEnviando(false)
        setStreamingText('')
      },
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
      <div className="flex h-screen items-center justify-center text-red-600">
        {erro}
      </div>
    )
  }

  if (!entrevista) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Carregando entrevista…
      </div>
    )
  }

  const emAndamento = entrevista.status === 'EM_ANDAMENTO'

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white px-6 py-4 shadow flex items-center gap-4">
        <button
          onClick={() => navigate('/demandas')}
          aria-label="Voltar"
          className="text-blue-200 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            Entrevista — {entrevista.tituloDemanda}
          </h1>
          <p className="text-blue-200 text-xs">
            Módulo 2 · Analista de Negócios IA · TCE-CE
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            emAndamento
              ? 'bg-green-400 text-green-900'
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {emAndamento ? 'Em andamento' : entrevista.status}
        </span>
        {emAndamento && entrevista.mensagens.length >= 4 && (
          <button
            onClick={handleConsolidar}
            disabled={consolidando || enviando}
            className="ml-2 px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {consolidando ? 'Consolidando…' : 'Consolidar'}
          </button>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {entrevista.mensagens.length === 0 && !enviando && (
            <p className="text-center text-gray-400 mt-12 text-sm">
              A entrevista foi iniciada. O analista IA irá conduzir a conversa.
            </p>
          )}

          {entrevista.mensagens.map((msg) => (
            <ChatBubble key={msg.id} mensagem={msg} />
          ))}

          {streamingText && <StreamingBubble conteudo={streamingText} />}

          {enviando && !streamingText && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2">
                IA
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {erro && (
            <p className="text-center text-red-500 text-sm mt-2" role="alert">
              {erro}
            </p>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Sumário */}
      {sumario && (
        <div className="border-t border-green-200 bg-green-50 px-6 py-4 max-h-64 overflow-y-auto">
          <h2 className="font-semibold text-green-800 mb-2">
            ✓ Sumário do Levantamento gerado
          </h2>
          <div className="text-sm text-green-900 space-y-1">
            {sumario.contexto && <p><strong>Contexto:</strong> {sumario.contexto}</p>}
            {sumario.necessidades && <p><strong>Necessidades:</strong> {sumario.necessidades}</p>}
            {sumario.informacoesAusentes && (
              <p><strong>Lacunas:</strong> {sumario.informacoesAusentes}</p>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      {emAndamento ? (
        <ChatInput onEnviar={handleEnviar} disabled={enviando} />
      ) : (
        <div className="border-t border-gray-200 bg-gray-100 p-4 text-center text-sm text-gray-500">
          Entrevista concluída.{' '}
          <button
            onClick={() => navigate('/demandas')}
            className="text-blue-600 hover:underline"
          >
            Voltar às Demandas
          </button>
        </div>
      )}
    </div>
  )
}
