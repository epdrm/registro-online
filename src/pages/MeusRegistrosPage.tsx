import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { PesoBadge } from '../components/PesoBadge'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { CATEGORIAS, TURMAS, alunoPorId, turmaPorId } from '../data/mockData'
import { categoriaEfetivaDoRegistro, registrosDoAutor } from '../data/selectors'
import { formatarDataHora, diasEntre } from '../utils/date'
import { IconClipboard, IconSearch } from '../components/icons'

const PERIODOS = [
  { id: 7, label: '7 dias' },
  { id: 30, label: '30 dias' },
  { id: 180, label: 'Semestre' },
]

export function MeusRegistrosPage() {
  const { usuario } = useAuth()
  const { registros } = useData()
  const navigate = useNavigate()

  const [busca, setBusca] = useState('')
  const [turmaFiltro, setTurmaFiltro] = useState('todas')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [periodo, setPeriodo] = useState(30)

  const meusRegistros = useMemo(() => (usuario ? registrosDoAutor(usuario.id, registros) : []), [usuario, registros])
  const turmasComRegistro = useMemo(
    () => TURMAS.filter((t) => meusRegistros.some((r) => r.turmaId === t.id)),
    [meusRegistros],
  )

  const filtrados = meusRegistros.filter((r) => {
    if (diasEntre(r.dataHora) > periodo) return false
    if (turmaFiltro !== 'todas' && r.turmaId !== turmaFiltro) return false
    if (categoriaFiltro !== 'todas' && r.categoriaId !== categoriaFiltro) return false
    if (busca) {
      const nomes = r.alunoIds.map((id) => alunoPorId(id)?.nome.toLowerCase() ?? '')
      if (!nomes.some((n) => n.includes(busca.toLowerCase()))) return false
    }
    return true
  })

  if (!usuario) return null

  return (
    <AppShell titulo="Meus registros">
      <div className="flex flex-col gap-5 px-4 py-6 sm:px-7">
        <div className="text-[13.5px] text-text-secondary">
          {meusRegistros.length} registros criados por você
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <IconSearch size={16} className="absolute top-3 left-3 text-text-secondary" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              type="text"
              placeholder="Buscar por aluno"
              className="tap-target w-full rounded-lg border border-border bg-bg py-2 pr-3 pl-9 text-[13.5px] outline-none focus:ring-2 focus:ring-green"
            />
          </div>
          <select
            value={turmaFiltro}
            onChange={(e) => setTurmaFiltro(e.target.value)}
            className="tap-target rounded-lg border border-border bg-bg px-3 text-[13.5px]"
          >
            <option value="todas">Todas as turmas</option>
            {turmasComRegistro.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="tap-target rounded-lg border border-border bg-bg px-3 text-[13.5px]"
          >
            <option value="todas">Todas as categorias</option>
            {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-border">
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

        {filtrados.length === 0 ? (
          <EmptyState
            titulo="Nenhum registro encontrado"
            descricao="Ajuste os filtros ou crie um novo registro para esta turma."
            icone={<IconClipboard size={20} />}
          />
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-border bg-bg">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[2fr_1.3fr_1.7fr_1fr_1.3fr] gap-2 border-b border-border bg-bg-section px-4 py-3">
                {['Aluno', 'Turma', 'Categoria', 'Data', 'Tratativa'].map((h) => (
                  <div key={h} className="text-[11.5px] font-bold tracking-wide text-text-secondary uppercase">{h}</div>
                ))}
              </div>
              {filtrados.map((r, i) => {
                const aluno = alunoPorId(r.alunoIds[0])
                const efetiva = categoriaEfetivaDoRegistro(r)
                const turma = turmaPorId(r.turmaId)
                if (!aluno) return null
                return (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/app/aluno/${aluno.id}`)}
                    className={`grid w-full grid-cols-[2fr_1.3fr_1.7fr_1fr_1.3fr] items-center gap-2 px-4 py-3 text-left hover:bg-bg-section ${i !== 0 ? 'border-t border-border' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar iniciais={aluno.iniciais} cor={aluno.avatarColor} tamanho={30} />
                      <span className="truncate text-[13.5px] font-semibold">
                        {aluno.nome}{r.alunoIds.length > 1 && ` +${r.alunoIds.length - 1}`}
                      </span>
                    </div>
                    <div className="text-[13.5px] text-text-secondary">{turma?.nome}</div>
                    <div><PesoBadge peso={efetiva.peso} pesoNumero={efetiva.pesoNumero} className="max-w-full truncate" /></div>
                    <div className="text-[13px] text-text-secondary">{formatarDataHora(r.dataHora)}</div>
                    <div><StatusBadge status={r.status} /></div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
