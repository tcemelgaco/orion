import { useState } from 'react'
import type { StatusAprovacao } from '../../types/canvas'

interface Props {
  status: StatusAprovacao
  onRevisar: () => Promise<void>
  onAprovar: () => Promise<void>
  onPublicar: () => Promise<void>
}

export function AprovacaoBotoes({ status, onRevisar, onAprovar, onPublicar }: Props) {
  const [loading, setLoading] = useState(false)

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true)
    try { await fn() } finally { setLoading(false) }
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'RASCUNHO_IA' && (
        <button
          onClick={() => handle(onRevisar)}
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          aria-label="Abrir para revisão"
        >
          Abrir para Revisão
        </button>
      )}
      {status === 'EM_REVISAO' && (
        <button
          onClick={() => handle(onAprovar)}
          disabled={loading}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          aria-label="Aprovar formalmente"
        >
          Aprovar
        </button>
      )}
      {status === 'APROVADO' && (
        <button
          onClick={() => handle(onPublicar)}
          disabled={loading}
          className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          aria-label="Publicar para desenvolvimento"
        >
          Publicar
        </button>
      )}
    </div>
  )
}
