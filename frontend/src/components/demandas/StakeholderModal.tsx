import { useState } from 'react'
import type { AdicionarStakeholderPayload, PapelStakeholder } from '../../types/demanda'

interface Props {
  onClose: () => void
  onSalvar: (payload: AdicionarStakeholderPayload) => Promise<void>
}

const papelOptions: { value: PapelStakeholder; label: string }[] = [
  { value: 'PATROCINADOR', label: 'Patrocinador' },
  { value: 'GESTOR_DEMANDANTE', label: 'Gestor Demandante' },
  { value: 'USUARIO_FINAL', label: 'Usuário Final' },
  { value: 'ANALISTA_STI', label: 'Analista STI' },
  { value: 'DESENVOLVEDOR', label: 'Desenvolvedor' },
  { value: 'QA', label: 'QA' },
  { value: 'OUTRO', label: 'Outro' },
]

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

export function StakeholderModal({ onClose, onSalvar }: Props) {
  const [values, setValues] = useState<AdicionarStakeholderPayload>({
    nome: '',
    matricula: '',
    area: '',
    papel: 'USUARIO_FINAL',
    contato: '',
  })
  const [erroNome, setErroNome] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof AdicionarStakeholderPayload>(key: K, value: AdicionarStakeholderPayload[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (key === 'nome') setErroNome('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.nome.trim()) {
      setErroNome('Nome é obrigatório')
      return
    }
    setSubmitting(true)
    try {
      await onSalvar({
        ...values,
        matricula: values.matricula || undefined,
        area: values.area || undefined,
        contato: values.contato || undefined,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Adicionar Stakeholder</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.nome}
                onChange={(e) => set('nome', e.target.value)}
                placeholder="Nome completo"
                className={`${fieldClass} ${erroNome ? 'border-red-400' : ''}`}
              />
              {erroNome && <p className="mt-1 text-xs text-red-500">{erroNome}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
              <input
                type="text"
                value={values.matricula}
                onChange={(e) => set('matricula', e.target.value)}
                placeholder="Ex: 12345"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Papel <span className="text-red-500">*</span>
              </label>
              <select
                value={values.papel}
                onChange={(e) => set('papel', e.target.value as PapelStakeholder)}
                className={fieldClass}
              >
                {papelOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <input
                type="text"
                value={values.area}
                onChange={(e) => set('area', e.target.value)}
                placeholder="Área / Unidade organizacional"
                className={fieldClass}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
              <input
                type="text"
                value={values.contato}
                onChange={(e) => set('contato', e.target.value)}
                placeholder="E-mail ou ramal"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? 'Salvando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
