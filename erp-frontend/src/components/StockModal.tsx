import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { obtenerStockProducto, registrarMovimientoStock } from '../api/productos'
import type { Deposito, ProductoServicio, StockPorDeposito, TipoMovimiento } from '../types'

interface StockModalProps {
  producto: ProductoServicio
  depositos: Deposito[]
  onClose: () => void
}

export function StockModal({ producto, depositos, onClose }: StockModalProps) {
  const [stock, setStock] = useState<StockPorDeposito[]>([])
  const [cargando, setCargando] = useState(true)
  const [tipo, setTipo] = useState<TipoMovimiento>('entrada')
  const [depositoId, setDepositoId] = useState<number>(depositos[0]?.id ?? 0)
  const [cantidad, setCantidad] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function cargarStock() {
    setCargando(true)
    try {
      const data = await obtenerStockProducto(producto.id)
      setStock(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarStock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.id])

  function cantidadEnDeposito(depositoId: number): string {
    return stock.find((s) => s.deposito_id === depositoId)?.cantidad ?? '0.00'
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!cantidad || Number(cantidad) <= 0) {
      setError('Ingresá una cantidad mayor a cero.')
      return
    }
    setGuardando(true)
    try {
      await registrarMovimientoStock({
        producto_id: producto.id,
        deposito_id: depositoId,
        tipo,
        cantidad: Number(cantidad),
        origen: 'ajuste_manual',
        notas: notas || undefined,
      })
      setCantidad('')
      setNotas('')
      await cargarStock()
    } catch (err: unknown) {
      const mensaje =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'No se pudo registrar el movimiento.'
      setError(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-canvas-raised p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-graphite-900">{producto.nombre}</h2>
          <button onClick={onClose} className="text-graphite-400 hover:text-graphite-900">
            <X size={20} />
          </button>
        </div>
        <p className="mb-4 font-mono text-xs text-graphite-400">{producto.codigo}</p>

        <div className="mb-5 space-y-2">
          {cargando ? (
            <p className="text-sm text-graphite-400">Cargando stock…</p>
          ) : (
            depositos.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md bg-canvas px-3 py-2 text-sm">
                <span className="text-graphite-700">{d.nombre}</span>
                <span className="font-mono font-medium text-graphite-900">{cantidadEnDeposito(d.id)}</span>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 border-t border-graphite-200 pt-4">
          <p className="text-sm font-medium text-graphite-900">Registrar movimiento</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-graphite-700">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
                className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-graphite-700">Depósito</label>
              <select
                value={depositoId}
                onChange={(e) => setDepositoId(Number(e.target.value))}
                className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
              >
                {depositos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-graphite-700">Cantidad</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-graphite-700">Notas</label>
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-md bg-copper-500 px-4 py-2 font-medium text-white hover:bg-copper-600 disabled:opacity-60"
          >
            {guardando ? 'Registrando…' : 'Registrar movimiento'}
          </button>
        </form>
      </div>
    </div>
  )
}
