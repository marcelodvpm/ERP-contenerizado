import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, Trash2, FileText } from 'lucide-react'
import { crearPresupuesto, listarPresupuestos } from '../api/presupuestos'
import { listarTerceros } from '../api/terceros'
import { listarProductos } from '../api/productos'
import { listarProyectos } from '../api/proyectos'
import type {
  EstadoPresupuesto,
  Presupuesto,
  PresupuestoFormInput,
  PresupuestoItemInput,
  ProductoServicio,
  Proyecto,
  Tercero,
} from '../types'

const ESTADO_LABELS: Record<EstadoPresupuesto, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  vencido: 'Vencido',
}

const ESTADO_COLORES: Record<EstadoPresupuesto, string> = {
  borrador: 'bg-graphite-200 text-graphite-700',
  enviado: 'bg-copper-100 text-copper-600',
  aprobado: 'bg-success/15 text-success',
  rechazado: 'bg-danger/15 text-danger',
  vencido: 'bg-graphite-200 text-graphite-400',
}

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const ITEM_VACIO: PresupuestoItemInput = { producto_servicio_id: 0, cantidad: 1, precio_unitario: 0, descuento: 0 }

export function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [clientes, setClientes] = useState<Tercero[]>([])
  const [productos, setProductos] = useState<ProductoServicio[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<EstadoPresupuesto | ''>('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteId, setClienteId] = useState<number>(0)
  const [proyectoId, setProyectoId] = useState<number | undefined>(undefined)
  const [fechaValidez, setFechaValidez] = useState('')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<PresupuestoItemInput[]>([{ ...ITEM_VACIO }])
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarPresupuestos({ estado: filtroEstado || undefined })
      setPresupuestos(data)
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
    if (clientes.length === 0) {
      listarTerceros({ tipo: 'cliente' }).then(setClientes)
    }
    if (productos.length === 0) {
      listarProductos().then(setProductos)
    }
    if (proyectos.length === 0) {
      listarProyectos().then(setProyectos)
    }
  }

  function actualizarItem(index: number, cambios: Partial<PresupuestoItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...cambios } : it)))
  }

  function elegirProducto(index: number, productoId: number) {
    const producto = productos.find((p) => p.id === productoId)
    actualizarItem(index, {
      producto_servicio_id: productoId,
      precio_unitario: producto ? Number(producto.precio_venta) : 0,
    })
  }

  function agregarItem() {
    setItems((prev) => [...prev, { ...ITEM_VACIO }])
  }

  function quitarItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const totalEstimado = items.reduce(
    (acc, it) => acc + it.cantidad * it.precio_unitario - (it.descuento ?? 0),
    0
  )

  function resetForm() {
    setClienteId(0)
    setProyectoId(undefined)
    setFechaValidez('')
    setNotas('')
    setItems([{ ...ITEM_VACIO }])
    setError(null)
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!clienteId) {
      setError('Elegí un cliente.')
      return
    }
    if (items.some((it) => !it.producto_servicio_id)) {
      setError('Completá el producto/servicio en cada ítem.')
      return
    }

    const input: PresupuestoFormInput = {
      cliente_id: clienteId,
      proyecto_id: proyectoId,
      fecha_validez: fechaValidez || undefined,
      notas: notas || undefined,
      items,
    }

    setGuardando(true)
    try {
      await crearPresupuesto(input)
      setModalAbierto(false)
      resetForm()
      await cargar()
    } catch {
      setError('No se pudo crear el presupuesto.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Presupuestos</h1>
          <p className="text-sm text-graphite-400">Cotizaciones para tus clientes.</p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600"
        >
          <Plus size={16} />
          Nuevo presupuesto
        </button>
      </div>

      <select
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value as EstadoPresupuesto | '')}
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
              <th className="px-4 py-3 font-normal">Vigencia</th>
              <th className="px-4 py-3 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : presupuestos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  No hay presupuestos todavía.
                </td>
              </tr>
            ) : (
              presupuestos.map((p) => (
                <tr key={p.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link
                      to={`/presupuestos/${p.id}`}
                      className="flex items-center gap-2 font-mono text-copper-600 hover:underline"
                    >
                      <FileText size={15} />
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_COLORES[p.estado]}`}>
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite-700">{p.fecha}</td>
                  <td className="px-4 py-3 text-graphite-700">{p.fecha_validez ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-graphite-900">{formatoMoneda(p.total)}</td>
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
              <h2 className="text-lg font-semibold text-graphite-900">Nuevo presupuesto</h2>
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
                <label className="mb-1 block text-sm text-graphite-700">Cliente *</label>
                <select
                  required
                  value={clienteId || ''}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="" disabled>
                    Elegí un cliente…
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razon_social}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Válido hasta</label>
                  <input
                    type="date"
                    value={fechaValidez}
                    onChange={(e) => setFechaValidez(e.target.value)}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Proyecto (opcional)</label>
                  <select
                    value={proyectoId ?? ''}
                    onChange={(e) => setProyectoId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  >
                    <option value="">Ninguno</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.numero} · {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-graphite-900">Ítems</label>
                  <button
                    type="button"
                    onClick={agregarItem}
                    className="flex items-center gap-1 text-sm text-copper-600 hover:underline"
                  >
                    <Plus size={14} />
                    Agregar ítem
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => {
                    const subtotalItem = item.cantidad * item.precio_unitario - (item.descuento ?? 0)
                    return (
                      <div key={index} className="grid grid-cols-12 items-center gap-2 rounded-md bg-canvas p-2">
                        <select
                          value={item.producto_servicio_id || ''}
                          onChange={(e) => elegirProducto(index, Number(e.target.value))}
                          className="col-span-5 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
                        >
                          <option value="" disabled>
                            Producto/servicio…
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
                          placeholder="Precio"
                          className="col-span-2 rounded-md border border-graphite-200 px-2 py-1.5 text-sm"
                        />
                        <span className="col-span-2 text-right font-mono text-sm text-graphite-700">
                          {subtotalItem.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => quitarItem(index)}
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
                {guardando ? 'Guardando…' : 'Guardar presupuesto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
