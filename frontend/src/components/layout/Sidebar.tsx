import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavSection {
  group: string
  items: NavItem[]
}

const nav: NavSection[] = [
  {
    group: 'Módulo 1',
    items: [
      {
        to: '/demandas',
        label: 'Gestão de Demandas',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Módulo 2',
    items: [
      {
        to: '/entrevistas',
        label: 'Entrevistas IA',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Em Breve',
    items: [
      {
        to: '#canvas',
        label: 'Canvas do Projeto',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
      },
      {
        to: '#requisitos',
        label: 'Especificação',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
      },
      {
        to: '#historias',
        label: 'Histórias de Usuário',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
      },
    ],
  },
]

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

export function Sidebar() {
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
        {nav.map((section) => (
          <div key={section.group} className="mb-1">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isDisabled = item.to.startsWith('#')
                if (isDisabled) {
                  return (
                    <li key={item.to}>
                      <span className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 cursor-not-allowed select-none">
                        {item.icon}
                        <span className="flex-1 truncate">{item.label}</span>
                        <span className="text-[9px] font-medium bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded">
                          fase 2
                        </span>
                      </span>
                    </li>
                  )
                }
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                            : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                        }`
                      }
                    >
                      {item.icon}
                      <span className="flex-1 truncate">{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
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
