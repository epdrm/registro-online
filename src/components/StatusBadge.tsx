import type { StatusTratativa } from '../types'

const CONFIG: Record<StatusTratativa, { rotulo: string; cor: string }> = {
  sem_tratativa: { rotulo: 'Sem tratativa', cor: '#B3261E' },
  em_acompanhamento: { rotulo: 'Em acompanhamento', cor: '#C2601C' },
  resolvido: { rotulo: 'Resolvido', cor: '#16794C' },
}

export function StatusBadge({ status }: { status: StatusTratativa }) {
  const { rotulo, cor } = CONFIG[status]
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ color: cor, background: `${cor}14` }}
    >
      {rotulo}
    </span>
  )
}
