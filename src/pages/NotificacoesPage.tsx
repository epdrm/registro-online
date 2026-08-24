import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { turmaPorId } from '../data/mockData'
import { formatarDataHora, tempoRelativo } from '../utils/date'
import { IconAlertTriangle, IconBarChart, IconBell } from '../components/icons'

const ABAS = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao_lidas', label: 'Não lidas' },
] as const

export function NotificacoesPage() {
  const { notificacoes, marcarComoLida, marcarTodasComoLidas } = useData()
  const navigate = useNavigate()
  const [aba, setAba] = useState<(typeof ABAS)[number]['id']>('todas')

  const lista = aba === 'nao_lidas' ? notificacoes.filter((n) => !n.lida) : notificacoes
  const naoLidas = notificacoes.filter((n) => !n.lida).length

  function abrir(id: string, alunoId?: string) {
    marcarComoLida(id)
    if (alunoId) navigate(`/app/aluno/${alunoId}`)
  }

  return (
    <AppShell titulo="Central de notificações">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 px-4 py-6 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {ABAS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`tap-target rounded-md px-3.5 text-[13px] font-semibold ${
                  aba === a.id ? 'bg-green-soft text-green-dark' : 'text-text-secondary'
                }`}
              >
                {a.label} {a.id === 'nao_lidas' && naoLidas > 0 && `(${naoLidas})`}
              </button>
            ))}
          </div>
          {naoLidas > 0 && (
            <button onClick={marcarTodasComoLidas} className="tap-target text-[13px] font-semibold text-green">
              Marcar todas como lidas
            </button>
          )}
        </div>

        {lista.length === 0 ? (
          <EmptyState titulo={aba === 'nao_lidas' ? 'Tudo em dia por aqui' : 'Nenhuma notificação ainda'} icone={<IconBell size={20} />} />
        ) : (
          <div className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-bg">
            {lista.map((n, i) => {
              const turma = turmaPorId(n.turmaId)
              const Icone = n.motivo === 'grave' ? IconAlertTriangle : IconBarChart
              const cor = n.motivo === 'grave' ? '#B3261E' : '#C2601C'
              return (
                <button
                  key={n.id}
                  onClick={() => abrir(n.id, n.alunoId)}
                  className={`flex w-full items-start gap-3.5 px-4 py-4 text-left ${i !== 0 ? 'border-t border-border' : ''} ${n.lida ? 'bg-bg' : 'bg-green-soft/40'}`}
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ color: cor, background: `${cor}14` }}>
                    <Icone size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13.5px] ${n.lida ? 'font-medium text-text' : 'font-bold text-text'}`}>{n.titulo}</span>
                      {!n.lida && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green" />}
                    </div>
                    <div className="mt-0.5 text-[13px] text-text-secondary">{turma?.nome} · {n.descricao}</div>
                    <div className="mt-1 text-xs text-text-secondary">{formatarDataHora(n.dataHora)} · {tempoRelativo(n.dataHora)}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
