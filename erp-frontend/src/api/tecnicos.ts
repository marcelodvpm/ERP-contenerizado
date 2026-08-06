import { apiClient } from './client'
import type { Tecnico } from '../types'

export async function listarTecnicos(): Promise<Tecnico[]> {
  const { data } = await apiClient.get<Tecnico[]>('/tecnicos')
  return data
}
