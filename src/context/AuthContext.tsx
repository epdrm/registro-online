import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { emailInterno } from '../lib/username'
import type { Usuario } from '../types'

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  entrar: (usuario: string, senha: string) => Promise<{ erro?: string }>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface PerfilComDisciplinas {
  id: string
  nome: string
  username: string
  email: string
  iniciais: string
  avatar_color: string
  papel: Usuario['papel']
  turma_responsavel_id: string | null
  eixo_coordenado_id: string | null
  professor_disciplinas: { disciplinas: { nome: string } | null }[] | null
}

async function buscarPerfil(userId: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, professor_disciplinas(disciplinas(nome))')
    .eq('id', userId)
    .maybeSingle<PerfilComDisciplinas>()
  if (error || !data) return null
  return {
    id: data.id,
    nome: data.nome,
    username: data.username,
    email: data.email,
    iniciais: data.iniciais,
    avatarColor: data.avatar_color,
    papel: data.papel,
    disciplinas: (data.professor_disciplinas ?? [])
      .map((pd) => pd.disciplinas?.nome)
      .filter((nome): nome is string => !!nome),
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
    entrar: async (usuarioLogin, senha) => {
      const { error } = await supabase.auth.signInWithPassword({ email: emailInterno(usuarioLogin), password: senha })
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
  if (mensagem.includes('Invalid login credentials')) return 'Usuário ou senha incorretos.'
  if (mensagem.includes('Email not confirmed')) return 'Conta ainda não confirmada.'
  return 'Não foi possível entrar. Tente novamente.'
}
