import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Search, X, Boxes } from 'lucide-react'
import { crearProducto, listarCategorias, listarDepositos, listarProductos } from '../api/productos'
import type { Categoria, Deposito, ProductoFormInput, ProductoServicio, TipoItem } from '../types'
import { StockModal } from '../components/StockModal'

const TIPO_LABELS: Record<TipoItem, string> = {
  producto: 'Producto',
  servicio: 'Servicio',
}

const FORM_INICIAL: ProductoFormInput = {
  codigo: '',
  nombre: '',
  tipo: 'producto',
  unidad_medida: 'unidad',
  precio_venta: 0,
  precio_costo: 0,
  maneja_stock: true,
  stock_minimo: 0,
}

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function ProductosPage() {
  const [productos, setProductos] = useState<ProductoServicio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoItem | ''>('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState<ProductoFormInput>(FORM_INICIAL)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [productoStock, setProductoStock] = useState<ProductoServicio | null>(null)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarProductos({ buscar: buscar || undefined, tipo: filtroTipo || undefined })
      setProductos(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    listarCategorias().then(setCategorias)
    listarDepositos().then(setDepositos)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(cargar, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, filtroTipo])

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setErrorForm(null)
    setGuardando(true)
    try {
      await crearProducto(form)
      setModalAbierto(false)
      setForm(FORM_INICIAL)
      await cargar()
    } catch {
      setErrorForm('No se pudo guardar. Revisá que el código no esté repetido.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Catálogo e inventario</h1>
          <p className="text-sm text-graphite-400">Productos, servicios y su stock por depósito.</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="w-full rounded-md border border-graphite-200 bg-canvas-raised py-2 pl-9 pr-3 text-sm focus-visible:border-copper-500"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as TipoItem | '')}
          className="rounded-md border border-graphite-200 bg-canvas-raised px-3 py-2 text-sm focus-visible:border-copper-500"
        >
          <option value="">Todos</option>
          <option value="producto">Productos</option>
          <option value="servicio">Servicios</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Código</th>
              <th className="px-4 py-3 font-normal">Nombre</th>
              <th className="px-4 py-3 font-normal">Tipo</th>
              <th className="px-4 py-3 font-normal text-right">Precio venta</th>
              <th className="px-4 py-3 font-normal text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  No hay resultados.
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 font-mono text-graphite-700">{p.codigo}</td>
                  <td className="px-4 py-3 font-medium text-graphite-900">{p.nombre}</td>
                  <td className="px-4 py-3 text-graphite-400">{TIPO_LABELS[p.tipo]}</td>
                  <td className="px-4 py-3 text-right font-mono text-graphite-900">
                    {formatoMoneda(p.precio_venta)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.maneja_stock ? (
                      <button
                        onClick={() => setProductoStock(p)}
                        className="flex items-center gap-1 text-copper-600 hover:underline"
                      >
                        <Boxes size={14} />
                        Ver stock
                      </button>
                    ) : (
                      <span className="text-graphite-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-canvas-raised p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-graphite-900">Nuevo producto/servicio</h2>
              <button onClick={() => setModalAbierto(false)} className="text-graphite-400 hover:text-graphite-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Código *</label>
                  <input
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value as TipoItem,
                        maneja_stock: e.target.value === 'producto',
                      })
                    }
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Nombre *</label>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Categoría</label>
                <select
                  value={form.categoria_id ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, categoria_id: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Unidad</label>
                  <input
                    value={form.unidad_medida}
                    onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Precio venta</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio_venta}
                    onChange={(e) => setForm({ ...form, precio_venta: Number(e.target.value) })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Precio costo</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio_costo}
                    onChange={(e) => setForm({ ...form, precio_costo: Number(e.target.value) })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
              </div>

              {form.tipo === 'producto' && (
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Stock mínimo</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.stock_minimo}
                    onChange={(e) => setForm({ ...form, stock_minimo: Number(e.target.value) })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
              )}

              {errorForm && <p className="text-sm text-danger">{errorForm}</p>}

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-md bg-copper-500 px-4 py-2 font-medium text-white hover:bg-copper-600 disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {productoStock && (
        <StockModal producto={productoStock} depositos={depositos} onClose={() => setProductoStock(null)} />
      )}
    </div>
  )
}
