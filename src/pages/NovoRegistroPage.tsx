import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { ALUNOS, CATEGORIAS, TURMAS } from '../data/mockData'
import { pesoAcumuladoAluno } from '../data/selectors'
import { IconCheck, IconPaperclip, IconSearch } from '../components/icons'
import type { PesoTipo } from '../types'

const COR_PESO: Record<PesoTipo, string> = {
  leve: '#B98900',
  moderada: '#C2601C',
  grave: '#B3261E',
  positiva: '#16794C',
}

const ROTULO_PESO: Record<PesoTipo, string> = {
  leve: 'Leve · peso 1',
  moderada: 'Moderada · peso 3',
  grave: 'Grave · peso 5',
  positiva: 'Positiva · não soma',
}

export function NovoRegistroPage() {
  const { usuario } = useAuth()
  const { registros, adicionarRegistro } = useData()
  const navigate = useNavigate()

  const [turmaId, setTurmaId] = useState(usuario?.turmaResponsavelId ?? 'ds-2')
  const [busca, setBusca] = useState('')
  const [alunoIds, setAlunoIds] = useState<string[]>([])
  const [categoriaId, setCategoriaId] = useState('celular')
  const [descricao, setDescricao] = useState('')
  const [anexo, setAnexo] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  const alunosDaTurma = useMemo(
    () => ALUNOS.filter((a) => a.turmaId === turmaId && a.nome.toLowerCase().includes(busca.toLowerCase())),
    [turmaId, busca],
  )
  const categoriaAtual = CATEGORIAS.find((c) => c.id === categoriaId)

  function alternarAluno(id: string) {
    setAlunoIds((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))
  }

  function trocarTurma(id: string) {
    setTurmaId(id)
    setAlunoIds([])
    setBusca('')
  }

  function salvar() {
    if (!usuario || alunoIds.length === 0) return
    adicionarRegistro({
      alunoIds,
      turmaId,
      disciplina: usuario.disciplina,
      autorId: usuario.id,
      categoriaId,
      descricao: descricao.trim() || 'Sem descrição adicional.',
    })
    setSalvo(true)
    setTimeout(() => navigate('/app/meus-registros'), 900)
  }

  if (!usuario) return null

  return (
    <AppShell titulo="Novo registro">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-7 px-4 py-7 sm:px-7">
        <div className="text-[13px] text-text-secondary">
          Preencha em poucos passos — leva menos de um minuto. Registrado como <strong className="text-text">{usuario.nome}</strong>, {usuario.disciplina}.
        </div>

        {/* 1. Turma */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">1 · Turma</h2>
          <div className="flex flex-wrap gap-2">
            {TURMAS.map((t) => {
              const selecionada = t.id === turmaId
              return (
                <button
                  key={t.id}
                  onClick={() => trocarTurma(t.id)}
                  className={`tap-target rounded-full border px-4 text-[13.5px] font-semibold transition-colors ${
                    selecionada ? 'border-green bg-green-soft text-green-dark' : 'border-border bg-bg text-text hover:bg-bg-section'
                  }`}
                >
                  {t.nome}
                </button>
              )
            })}
          </div>
        </section>

        {/* 2. Aluno */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">2 · Aluno(s)</h2>
            <span className="text-xs text-text-secondary">
              {alunoIds.length === 0 ? 'nenhum aluno selecionado' : `${alunoIds.length} selecionado(s)`}
            </span>
          </div>

          <div className="relative">
            <IconSearch size={17} className="absolute top-3.5 left-3.5 text-text-secondary" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar aluno pelo nome"
              className="tap-target w-full rounded-lg border border-border bg-bg py-2.5 pr-3.5 pl-10 text-[14.5px] outline-none focus:ring-2 focus:ring-green"
            />
          </div>

          <div className="overflow-hidden rounded-[10px] border border-border bg-bg">
            {alunosDaTurma.length === 0 ? (
              <div className="p-5 text-center text-[13px] text-text-secondary">
                Nenhum aluno cadastrado nesta turma neste protótipo — tente "2º Desenvolvimento de Sistemas".
              </div>
            ) : (
              alunosDaTurma.map((a, i) => {
                const selecionado = alunoIds.includes(a.id)
                const peso = pesoAcumuladoAluno(a.id, registros)
                return (
                  <button
                    key={a.id}
                    onClick={() => alternarAluno(a.id)}
                    className={`tap-target flex w-full items-center justify-between px-3.5 py-2.5 text-left ${i !== 0 ? 'border-t border-border' : ''} ${selecionado ? 'bg-green-soft' : 'bg-bg'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar iniciais={a.iniciais} cor={a.avatarColor} tamanho={34} />
                      <div>
                        <div className="text-[14.5px] font-semibold">{a.nome}</div>
                        <div className="text-xs text-text-secondary">peso acumulado (30 dias): {peso}</div>
                      </div>
                    </div>
                    <div className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px] ${selecionado ? 'border-green bg-green' : 'border-border bg-transparent'}`}>
                      {selecionado && <IconCheck size={13} className="text-white" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* 3. Categoria */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">3 · Categoria</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {CATEGORIAS.map((c) => {
              const selecionada = c.id === categoriaId
              const cor = COR_PESO[c.peso]
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoriaId(c.id)}
                  className="flex min-h-[100px] flex-col items-start gap-2 rounded-[10px] border-[1.5px] p-3.5 text-left transition-colors"
                  style={{
                    borderColor: selecionada ? cor : 'var(--color-border)',
                    background: selecionada ? `${cor}14` : 'var(--color-bg)',
                  }}
                >
                  <div className="text-[13.5px] leading-snug font-semibold">{c.nome}</div>
                  <div className="mt-auto text-[11.5px] font-bold" style={{ color: cor }}>{ROTULO_PESO[c.peso]}</div>
                </button>
              )
            })}
          </div>
        </section>

        {/* 4. Descrição */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">4 · Descrição</h2>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o que foi observado…"
            className="min-h-[96px] w-full resize-y rounded-lg border border-border p-3.5 text-[14.5px] outline-none focus:ring-2 focus:ring-green"
          />
          <div className="flex items-start gap-2 text-[12.5px] text-text-secondary">
            <span className="mt-0.5 text-text-secondary">ⓘ</span>
            Descreva o comportamento observado, não uma opinião sobre o aluno. Esse texto fica no histórico dele.
          </div>

          <button
            onClick={() => setAnexo(anexo ? null : 'foto-ocorrencia.jpg')}
            className="tap-target mt-1 flex items-center gap-2 self-start rounded-lg border border-dashed border-border px-3.5 text-[13.5px] text-text-secondary"
          >
            <IconPaperclip size={16} />
            {anexo ? `Anexado: ${anexo}` : 'Anexar arquivo (opcional)'}
          </button>
        </section>

        <div className="sticky bottom-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-3.5 shadow-[0_2px_10px_rgba(25,29,27,0.08)] lg:bottom-0">
          <div className="text-[13px] text-text-secondary">
            {alunoIds.length === 0
              ? 'Selecione ao menos um aluno para salvar'
              : `${alunoIds.length} aluno(s) · ${categoriaAtual ? ROTULO_PESO[categoriaAtual.peso] : ''}`}
          </div>
          <button
            onClick={salvar}
            disabled={alunoIds.length === 0}
            className="tap-target rounded-lg bg-green px-5 text-[14.5px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {salvo ? 'Registro salvo ✓' : 'Salvar registro'}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
