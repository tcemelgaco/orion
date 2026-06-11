import { useState } from 'react'
import type { CriarDemandaPayload, TipoDemanda, PrioridadeDemanda } from '../../types/demanda'

interface Props {
  initialValues?: Partial<CriarDemandaPayload>
  onSubmit: (values: CriarDemandaPayload) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const tipoOptions: { value: TipoDemanda; label: string }[] = [
  { value: 'NOVO_SISTEMA', label: 'Novo Sistema' },
  { value: 'MELHORIA', label: 'Melhoria' },
  { value: 'CORRETIVA', label: 'Corretiva' },
  { value: 'INTEGRACAO', label: 'Integração' },
  { value: 'MODERNIZACAO', label: 'Modernização' },
]

const prioridadeOptions: { value: PrioridadeDemanda; label: string }[] = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'BAIXA', label: 'Baixa' },
]

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export function DemandaForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Salvar' }: Props) {
  const [values, setValues] = useState<CriarDemandaPayload>({
    titulo: '',
    descricao: '',
    areaDemandante: '',
    tipo: 'NOVO_SISTEMA',
    prioridade: 'MEDIA',
    prazoEstimado: '',
    matriculaSolicitante: '',
    nomeSolicitante: '',
    premissas: '',
    restricoes: '',
    observacoes: '',
    ...initialValues,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof CriarDemandaPayload, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!values.titulo.trim()) next.titulo = 'Título é obrigatório'
    if (!values.areaDemandante.trim()) next.areaDemandante = 'Área demandante é obrigatória'
    if (!values.matriculaSolicitante.trim()) next.matriculaSolicitante = 'Matrícula do solicitante é obrigatória'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        ...values,
        descricao: values.descricao || undefined,
        prazoEstimado: values.prazoEstimado || undefined,
        nomeSolicitante: values.nomeSolicitante || undefined,
        premissas: values.premissas || undefined,
        restricoes: values.restricoes || undefined,
        observacoes: values.observacoes || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Identificação */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Identificação
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Ex: Sistema de Controle de Processos"
              className={`${fieldClass} ${errors.titulo ? 'border-red-400 ring-1 ring-red-300' : ''}`}
            />
            {errors.titulo && <p className="mt-1 text-xs text-red-500">{errors.titulo}</p>}
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              rows={3}
              value={values.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              placeholder="Descreva brevemente a necessidade…"
              className={`${fieldClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Classificação */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Classificação
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={values.tipo}
              onChange={(e) => set('tipo', e.target.value)}
              className={fieldClass}
            >
              {tipoOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Prioridade</label>
            <select
              value={values.prioridade}
              onChange={(e) => set('prioridade', e.target.value)}
              className={fieldClass}
            >
              {prioridadeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Prazo Estimado</label>
            <input
              type="date"
              value={values.prazoEstimado}
              onChange={(e) => set('prazoEstimado', e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
      </section>

      {/* Solicitante */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Solicitante
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Matrícula <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.matriculaSolicitante}
              onChange={(e) => set('matriculaSolicitante', e.target.value)}
              placeholder="Ex: 12345"
              className={`${fieldClass} ${errors.matriculaSolicitante ? 'border-red-400 ring-1 ring-red-300' : ''}`}
            />
            {errors.matriculaSolicitante && (
              <p className="mt-1 text-xs text-red-500">{errors.matriculaSolicitante}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Nome do Solicitante</label>
            <input
              type="text"
              value={values.nomeSolicitante}
              onChange={(e) => set('nomeSolicitante', e.target.value)}
              placeholder="Nome completo"
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Área Demandante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.areaDemandante}
              onChange={(e) => set('areaDemandante', e.target.value)}
              placeholder="Ex: SETIC / Controladoria Geral"
              className={`${fieldClass} ${errors.areaDemandante ? 'border-red-400 ring-1 ring-red-300' : ''}`}
            />
            {errors.areaDemandante && (
              <p className="mt-1 text-xs text-red-500">{errors.areaDemandante}</p>
            )}
          </div>
        </div>
      </section>

      {/* Contexto */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Contexto (opcional)
        </h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Premissas</label>
            <textarea
              rows={2}
              value={values.premissas}
              onChange={(e) => set('premissas', e.target.value)}
              placeholder="Premissas consideradas para esta demanda…"
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Restrições</label>
            <textarea
              rows={2}
              value={values.restricoes}
              onChange={(e) => set('restricoes', e.target.value)}
              placeholder="Restrições técnicas, orçamentárias ou legais…"
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Observações</label>
            <textarea
              rows={2}
              value={values.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              placeholder="Informações adicionais relevantes…"
              className={`${fieldClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
