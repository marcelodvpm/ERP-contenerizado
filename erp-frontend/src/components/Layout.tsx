import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Wrench,
  CalendarDays,
  ShoppingCart,
  Receipt,
  FolderKanban,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, disponible: true },
  { to: '/proyectos', label: 'Proyectos', icon: FolderKanban, disponible: true },
  { to: '/terceros', label: 'Clientes y proveedores', icon: Users, disponible: true },
  { to: '/productos', label: 'Catálogo e inventario', icon: Package, disponible: true },
  { to: '/presupuestos', label: 'Presupuestos', icon: FileText, disponible: true },
  { to: '/ordenes-trabajo', label: 'Órdenes de trabajo', icon: Wrench, disponible: true },
  { to: '/agenda', label: 'Agenda de técnicos', icon: CalendarDays, disponible: true },
  { to: '/compras', label: 'Compras', icon: ShoppingCart, disponible: true },
  { to: '/ventas', label: 'Ventas', icon: Receipt, disponible: true },
]

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth()

  return (
    <div className="flex h-screen bg-canvas">
      <aside className="flex w-64 flex-shrink-0 flex-col bg-graphite-900 text-graphite-200">
        <div className="px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-widest text-copper-400">ERP</p>
          <p className="text-lg font-semibold text-white">Latina Home Solutions</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            if (!item.disponible) {
              return (
                <div
                  key={item.to}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-graphite-400/50 cursor-not-allowed"
                  title="Próximamente"
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {item.label}
                </div>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-copper-500 bg-graphite-800 text-white'
                      : 'border-transparent text-graphite-200 hover:bg-graphite-800/60 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-graphite-800 px-3 py-4">
          <div className="px-3 pb-3">
            <p className="text-sm text-white">{usuario?.nombre_completo}</p>
            <p className="text-xs text-graphite-400">{usuario?.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-graphite-200 hover:bg-graphite-800/60 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
