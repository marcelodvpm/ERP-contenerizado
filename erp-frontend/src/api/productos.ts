import { apiClient } from './client'
import type {
  Categoria,
  Deposito,
  MovimientoStockInput,
  ProductoFormInput,
  ProductoServicio,
  StockPorDeposito,
  TipoItem,
} from '../types'

interface ListarProductosParams {
  tipo?: TipoItem
  categoria_id?: number
  buscar?: string
}

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await apiClient.get<Categoria[]>('/categorias')
  return data
}

export async function listarDepositos(): Promise<Deposito[]> {
  const { data } = await apiClient.get<Deposito[]>('/depositos')
  return data
}

export async function listarProductos(params: ListarProductosParams = {}): Promise<ProductoServicio[]> {
  const { data } = await apiClient.get<ProductoServicio[]>('/productos', { params })
  return data
}

export async function crearProducto(input: ProductoFormInput): Promise<ProductoServicio> {
  const { data } = await apiClient.post<ProductoServicio>('/productos', input)
  return data
}

export async function obtenerStockProducto(productoId: number): Promise<StockPorDeposito[]> {
  const { data } = await apiClient.get<StockPorDeposito[]>(`/productos/${productoId}/stock`)
  return data
}

export async function registrarMovimientoStock(input: MovimientoStockInput) {
  const { data } = await apiClient.post('/movimientos-stock', input)
  return data
}
