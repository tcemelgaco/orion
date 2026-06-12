interface Props {
  score: number | null
  label: string
  detalhes?: string | null
  onAvaliar?: () => void
  loading?: boolean
}

function scoreColor(score: number) {
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-red-100 text-red-800 border-red-300'
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
        className="rounded border border-dashed border-gray-300 px-2 py-0.5 text-[10px] text-gray-400 hover:border-blue-400 hover:text-blue-500 disabled:opacity-50 whitespace-nowrap"
        title={`Avaliar ${label} com IA`}
        aria-label={`Avaliar ${label}`}
      >
        {loading ? '...' : `${label} ?`}
      </button>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold ${scoreColor(score)}`}
      title={feedback ?? `Score ${label}: ${score}/100`}
    >
      {label} {score}
    </span>
  )
}
