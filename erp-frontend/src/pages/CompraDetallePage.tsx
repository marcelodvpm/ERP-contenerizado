import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PackageCheck } from 'lucide-react'
import { obtenerCompra, recibirCompra } from '../api/compras'
import { listarDepositos } from '../api/productos'
import type { Compra, Deposito } from '../types'

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function CompraDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [compra, setCompra] = useState<Compra | null>(null)
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [depositoId, setDepositoId] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [recibiendo, setRecibiendo] = useState(false)

  useEffect(() => {
    if (!id) return
    obtenerCompra(Number(id))
      .then(setCompra)
      .catch(() => setError('No se pudo cargar la compra.'))
    listarDepositos().then((data) => {
      setDepositos(data)
      if (data[0]) setDepositoId(data[0].id)
    })
  }, [id])

  async function handleRecibir() {
    if (!compra || !depositoId) return
    setRecibiendo(true)
    setError(null)
    try {
      const actualizada = await recibirCompra(compra.id, depositoId)
      setCompra(actualizada)
    } catch {
      setError('No se pudo recibir la compra.')
    } finally {
      setRecibiendo(false)
    }
  }

  if (error && !compra) return <p className="text-sm text-danger">{error}</p>
  if (!compra) return <p className="text-sm text-graphite-400">Cargando…</p>

  return (
    <div className="space-y-6">
      <Link to="/compras" className="flex items-center gap-1 text-sm text-graphite-400 hover:text-graphite-900">
        <ArrowLeft size={14} />
        Volver a compras
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-copper-600">{compra.numero}</p>
          <h1 className="text-xl font-semibold text-graphite-900">
            Estado: {compra.estado === 'pendiente' ? 'Pendiente' : compra.estado === 'recibida' ? 'Recibida' : 'Cancelada'}
          </h1>
          <p className="mt-1 text-sm text-graphite-400">Fecha: {compra.fecha}</p>
        </div>

        {compra.estado === 'pendiente' && (
          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-xs text-graphite-400">Recibir en</label>
              <select
                value={depositoId}
                onChange={(e) => setDepositoId(Number(e.target.value))}
                className="rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
              >
                {depositos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRecibir}
              disabled={recibiendo}
              className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600 disabled:opacity-60"
            >
              <PackageCheck size={16} />
              {recibiendo ? 'Recibiendo…' : 'Marcar como recibida'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {compra.estado === 'recibida' && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Recibida — el stock de cada ítem ya se sumó automáticamente al depósito elegido.
        </p>
      )}

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
            {compra.items.map((item) => (
              <tr key={item.id} className="border-b border-graphite-200 last:border-0">
                <td className="px-4 py-3 text-graphite-900">Producto #{item.producto_id}</td>
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
                {formatoMoneda(compra.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {compra.notas && (
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <p className="mb-1 text-sm font-medium text-graphite-900">Notas</p>
          <p className="text-sm text-graphite-700">{compra.notas}</p>
        </div>
      )}
    </div>
  )
}
