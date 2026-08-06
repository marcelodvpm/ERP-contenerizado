import { apiClient } from './client'
import type { EstadoPresupuesto, Presupuesto, PresupuestoFormInput } from '../types'

interface ListarPresupuestosParams {
  cliente_id?: number
  proyecto_id?: number
  estado?: EstadoPresupuesto
}

export async function listarPresupuestos(params: ListarPresupuestosParams = {}): Promise<Presupuesto[]> {
  const { data } = await apiClient.get<Presupuesto[]>('/presupuestos', { params })
  return data
}

export async function obtenerPresupuesto(id: number): Promise<Presupuesto> {
  const { data } = await apiClient.get<Presupuesto>(`/presupuestos/${id}`)
  return data
}

export async function crearPresupuesto(input: PresupuestoFormInput): Promise<Presupuesto> {
  const { data } = await apiClient.post<Presupuesto>('/presupuestos', input)
  return data
}

export async function cambiarEstadoPresupuesto(id: number, estado: EstadoPresupuesto): Promise<Presupuesto> {
  const { data } = await apiClient.patch<Presupuesto>(`/presupuestos/${id}/estado`, { estado })
  return data
}
