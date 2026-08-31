import { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { CURSOS, EIXOS, cursoPorId, usuarioPorId } from '../data/mockData'
import { categoriaEfetivaDoRegistro, rankingTurmas, turmasSemOcorrencia, LIMIAR_ACUMULO, rankingAlunosDaTurma } from '../data/selectors'
import { TURMAS } from '../data/mockData'
import { formatarDataHora } from '../utils/date'
import { PesoBadge } from '../components/PesoBadge'

const PERIODOS = [
  { id: 7, label: 'Semana' },
  { id: 30, label: 'Mês' },
  { id: 90, label: 'Bimestre' },
]

export function PainelDirecaoPage() {
  const { usuario } = useAuth()
  const { registros } = useData()
  const [eixoFiltro, setEixoFiltro] = useState('todos')
  const [periodo, setPeriodo] = useState(30)

  const turmasDoEixo = useMemo(
    () => (eixoFiltro === 'todos' ? TURMAS : TURMAS.filter((t) => cursoPorId(t.cursoId)?.eixoId === eixoFiltro)),
    [eixoFiltro],
  )
  const idsTurmasDoEixo = useMemo(() => new Set(turmasDoEixo.map((t) => t.id)), [turmasDoEixo])

  const registrosFiltrados = useMemo(
    () => registros.filter((r) => idsTurmasDoEixo.has(r.turmaId)),
    [registros, idsTurmasDoEixo],
  )

  const ranking = useMemo(
    () => rankingTurmas(registrosFiltrados).slice(0, 8),
    [registrosFiltrados],
  )
  const maiorPeso = ranking[0]?.peso || 1

  const noPeriodo = registrosFiltrados.filter((r) => {
    const dias = (Date.now() - new Date(r.dataHora).getTime()) / (1000 * 60 * 60 * 24)
    return dias <= periodo
  })
  const graves = noPeriodo.filter((r) => r.categoriaId === 'patrimonio' || r.categoriaId === 'conflito')
  const alunosEmAlerta = useMemo(() => {
    const turmasComRoster = eixoFiltro === 'todos' ? TURMAS : turmasDoEixo
    return turmasComRoster.reduce((total, t) => total + rankingAlunosDaTurma(t.id, registros).filter((r) => r.peso >= LIMIAR_ACUMULO).length, 0)
  }, [turmasDoEixo, registros, eixoFiltro])

  const timeline = useMemo(() => [...registrosFiltrados].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()).slice(0, 8), [registrosFiltrados])

  if (!usuario) return null
  const rotuloVisao = usuario.papel === 'diretor' ? 'Direção escolar' : 'Coordenação pedagógica'

  return (
    <AppShell titulo="Visão geral da escola">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={eixoFiltro}
            onChange={(e) => setEixoFiltro(e.target.value)}
            className="tap-target rounded-lg border border-border bg-bg px-3 text-[13.5px]"
          >
            <option value="todos">Todos os eixos</option>
            {EIXOS.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <select className="tap-target rounded-lg border border-border bg-bg px-3 text-[13.5px]" defaultValue="">
            <option value="">Todos os cursos</option>
            {CURSOS.filter((c) => eixoFiltro === 'todos' || c.eixoId === eixoFiltro).map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <div className="ml-auto flex overflow-hidden rounded-lg border border-border">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodo(p.id)}
                className={`tap-target border-l border-border px-3.5 text-[13px] font-semibold first:border-l-0 ${
                  periodo === p.id ? 'bg-green-soft text-green-dark' : 'text-text-secondary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Ocorrências no período</div>
            <div className="mt-1.5 text-3xl font-bold">{noPeriodo.length}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Registros graves</div>
            <div className="mt-1.5 text-3xl font-bold text-grave">{graves.length}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Alunos em alerta</div>
            <div className="mt-1.5 text-3xl font-bold text-moderada">{alunosEmAlerta}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Turmas sem ocorrência</div>
            <div className="mt-1.5 text-3xl font-bold text-green">{turmasSemOcorrencia(registrosFiltrados)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="mb-0.5 text-[14.5px] font-bold">Ranking de turmas</div>
            <div className="mb-3.5 text-xs text-text-secondary">Peso total acumulado nos últimos 30 dias, por turma</div>
            {ranking.length === 0 ? (
              <div className="text-[13px] text-text-secondary">Nenhuma ocorrência no recorte selecionado.</div>
            ) : (
              <div className="flex flex-col">
                {ranking.map((r, i) => (
                  <div key={r.turma.id} className={`grid grid-cols-[2.2fr_1fr_1fr_1.5fr] items-center gap-2 py-2.5 ${i !== 0 ? 'border-t border-border' : ''}`}>
                    <div className="truncate text-[13.5px] font-semibold">{r.turma.nome}</div>
                    <div className="text-[13px] text-text-secondary">{r.ocorrencias} ocorr.</div>
                    <div className="text-[13px] font-bold">{r.peso}</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-section">
                      <div className="h-full rounded-full bg-green" style={{ width: `${(r.peso / maiorPeso) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="mb-0.5 text-[14.5px] font-bold">Linha do tempo de ocorrências</div>
            <div className="mb-3.5 text-xs text-text-secondary">Identificação por turma — nomes ficam no perfil do aluno</div>
            <div className="flex flex-col">
              {timeline.map((r, i) => {
                const efetiva = categoriaEfetivaDoRegistro(r)
                const autor = usuarioPorId(r.autorId)
                const turmaNome = TURMAS.find((t) => t.id === r.turmaId)?.nome
                return (
                  <div key={r.id} className={`flex gap-2.5 py-2.5 ${i !== 0 ? 'border-t border-border' : ''}`}>
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: { leve: '#B98900', moderada: '#C2601C', grave: '#B3261E', positiva: '#16794C' }[efetiva.peso] }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-text">
                        <strong>{turmaNome}</strong>
                        <span>· {efetiva.nome}</span>
                        <PesoBadge peso={efetiva.peso} pesoNumero={efetiva.pesoNumero} />
                      </div>
                      <div className="mt-0.5 text-xs text-text-secondary">{formatarDataHora(r.dataHora)} · registrado por {autor?.nome ?? 'sistema'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="text-xs text-text-secondary">Visão de {rotuloVisao.toLowerCase()} · {usuario.nome}</div>
      </div>
    </AppShell>
  )
}
