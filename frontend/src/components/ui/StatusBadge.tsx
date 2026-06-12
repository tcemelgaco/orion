import type { StatusDemanda } from '../../types/demanda'

const config: Record<StatusDemanda, { label: string; classes: string }> = {
  RASCUNHO:           { label: 'Rascunho',           classes: 'bg-slate-500 text-white ring-slate-600' },
  EM_ANALISE:         { label: 'Em Análise',          classes: 'bg-amber-500 text-white ring-amber-600' },
  APROVADA:           { label: 'Aprovada',            classes: 'bg-emerald-600 text-white ring-emerald-700' },
  EM_DESENVOLVIMENTO: { label: 'Em Desenvolvimento',  classes: 'bg-sky-600 text-white ring-sky-700' },
  CONCLUIDA:          { label: 'Concluída',           classes: 'bg-violet-600 text-white ring-violet-700' },
  CANCELADA:          { label: 'Cancelada',           classes: 'bg-red-600 text-white ring-red-700' },
}

export function StatusBadge({ status }: { status: StatusDemanda }) {
  const { label, classes } = config[status] ?? { label: status, classes: 'bg-slate-500 text-white ring-slate-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${classes}`}>
      {label}
    </span>
  )
}
