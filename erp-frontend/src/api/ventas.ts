import { apiClient } from './client'
import type { EstadoVenta, Venta, VentaFormInput } from '../types'

interface ListarVentasParams {
  cliente_id?: number
  estado?: EstadoVenta
}

export async function listarVentas(params: ListarVentasParams = {}): Promise<Venta[]> {
  const { data } = await apiClient.get<Venta[]>('/ventas', { params })
  return data
}

export async function obtenerVenta(id: number): Promise<Venta> {
  const { data } = await apiClient.get<Venta>(`/ventas/${id}`)
  return data
}

export async function crearVenta(input: VentaFormInput): Promise<Venta> {
  const { data } = await apiClient.post<Venta>('/ventas', input)
  return data
}

export async function marcarVentaPagada(id: number): Promise<Venta> {
  const { data } = await apiClient.post<Venta>(`/ventas/${id}/marcar-pagada`)
  return data
}
