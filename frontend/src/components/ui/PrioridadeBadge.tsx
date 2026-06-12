import type { PrioridadeDemanda } from '../../types/demanda'

const config: Record<PrioridadeDemanda, { label: string; classes: string; dot: string }> = {
  ALTA:  { label: 'Alta',  classes: 'bg-red-600 text-white ring-red-700',       dot: 'bg-red-200' },
  MEDIA: { label: 'Média', classes: 'bg-amber-500 text-white ring-amber-600',   dot: 'bg-amber-200' },
  BAIXA: { label: 'Baixa', classes: 'bg-emerald-600 text-white ring-emerald-700', dot: 'bg-emerald-200' },
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeDemanda }) {
  const { label, classes, dot } = config[prioridade] ?? { label: prioridade, classes: 'bg-slate-500 text-white ring-slate-600', dot: 'bg-slate-300' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
