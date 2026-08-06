import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { actualizarOT, obtenerOT } from '../api/ordenesTrabajo'
import { listarTecnicos } from '../api/tecnicos'
import type { EstadoOT, OrdenTrabajo, Tecnico } from '../types'

const ESTADO_LABELS: Record<EstadoOT, string> = {
  pendiente: 'Pendiente',
  asignada: 'Asignada',
  en_progreso: 'En progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

const SIGUIENTE_ESTADO: Partial<Record<EstadoOT, EstadoOT>> = {
  pendiente: 'asignada',
  asignada: 'en_progreso',
  en_progreso: 'completada',
}

export function OTDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [ot, setOt] = useState<OrdenTrabajo | null>(null)
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [error, setError] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState(false)

  async function cargar() {
    if (!id) return
    const data = await obtenerOT(Number(id))
    setOt(data)
  }

  useEffect(() => {
    cargar().catch(() => setError('No se pudo cargar la orden de trabajo.'))
    listarTecnicos().then(setTecnicos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleAsignarTecnico(tecnicoId: number) {
    if (!ot) return
    setActualizando(true)
    try {
      const actualizada = await actualizarOT(ot.id, { tecnico_id: tecnicoId })
      setOt(actualizada)
    } finally {
      setActualizando(false)
    }
  }

  async function avanzarEstado() {
    if (!ot) return
    const siguiente = SIGUIENTE_ESTADO[ot.estado]
    if (!siguiente) return
    setActualizando(true)
    try {
      const actualizada = await actualizarOT(ot.id, { estado: siguiente })
      setOt(actualizada)
    } finally {
      setActualizando(false)
    }
  }

  async function cancelar() {
    if (!ot) return
    setActualizando(true)
    try {
      const actualizada = await actualizarOT(ot.id, { estado: 'cancelada' })
      setOt(actualizada)
    } finally {
      setActualizando(false)
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!ot) return <p className="text-sm text-graphite-400">Cargando…</p>

  const tecnicoActual = tecnicos.find((t) => t.usuario_id === ot.tecnico_id)
  const siguienteEstado = SIGUIENTE_ESTADO[ot.estado]
  const puedeCancelar = ot.estado !== 'completada' && ot.estado !== 'cancelada'

  return (
    <div className="space-y-6">
      <Link to="/ordenes-trabajo" className="flex items-center gap-1 text-sm text-graphite-400 hover:text-graphite-900">
        <ArrowLeft size={14} />
        Volver a órdenes de trabajo
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm text-copper-600">{ot.numero}</p>
          <h1 className="text-xl font-semibold text-graphite-900">Estado: {ESTADO_LABELS[ot.estado]}</h1>
          {ot.direccion_servicio && <p className="mt-1 text-sm text-graphite-400">{ot.direccion_servicio}</p>}
        </div>

        <div className="flex gap-2">
          {siguienteEstado && (
            <button
              onClick={avanzarEstado}
              disabled={actualizando}
              className="rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600 disabled:opacity-60"
            >
              Marcar como {ESTADO_LABELS[siguienteEstado].toLowerCase()}
            </button>
          )}
          {puedeCancelar && (
            <button
              onClick={cancelar}
              disabled={actualizando}
              className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-60"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {ot.descripcion && (
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <p className="mb-1 text-sm font-medium text-graphite-900">Descripción</p>
          <p className="text-sm text-graphite-700">{ot.descripcion}</p>
        </div>
      )}

      <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
        <p className="mb-2 text-sm font-medium text-graphite-900">Técnico asignado</p>
        <select
          value={ot.tecnico_id ?? ''}
          onChange={(e) => handleAsignarTecnico(Number(e.target.value))}
          disabled={actualizando}
          className="w-full max-w-sm rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
        >
          <option value="" disabled>
            Sin asignar
          </option>
          {tecnicos.map((t) => (
            <option key={t.usuario_id} value={t.usuario_id}>
              {t.nombre_completo} {t.especialidad ? `· ${t.especialidad}` : ''}
            </option>
          ))}
        </select>
        {tecnicoActual && (
          <p className="mt-2 text-xs text-graphite-400">Zona de cobertura: {tecnicoActual.zona_cobertura ?? '—'}</p>
        )}
      </div>
    </div>
  )
}
