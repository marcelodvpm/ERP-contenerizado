import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import { crearTercero, listarTerceros } from '../api/terceros'
import type { Tercero, TerceroFormInput, TipoTercero } from '../types'

const TIPO_LABELS: Record<TipoTercero, string> = {
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  ambos: 'Cliente y proveedor',
}

const FORM_INICIAL: TerceroFormInput = {
  tipo: 'cliente',
  razon_social: '',
  cuit_dni: '',
  email: '',
  telefono: '',
  ciudad: '',
  provincia: '',
}

export function TercerosPage() {
  const [terceros, setTerceros] = useState<Tercero[]>([])
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoTercero | ''>('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState<TerceroFormInput>(FORM_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  async function cargar() {
    setCargando(true)
    try {
      const data = await listarTerceros({
        buscar: buscar || undefined,
        tipo: filtroTipo || undefined,
      })
      setTerceros(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(cargar, 300) // debounce simple para la búsqueda
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, filtroTipo])

  async function handleCrear(e: FormEvent) {
    e.preventDefault()
    setErrorForm(null)
    setGuardando(true)
    try {
      await crearTercero(form)
      setModalAbierto(false)
      setForm(FORM_INICIAL)
      await cargar()
    } catch {
      setErrorForm('No se pudo guardar. Revisá que el CUIT/DNI no esté repetido.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-graphite-900">Clientes y proveedores</h1>
          <p className="text-sm text-graphite-400">Gestioná tu cartera comercial.</p>
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
            placeholder="Buscar por nombre o CUIT/DNI…"
            className="w-full rounded-md border border-graphite-200 bg-canvas-raised py-2 pl-9 pr-3 text-sm focus-visible:border-copper-500"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as TipoTercero | '')}
          className="rounded-md border border-graphite-200 bg-canvas-raised px-3 py-2 text-sm focus-visible:border-copper-500"
        >
          <option value="">Todos</option>
          <option value="cliente">Clientes</option>
          <option value="proveedor">Proveedores</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-graphite-200 text-left text-graphite-400">
              <th className="px-4 py-3 font-normal">Razón social</th>
              <th className="px-4 py-3 font-normal">Tipo</th>
              <th className="px-4 py-3 font-normal">CUIT/DNI</th>
              <th className="px-4 py-3 font-normal">Ciudad</th>
              <th className="px-4 py-3 font-normal">Contacto</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  Cargando…
                </td>
              </tr>
            ) : terceros.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-graphite-400">
                  No hay resultados. Probá con otra búsqueda o creá el primero.
                </td>
              </tr>
            ) : (
              terceros.map((t) => (
                <tr key={t.id} className="border-b border-graphite-200 last:border-0 hover:bg-canvas">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/terceros/${t.id}`} className="text-graphite-900 hover:text-copper-600 hover:underline">
                      {t.razon_social}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-graphite-400">{TIPO_LABELS[t.tipo]}</td>
                  <td className="px-4 py-3 font-mono text-graphite-700">{t.cuit_dni ?? '—'}</td>
                  <td className="px-4 py-3 text-graphite-700">{t.ciudad ?? '—'}</td>
                  <td className="px-4 py-3 text-graphite-700">
                    {t.email ?? t.telefono ?? '—'}
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
              <h2 className="text-lg font-semibold text-graphite-900">Nuevo cliente/proveedor</h2>
              <button onClick={() => setModalAbierto(false)} className="text-graphite-400 hover:text-graphite-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-graphite-700">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoTercero })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                >
                  <option value="cliente">Cliente</option>
                  <option value="proveedor">Proveedor</option>
                  <option value="ambos">Cliente y proveedor</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Razón social *</label>
                <input
                  required
                  value={form.razon_social}
                  onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">CUIT/DNI</label>
                  <input
                    value={form.cuit_dni}
                    onChange={(e) => setForm({ ...form, cuit_dni: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-graphite-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Ciudad</label>
                  <input
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    className="w-full rounded-md border border-graphite-200 px-3 py-2 text-sm focus-visible:border-copper-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-graphite-700">Provincia</label>
                  <input
                    value={form.provincia}
                    onChange={(e) => setForm({ ...form, provincia: e.target.value })}
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
