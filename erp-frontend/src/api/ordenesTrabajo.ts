import { apiClient } from './client'
import type { EstadoOT, OrdenTrabajo, OTFormInput, OTUpdateInput } from '../types'

interface ListarOTsParams {
  cliente_id?: number
  tecnico_id?: number
  proyecto_id?: number
  estado?: EstadoOT
}

export async function listarOTs(params: ListarOTsParams = {}): Promise<OrdenTrabajo[]> {
  const { data } = await apiClient.get<OrdenTrabajo[]>('/ordenes-trabajo', { params })
  return data
}

export async function obtenerOT(id: number): Promise<OrdenTrabajo> {
  const { data } = await apiClient.get<OrdenTrabajo>(`/ordenes-trabajo/${id}`)
  return data
}

export async function crearOT(input: OTFormInput): Promise<OrdenTrabajo> {
  const { data } = await apiClient.post<OrdenTrabajo>('/ordenes-trabajo', input)
  return data
}

export async function actualizarOT(id: number, input: OTUpdateInput): Promise<OrdenTrabajo> {
  const { data } = await apiClient.put<OrdenTrabajo>(`/ordenes-trabajo/${id}`, input)
  return data
}
