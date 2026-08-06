import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Plus, Wrench } from 'lucide-react'
import { agregarCostoProyecto, asignarTecnicoProyecto, obtenerResumenProyecto } from '../api/proyectos'
import { listarTecnicos } from '../api/tecnicos'
import { listarPresupuestos } from '../api/presupuestos'
import { listarOTs } from '../api/ordenesTrabajo'
import type { OrdenTrabajo, Presupuesto, ProyectoResumen, Tecnico } from '../types'
import { StatCard } from '../components/StatCard'

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const proyectoId = Number(id)

  const [resumen, setResumen] = useState<ProyectoResumen | null>(null)
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [ots, setOts] = useState<OrdenTrabajo[]>([])
  const [error, setError] = useState<string | null>(null)

  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<number>(0)
  const [rolTecnico, setRolTecnico] = useState('')
  const [asignando, setAsignando] = useState(false)

  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [notasCosto, setNotasCosto] = useState('')
  const [guardandoCosto, setGuardandoCosto] = useState(false)

  async function cargarTodo() {
    const [resumenData, presupuestosData, otsData] = await Promise.all([
      obtenerResumenProyecto(proyectoId),
      listarPresupuestos({ proyecto_id: proyectoId }),
      listarOTs({ proyecto_id: proyectoId }),
    ])
    setResumen(resumenData)
    setPresupuestos(presupuestosData)
    setOts(otsData)
  }

  useEffect(() => {
    if (!id) return
    cargarTodo().catch(() => setError('No se pudo cargar el proyecto.'))
    listarTecnicos().then(setTecnicos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleAsignarTecnico(e: FormEvent) {
    e.preventDefault()
    if (!tecnicoSeleccionado) return
    setAsignando(true)
    try {
      await asignarTecnicoProyecto(proyectoId, tecnicoSeleccionado, rolTecnico || undefined)
      setTecnicoSeleccionado(0)
      setRolTecnico('')
      await cargarTodo()
    } finally {
      setAsignando(false)
    }
  }

  async function handleAgregarCosto(e: FormEvent) {
    e.preventDefault()
    if (!concepto || !monto) return
    setGuardandoCosto(true)
    try {
      await agregarCostoProyecto(proyectoId, concepto, Number(monto), notasCosto || undefined)
      setConcepto('')
      setMonto('')
      setNotasCosto('')
      await cargarTodo()
    } finally {
      setGuardandoCosto(false)
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!resumen) return <p className="text-sm text-graphite-400">Cargando…</p>

  const { proyecto } = resumen
  const balance =
    Number(resumen.total_vendido) - Number(resumen.total_comprado) - Number(resumen.total_costos_adicionales)

  return (
    <div className="space-y-6">
      <Link to="/proyectos" className="flex items-center gap-1 text-sm text-graphite-400 hover:text-graphite-900">
        <ArrowLeft size={14} />
        Volver a proyectos
      </Link>

      <div>
        <p className="font-mono text-sm text-copper-600">{proyecto.numero}</p>
        <h1 className="text-xl font-semibold text-graphite-900">{proyecto.nombre}</h1>
        {proyecto.descripcion && <p className="mt-1 text-sm text-graphite-400">{proyecto.descripcion}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Presupuestado" value={formatoMoneda(resumen.total_presupuestado)} />
        <StatCard label="Comprado" value={formatoMoneda(resumen.total_comprado)} />
        <StatCard label="Vendido" value={formatoMoneda(resumen.total_vendido)} />
        <StatCard
          label="Balance (vendido − comprado − costos)"
          value={balance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Presupuestos vinculados */}
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-graphite-900">
            <FileText size={16} className="text-copper-500" />
            Presupuestos ({presupuestos.length})
          </h2>
          {presupuestos.length === 0 ? (
            <p className="text-sm text-graphite-400">Sin presupuestos vinculados todavía.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
              {presupuestos.map((p) => (
                <Link
                  key={p.id}
                  to={`/presupuestos/${p.id}`}
                  className="flex items-center justify-between border-b border-graphite-200 px-4 py-2 text-sm last:border-0 hover:bg-canvas"
                >
                  <span className="font-mono text-copper-600">{p.numero}</span>
                  <span className="text-graphite-900">{formatoMoneda(p.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* OTs vinculadas */}
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-graphite-900">
            <Wrench size={16} className="text-copper-500" />
            Órdenes de trabajo ({resumen.cantidad_ots})
          </h2>
          {ots.length === 0 ? (
            <p className="text-sm text-graphite-400">Sin órdenes de trabajo vinculadas todavía.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
              {ots.map((o) => (
                <Link
                  key={o.id}
                  to={`/ordenes-trabajo/${o.id}`}
                  className="flex items-center justify-between border-b border-graphite-200 px-4 py-2 text-sm last:border-0 hover:bg-canvas"
                >
                  <span className="font-mono text-copper-600">{o.numero}</span>
                  <span className="text-graphite-700">{o.estado}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Asignar técnico */}
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <h2 className="mb-3 text-sm font-medium text-graphite-900">Asignar técnico</h2>
          <form onSubmit={handleAsignarTecnico} className="space-y-2">
            <select
              value={tecnicoSeleccionado || ''}
              onChange={(e) => setTecnicoSeleccionado(Number(e.target.value))}
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            >
              <option value="" disabled>
                Elegí un técnico…
              </option>
              {tecnicos.map((t) => (
                <option key={t.usuario_id} value={t.usuario_id}>
                  {t.nombre_completo} {t.especialidad ? `· ${t.especialidad}` : ''}
                </option>
              ))}
            </select>
            <input
              value={rolTecnico}
              onChange={(e) => setRolTecnico(e.target.value)}
              placeholder="Rol en el proyecto (opcional)"
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            />
            <button
              type="submit"
              disabled={asignando || !tecnicoSeleccionado}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600 disabled:opacity-60"
            >
              <Plus size={16} />
              {asignando ? 'Asignando…' : 'Asignar'}
            </button>
          </form>
        </div>

        {/* Registrar costo */}
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <h2 className="mb-3 text-sm font-medium text-graphite-900">Registrar costo adicional</h2>
          <form onSubmit={handleAgregarCosto} className="space-y-2">
            <input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Concepto (ej: viáticos)"
              required
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Monto"
              required
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            />
            <input
              value={notasCosto}
              onChange={(e) => setNotasCosto(e.target.value)}
              placeholder="Notas (opcional)"
              className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
            />
            <button
              type="submit"
              disabled={guardandoCosto}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600 disabled:opacity-60"
            >
              <Plus size={16} />
              {guardandoCosto ? 'Guardando…' : 'Agregar costo'}
            </button>
          </form>
          <p className="mt-3 text-xs text-graphite-400">
            Total de costos adicionales: <span className="font-mono">{formatoMoneda(resumen.total_costos_adicionales)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
