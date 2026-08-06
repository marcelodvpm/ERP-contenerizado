import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { marcarVentaPagada, obtenerVenta } from '../api/ventas'
import type { Venta } from '../types'

const ESTADO_LABELS: Record<Venta['estado'], string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  cancelada: 'Cancelada',
}

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function VentaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [venta, setVenta] = useState<Venta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState(false)

  useEffect(() => {
    if (!id) return
    obtenerVenta(Number(id))
      .then(setVenta)
      .catch(() => setError('No se pudo cargar la venta.'))
  }, [id])

  async function handleMarcarPagada() {
    if (!venta) return
    setActualizando(true)
    try {
      const actualizada = await marcarVentaPagada(venta.id)
      setVenta(actualizada)
    } finally {
      setActualizando(false)
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!venta) return <p className="text-sm text-graphite-400">Cargando…</p>

  return (
    <div className="space-y-6">
      <Link to="/ventas" className="flex items-center gap-1 text-sm text-graphite-400 hover:text-graphite-900">
        <ArrowLeft size={14} />
        Volver a ventas
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-copper-600">{venta.numero}</p>
          <h1 className="text-xl font-semibold text-graphite-900">Estado: {ESTADO_LABELS[venta.estado]}</h1>
          <p className="mt-1 text-sm text-graphite-400">Fecha: {venta.fecha}</p>
        </div>

        {venta.estado === 'pendiente' && (
          <button
            onClick={handleMarcarPagada}
            disabled={actualizando}
            className="flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {actualizando ? 'Actualizando…' : 'Marcar como pagada'}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Producto</th>
              <th className="px-4 py-3 font-normal text-right">Cantidad</th>
              <th className="px-4 py-3 font-normal text-right">Precio unitario</th>
              <th className="px-4 py-3 font-normal text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.items.map((item) => (
              <tr key={item.id} className="border-b border-graphite-200 last:border-0">
                <td className="px-4 py-3 text-graphite-900">Producto #{item.producto_servicio_id}</td>
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
                {formatoMoneda(venta.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
