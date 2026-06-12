import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import {
  criarSessaoAgente,
  listarSessoesAgente,
  listarMensagensAgente,
  streamMensagemAgente,
} from '../services/api'
import { AGENTES_CONFIG } from '../types/agente'
import type { TipoAgente, AgenteSessao, AgenteMensagem } from '../types/agente'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BolhaUsuario({ mensagem }: { mensagem: AgenteMensagem }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="max-w-[75%]">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{mensagem.conteudo}</p>
        </div>
        <p className="text-[10px] text-slate-400 text-right mt-1 pr-1">{formatarHora(mensagem.criadoEm)}</p>
      </div>
    </div>
  )
}

function BolhaAgente({ mensagem, label }: { mensagem: AgenteMensagem; label: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mb-5">
        {label.slice(0, 2).toUpperCase()}
      </div>
      <div className="max-w-[75%]">
        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{mensagem.conteudo}</p>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 pl-1">{formatarHora(mensagem.criadoEm)}</p>
      </div>
    </div>
  )
}

function BolhaStreaming({ texto, label }: { texto: string; label: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
        {label.slice(0, 2).toUpperCase()}
      </div>
      <div className="max-w-[75%]">
        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {texto}
            <span className="inline-block w-2 h-4 bg-slate-400 ml-0.5 animate-pulse align-text-bottom" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}

function DigitandoIndicador({ label }: { label: string }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
        {label.slice(0, 2).toUpperCase()}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AgentesPage() {
  const { demandaId } = useParams<{ demandaId: string }>()

  const [tipoSelecionado, setTipoSelecionado] = useState<TipoAgente | null>(null)
  const [sessaoAtual, setSessaoAtual] = useState<AgenteSessao | null>(null)
  const [mensagens, setMensagens] = useState<AgenteMensagem[]>([])
  const [sessoes, setSessoes] = useState<AgenteSessao[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoMensagens, setCarregandoMensagens] = useState(false)
  const [erro, setErro] = useState('')
  const [iniciando, setIniciando] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom whenever messages or streaming text change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, streamingText])

  // Load sessions on mount
  useEffect(() => {
    if (!demandaId) return
    setCarregando(true)
    listarSessoesAgente(demandaId)
      .then((res) => setSessoes(res.data ?? []))
      .catch(() => setErro('Erro ao carregar sessões.'))
      .finally(() => setCarregando(false))
  }, [demandaId])

  const handleSelecionarAgente = useCallback(
    async (tipo: TipoAgente) => {
      if (!demandaId) return
      setTipoSelecionado(tipo)
      setMensagens([])
      setSessaoAtual(null)
      setStreamingText('')
      setErro('')

      // Find existing session for this agent type
      const existente = sessoes.find((s) => s.tipoAgente === tipo)
      if (existente) {
        setSessaoAtual(existente)
        setCarregandoMensagens(true)
        try {
          const res = await listarMensagensAgente(demandaId, existente.id)
          setMensagens(res.data ?? [])
        } catch {
          setErro('Erro ao carregar mensagens.')
        } finally {
          setCarregandoMensagens(false)
        }
      }
    },
    [demandaId, sessoes],
  )

  async function handleIniciarConversa() {
    if (!demandaId || !tipoSelecionado) return
    setIniciando(true)
    setErro('')
    try {
      const res = await criarSessaoAgente(demandaId, tipoSelecionado)
      const novaSessao: AgenteSessao = res.data
      setSessoes((prev) => [...prev, novaSessao])
      setSessaoAtual(novaSessao)
      setMensagens([])
    } catch {
      setErro('Erro ao criar sessão do agente.')
    } finally {
      setIniciando(false)
    }
  }

  function handleEnviar() {
    if (!demandaId || !sessaoAtual || enviando || input.trim() === '') return

    const conteudo = input.trim()
    const msgUsuario: AgenteMensagem = {
      id: crypto.randomUUID(),
      papel: 'USUARIO',
      conteudo,
      criadoEm: new Date().toISOString(),
    }
    setMensagens((prev) => [...prev, msgUsuario])
    setInput('')
    setEnviando(true)
    setErro('')
    setStreamingText('')

    streamMensagemAgente(
      demandaId,
      sessaoAtual.id,
      conteudo,
      (token) => setStreamingText((prev) => prev + token),
      () => {
        // Reload messages from server to get persisted agent message with real id/timestamp
        listarMensagensAgente(demandaId, sessaoAtual.id)
          .then((res) => {
            setMensagens(res.data ?? [])
            setStreamingText('')
            setEnviando(false)
          })
          .catch(() => {
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  const cfgSelecionado = tipoSelecionado ? AGENTES_CONFIG[tipoSelecionado] : null

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">

        {/* ── Left sidebar: agent list + session history ── */}
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Agentes Especializados</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">M14 — Selecione um agente</p>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {(Object.entries(AGENTES_CONFIG) as [TipoAgente, typeof AGENTES_CONFIG[TipoAgente]][]).map(([tipo, cfg]) => {
              const temSessao = sessoes.some((s) => s.tipoAgente === tipo)
              return (
                <button
                  key={tipo}
                  onClick={() => handleSelecionarAgente(tipo)}
                  aria-label={`Selecionar agente ${cfg.label}`}
                  aria-pressed={tipoSelecionado === tipo}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    tipoSelecionado === tipo
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium flex-1 truncate">{cfg.label}</p>
                    {temSessao && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${tipoSelecionado === tipo ? 'bg-blue-200' : 'bg-green-400'}`}
                        title="Sessão existente"
                        aria-label="Sessão existente"
                      />
                    )}
                  </div>
                  <p
                    className={`text-[10px] mt-0.5 leading-relaxed ${
                      tipoSelecionado === tipo ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {cfg.descricao}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Session history list */}
          {sessoes.length > 0 && (
            <div className="border-t border-slate-200 px-2 py-3">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Sessoes Ativas ({sessoes.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {sessoes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelecionarAgente(s.tipoAgente)}
                    aria-label={`Abrir sessão de ${AGENTES_CONFIG[s.tipoAgente]?.label ?? s.tipoAgente}`}
                    className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors truncate ${
                      sessaoAtual?.id === s.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {AGENTES_CONFIG[s.tipoAgente]?.label ?? s.tipoAgente}
                  </button>
                ))}
              </div>
            </div>
          )}

          {carregando && (
            <div className="px-4 py-3 text-[11px] text-slate-400 text-center border-t border-slate-200">
              Carregando sessoes…
            </div>
          )}
        </aside>

        {/* ── Right panel: chat ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* No agent selected */}
          {!tipoSelecionado && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold text-sm">Agentes Especializados de IA</p>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                Selecione um agente para iniciar uma conversa especializada.
              </p>
            </div>
          )}

          {/* Agent selected */}
          {tipoSelecionado && cfgSelecionado && (
            <>
              {/* Chat header */}
              <div className="shrink-0 border-b border-slate-200 px-5 py-3 bg-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {cfgSelecionado.label.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{cfgSelecionado.label}</p>
                  <p className="text-[11px] text-slate-400 truncate">{cfgSelecionado.descricao}</p>
                </div>
                {sessaoAtual && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Sessão ativa
                  </span>
                )}
              </div>

              {/* Messages area */}
              <main className="flex-1 overflow-y-auto" aria-label="Mensagens da conversa" aria-live="polite">
                <div className="max-w-3xl mx-auto px-4 py-5">

                  {/* No session yet */}
                  {!sessaoAtual && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-semibold text-sm mb-1">{cfgSelecionado.label}</p>
                      <p className="text-slate-400 text-xs mb-5 max-w-xs">{cfgSelecionado.descricao}</p>
                      <button
                        onClick={handleIniciarConversa}
                        disabled={iniciando}
                        aria-label={`Iniciar conversa com ${cfgSelecionado.label}`}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors"
                      >
                        {iniciando ? 'Iniciando…' : 'Iniciar Conversa'}
                      </button>
                    </div>
                  )}

                  {/* Loading messages */}
                  {sessaoAtual && carregandoMensagens && (
                    <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Carregando mensagens…
                    </div>
                  )}

                  {/* Empty state after session created */}
                  {sessaoAtual && !carregandoMensagens && mensagens.length === 0 && !enviando && (
                    <div className="text-center py-10">
                      <p className="text-slate-500 text-sm font-medium">Sessão iniciada</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Envie uma mensagem para começar a conversa com o {cfgSelecionado.label}.
                      </p>
                    </div>
                  )}

                  {/* Message list */}
                  {!carregandoMensagens && mensagens.map((msg) =>
                    msg.papel === 'USUARIO' ? (
                      <BolhaUsuario key={msg.id} mensagem={msg} />
                    ) : (
                      <BolhaAgente key={msg.id} mensagem={msg} label={cfgSelecionado.label} />
                    ),
                  )}

                  {/* Streaming bubble */}
                  {streamingText && <BolhaStreaming texto={streamingText} label={cfgSelecionado.label} />}

                  {/* Typing indicator (waiting for first token) */}
                  {enviando && !streamingText && (
                    <DigitandoIndicador label={cfgSelecionado.label} />
                  )}

                  {/* Error message */}
                  {erro && (
                    <p className="text-center text-red-500 text-sm mt-2 py-2" role="alert">{erro}</p>
                  )}

                  <div ref={bottomRef} />
                </div>
              </main>

              {/* Input area */}
              {sessaoAtual && (
                <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
                  <div className="max-w-3xl mx-auto flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={enviando}
                      rows={1}
                      placeholder={`Mensagem para o ${cfgSelecionado.label}… (Enter para enviar, Shift+Enter para nova linha)`}
                      aria-label={`Campo de mensagem para ${cfgSelecionado.label}`}
                      className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 max-h-32 overflow-y-auto"
                      style={{ minHeight: '42px' }}
                    />
                    <button
                      onClick={handleEnviar}
                      disabled={enviando || input.trim() === ''}
                      aria-label="Enviar mensagem"
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      {enviando ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      )}
                      {enviando ? 'Enviando' : 'Enviar'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Enter envia · Shift+Enter para nova linha
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
