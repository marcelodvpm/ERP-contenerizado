import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-graphite-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-white">
          <Zap size={22} className="text-copper-500" strokeWidth={2} />
          <span className="font-mono text-sm uppercase tracking-widest text-copper-400">
            ERP · Latina Home Solutions
          </span>
        </div>

        <div className="rounded-lg border border-graphite-800 bg-graphite-900 p-8">
          <h1 className="mb-6 text-lg font-semibold text-white">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm text-graphite-200">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full rounded-md border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-400 focus-visible:border-copper-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-graphite-200">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-graphite-700 bg-graphite-800 px-3 py-2 text-white placeholder:text-graphite-400 focus-visible:border-copper-500"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-md bg-copper-500 px-4 py-2 font-medium text-white transition-colors hover:bg-copper-600 disabled:opacity-60"
            >
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
