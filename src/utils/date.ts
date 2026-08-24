// Data de referência do protótipo — fixa para que os dados fictícios (peso
// acumulado, alertas, "hoje/ontem") fiquem sempre consistentes na demonstração.
export const HOJE = new Date(2026, 7, 24, 18, 0, 0) // 24/ago/2026

export function comData(diasAtras: number, hora: number, minuto: number): Date {
  const d = new Date(HOJE)
  d.setDate(d.getDate() - diasAtras)
  d.setHours(hora, minuto, 0, 0)
  return d
}

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

export function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  const hora = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  const inicioHoje = new Date(HOJE)
  inicioHoje.setHours(0, 0, 0, 0)
  const inicioOntem = new Date(inicioHoje)
  inicioOntem.setDate(inicioOntem.getDate() - 1)

  if (d >= inicioHoje) return `Hoje, ${hora}`
  if (d >= inicioOntem) return `Ontem, ${hora}`
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${hora}`
}

export function formatarDataCurta(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

export function diasEntre(isoInicio: string, referencia: Date = HOJE): number {
  const diff = referencia.getTime() - new Date(isoInicio).getTime()
  return diff / (1000 * 60 * 60 * 24)
}

export function tempoRelativo(iso: string): string {
  const dias = diasEntre(iso)
  if (dias < 1) return 'há poucas horas'
  if (dias < 2) return 'há 1 dia'
  return `há ${Math.floor(dias)} dias`
}
