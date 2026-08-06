import { useEffect, useState, type FormEvent } from 'react'
import { Plus, X, CalendarDays } from 'lucide-react'
import { actualizarTurno, crearTurno, listarAgenda } from '../api/agenda'
import { listarTecnicos } from '../api/tecnicos'
import { listarOTs } from '../api/ordenesTrabajo'
import type { EstadoAgenda, OrdenTrabajo, Tecnico, Turno, TurnoFormInput } from '../types'

const ESTADO_LABELS: Record<EstadoAgenda, string> = {
  programado: 'Programado',
  confirmado: 'Confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

const ESTADO_COLORES: Record<EstadoAgenda, string> = {
  programado: 'bg-graphite-200 text-graphite-700',
  confirmado: 'bg-copper-100 text-copper-600',
  completado: 'bg-success/15 text-success',
  cancelado: 'bg-danger/15 text-danger',
}

const FORM_INICIAL: TurnoFormInput = {
  tecnico_id: 0,
  fecha: '',
  hora_inicio: '',
  hora_fin: '',
}

function formatoFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function AgendaPage() {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [ots, setOts] = useState<OrdenTrabajo[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroTecnico, setFiltroTecnico] = useState<number | ''>('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState<TurnoFormInput>(FORM_INICIAL)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarAgenda({ tecnico_id: filtroTecnico || undefined })
      setTurnos(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    listarTecnicos().then(setTecnicos)
  }, [])

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTecnico])

  async function abrirModal() {
    setModalAbierto(true)
    if (ots.length === 0) {
      const data = await listarOTs()
      setOts(data.filter((o) => o.estado !== 'completada' && o.estado !== 'cancelada'))
    }
  }

  function nombreTecnico(id: number): string {
    return tecnicos.find((t) => t.usuario_id === id)?.nombre_completo ?? `Técnico #${id}`
  }

  async function handleCambiarEstado(turno: Turno, estado: EstadoAgenda) {
    const actualizado = await actualizarTurno(turno.id, { estado })
    setTurnos((prev) => prev.map((t) => (t.id === turno.id ? actualizado : t)))
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.tecnico_id || !form.fecha || !form.hora_inicio || !form.hora_fin) {
      setError('Completá técnico, fecha y horario.')
      return
    }
    setGuardando(true)
    try {
      await crearTurno(form)
      setModalAbierto(false)
      setForm(FORM_INICIAL)
      await cargar()
    } catch (err: unknown) {
      const mensaje =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'No se pudo crear el turno.'
      setError(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Agenda de técnicos</h1>
          <p className="text-sm text-graphite-400">Turnos programados por técnico.</p>
        </div>
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-medium text-white hover:bg-copper-600"
        >
          <Plus size={16} />
          Nuevo turno
        </button>
      </div>

      <select
        value={filtroTecnico}
        onChange={(e) => setFiltroTecnico(e.target.value ? Number(e.target.value) : '')}
        className="rounded-md border border-graphite-200 bg-canvas-raised px-3 py-2 text-sm focus-visible:border-copper-500"
      >
        <option value="">Todos los técnicos</option>
        {tecnicos.map((t) => (
          <option key={t.usuario_id} value={t.usuario_id}>
            {t.nombre_completo}
          </option>
        ))}
      </select>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Fecha</th>
              <th className="px-4 py-3 font-normal">Horario</th>
              <th className="px-4 py-3 font-normal">Técnico</th>
              <th className="px-4 py-3 font-normal">Notas</th>
              <th className="px-4 py-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : turnos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  No hay turnos programados.
                </td>
              </tr>
            ) : (
              turnos.map((t) => (
                <tr key={t.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 text-graphite-900">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-copper-500" />
                      {formatoFecha(t.fecha)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-graphite-700">
                    {t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3 text-graphite-700">{nombreTecnico(t.tecnico_id)}</td>
                  <td className="px-4 py-3 text-graphite-400">{t.notas ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.estado}
                      onChange={(e) => handleCambiarEstado(t, e.target.value as EstadoAgenda)}
                      className={`rounded-full border-0 px-2 py-0.5 text-xs ${ESTADO_COLORES[t.estado]}`}
                    >
                      {Object.entries(ESTADO_LABELS).map(([valor, label]) => (
                        <option key={valor} value={valor}>
                          {label}
                        </option>
                      ))}
                    </select>
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
              <h2 className="text-lg font-semibold text-graphite-900">Nuevo turno</h2>
              <button onClick={() => setModalAbierto(false)} className="text-graphite-400 hover:text-graphite-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-graphite-700">Técnico *</label>
                <select
                  required
                  value={form.tecnico_id || ''}
                  onChange={(e) => setForm({ ...form, tecnico_id: Number(e.target.value) })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="" disabled>
                    Elegí un técnico…
                  </option>
                  {tecnicos.map((t) => (
                    <option key={t.usuario_id} value={t.usuario_id}>
                      {t.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Orden de trabajo (opcional)</label>
                <select
                  value={form.ot_id ?? ''}
                  onChange={(e) => setForm({ ...form, ot_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="">Ninguna (visita general)</option>
                  {ots.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.numero}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Fecha *</label>
                <input
                  type="date"
                  required
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Hora inicio *</label>
                  <input
                    type="time"
                    required
                    value={form.hora_inicio}
                    onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Hora fin *</label>
                  <input
                    type="time"
                    required
                    value={form.hora_fin}
                    onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Notas</label>
                <input
                  value={form.notas ?? ''}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-md bg-copper-500 px-4 py-2 font-medium text-white hover:bg-copper-600 disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Guardar turno'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
