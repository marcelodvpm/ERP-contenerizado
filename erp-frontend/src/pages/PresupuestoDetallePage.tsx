import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cambiarEstadoPresupuesto, obtenerPresupuesto } from '../api/presupuestos'
import type { EstadoPresupuesto, Presupuesto } from '../types'

const ESTADO_LABELS: Record<EstadoPresupuesto, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
}

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

// Transiciones de estado que tiene sentido ofrecer desde cada estado actual
const ACCIONES: Partial<Record<EstadoPresupuesto, { estado: EstadoPresupuesto; label: string; estilo: string }[]>> = {
  borrador: [{ estado: 'enviado', label: 'Marcar como enviado', estilo: 'bg-copper-500 hover:bg-copper-600' }],
  enviado: [
    { estado: 'aprobado', label: 'Marcar como aprobado', estilo: 'bg-success hover:bg-success/90' },
    { estado: 'rechazado', label: 'Marcar como rechazado', estilo: 'bg-danger hover:bg-danger/90' },
  ],
}

export function PresupuestoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  async function cargar() {
    if (!id) return
    const data = await obtenerPresupuesto(Number(id))
    setPresupuesto(data)
  }

  useEffect(() => {
    cargar().catch(() => setError('No se pudo cargar el presupuesto.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleCambiarEstado(nuevoEstado: EstadoPresupuesto) {
    if (!presupuesto) return
    setCambiandoEstado(true)
    try {
      const actualizado = await cambiarEstadoPresupuesto(presupuesto.id, nuevoEstado)
      setPresupuesto(actualizado)
    } finally {
      setCambiandoEstado(false)
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!presupuesto) return <p className="text-sm text-graphite-400">Cargando…</p>

  const acciones = ACCIONES[presupuesto.estado] ?? []

  return (
    <div className="space-y-6">
      <Link to="/presupuestos" className="flex items-center gap-1 text-sm text-graphite-400 hover:text-graphite-900">
        <ArrowLeft size={14} />
        Volver a presupuestos
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-copper-600">{presupuesto.numero}</p>
          <h1 className="text-xl font-semibold text-graphite-900">
            Estado: {ESTADO_LABELS[presupuesto.estado]}
          </h1>
          <p className="mt-1 text-sm text-graphite-400">
            Fecha: {presupuesto.fecha} {presupuesto.fecha_validez && `· Válido hasta ${presupuesto.fecha_validez}`}
          </p>
        </div>

        {acciones.length > 0 && (
          <div className="flex gap-2">
            {acciones.map((accion) => (
              <button
                key={accion.estado}
                onClick={() => handleCambiarEstado(accion.estado)}
                disabled={cambiandoEstado}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${accion.estilo}`}
              >
                {accion.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Descripción</th>
              <th className="px-4 py-3 font-normal text-right">Cantidad</th>
              <th className="px-4 py-3 font-normal text-right">Precio unitario</th>
              <th className="px-4 py-3 font-normal text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {presupuesto.items.map((item) => (
              <tr key={item.id} className="border-b border-graphite-200 last:border-0">
                <td className="px-4 py-3 text-graphite-900">{item.descripcion ?? `Ítem #${item.producto_servicio_id}`}</td>
                <td className="px-4 py-3 text-right font-mono text-graphite-700">{item.cantidad}</td>
                <td className="px-4 py-3 text-right font-mono text-graphite-700">
                  {formatoMoneda(item.precio_unitario)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-graphite-900">{formatoMoneda(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-graphite-900">
                Total
              </td>
              <td className="px-4 py-3 text-right font-mono text-lg font-semibold text-graphite-900">
                {formatoMoneda(presupuesto.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {presupuesto.notas && (
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <p className="mb-1 text-sm font-medium text-graphite-900">Notas</p>
          <p className="text-sm text-graphite-700">{presupuesto.notas}</p>
        </div>
      )}
    </div>
  )
}
