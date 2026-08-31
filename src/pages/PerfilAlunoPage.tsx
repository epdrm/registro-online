import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { PesoBadge } from '../components/PesoBadge'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { alunoPorId, turmaPorId, usuarioPorId } from '../data/mockData'
import { categoriaEfetivaDoRegistro, pesoAcumuladoAluno, registrosDoAluno, statusPeso } from '../data/selectors'
import { formatarDataHora } from '../utils/date'
import { IconChevronLeft, IconClipboard } from '../components/icons'

const STATUS_LABEL: Record<string, string> = { grave: 'Alerta', moderada: 'Atenção', leve: 'Observar', ok: 'Normal' }
const STATUS_COR: Record<string, string> = { grave: '#B3261E', moderada: '#C2601C', leve: '#B98900', ok: '#5C6661' }

const PODE_REGISTRAR_TRATATIVA = new Set(['coordenacao_pedagogica', 'diretor'])
const VE_HISTORICO_COMPLETO = new Set(['professor_diretor', 'professor_coordenador', 'coordenacao_pedagogica', 'diretor'])

export function PerfilAlunoPage() {
  const { alunoId } = useParams<{ alunoId: string }>()
  const { usuario } = useAuth()
  const { registros, tratativas, adicionarTratativa } = useData()
  const navigate = useNavigate()
  const [aba, setAba] = useState<'linha' | 'tratativas'>('linha')
  const [novaTratativa, setNovaTratativa] = useState('')

  const aluno = alunoId ? alunoPorId(alunoId) : undefined
  const turma = aluno ? turmaPorId(aluno.turmaId) : undefined

  const historicoCompleto = usuario ? VE_HISTORICO_COMPLETO.has(usuario.papel) : false
  const registrosDoHistorico = useMemo(() => {
    if (!aluno || !usuario) return []
    const todos = registrosDoAluno(aluno.id, registros)
    return historicoCompleto ? todos : todos.filter((r) => r.autorId === usuario.id)
  }, [aluno, usuario, registros, historicoCompleto])

  const tratativasDoAluno = useMemo(
    () => tratativas.filter((t) => t.alunoId === alunoId).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [tratativas, alunoId],
  )

  if (!usuario || !aluno || !turma) {
    return (
      <AppShell titulo="Perfil do aluno">
        <div className="px-4 py-10 sm:px-7">
          <EmptyState titulo="Aluno não encontrado neste protótipo" descricao="Volte e escolha um aluno a partir de uma lista ou painel." />
        </div>
      </AppShell>
    )
  }

  const peso30 = pesoAcumuladoAluno(aluno.id, registros, 30)
  const pesoSemestre = pesoAcumuladoAluno(aluno.id, registros, 180)
  const status = statusPeso(peso30)
  const escalaMax = 15

  function registrarTratativa() {
    if (!novaTratativa.trim() || !usuario || !aluno) return
    adicionarTratativa(aluno.id, usuario.nome, novaTratativa.trim())
    setNovaTratativa('')
  }

  return (
    <AppShell titulo="Perfil do aluno">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 sm:px-7">
        <button onClick={() => navigate(-1)} className="tap-target -ml-2 flex w-fit items-center gap-1.5 rounded-lg px-2 text-[13.5px] font-semibold text-text-secondary hover:bg-bg-section">
          <IconChevronLeft size={17} /> Voltar
        </button>

        <div className="flex flex-col items-start gap-4 rounded-[10px] border border-border bg-bg p-6 sm:flex-row sm:items-center">
          <Avatar iniciais={aluno.iniciais} cor={aluno.avatarColor} tamanho={64} />
          <div className="flex-1">
            <div className="text-xl font-bold">{aluno.nome}</div>
            <div className="text-[13.5px] text-text-secondary">{turma.nome} · turno {turma.turno}</div>
          </div>
          {!historicoCompleto && (
            <div className="rounded-md bg-bg-section px-2.5 py-1 text-xs text-text-secondary">
              Exibindo apenas suas próprias ocorrências
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="flex items-baseline justify-between">
              <div className="text-xs font-semibold text-text-secondary">Peso acumulado — últimos 30 dias</div>
              <span className="rounded-md px-2 py-0.5 text-[11.5px] font-bold" style={{ color: STATUS_COR[status], background: `${STATUS_COR[status]}14` }}>
                {STATUS_LABEL[status]}
              </span>
            </div>
            <div className="mt-2 text-3xl font-bold" style={{ color: STATUS_COR[status] }}>{peso30}</div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-bg-section">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (peso30 / escalaMax) * 100)}%`, background: STATUS_COR[status] }} />
            </div>
            <div className="mt-1.5 text-xs text-text-secondary">Alerta a partir de 6 pontos em 30 dias</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Peso acumulado — semestre</div>
            <div className="mt-2 text-3xl font-bold">{pesoSemestre}</div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-bg-section">
              <div className="h-full rounded-full bg-green" style={{ width: `${Math.min(100, (pesoSemestre / (escalaMax * 3)) * 100)}%` }} />
            </div>
            <div className="mt-1.5 text-xs text-text-secondary">{registrosDoHistorico.length} registro(s) no histórico visível</div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border">
          {([['linha', 'Linha do tempo'], ['tratativas', 'Tratativas']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`tap-target -mb-px border-b-2 px-3 text-[13.5px] font-semibold ${
                aba === id ? 'border-green text-green-dark' : 'border-transparent text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {aba === 'linha' ? (
          registrosDoHistorico.length === 0 ? (
            <EmptyState titulo="Nenhuma ocorrência neste histórico" icone={<IconClipboard size={20} />} />
          ) : (
            <div className="flex flex-col">
              {registrosDoHistorico.map((r, i) => {
                const efetiva = categoriaEfetivaDoRegistro(r)
                const autor = usuarioPorId(r.autorId)
                return (
                  <div key={r.id} className={`flex gap-3 py-3.5 ${i !== 0 ? 'border-t border-border' : ''}`}>
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: { leve: '#B98900', moderada: '#C2601C', grave: '#B3261E', positiva: '#16794C' }[efetiva.peso] }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-semibold">{efetiva.nome}</span>
                        <PesoBadge peso={efetiva.peso} pesoNumero={efetiva.pesoNumero} />
                      </div>
                      <p className="mt-1 text-[13.5px] text-text-secondary">{r.descricao}</p>
                      <div className="mt-1.5 text-xs text-text-secondary">
                        {formatarDataHora(r.dataHora)} · {r.disciplina} · registrado por {autor?.nome ?? '—'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4">
            {PODE_REGISTRAR_TRATATIVA.has(usuario.papel) && (
              <div className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-bg p-4">
                <textarea
                  value={novaTratativa}
                  onChange={(e) => setNovaTratativa(e.target.value)}
                  placeholder="Registrar uma tratativa da coordenação para este aluno…"
                  className="min-h-[70px] w-full resize-y rounded-lg border border-border p-3 text-[13.5px] outline-none focus:ring-2 focus:ring-green"
                />
                <button
                  onClick={registrarTratativa}
                  disabled={!novaTratativa.trim()}
                  className="tap-target self-start rounded-lg bg-green px-4 text-[13.5px] font-semibold text-white disabled:opacity-40"
                >
                  Registrar tratativa
                </button>
              </div>
            )}
            {tratativasDoAluno.length === 0 ? (
              <EmptyState titulo="Nenhuma tratativa registrada" descricao="Tratativas da coordenação aparecem aqui." />
            ) : (
              <div className="flex flex-col">
                {tratativasDoAluno.map((t, i) => (
                  <div key={t.id} className={`py-3.5 ${i !== 0 ? 'border-t border-border' : ''}`}>
                    <p className="text-[13.5px] text-text">{t.texto}</p>
                    <div className="mt-1.5 text-xs text-text-secondary">{formatarDataHora(t.dataHora)} · {t.autor}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
