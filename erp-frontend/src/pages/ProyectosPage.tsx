import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, FolderKanban } from 'lucide-react'
import { crearProyecto, listarProyectos } from '../api/proyectos'
import { listarTerceros } from '../api/terceros'
import type { EstadoProyecto, Proyecto, ProyectoFormInput, Tercero } from '../types'

const ESTADO_LABELS: Record<EstadoProyecto, string> = {
  planificacion: 'Planificación',
  activo: 'Activo',
  pausado: 'Pausado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
}

const ESTADO_COLORES: Record<EstadoProyecto, string> = {
  planificacion: 'bg-graphite-200 text-graphite-700',
  activo: 'bg-copper-100 text-copper-600',
  pausado: 'bg-graphite-200 text-graphite-700',
  finalizado: 'bg-success/15 text-success',
  cancelado: 'bg-danger/15 text-danger',
}

const FORM_INICIAL: ProyectoFormInput = {
  nombre: '',
  descripcion: '',
  cliente_id: 0,
  fecha_inicio: '',
  fecha_fin_estimada: '',
}

export function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [clientes, setClientes] = useState<Tercero[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState<ProyectoFormInput>(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarProyectos()
      setProyectos(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function abrirModal() {
    setModalAbierto(true)
    if (clientes.length === 0) {
      const data = await listarTerceros({ tipo: 'cliente' })
      setClientes(data)
    }
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setErrorForm(null)
    if (!form.cliente_id) {
      setErrorForm('Elegí un cliente.')
      return
    }
    setGuardando(true)
    try {
      await crearProyecto(form)
      setModalAbierto(false)
      setForm(FORM_INICIAL)
      await cargar()
    } catch {
      setErrorForm('No se pudo crear el proyecto.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Proyectos</h1>
          <p className="text-sm text-graphite-400">
            Agrupá presupuestos, órdenes de trabajo, compras y ventas de un mismo trabajo.
          </p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600"
        >
          <Plus size={16} />
          Nuevo proyecto
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Número</th>
              <th className="px-4 py-3 font-normal">Nombre</th>
              <th className="px-4 py-3 font-normal">Estado</th>
              <th className="px-4 py-3 font-normal">Inicio</th>
              <th className="px-4 py-3 font-normal">Fin estimado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : proyectos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Todavía no hay proyectos. Creá el primero.
                </td>
              </tr>
            ) : (
              proyectos.map((p) => (
                <tr key={p.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link
                      to={`/proyectos/${p.id}`}
                      className="flex items-center gap-2 font-mono text-copper-600 hover:underline"
                    >
                      <FolderKanban size={15} />
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-graphite-900">{p.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_COLORES[p.estado]}`}>
                      {ESTADO_LABELS[p.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite-700">{p.fecha_inicio ?? '—'}</td>
                  <td className="px-4 py-3 text-graphite-700">{p.fecha_fin_estimada ?? '—'}</td>
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
              <h2 className="text-lg font-semibold text-graphite-900">Nuevo proyecto</h2>
              <button onClick={() => setModalAbierto(false)} className="text-graphite-400 hover:text-graphite-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-graphite-700">Nombre *</label>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Modernización eléctrica Edificio Faro"
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Cliente *</label>
                <select
                  required
                  value={form.cliente_id || ''}
                  onChange={(e) => setForm({ ...form, cliente_id: Number(e.target.value) })}
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

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Fecha de inicio</label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Fin estimado</label>
                  <input
                    type="date"
                    value={form.fecha_fin_estimada}
                    onChange={(e) => setForm({ ...form, fecha_fin_estimada: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
              </div>

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
    </div>
  )
}
