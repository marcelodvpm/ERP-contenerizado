import { apiClient } from './client'
import type { Tercero, TerceroFormInput, TipoTercero } from '../types'

interface ListarTercerosParams {
  tipo?: TipoTercero
  buscar?: string
}

export async function listarTerceros(params: ListarTercerosParams = {}): Promise<Tercero[]> {
  const { data } = await apiClient.get<Tercero[]>('/terceros', { params })
  return data
}

export async function obtenerTercero(id: number): Promise<Tercero> {
  const { data } = await apiClient.get<Tercero>(`/terceros/${id}`)
  return data
}

export async function crearTercero(input: TerceroFormInput): Promise<Tercero> {
  const { data } = await apiClient.post<Tercero>('/terceros', input)
  return data
}
