import { useState } from 'react'
import type { CriarDemandaPayload, TipoDemanda, PrioridadeDemanda } from '../../types/demanda'

interface Props {
  initialValues?: Partial<CriarDemandaPayload>
  onSubmit: (values: CriarDemandaPayload) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const tipoOptions: { value: TipoDemanda; label: string; desc: string }[] = [
  { value: 'NOVO_SISTEMA',  label: 'Novo Sistema',   desc: 'Sistema inexistente' },
  { value: 'MELHORIA',      label: 'Melhoria',        desc: 'Evolução de funcionalidade' },
  { value: 'CORRETIVA',     label: 'Corretiva',       desc: 'Correção de falha' },
  { value: 'INTEGRACAO',    label: 'Integração',      desc: 'Conexão com externos' },
  { value: 'MODERNIZACAO',  label: 'Modernização',    desc: 'Atualização tecnológica' },
]

const prioridadeOptions: { value: PrioridadeDemanda; label: string; color: string }[] = [
  { value: 'ALTA',  label: 'Alta',  color: 'text-red-600' },
  { value: 'MEDIA', label: 'Média', color: 'text-yellow-600' },
  { value: 'BAIXA', label: 'Baixa', color: 'text-green-600' },
]

const input = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-colors'
const inputError = 'border-red-300 bg-red-50 focus:ring-red-400'
const label = 'block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide'

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{children}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

export function DemandaForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Salvar' }: Props) {
  const [values, setValues] = useState<CriarDemandaPayload>({
    titulo: '', descricao: '', areaDemandante: '',
    tipo: 'NOVO_SISTEMA', prioridade: 'MEDIA',
    prazoEstimado: '', matriculaSolicitante: '',
    nomeSolicitante: '', premissas: '', restricoes: '', observacoes: '',
    ...initialValues,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function set(field: keyof CriarDemandaPayload, value: string) {
    setValues((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!values.titulo.trim())                 e.titulo = 'Obrigatório'
    if (!values.areaDemandante.trim())         e.areaDemandante = 'Obrigatório'
    if (!values.matriculaSolicitante.trim())   e.matriculaSolicitante = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        ...values,
        descricao:           values.descricao || undefined,
        prazoEstimado:       values.prazoEstimado || undefined,
        nomeSolicitante:     values.nomeSolicitante || undefined,
        premissas:           values.premissas || undefined,
        restricoes:          values.restricoes || undefined,
        observacoes:         values.observacoes || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* ── Identificação ── */}
      <section>
        <SectionTitle>Identificação</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <label className={label}>
              Título <span className="text-red-500 normal-case tracking-normal">*</span>
            </label>
            <input type="text" value={values.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Ex: Sistema de Controle de Processos Administrativos"
              className={`${input} ${errors.titulo ? inputError : ''}`} />
            {errors.titulo && <p className="mt-1 text-xs text-red-500">{errors.titulo}</p>}
          </div>
          <div className="lg:col-span-2">
            <label className={label}>Descrição</label>
            <textarea rows={3} value={values.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              placeholder="Descreva brevemente a necessidade, contexto e objetivo da demanda…"
              className={`${input} resize-none`} />
          </div>
        </div>
      </section>

      {/* ── Classificação ── */}
      <section>
        <SectionTitle>Classificação</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>
              Tipo <span className="text-red-500 normal-case tracking-normal">*</span>
            </label>
            <select value={values.tipo} onChange={(e) => set('tipo', e.target.value)} className={input}>
              {tipoOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Prioridade</label>
            <select value={values.prioridade} onChange={(e) => set('prioridade', e.target.value)} className={input}>
              {prioridadeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Prazo Estimado</label>
            <input type="date" value={values.prazoEstimado}
              onChange={(e) => set('prazoEstimado', e.target.value)}
              className={input} />
          </div>
        </div>
      </section>

      {/* ── Solicitante ── */}
      <section>
        <SectionTitle>Solicitante</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={label}>
              Matrícula <span className="text-red-500 normal-case tracking-normal">*</span>
            </label>
            <input type="text" value={values.matriculaSolicitante}
              onChange={(e) => set('matriculaSolicitante', e.target.value)}
              placeholder="Ex: 12345"
              className={`${input} ${errors.matriculaSolicitante ? inputError : ''}`} />
            {errors.matriculaSolicitante && <p className="mt-1 text-xs text-red-500">{errors.matriculaSolicitante}</p>}
          </div>
          <div>
            <label className={label}>Nome do Solicitante</label>
            <input type="text" value={values.nomeSolicitante}
              onChange={(e) => set('nomeSolicitante', e.target.value)}
              placeholder="Nome completo"
              className={input} />
          </div>
          <div>
            <label className={label}>
              Área Demandante <span className="text-red-500 normal-case tracking-normal">*</span>
            </label>
            <input type="text" value={values.areaDemandante}
              onChange={(e) => set('areaDemandante', e.target.value)}
              placeholder="Ex: Controladoria / SETIC"
              className={`${input} ${errors.areaDemandante ? inputError : ''}`} />
            {errors.areaDemandante && <p className="mt-1 text-xs text-red-500">{errors.areaDemandante}</p>}
          </div>
        </div>
      </section>

      {/* ── Contexto ── */}
      <section>
        <SectionTitle>Contexto (opcional)</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={label}>Premissas</label>
            <textarea rows={3} value={values.premissas}
              onChange={(e) => set('premissas', e.target.value)}
              placeholder="Premissas e condições assumidas para esta demanda…"
              className={`${input} resize-none`} />
          </div>
          <div>
            <label className={label}>Restrições</label>
            <textarea rows={3} value={values.restricoes}
              onChange={(e) => set('restricoes', e.target.value)}
              placeholder="Restrições técnicas, orçamentárias ou legais…"
              className={`${input} resize-none`} />
          </div>
          <div className="lg:col-span-2">
            <label className={label}>Observações</label>
            <textarea rows={2} value={values.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              placeholder="Informações complementares relevantes…"
              className={`${input} resize-none`} />
          </div>
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          <span className="text-red-400">*</span> Campos obrigatórios
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={submitting}
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm">
            {submitting ? 'Salvando…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
