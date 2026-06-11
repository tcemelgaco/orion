import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DemandaForm } from '../components/demandas/DemandaForm'
import { criarDemanda } from '../services/api'
import type { CriarDemandaPayload } from '../types/demanda'

export function NovaDemandaPage() {
  const navigate = useNavigate()

  async function handleSubmit(values: CriarDemandaPayload) {
    const res = await criarDemanda(values)
    navigate(`/demandas/${res.data.id}`)
  }

  return (
    <AppLayout>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/demandas')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Demandas
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">Nova Demanda</span>
        <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          Módulo 1
        </span>
      </div>

      {/* Two-column layout */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <DemandaForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/demandas')}
            submitLabel="Criar Demanda"
          />
        </div>

        {/* Info panel — 1/3 width */}
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Como funciona
            </h3>
            <ol className="text-xs text-blue-700 space-y-2 leading-relaxed list-decimal list-inside">
              <li>Cadastre a demanda com os dados básicos do solicitante</li>
              <li>Adicione os stakeholders envolvidos</li>
              <li>Inicie uma <strong>Entrevista IA</strong> — o assistente conduz o levantamento</li>
              <li>Consolide a entrevista para gerar o sumário de requisitos</li>
              <li>Avance para Especificação, Canvas e Histórias de Usuário</li>
            </ol>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tipos de Demanda</h3>
            <ul className="text-xs text-slate-500 space-y-2">
              {[
                ['Novo Sistema', 'Desenvolvimento de sistema inexistente'],
                ['Melhoria', 'Evolução de funcionalidade existente'],
                ['Corretiva', 'Correção de erro ou falha'],
                ['Integração', 'Conexão com sistemas externos'],
                ['Modernização', 'Atualização tecnológica'],
              ].map(([tipo, desc]) => (
                <li key={tipo} className="flex flex-col">
                  <span className="font-semibold text-slate-700">{tipo}</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Campos obrigatórios</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Título, Área Demandante e Matrícula do Solicitante são necessários para criar a demanda.
              Os demais campos podem ser preenchidos posteriormente.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
