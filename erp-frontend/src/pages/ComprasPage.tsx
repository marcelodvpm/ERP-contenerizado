import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, Trash2, ShoppingBag } from 'lucide-react'
import { crearCompra, listarCompras } from '../api/compras'
import { listarTerceros } from '../api/terceros'
import { listarProductos } from '../api/productos'
import type { Compra, CompraItemInput, EstadoCompra, ProductoServicio, Tercero } from '../types'

const ESTADO_LABELS: Record<EstadoCompra, string> = {
  pendiente: 'Pendiente',
  recibida: 'Recibida',
  cancelada: 'Cancelada',
}

const ESTADO_COLORES: Record<EstadoCompra, string> = {
  pendiente: 'bg-copper-100 text-copper-600',
  recibida: 'bg-success/15 text-success',
  cancelada: 'bg-danger/15 text-danger',
}

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const ITEM_VACIO: CompraItemInput = { producto_id: 0, cantidad: 1, precio_unitario: 0 }

export function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [proveedores, setProveedores] = useState<Tercero[]>([])
  const [productos, setProductos] = useState<ProductoServicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<EstadoCompra | ''>('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorId, setProveedorId] = useState<number>(0)
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<CompraItemInput[]>([{ ...ITEM_VACIO }])
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarCompras({ estado: filtroEstado || undefined })
      setCompras(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado])

  async function abrirModal() {
    setModalAbierto(true)
    if (proveedores.length === 0) listarTerceros({ tipo: 'proveedor' }).then(setProveedores)
    if (productos.length === 0) listarProductos({ tipo: 'producto' }).then(setProductos)
  }

  function actualizarItem(index: number, cambios: Partial<CompraItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...cambios } : it)))
  }

  function elegirProducto(index: number, productoId: number) {
    const producto = productos.find((p) => p.id === productoId)
    actualizarItem(index, {
      producto_id: productoId,
      precio_unitario: producto ? Number(producto.precio_costo) : 0,
    })
  }

  function resetForm() {
    setProveedorId(0)
    setNotas('')
    setItems([{ ...ITEM_VACIO }])
    setError(null)
  }

  const totalEstimado = items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0)

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!proveedorId) {
      setError('Elegí un proveedor.')
      return
    }
    if (items.some((it) => !it.producto_id)) {
      setError('Completá el producto en cada ítem.')
      return
    }
    setGuardando(true)
    try {
      await crearCompra({ proveedor_id: proveedorId, notas: notas || undefined, items })
      setModalAbierto(false)
      resetForm()
      await cargar()
    } catch {
      setError('No se pudo crear la compra.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Compras</h1>
          <p className="text-sm text-graphite-400">Pedidos a proveedores.</p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600"
        >
          <Plus size={16} />
          Nueva compra
        </button>
      </div>

      <select
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value as EstadoCompra | '')}
        className="rounded-md border border-graphite-200 bg-canvas-raised px-3 py-2 text-sm focus-visible:border-copper-500"
      >
        <option value="">Todos los estados</option>
        {Object.entries(ESTADO_LABELS).map(([valor, label]) => (
          <option key={valor} value={valor}>
            {label}
          </option>
        ))}
      </select>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Número</th>
              <th className="px-4 py-3 font-normal">Estado</th>
              <th className="px-4 py-3 font-normal">Fecha</th>
              <th className="px-4 py-3 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : compras.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-graphite-400">
                  No hay compras todavía.
                </td>
              </tr>
            ) : (
              compras.map((c) => (
                <tr key={c.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link
                      to={`/compras/${c.id}`}
                      className="flex items-center gap-2 font-mono text-copper-600 hover:underline"
                    >
                      <ShoppingBag size={15} />
                      {c.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_COLORES[c.estado]}`}>
                      {ESTADO_LABELS[c.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite-700">{c.fecha}</td>
                  <td className="px-4 py-3 text-right font-mono text-graphite-900">{formatoMoneda(c.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/40 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg bg-canvas-raised p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-graphite-900">Nueva compra</h2>
              <button
                onClick={() => {
                  setModalAbierto(false)
                  resetForm()
                }}
                className="text-graphite-400 hover:text-graphite-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-graphite-700">Proveedor *</label>
                <select
                  required
                  value={proveedorId || ''}
                  onChange={(e) => setProveedorId(Number(e.target.value))}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="" disabled>
                    Elegí un proveedor…
                  </option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razon_social}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-graphite-900">Ítems</label>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => [...prev, { ...ITEM_VACIO }])}
                    className="flex items-center gap-1 text-sm text-copper-600 hover:underline"
                  >
                    <Plus size={14} />
                    Agregar ítem
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => {
                    const subtotalItem = item.cantidad * item.precio_unitario
                    return (
                      <div key={index} className="grid grid-cols-12 items-center gap-2 rounded-md bg-canvas p-2">
                        <select
                          value={item.producto_id || ''}
                          onChange={(e) => elegirProducto(index, Number(e.target.value))}
                          className="col-span-5 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
                        >
                          <option value="" disabled>
                            Producto…
                          </option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.cantidad}
                          onChange={(e) => actualizarItem(index, { cantidad: Number(e.target.value) })}
                          placeholder="Cant."
                          className="col-span-2 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precio_unitario}
                          onChange={(e) => actualizarItem(index, { precio_unitario: Number(e.target.value) })}
                          placeholder="Costo"
                          className="col-span-2 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
                        />
                        <span className="col-span-2 text-right font-mono text-sm text-graphite-700">
                          {subtotalItem.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                          disabled={items.length === 1}
                          className="col-span-1 flex justify-center text-graphite-400 hover:text-danger disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-2 flex justify-end text-sm">
                  <span className="text-graphite-400">Total estimado:&nbsp;</span>
                  <span className="font-mono font-semibold text-graphite-900">
                    {totalEstimado.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Notas</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-md bg-copper-500 px-4 py-2 font-medium text-white hover:bg-copper-600 disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Guardar compra'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
