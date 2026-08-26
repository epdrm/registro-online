import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local',
  )
}

/** Cliente principal — mantém a sessão de quem está logado no app. */
export const supabase = createClient(url, anonKey)

/**
 * Cliente descartável, sem sessão persistida.
 * Usado para criar contas de professores a partir da tela de administração:
 * `auth.signUp` nesse cliente cria o usuário no Supabase Auth sem substituir
 * a sessão de quem está logado (o admin continua autenticado no `supabase` acima).
 */
export function criarClienteDescartavel() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
