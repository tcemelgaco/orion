import type { StatusAprovacao } from '../../types/canvas'

interface Props {
  status: StatusAprovacao
  aprovadoPor?: string | null
  aprovadoEm?: string | null
}

const config: Record<StatusAprovacao, { label: string; classes: string }> = {
  RASCUNHO_IA: {
    label: 'Rascunho IA',
    classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
  },
  EM_REVISAO: {
    label: 'Em Revisão',
    classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
  },
  APROVADO: {
    label: 'Aprovado',
    classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700',
  },
  PUBLICADO: {
    label: 'Publicado',
    classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300 dark:border-purple-700',
  },
}

export function AprovacaoBadge({ status, aprovadoPor, aprovadoEm }: Props) {
  const { label, classes } = config[status] ?? config.RASCUNHO_IA
  const tooltip =
    aprovadoPor && aprovadoEm
      ? `Aprovado por ${aprovadoPor} em ${new Date(aprovadoEm).toLocaleDateString('pt-BR')}`
      : undefined

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
      title={tooltip}
    >
      {status === 'RASCUNHO_IA' && <span>🤖</span>}
      {status === 'EM_REVISAO' && <span>✏️</span>}
      {status === 'APROVADO' && <span>✅</span>}
      {status === 'PUBLICADO' && <span>🚀</span>}
      {label}
    </span>
  )
}
