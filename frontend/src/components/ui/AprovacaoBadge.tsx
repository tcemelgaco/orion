import type { StatusAprovacao } from '../../types/canvas'

interface Props {
  status: StatusAprovacao
  aprovadoPor?: string | null
  aprovadoEm?: string | null
}

const config: Record<StatusAprovacao, { label: string; dot: string; classes: string }> = {
  RASCUNHO_IA: {
    label: 'Rascunho IA',
    dot: 'bg-amber-300',
    classes: 'bg-amber-600 text-white border border-amber-700',
  },
  EM_REVISAO: {
    label: 'Em Revisão',
    dot: 'bg-sky-300',
    classes: 'bg-sky-600 text-white border border-sky-700',
  },
  APROVADO: {
    label: 'Aprovado',
    dot: 'bg-emerald-300',
    classes: 'bg-emerald-600 text-white border border-emerald-700',
  },
  PUBLICADO: {
    label: 'Publicado',
    dot: 'bg-violet-300',
    classes: 'bg-violet-600 text-white border border-violet-700',
  },
}

export function AprovacaoBadge({ status, aprovadoPor, aprovadoEm }: Props) {
  const { label, dot, classes } = config[status] ?? config.RASCUNHO_IA
  const tooltip =
    aprovadoPor && aprovadoEm
      ? `Aprovado por ${aprovadoPor} em ${new Date(aprovadoEm).toLocaleDateString('pt-BR')}`
      : undefined

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${classes}`}
      title={tooltip}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  )
}
