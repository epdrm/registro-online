import type { ReactNode } from 'react'
import { IconInbox } from './icons'

interface EmptyStateProps {
  titulo: string
  descricao?: string
  icone?: ReactNode
}

export function EmptyState({ titulo, descricao, icone }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-section text-text-secondary">
        {icone ?? <IconInbox size={20} />}
      </div>
      <div className="text-sm font-semibold text-text">{titulo}</div>
      {descricao && <div className="max-w-xs text-sm text-text-secondary">{descricao}</div>}
    </div>
  )
}
