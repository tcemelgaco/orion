import type { PrioridadeDemanda } from '../../types/demanda'

const config: Record<PrioridadeDemanda, { label: string; classes: string; dot: string }> = {
  ALTA: { label: 'Alta', classes: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  MEDIA: { label: 'Média', classes: 'bg-yellow-50 text-yellow-700 ring-yellow-200', dot: 'bg-yellow-500' },
  BAIXA: { label: 'Baixa', classes: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-500' },
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeDemanda }) {
  const { label, classes, dot } = config[prioridade] ?? { label: prioridade, classes: 'bg-gray-100 text-gray-600 ring-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
