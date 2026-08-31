import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { PesoBadge } from '../components/PesoBadge'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { alunoPorId, turmaPorId } from '../data/mockData'
import { categoriaEfetivaDoRegistro, pesoDoRegistro, registrosDoAutor } from '../data/selectors'
import { formatarDataHora, diasEntre } from '../utils/date'
import { IconClipboard, IconPlus } from '../components/icons'

export function PainelProfessorPage() {
  const { usuario } = useAuth()
  const { registros } = useData()
  const navigate = useNavigate()

  const meusRegistros = useMemo(() => (usuario ? registrosDoAutor(usuario.id, registros) : []), [usuario, registros])
  const noMes = useMemo(() => meusRegistros.filter((r) => diasEntre(r.dataHora) <= 30), [meusRegistros])
  const graves = useMemo(() => noMes.filter((r) => pesoDoRegistro(r) === 5), [noMes])
  const alunosUnicos = useMemo(() => new Set(noMes.flatMap((r) => r.alunoIds)).size, [noMes])
  const recentes = meusRegistros.slice(0, 6)

  if (!usuario) return null

  return (
    <AppShell titulo="Painel">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold">Olá, {usuario.nome.split(' ')[0]}</div>
            <div className="text-[13.5px] text-text-secondary">
              {usuario.disciplinas?.length ? usuario.disciplinas.join(', ') : 'Sem disciplina cadastrada'}
            </div>
          </div>
          <button
            onClick={() => navigate('/app/novo-registro')}
            className="tap-target flex items-center justify-center gap-2 self-start rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-green-dark"
          >
            <IconPlus size={16} />
            Novo registro
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Registros — 30 dias</div>
            <div className="mt-1.5 text-3xl font-bold">{noMes.length}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Registros graves</div>
            <div className="mt-1.5 text-3xl font-bold text-grave">{graves.length}</div>
            <div className="mt-0.5 text-xs text-text-secondary">peso 5, últimos 30 dias</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Alunos envolvidos</div>
            <div className="mt-1.5 text-3xl font-bold">{alunosUnicos}</div>
            <div className="mt-0.5 text-xs text-text-secondary">últimos 30 dias</div>
          </div>
        </div>

        <div className="rounded-[10px] border border-border bg-bg p-5">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="text-[14.5px] font-bold">Seus últimos registros</div>
            <button onClick={() => navigate('/app/meus-registros')} className="text-[12.5px] font-semibold text-green-dark hover:underline">
              Ver todos
            </button>
          </div>

          {recentes.length === 0 ? (
            <EmptyState
              titulo="Nenhum registro ainda"
              descricao="Quando você registrar uma ocorrência, ela aparece aqui."
              icone={<IconClipboard size={20} />}
            />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recentes.map((r) => {
                const aluno = alunoPorId(r.alunoIds[0])
                const efetiva = categoriaEfetivaDoRegistro(r)
                const turma = turmaPorId(r.turmaId)
                if (!aluno) return null
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/app/aluno/${aluno.id}`)}
                    className="flex items-center gap-3 py-2.5 text-left hover:bg-bg-section"
                  >
                    <Avatar iniciais={aluno.iniciais} cor={aluno.avatarColor} tamanho={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold">
                        {aluno.nome}{r.alunoIds.length > 1 && ` +${r.alunoIds.length - 1}`}
                      </div>
                      <div className="truncate text-xs text-text-secondary">{turma?.nome} · {formatarDataHora(r.dataHora)}</div>
                    </div>
                    <PesoBadge peso={efetiva.peso} pesoNumero={efetiva.pesoNumero} className="shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
