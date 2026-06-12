import { NavLink, useLocation, useNavigate } from 'react-router-dom'

function TceCeLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 shrink-0">
      <rect width="40" height="40" rx="8" fill="#1d4ed8" />
      <path d="M20 6L32 13V27L20 34L8 27V13L20 6Z" fill="white" fillOpacity="0.15" />
      <path d="M20 6L32 13V27L20 34L8 27V13L20 6Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="20" y="24" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="sans-serif">TCE</text>
    </svg>
  )
}

function IconDemandas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  )
}

function IconEntrevista() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

function IconCanvas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function IconRequisitos() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function IconBacklog() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function IconArtefatos() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

const MODULE_ITEMS = [
  { path: 'canvas',     label: 'Canvas',             mod: 'M3', Icon: IconCanvas },
  { path: 'requisitos', label: 'Especificação',       mod: 'M4', Icon: IconRequisitos },
  { path: 'backlog',    label: 'Histórias de Usuário', mod: 'M5', Icon: IconBacklog },
  { path: 'artefatos',  label: 'Artefatos',           mod: '',   Icon: IconArtefatos },
]

const navLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
  }`

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Detect /demandas/:demandaId/(canvas|requisitos|backlog|artefatos)
  const moduleMatch = pathname.match(/^\/demandas\/([^/]+)\/(canvas|requisitos|backlog|artefatos)$/)
  const demandaId = moduleMatch ? moduleMatch[1] : null

  return (
    <aside
      className="w-60 flex flex-col shrink-0 border-r border-slate-800"
      style={{ background: 'linear-gradient(180deg, #0d1f3c 0%, #0a1628 100%)' }}
    >
      {/* Logo / Brand */}
      <div className="px-4 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <TceCeLogo />
          <div className="min-w-0">
            <div className="text-white font-bold text-base leading-tight">AILER</div>
            <div className="text-slate-400 text-[10px] leading-snug mt-0.5 uppercase tracking-wider">
              TCE-CE · Requisitos IA
            </div>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
          Tribunal de Contas do Estado do Ceará
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">

        {/* ── Contextual: inside a demanda module ── */}
        {demandaId ? (
          <>
            <button
              onClick={() => navigate('/demandas')}
              className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Voltar às Demandas
            </button>

            <div className="mb-1">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Esta Demanda
              </p>
              <ul className="space-y-0.5">
                {MODULE_ITEMS.map(({ path, label, Icon }) => (
                  <li key={path}>
                    <NavLink to={`/demandas/${demandaId}/${path}`} className={navLink}>
                      <Icon />
                      <span className="flex-1 truncate">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* ── Global nav ── */}
            <div className="mb-1">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Principal
              </p>
              <ul className="space-y-0.5">
                <li>
                  <NavLink to="/demandas" end className={navLink}>
                    <IconDemandas />
                    <span className="flex-1 truncate">Gestão de Demandas</span>
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-900/40 px-1.5 py-0.5 rounded">M1</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* ── Pipeline modules (info) ── */}
            <div className="mb-1 mt-2">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Módulos por Demanda
              </p>
              <div className="px-3 mb-2 text-[10px] text-slate-600 leading-relaxed">
                Abra uma demanda para acessar os módulos abaixo.
              </div>
              <ul className="space-y-0.5">
                <li>
                  <span className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 select-none">
                    <IconEntrevista />
                    <span className="flex-1 truncate">Entrevista IA</span>
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-700/30 px-1.5 py-0.5 rounded">M2</span>
                  </span>
                </li>
                {MODULE_ITEMS.map(({ path, label, mod, Icon }) => (
                  <li key={path}>
                    <span className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 select-none">
                      <Icon />
                      <span className="flex-1 truncate">{label}</span>
                      {mod && <span className="text-[9px] font-bold text-slate-600 bg-slate-700/30 px-1.5 py-0.5 rounded">{mod}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow">
            A
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">Analista</div>
            <div className="text-[11px] text-slate-500">STI · D2S2</div>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  )
}
