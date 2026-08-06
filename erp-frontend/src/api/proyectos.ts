import { apiClient } from './client'
import type { Proyecto, ProyectoFormInput, ProyectoResumen } from '../types'

export async function listarProyectos(clienteId?: number): Promise<Proyecto[]> {
  const { data } = await apiClient.get<Proyecto[]>('/proyectos', { params: { cliente_id: clienteId } })
  return data
}

export async function obtenerProyecto(id: number): Promise<Proyecto> {
  const { data } = await apiClient.get<Proyecto>(`/proyectos/${id}`)
  return data
}

export async function obtenerResumenProyecto(id: number): Promise<ProyectoResumen> {
  const { data } = await apiClient.get<ProyectoResumen>(`/proyectos/${id}/resumen`)
  return data
}

export async function crearProyecto(input: ProyectoFormInput): Promise<Proyecto> {
  const { data } = await apiClient.post<Proyecto>('/proyectos', input)
  return data
}

export async function asignarTecnicoProyecto(proyectoId: number, tecnicoId: number, rol?: string) {
  const { data } = await apiClient.post(`/proyectos/${proyectoId}/tecnicos`, {
    tecnico_id: tecnicoId,
    rol_en_proyecto: rol,
  })
  return data
}

export async function agregarCostoProyecto(proyectoId: number, concepto: string, monto: number, notas?: string) {
  const { data } = await apiClient.post(`/proyectos/${proyectoId}/costos`, { concepto, monto, notas })
  return data
}
