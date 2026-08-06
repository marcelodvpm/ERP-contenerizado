import { apiClient } from './client'
import type { Compra, CompraFormInput, EstadoCompra } from '../types'

interface ListarComprasParams {
  proveedor_id?: number
  estado?: EstadoCompra
}

export async function listarCompras(params: ListarComprasParams = {}): Promise<Compra[]> {
  const { data } = await apiClient.get<Compra[]>('/compras', { params })
  return data
}

export async function obtenerCompra(id: number): Promise<Compra> {
  const { data } = await apiClient.get<Compra>(`/compras/${id}`)
  return data
}

export async function crearCompra(input: CompraFormInput): Promise<Compra> {
  const { data } = await apiClient.post<Compra>('/compras', input)
  return data
}

export async function recibirCompra(id: number, depositoId: number): Promise<Compra> {
  const { data } = await apiClient.post<Compra>(`/compras/${id}/recibir`, { deposito_id: depositoId })
  return data
}
