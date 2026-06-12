interface Props {
  score: number | null
  label: string
  detalhes?: string | null
  onAvaliar?: () => void
  loading?: boolean
}

function scoreClasses(score: number): string {
  if (score >= 70) return 'bg-emerald-600 text-white border-emerald-700'
  if (score >= 40) return 'bg-amber-500 text-white border-amber-600'
  return 'bg-red-600 text-white border-red-700'
}

function parseFeedback(detalhes: string | null): string | null {
  if (!detalhes) return null
  try {
    const parsed = JSON.parse(detalhes)
    return parsed.feedback ?? null
  } catch {
    return null
  }
}

export function ScoreBadge({ score, label, detalhes, onAvaliar, loading }: Props) {
  const feedback = parseFeedback(detalhes ?? null)

  if (score === null || score === undefined) {
    if (!onAvaliar) return null
    return (
      <button
        onClick={onAvaliar}
        disabled={loading}
        className="rounded border border-dashed border-slate-400 px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 whitespace-nowrap transition-colors"
        title={`Avaliar ${label} com IA`}
        aria-label={`Avaliar ${label}`}
      >
        {loading ? '…' : `${label} ?`}
      </button>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${scoreClasses(score)}`}
      title={feedback ?? `Score ${label}: ${score}/100`}
    >
      {label} {score}
    </span>
  )
}
