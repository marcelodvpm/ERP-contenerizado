import { apiClient } from './client'
import type { Turno, TurnoFormInput, TurnoUpdateInput } from '../types'

interface ListarAgendaParams {
  tecnico_id?: number
  fecha_desde?: string
  fecha_hasta?: string
}

export async function listarAgenda(params: ListarAgendaParams = {}): Promise<Turno[]> {
  const { data } = await apiClient.get<Turno[]>('/agenda', { params })
  return data
}

export async function crearTurno(input: TurnoFormInput): Promise<Turno> {
  const { data } = await apiClient.post<Turno>('/agenda', input)
  return data
}

export async function actualizarTurno(id: number, input: TurnoUpdateInput): Promise<Turno> {
  const { data } = await apiClient.put<Turno>(`/agenda/${id}`, input)
  return data
}
