// O Supabase Auth exige um e-mail para login/senha. Como este é um sistema
// interno sem uso de e-mail de verdade, cada usuário loga com um "nome de
// usuário" e por baixo dos panos isso vira um e-mail sintético fixo — nunca
// exibido nem enviado a lugar nenhum, só usado para falar com o Auth.

export const DOMINIO_INTERNO = 'interno.escola'

export const REGEX_USUARIO = /^[a-z0-9._-]+$/i

export function normalizarUsuario(usuario: string): string {
  return usuario.trim().toLowerCase()
}

export function emailInterno(usuario: string): string {
  return `${normalizarUsuario(usuario)}@${DOMINIO_INTERNO}`
}
