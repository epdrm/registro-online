import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { USUARIOS, usuarioPorId } from '../data/mockData'
import type { Usuario } from '../types'

interface AuthContextValue {
  usuario: Usuario | null
  entrarComo: (usuarioId: string) => void
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState<string | null>(null)

  const value = useMemo<AuthContextValue>(() => ({
    usuario: usuarioId ? (usuarioPorId(usuarioId) ?? null) : null,
    entrarComo: (id: string) => setUsuarioId(id),
    sair: () => setUsuarioId(null),
  }), [usuarioId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

export const USUARIOS_DEMO = USUARIOS
