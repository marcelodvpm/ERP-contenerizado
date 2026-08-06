import { apiClient } from './client'
import type { Usuario } from '../types'

export async function login(username: string, password: string): Promise<string> {
  const body = new URLSearchParams()
  body.set('grant_type', 'password')
  body.set('username', username)
  body.set('password', password)

  const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
    '/auth/login',
    body,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  return data.access_token
}

export async function obtenerUsuarioActual(): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>('/usuarios/me')
  return data
}
