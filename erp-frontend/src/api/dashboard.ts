import { apiClient } from './client'
import type { DashboardResumen } from '../types'

export async function obtenerResumenDashboard(): Promise<DashboardResumen> {
  const { data } = await apiClient.get<DashboardResumen>('/dashboard/resumen')
  return data
}
