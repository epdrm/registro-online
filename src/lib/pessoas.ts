// Helpers compartilhados entre as telas que cadastram pessoas (professores, alunos).

export const CORES_AVATAR = ['#5C6661', '#16794C', '#0F5138', '#B98900']

export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '??'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function corAleatoria(): string {
  return CORES_AVATAR[Math.floor(Math.random() * CORES_AVATAR.length)]
}
