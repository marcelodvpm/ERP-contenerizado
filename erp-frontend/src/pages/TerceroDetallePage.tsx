import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FolderKanban, FileText, Wrench } from 'lucide-react'
import { obtenerTercero } from '../api/terceros'
import { listarProyectos } from '../api/proyectos'
import { listarPresupuestos } from '../api/presupuestos'
import { listarOTs } from '../api/ordenesTrabajo'
import type { OrdenTrabajo, Presupuesto, Proyecto, Tercero } from '../types'

const TIPO_LABELS: Record<Tercero['tipo'], string> = {
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  ambos: 'Cliente y proveedor',
}

function formatoMoneda(valor: string): string {
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function TerceroDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [tercero, setTercero] = useState<Tercero | null>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [ots, setOts] = useState<OrdenTrabajo[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const clienteId = Number(id)
    obtenerTercero(clienteId)
      .then(setTercero)
      .catch(() => setError('No se pudo cargar el registro.'))
    listarProyectos(clienteId).then(setProyectos)
    listarPresupuestos({ cliente_id: clienteId }).then(setPresupuestos)
    listarOTs({ cliente_id: clienteId }).then(setOts)
  }, [id])

  if (error) return <p className="text-sm text-danger">{error}</p>
  if (!tercero) return <p className="text-sm text-graphite-400">Cargando…</p>

  return (
    <div className="space-y-6">
      <Link to="/terceros" className="flex items-center gap-1 text-sm text-graphite-400 hover:text-graphite-900">
        <ArrowLeft size={14} />
        Volver al listado
      </Link>

      <div>
        <span className="rounded-full bg-graphite-200 px-2 py-0.5 text-xs text-graphite-700">
          {TIPO_LABELS[tercero.tipo]}
        </span>
        <h1 className="mt-2 text-xl font-semibold text-graphite-900">{tercero.razon_social}</h1>
        <p className="mt-1 text-sm text-graphite-400">
          {tercero.cuit_dni ?? 'Sin CUIT/DNI'} · {tercero.ciudad ?? 'Sin ciudad'}
          {tercero.provincia ? `, ${tercero.provincia}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <h2 className="mb-3 text-sm font-medium text-graphite-900">Datos de contacto</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-graphite-400">Email</dt>
              <dd className="text-graphite-900">{tercero.email ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-graphite-400">Teléfono</dt>
              <dd className="text-graphite-900">{tercero.telefono ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-graphite-400">Condición IVA</dt>
              <dd className="text-graphite-900">{tercero.condicion_iva ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-graphite-200 bg-canvas-raised p-4">
          <h2 className="mb-3 text-sm font-medium text-graphite-900">Contactos</h2>
          {tercero.contactos.length === 0 ? (
            <p className="text-sm text-graphite-400">Sin contactos registrados.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {tercero.contactos.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span className="text-graphite-900">
                    {c.nombre} {c.es_principal && <span className="text-xs text-copper-600">(principal)</span>}
                  </span>
                  <span className="text-graphite-400">{c.telefono ?? c.email ?? '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-graphite-900">
          <FolderKanban size={16} className="text-copper-500" />
          Proyectos ({proyectos.length})
        </h2>
        {proyectos.length === 0 ? (
          <p className="text-sm text-graphite-400">Sin proyectos asociados.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
            {proyectos.map((p) => (
              <Link
                key={p.id}
                to={`/proyectos/${p.id}`}
                className="flex items-center justify-between border-b border-graphite-200 px-4 py-2 text-sm last:border-0 hover:bg-canvas"
              >
                <span className="font-mono text-copper-600">{p.numero}</span>
                <span className="text-graphite-900">{p.nombre}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-graphite-900">
          <FileText size={16} className="text-copper-500" />
          Presupuestos ({presupuestos.length})
        </h2>
        {presupuestos.length === 0 ? (
          <p className="text-sm text-graphite-400">Sin presupuestos asociados.</p>
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

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-graphite-900">
          <Wrench size={16} className="text-copper-500" />
          Órdenes de trabajo ({ots.length})
        </h2>
        {ots.length === 0 ? (
          <p className="text-sm text-graphite-400">Sin órdenes de trabajo asociadas.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-graphite-200 bg-canvas-raised">
            {ots.map((ot) => (
              <Link
                key={ot.id}
                to={`/ordenes-trabajo/${ot.id}`}
                className="flex items-center justify-between border-b border-graphite-200 px-4 py-2 text-sm last:border-0 hover:bg-canvas"
              >
                <span className="font-mono text-copper-600">{ot.numero}</span>
                <span className="text-graphite-900">{ot.estado}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
