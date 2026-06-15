import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { buscarDemanda, listarArtefatos, uploadArtefato, downloadArtefato, excluirArtefato } from '../services/api'
import type { Artefato, TipoArtefato } from '../types/artefato'

const TIPOS: { value: TipoArtefato; label: string; color: string }[] = [
  { value: 'LEI',                 label: 'Lei',                  color: 'bg-blue-100 text-blue-700' },
  { value: 'INSTRUCAO_NORMATIVA', label: 'Instrução Normativa',  color: 'bg-purple-100 text-purple-700' },
  { value: 'RESOLUCAO',           label: 'Resolução',            color: 'bg-amber-100 text-amber-700' },
  { value: 'CONTRATO',            label: 'Contrato',             color: 'bg-red-100 text-red-700' },
  { value: 'MANUAL',              label: 'Manual',               color: 'bg-green-100 text-green-700' },
  { value: 'ESPECIFICACAO',       label: 'Especificação',        color: 'bg-cyan-100 text-cyan-700' },
  { value: 'OUTRO',               label: 'Outro',                color: 'bg-gray-100 text-gray-600' },
]

function tipoLabel(v: TipoArtefato) { return TIPOS.find(t => t.value === v)?.label ?? v }
function tipoColor(v: TipoArtefato) { return TIPOS.find(t => t.value === v)?.color ?? 'bg-gray-100 text-gray-600' }

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

function FileIcon({ contentType }: { contentType: string }) {
  const isPdf  = contentType.includes('pdf')
  const isWord = contentType.includes('word') || contentType.includes('officedocument')
  const isImg  = contentType.startsWith('image/')

  if (isPdf) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  if (isWord) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  if (isImg) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

interface UploadModal {
  file: File
  tipo: TipoArtefato
  descricao: string
}

export function ArtefatosPage() {
  const { demandaId } = useParams<{ demandaId: string }>()
  const navigate = useNavigate()

  const [demandaTitulo, setDemandaTitulo] = useState('')
  const [artefatos, setArtefatos]         = useState<Artefato[]>([])
  const [loading, setLoading]             = useState(true)
  const [dragging, setDragging]           = useState(false)
  const [modal, setModal]                 = useState<UploadModal | null>(null)
  const [enviando, setEnviando]           = useState(false)
  const [baixando, setBaixando]           = useState<string | null>(null)
  const [excluindo, setExcluindo]         = useState<string | null>(null)
  const [erro, setErro]                   = useState('')
  const fileInputRef                      = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    if (!demandaId) return
    setLoading(true)
    try {
      const [demResp, artResp] = await Promise.all([
        buscarDemanda(demandaId),
        listarArtefatos(demandaId),
      ])
      setDemandaTitulo(demResp.data.titulo)
      setArtefatos(artResp.data)
    } finally {
      setLoading(false)
    }
  }, [demandaId])

  useEffect(() => {
    const t = setTimeout(carregar, 0)
    return () => clearTimeout(t)
  }, [carregar])

  function abrirModal(file: File) {
    setModal({ file, tipo: 'OUTRO', descricao: '' })
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) abrirModal(files[0])
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files && files.length > 0) abrirModal(files[0])
    e.target.value = ''
  }

  async function handleEnviar() {
    if (!demandaId || !modal) return
    setEnviando(true)
    try {
      await uploadArtefato(demandaId, modal.file, modal.tipo, modal.descricao)
      setModal(null)
      await carregar()
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { mensagem?: string }; status?: number } }
      const serverMsg = ax?.response?.data?.mensagem
      const status = ax?.response?.status
      if (status === 413 || serverMsg?.toLowerCase().includes('tamanho')) {
        setErro('Arquivo muito grande. Limite máximo: 50 MB.')
      } else {
        setErro(serverMsg ?? 'Erro ao enviar arquivo. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  async function handleDownload(a: Artefato) {
    setBaixando(a.id)
    try { await downloadArtefato(a.id, a.nomeOriginal) }
    catch { setErro('Erro ao baixar arquivo.') }
    finally { setBaixando(null) }
  }

  async function handleExcluir(id: string) {
    if (!confirm('Excluir este artefato?')) return
    setExcluindo(id)
    try { await excluirArtefato(id); await carregar() }
    catch { setErro('Erro ao excluir artefato.') }
    finally { setExcluindo(null) }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                <button onClick={() => navigate('/demandas')} className="hover:text-blue-600">Demandas</button>
                <span>/</span>
                <button onClick={() => navigate(`/demandas/${demandaId}`)} className="hover:text-blue-600 max-w-xs truncate">
                  {demandaTitulo || '…'}
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium">Artefatos</span>
              </nav>
              <h1 className="text-xl font-bold text-gray-900">Repositório de Artefatos</h1>
              <p className="text-sm text-slate-500 mt-0.5">Leis, INs, resoluções, contratos e documentos de referência</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0d1f3c] text-white text-sm font-medium hover:bg-[#1a3460]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Adicionar Arquivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv,.zip"
              onChange={onFileChange}
            />
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {erro && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between">
              {erro}
              <button onClick={() => setErro('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Arraste arquivos aqui ou clique para selecionar</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLS, imagens, TXT — até 50 MB</p>
            </div>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg className="animate-spin w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Carregando…
            </div>
          ) : artefatos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nenhum artefato cadastrado. Faça o upload do primeiro documento.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {artefatos.length} artefato{artefatos.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ul className="divide-y divide-slate-100">
                {artefatos.map(a => (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 group transition-colors">
                    <div className="shrink-0">
                      <FileIcon contentType={a.contentType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.nomeOriginal}</p>
                      {a.descricao && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{a.descricao}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tipoColor(a.tipoArtefato)}`}>
                          {tipoLabel(a.tipoArtefato)}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatBytes(a.tamanhoBytes)}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(a.criadoEm).toLocaleDateString('pt-BR')}
                        </span>
                        {a.uploadadoPor && (
                          <span className="text-[11px] text-slate-400">por {a.uploadadoPor}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownload(a)}
                        disabled={baixando === a.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        aria-label="Baixar"
                      >
                        {baixando === a.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        )}
                        Baixar
                      </button>
                      <button
                        onClick={() => handleExcluir(a.id)}
                        disabled={excluindo === a.id}
                        className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-40 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                        aria-label="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal de upload */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Adicionar Artefato</h2>
            <p className="text-sm text-slate-500 mb-5 truncate">{modal.file.name}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de Documento</label>
                <select
                  value={modal.tipo}
                  onChange={e => setModal({ ...modal, tipo: e.target.value as TipoArtefato })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIPOS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Descrição <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={modal.descricao}
                  onChange={e => setModal({ ...modal, descricao: e.target.value })}
                  placeholder="Ex: Lei que rege o processo licitatório…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                O nome e o tipo serão usados como contexto na geração de requisitos pela IA.
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                disabled={enviando}
                className="px-4 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                disabled={enviando}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#0d1f3c] rounded-lg hover:bg-[#1a3460] disabled:opacity-60"
              >
                {enviando ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Enviando…
                  </>
                ) : 'Enviar Arquivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
