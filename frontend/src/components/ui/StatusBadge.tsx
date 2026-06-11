import type { StatusDemanda } from '../../types/demanda'

const config: Record<StatusDemanda, { label: string; classes: string }> = {
  RASCUNHO: { label: 'Rascunho', classes: 'bg-gray-100 text-gray-700 ring-gray-200' },
  EM_ANALISE: { label: 'Em Análise', classes: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  APROVADA: { label: 'Aprovada', classes: 'bg-green-50 text-green-700 ring-green-200' },
  EM_DESENVOLVIMENTO: { label: 'Em Desenvolvimento', classes: 'bg-blue-50 text-blue-700 ring-blue-200' },
  CONCLUIDA: { label: 'Concluída', classes: 'bg-purple-50 text-purple-700 ring-purple-200' },
  CANCELADA: { label: 'Cancelada', classes: 'bg-red-50 text-red-600 ring-red-200' },
}

export function StatusBadge({ status }: { status: StatusDemanda }) {
  const { label, classes } = config[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600 ring-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${classes}`}>
      {label}
    </span>
  )
}
