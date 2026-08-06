import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, Wrench } from 'lucide-react'
import { crearOT, listarOTs } from '../api/ordenesTrabajo'
import { listarTerceros } from '../api/terceros'
import { listarTecnicos } from '../api/tecnicos'
import { listarPresupuestos } from '../api/presupuestos'
import { listarProyectos } from '../api/proyectos'
import type {
  EstadoOT,
  OrdenTrabajo,
  OTFormInput,
  Presupuesto,
  PrioridadOT,
  Proyecto,
  Tecnico,
  Tercero,
  TipoOT,
} from '../types'

const ESTADO_LABELS: Record<EstadoOT, string> = {
  pendiente: 'Pendiente',
  asignada: 'Asignada',
  en_progreso: 'En progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

const ESTADO_COLORES: Record<EstadoOT, string> = {
  pendiente: 'bg-graphite-200 text-graphite-700',
  asignada: 'bg-copper-100 text-copper-600',
  en_progreso: 'bg-copper-100 text-copper-600',
  completada: 'bg-success/15 text-success',
  cancelada: 'bg-danger/15 text-danger',
}

const TIPO_LABELS: Record<TipoOT, string> = {
  instalacion: 'Instalación',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
}

const PRIORIDAD_LABELS: Record<PrioridadOT, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
}

const FORM_INICIAL: OTFormInput = {
  cliente_id: 0,
  tipo: 'instalacion',
  prioridad: 'media',
}

export function OrdenesTrabajoPage() {
  const [ots, setOts] = useState<OrdenTrabajo[]>([])
  const [clientes, setClientes] = useState<Tercero[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [presupuestosCliente, setPresupuestosCliente] = useState<Presupuesto[]>([])
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<EstadoOT | ''>('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState<OTFormInput>(FORM_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarOTs({ estado: filtroEstado || undefined })
      setOts(data)
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
    if (clientes.length === 0) listarTerceros({ tipo: 'cliente' }).then(setClientes)
    if (tecnicos.length === 0) listarTecnicos().then(setTecnicos)
    if (proyectos.length === 0) listarProyectos().then(setProyectos)
  }

  async function handleClienteChange(clienteId: number) {
    setForm({ ...form, cliente_id: clienteId, presupuesto_id: undefined })
    setPresupuestosCliente([])
    if (clienteId) {
      const data = await listarPresupuestos({ cliente_id: clienteId, estado: 'aprobado' })
      setPresupuestosCliente(data)
    }
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.cliente_id) {
      setError('Elegí un cliente.')
      return
    }
    setGuardando(true)
    try {
      await crearOT(form)
      setModalAbierto(false)
      setForm(FORM_INICIAL)
      setPresupuestosCliente([])
      await cargar()
    } catch {
      setError('No se pudo crear la orden de trabajo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Órdenes de trabajo</h1>
          <p className="text-sm text-graphite-400">Instalaciones, reparaciones y mantenimientos.</p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600"
        >
          <Plus size={16} />
          Nueva OT
        </button>
      </div>

      <select
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value as EstadoOT | '')}
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
              <th className="px-4 py-3 font-normal">Tipo</th>
              <th className="px-4 py-3 font-normal">Estado</th>
              <th className="px-4 py-3 font-normal">Prioridad</th>
              <th className="px-4 py-3 font-normal">Programada</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : ots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  No hay órdenes de trabajo todavía.
                </td>
              </tr>
            ) : (
              ots.map((ot) => (
                <tr key={ot.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link
                      to={`/ordenes-trabajo/${ot.id}`}
                      className="flex items-center gap-2 font-mono text-copper-600 hover:underline"
                    >
                      <Wrench size={15} />
                      {ot.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-graphite-700">{TIPO_LABELS[ot.tipo]}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${ESTADO_COLORES[ot.estado]}`}>
                      {ESTADO_LABELS[ot.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite-700">{PRIORIDAD_LABELS[ot.prioridad]}</td>
                  <td className="px-4 py-3 text-graphite-700">
                    {ot.fecha_programada ? new Date(ot.fecha_programada).toLocaleDateString('es-AR') : '—'}
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
              <h2 className="text-lg font-semibold text-graphite-900">Nueva orden de trabajo</h2>
              <button onClick={() => setModalAbierto(false)} className="text-graphite-400 hover:text-graphite-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-graphite-700">Cliente *</label>
                <select
                  required
                  value={form.cliente_id || ''}
                  onChange={(e) => handleClienteChange(Number(e.target.value))}
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

              {presupuestosCliente.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">
                    Presupuesto aprobado (opcional)
                  </label>
                  <select
                    value={form.presupuesto_id ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, presupuesto_id: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  >
                    <option value="">Ninguno</option>
                    {presupuestosCliente.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.numero}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoOT })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  >
                    {Object.entries(TIPO_LABELS).map(([valor, label]) => (
                      <option key={valor} value={valor}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm({ ...form, prioridad: e.target.value as PrioridadOT })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  >
                    {Object.entries(PRIORIDAD_LABELS).map(([valor, label]) => (
                      <option key={valor} value={valor}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Técnico (opcional)</label>
                <select
                  value={form.tecnico_id ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, tecnico_id: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="">Sin asignar</option>
                  {tecnicos.map((t) => (
                    <option key={t.usuario_id} value={t.usuario_id}>
                      {t.nombre_completo} {t.especialidad ? `· ${t.especialidad}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Proyecto (opcional)</label>
                <select
                  value={form.proyecto_id ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, proyecto_id: e.target.value ? Number(e.target.value) : undefined })
                  }
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

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Dirección del servicio</label>
                <input
                  value={form.direccion_servicio ?? ''}
                  onChange={(e) => setForm({ ...form, direccion_servicio: e.target.value })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Descripción</label>
                <textarea
                  value={form.descripcion ?? ''}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
