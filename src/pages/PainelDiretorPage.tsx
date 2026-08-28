import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'
import { contagemPorCategoria, pesoAcumuladoAluno, registrosDaTurma, statusPeso, LIMIAR_ACUMULO } from '../data/selectors'
import { formatarDataHora } from '../utils/date'
import { IconAlertTriangle, IconBell } from '../components/icons'

const STATUS_LABEL: Record<string, string> = { grave: 'Alerta', moderada: 'Atenção', leve: 'Observar', ok: 'Normal' }
const STATUS_COR: Record<string, string> = { grave: '#B3261E', moderada: '#C2601C', leve: '#B98900', ok: '#5C6661' }

interface AlunoReal {
  id: string
  nome: string
  iniciais: string
  avatar_color: string
}

interface TurmaReal {
  nome: string
  cursos: { nome: string; eixos: { nome: string } | null } | null
}

export function PainelDiretorPage() {
  const { usuario } = useAuth()
  const { registros, notificacoes } = useData()

  const turmaId = usuario?.turmaResponsavelId
  const [turma, setTurma] = useState<TurmaReal | null>(null)
  const [alunos, setAlunos] = useState<AlunoReal[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!turmaId) {
      setCarregando(false)
      return
    }
    let ativo = true
    async function carregar() {
      setCarregando(true)
      const [{ data: turmaData }, { data: alunosData }] = await Promise.all([
        supabase.from('series').select('nome, cursos(nome, eixos(nome))').eq('id', turmaId).maybeSingle<TurmaReal>(),
        supabase.from('alunos').select('id, nome, iniciais, avatar_color').eq('turma_id', turmaId).order('nome'),
      ])
      if (ativo) {
        setTurma(turmaData ?? null)
        setAlunos((alunosData as AlunoReal[] | null) ?? [])
        setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [turmaId])

  const registrosDaMinhaTurma = useMemo(() => (turmaId ? registrosDaTurma(turmaId, registros) : []), [turmaId, registros])
  const registrosDoMes = registrosDaMinhaTurma.filter((r) => Math.abs(new Date(r.dataHora).getTime() - Date.now()) < 40 * 24 * 60 * 60 * 1000)

  const ranking = useMemo(() => alunos
    .map((aluno) => {
      const peso = pesoAcumuladoAluno(aluno.id, registros)
      return { aluno, peso, status: statusPeso(peso) }
    })
    .sort((a, b) => b.peso - a.peso), [alunos, registros])

  const categorias = useMemo(() => contagemPorCategoria(registrosDoMes), [registrosDoMes])
  const maiorCategoria = categorias[0]?.total ?? 1
  const maiorPeso = ranking[0]?.peso || 1

  const graves = registrosDaMinhaTurma.filter((r) => r.categoriaId === 'patrimonio' || r.categoriaId === 'conflito')
  const emAlerta = ranking.filter((r) => r.peso >= LIMIAR_ACUMULO)
  const alertasDaTurma = notificacoes.filter((n) => n.turmaId === turmaId).slice(0, 6)

  if (!usuario) return null

  if (!turmaId) {
    return (
      <AppShell titulo="Minha turma">
        <div className="p-6 text-sm text-text-secondary">Nenhuma turma responsável vinculada à sua conta ainda — fale com a administração.</div>
      </AppShell>
    )
  }

  if (carregando) {
    return (
      <AppShell titulo="Minha turma">
        <div className="p-6 text-sm text-text-secondary">Carregando…</div>
      </AppShell>
    )
  }

  if (!turma) {
    return (
      <AppShell titulo="Minha turma">
        <div className="p-6 text-sm text-text-secondary">Turma não encontrada — pode ter sido removida do catálogo.</div>
      </AppShell>
    )
  }

  const rotuloTurma = [turma.nome, turma.cursos?.nome].filter(Boolean).join(' ')

  return (
    <AppShell titulo="Minha turma">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
        <div>
          <div className="text-xl font-bold">{rotuloTurma}</div>
          <div className="text-[13.5px] text-text-secondary">
            {alunos.length} {alunos.length === 1 ? 'aluno' : 'alunos'}
            {turma.cursos?.eixos?.nome && ` · Eixo de ${turma.cursos.eixos.nome}`}
          </div>
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
            {ranking.length === 0 ? (
              <EmptyState titulo="Nenhum aluno cadastrado nesta turma ainda" icone={<IconBell size={18} />} />
            ) : (
              <div className="flex flex-col">
                {ranking.map((r, i) => (
                  <div
                    key={r.aluno.id}
                    className={`flex items-center justify-between gap-3 py-2.5 ${i !== 0 ? 'border-t border-border' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar iniciais={r.aluno.iniciais} cor={r.aluno.avatar_color} tamanho={32} />
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
                  </div>
                ))}
              </div>
            )}
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
