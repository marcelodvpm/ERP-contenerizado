import { useEffect, useState } from 'react'
import { DollarSign, FileClock, ShoppingBag, AlertTriangle } from 'lucide-react'
import { obtenerResumenDashboard } from '../api/dashboard'
import type { DashboardResumen } from '../types'
import { StatCard } from '../components/StatCard'

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  asignada: 'Asignada',
  en_progreso: 'En progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

function formatoMoneda(valor: string): string {
  const numero = Number(valor)
  return numero.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function DashboardPage() {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerResumenDashboard()
      .then(setResumen)
      .catch(() => setError('No se pudo cargar el resumen. Verificá que el backend esté corriendo.'))
  }, [])

  if (error) {
    return <p className="text-sm text-danger">{error}</p>
  }

  if (!resumen) {
    return <p className="text-sm text-graphite-400">Cargando resumen…</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-graphite-900">Dashboard</h1>
        <p className="text-sm text-graphite-400">Estado general del negocio, al día de hoy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ventas del mes"
          value={String(resumen.ventas_mes.cantidad)}
          sublabel={formatoMoneda(resumen.ventas_mes.monto_total)}
          icon={<DollarSign size={18} />}
        />
        <StatCard
          label="Presupuestos pendientes"
          value={String(resumen.presupuestos_pendientes.cantidad)}
          sublabel={formatoMoneda(resumen.presupuestos_pendientes.monto_total)}
          icon={<FileClock size={18} />}
        />
        <StatCard
          label="Compras pendientes"
          value={String(resumen.compras_pendientes.cantidad)}
          sublabel={formatoMoneda(resumen.compras_pendientes.monto_total)}
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="Productos con stock crítico"
          value={String(resumen.stock_critico.length)}
          sublabel={resumen.stock_critico.length > 0 ? 'Requieren reposición' : 'Todo en orden'}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-5">
          <h2 className="mb-4 text-sm font-medium text-graphite-900">Órdenes de trabajo por estado</h2>
          <div className="space-y-2">
            {resumen.ot_por_estado.map((fila) => (
              <div key={fila.estado} className="flex items-center justify-between text-sm">
                <span className="text-graphite-400">{ESTADO_LABELS[fila.estado] ?? fila.estado}</span>
                <span className="font-mono font-medium text-graphite-900">{fila.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-5">
          <h2 className="mb-4 text-sm font-medium text-graphite-900">Agenda de la próxima semana</h2>
          {resumen.agenda_proxima_semana.length === 0 ? (
            <p className="text-sm text-graphite-400">Sin turnos programados.</p>
          ) : (
            <div className="space-y-2">
              {resumen.agenda_proxima_semana.map((dia) => (
                <div key={dia.fecha} className="flex items-center justify-between text-sm">
                  <span className="text-graphite-400">
                    {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="font-mono font-medium text-graphite-900">{dia.cantidad} turno(s)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {resumen.stock_critico.length > 0 && (
        <div className="rounded-lg border border-copper-400/40 bg-copper-100/40 p-5">
          <h2 className="mb-4 text-sm font-medium text-graphite-900">Productos por debajo del stock mínimo</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-graphite-400">
                <th className="pb-2 font-normal">Código</th>
                <th className="pb-2 font-normal">Producto</th>
                <th className="pb-2 font-normal text-right">Stock actual</th>
                <th className="pb-2 font-normal text-right">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {resumen.stock_critico.map((p) => (
                <tr key={p.producto_id} className="border-t border-copper-400/20">
                  <td className="py-2 font-mono text-graphite-700">{p.codigo}</td>
                  <td className="py-2 text-graphite-900">{p.nombre}</td>
                  <td className="py-2 text-right font-mono text-danger">{p.stock_actual}</td>
                  <td className="py-2 text-right font-mono text-graphite-400">{p.stock_minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
