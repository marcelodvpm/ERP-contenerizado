import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as loginRequest, obtenerUsuarioActual } from '../api/auth'
import type { Usuario } from '../types'

interface AuthContextValue {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('erp_token')
    if (!token) {
      setCargando(false)
      return
    }
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => localStorage.removeItem('erp_token'))
      .finally(() => setCargando(false))
  }, [])

  async function login(username: string, password: string) {
    const token = await loginRequest(username, password)
    localStorage.setItem('erp_token', token)
    const usuarioActual = await obtenerUsuarioActual()
    setUsuario(usuarioActual)
  }

  function logout() {
    localStorage.removeItem('erp_token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
