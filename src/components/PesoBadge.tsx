import type { PesoTipo } from '../types'

const CORES: Record<PesoTipo, string> = {
  leve: '#B98900',
  moderada: '#C2601C',
  grave: '#B3261E',
  positiva: '#16794C',
}

const ROTULOS: Record<PesoTipo, string> = {
  leve: 'Leve',
  moderada: 'Moderada',
  grave: 'Grave',
  positiva: 'Positiva',
}

interface PesoBadgeProps {
  peso: PesoTipo
  pesoNumero: number
  className?: string
}

/** Selo de peso — sempre com rótulo textual, nunca só cor (regra de acessibilidade do design-system). */
export function PesoBadge({ peso, pesoNumero, className = '' }: PesoBadgeProps) {
  const cor = CORES[peso]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap ${className}`}
      style={{ color: cor, background: `${cor}14` }}
    >
      {ROTULOS[peso]} · {peso === 'positiva' ? 'não soma' : `peso ${pesoNumero}`}
    </span>
  )
}
