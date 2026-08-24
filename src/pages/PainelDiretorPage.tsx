import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { turmaPorId } from '../data/mockData'
import { contagemPorCategoria, rankingAlunosDaTurma, registrosDaTurma, LIMIAR_ACUMULO } from '../data/selectors'
import { formatarDataHora } from '../utils/date'
import { IconAlertTriangle, IconBell } from '../components/icons'

const STATUS_LABEL: Record<string, string> = { grave: 'Alerta', moderada: 'Atenção', leve: 'Observar', ok: 'Normal' }
const STATUS_COR: Record<string, string> = { grave: '#B3261E', moderada: '#C2601C', leve: '#B98900', ok: '#5C6661' }

export function PainelDiretorPage() {
  const { usuario } = useAuth()
  const { registros, notificacoes } = useData()
  const navigate = useNavigate()

  const turmaId = usuario?.turmaResponsavelId ?? 'ds-2'
  const turma = turmaPorId(turmaId)

  const registrosDaMinhaTurma = useMemo(() => registrosDaTurma(turmaId, registros), [turmaId, registros])
  const registrosDoMes = registrosDaMinhaTurma.filter((r) => Math.abs(new Date(r.dataHora).getTime() - Date.now()) < 40 * 24 * 60 * 60 * 1000)
  const ranking = useMemo(() => rankingAlunosDaTurma(turmaId, registros), [turmaId, registros])
  const categorias = useMemo(() => contagemPorCategoria(registrosDoMes), [registrosDoMes])
  const maiorCategoria = categorias[0]?.total ?? 1
  const maiorPeso = ranking[0]?.peso || 1

  const graves = registrosDaMinhaTurma.filter((r) => r.categoriaId === 'patrimonio' || r.categoriaId === 'conflito')
  const emAlerta = ranking.filter((r) => r.peso >= LIMIAR_ACUMULO)
  const alertasDaTurma = notificacoes.filter((n) => n.turmaId === turmaId).slice(0, 6)

  if (!usuario || !turma) return null

  return (
    <AppShell titulo="Minha turma">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
        <div>
          <div className="text-xl font-bold">{turma.nome}</div>
          <div className="text-[13.5px] text-text-secondary">{turma.totalAlunos} alunos · turno {turma.turno} · Eixo de Tecnologia da Informação</div>
        </div>

        {emAlerta.length > 0 && (
          <div className="flex items-center gap-3 rounded-[10px] border border-[#C2601C33] bg-[#C2601C0F] px-4 py-3.5">
            <IconAlertTriangle size={20} className="shrink-0 text-moderada" />
            <div className="flex-1 text-[13.5px] text-text">
              <strong>{emAlerta.length} aluno(s)</strong> atingiram {LIMIAR_ACUMULO} pontos ou mais em ocorrências nos últimos 30 dias.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Registros no mês</div>
            <div className="mt-1.5 text-3xl font-bold">{registrosDoMes.length}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Registros graves</div>
            <div className="mt-1.5 text-3xl font-bold text-grave">{graves.length}</div>
            <div className="mt-0.5 text-xs text-text-secondary">peso 5 · notificados no mesmo dia</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Alunos em alerta</div>
            <div className="mt-1.5 text-3xl font-bold text-moderada">{emAlerta.length}</div>
            <div className="mt-0.5 text-xs text-text-secondary">≥ {LIMIAR_ACUMULO} pontos em 30 dias</div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="mb-1 text-[14.5px] font-bold">Alunos por peso acumulado</div>
            <div className="mb-3.5 text-xs text-text-secondary">Soma de peso das ocorrências nos últimos 30 dias</div>
            <div className="flex flex-col">
              {ranking.map((r, i) => (
                <button
                  key={r.aluno.id}
                  onClick={() => navigate(`/app/aluno/${r.aluno.id}`)}
                  className={`flex items-center justify-between gap-3 py-2.5 text-left ${i !== 0 ? 'border-t border-border' : ''}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar iniciais={r.aluno.iniciais} cor={r.aluno.avatarColor} tamanho={32} />
                    <span className="truncate text-[13.5px] font-semibold">{r.aluno.nome}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-bg-section sm:block">
                      <div className="h-full rounded-full" style={{ width: `${(r.peso / maiorPeso) * 100}%`, background: STATUS_COR[r.status] }} />
                    </div>
                    <span className="rounded-md px-2 py-0.5 text-[11.5px] font-bold" style={{ color: STATUS_COR[r.status], background: `${STATUS_COR[r.status]}14` }}>
                      {STATUS_LABEL[r.status]}
                    </span>
                    <span className="w-5 text-right text-sm font-bold">{r.peso}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[10px] border border-border bg-bg p-5">
              <div className="mb-3.5 text-[14.5px] font-bold">Ocorrências por categoria — no mês</div>
              {categorias.length === 0 ? (
                <div className="text-[13px] text-text-secondary">Nenhuma ocorrência nesta turma neste período.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {categorias.map((c) => (
                    <div key={c.categoria.id}>
                      <div className="mb-1 flex justify-between text-[12.5px]">
                        <span>{c.categoria.nome}</span>
                        <span className="font-semibold text-text-secondary">{c.total}</span>
                      </div>
                      <div className="h-[7px] overflow-hidden rounded-full bg-bg-section">
                        <div className="h-full rounded-full bg-green" style={{ width: `${(c.total / maiorCategoria) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[10px] border border-border bg-bg p-5">
              <div className="mb-3 text-[14.5px] font-bold">Alertas pendentes</div>
              {alertasDaTurma.length === 0 ? (
                <EmptyState titulo="Sem alertas no momento" icone={<IconBell size={18} />} />
              ) : (
                <div className="flex flex-col gap-3">
                  {alertasDaTurma.map((n) => (
                    <div key={n.id} className="flex gap-2.5">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: n.motivo === 'grave' ? '#B3261E' : '#C2601C' }} />
                      <div>
                        <div className="text-[13px] text-text">{n.titulo}</div>
                        <div className="mt-0.5 text-xs text-text-secondary">{formatarDataHora(n.dataHora)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
