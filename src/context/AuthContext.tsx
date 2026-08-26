import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Usuario } from '../types'

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<{ erro?: string }>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function buscarPerfil(userId: string): Promise<Usuario | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error || !data) return null
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    iniciais: data.iniciais,
    avatarColor: data.avatar_color,
    papel: data.papel,
    disciplina: data.disciplina ?? undefined,
    turmaResponsavelId: data.turma_responsavel_id ?? undefined,
    eixoCoordenadoId: data.eixo_coordenado_id ?? undefined,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    supabase.auth.getSession().then(async ({ data }) => {
      const perfil = data.session ? await buscarPerfil(data.session.user.id) : null
      if (ativo) {
        setUsuario(perfil)
        setCarregando(false)
      }
    })

    const { data: assinatura } = supabase.auth.onAuthStateChange(async (_evento, session) => {
      const perfil = session ? await buscarPerfil(session.user.id) : null
      if (ativo) setUsuario(perfil)
    })

    return () => {
      ativo = false
      assinatura.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    usuario,
    carregando,
    entrar: async (email, senha) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) return { erro: traduzirErro(error.message) }
      return {}
    },
    sair: async () => {
      await supabase.auth.signOut()
    },
  }), [usuario, carregando])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

function traduzirErro(mensagem: string): string {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (mensagem.includes('Email not confirmed')) return 'E-mail ainda não confirmado.'
  return 'Não foi possível entrar. Tente novamente.'
}
