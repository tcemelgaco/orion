import { useState, useEffect } from 'react'
import { buscarGitLabConfig, salvarGitLabConfig, exportarParaGitLab } from '../../services/api'
import type { GitLabConfig, GitLabConfigPayload, GitLabExportResult } from '../../types/gitlab'

interface Props {
  demandaId: string
}

export function GitLabExportPanel({ demandaId }: Props) {
  const [config, setConfig] = useState<GitLabConfig | null>(null)
  const [form, setForm] = useState<GitLabConfigPayload>({ gitlabUrl: '', projectId: '', accessToken: '' })
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [resultado, setResultado] = useState<GitLabExportResult | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarGitLabConfig(demandaId)
      .then(r => setConfig(r.data))
      .catch(() => setConfig(null))
  }, [demandaId])

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    salvarGitLabConfig(demandaId, form)
      .then(r => { setConfig(r.data); setEditando(false) })
      .catch(err => setErro(err.response?.data?.mensagem ?? 'Erro ao salvar configuração'))
      .finally(() => setSalvando(false))
  }

  function handleExportar() {
    setExportando(true)
    setResultado(null)
    setErro(null)
    exportarParaGitLab(demandaId)
      .then(r => setResultado(r.data))
      .catch(err => setErro(err.response?.data?.mensagem ?? 'Erro ao exportar para GitLab'))
      .finally(() => setExportando(false))
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconGitLab />
          <h3 className="text-sm font-semibold text-slate-800">Integração GitLab</h3>
        </div>
        {config && !editando && (
          <button
            onClick={() => { setEditando(true); setForm({ gitlabUrl: config.gitlabUrl, projectId: config.projectId, accessToken: '' }) }}
            className="text-xs text-blue-600 hover:underline"
          >
            Editar config
          </button>
        )}
      </div>

      {/* Config atual */}
      {config && !editando && (
        <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
          <p className="text-slate-500">URL: <span className="text-slate-800 font-mono">{config.gitlabUrl}</span></p>
          <p className="text-slate-500">Projeto: <span className="text-slate-800 font-mono">{config.projectId}</span></p>
          <p className="text-slate-500">Token: <span className="text-slate-800 font-mono">{config.accessTokenMasked}</span></p>
        </div>
      )}

      {/* Formulário de configuração */}
      {(!config || editando) && (
        <form onSubmit={handleSalvar} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">URL do GitLab</label>
            <input
              type="url"
              required
              placeholder="https://gitlab.exemplo.com.br"
              value={form.gitlabUrl}
              onChange={e => setForm(f => ({ ...f, gitlabUrl: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ID ou caminho do projeto</label>
            <input
              type="text"
              required
              placeholder="grupo/nome-do-projeto  ou  42"
              value={form.projectId}
              onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Token de acesso {config ? '(deixe em branco para manter o atual)' : ''}
            </label>
            <input
              type="password"
              required={!config}
              placeholder="glpat-xxxxxxxxxxxx"
              value={form.accessToken}
              onChange={e => setForm(f => ({ ...f, accessToken: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {salvando ? 'Validando e salvando…' : 'Salvar configuração'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* Botão de exportar */}
      {config && !editando && (
        <button
          onClick={handleExportar}
          disabled={exportando}
          aria-busy={exportando}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {exportando ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Exportando…</>
          ) : (
            <><IconExport />Exportar Backlog para GitLab</>
          )}
        </button>
      )}

      {/* Erro */}
      {erro && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {erro}
        </div>
      )}

      {/* Resultado do export */}
      {resultado && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-green-700">✓ {resultado.epicosExportados} épico(s)</span>
            <span className="text-green-700">✓ {resultado.historiaExportadas} história(s)</span>
            {resultado.erros > 0 && <span className="text-red-600">✗ {resultado.erros} erro(s)</span>}
          </div>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {resultado.detalhes.map((d, i) => (
              <li key={i} className="text-xs text-slate-700 font-mono">{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function IconGitLab() {
  return (
    <svg className="w-4 h-4 shrink-0 text-orange-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.49a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  )
}

function IconExport() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}
