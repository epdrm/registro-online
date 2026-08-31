import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { ALUNOS, CATEGORIAS, TURMAS } from '../data/mockData'
import { pesoAcumuladoAluno, pesoTipoDoNumero } from '../data/selectors'
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
  const [tituloOutro, setTituloOutro] = useState('')
  const [pesoOutro, setPesoOutro] = useState(3)
  const [descricao, setDescricao] = useState('')
  const [anexo, setAnexo] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [disciplina, setDisciplina] = useState(usuario?.disciplinas?.[0] ?? '')

  const alunosDaTurma = useMemo(
    () => ALUNOS.filter((a) => a.turmaId === turmaId && a.nome.toLowerCase().includes(busca.toLowerCase())),
    [turmaId, busca],
  )
  const categoriaAtual = CATEGORIAS.find((c) => c.id === categoriaId)
  const ehOutro = categoriaId === 'outro'
  const categoriasPorPeso = useMemo(() => {
    const fixas = CATEGORIAS.filter((c) => c.id !== 'outro').sort((a, b) => a.pesoNumero - b.pesoNumero)
    const outro = CATEGORIAS.find((c) => c.id === 'outro')
    return outro ? [...fixas, outro] : fixas
  }, [])

  const descricaoValida = descricao.trim().length > 0
  const tituloOutroValido = !ehOutro || tituloOutro.trim().length > 0
  const podeSalvar = alunoIds.length > 0 && descricaoValida && tituloOutroValido

  function alternarAluno(id: string) {
    setAlunoIds((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))
  }

  function trocarTurma(id: string) {
    setTurmaId(id)
    setAlunoIds([])
    setBusca('')
  }

  function salvar() {
    if (!usuario || !podeSalvar) return
    adicionarRegistro({
      alunoIds,
      turmaId,
      disciplina,
      autorId: usuario.id,
      categoriaId,
      ...(ehOutro ? { titulo: tituloOutro.trim(), pesoNumero: pesoOutro } : {}),
      descricao: descricao.trim(),
    })
    setSalvo(true)
    setTimeout(() => navigate('/app/meus-registros'), 900)
  }

  if (!usuario) return null

  return (
    <AppShell titulo="Novo registro">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-7 px-4 py-7 sm:px-7">
        <div className="flex flex-col gap-2 text-[13px] text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <div>
            Preencha em poucos passos — leva menos de um minuto. Registrado como <strong className="text-text">{usuario.nome}</strong>.
          </div>
          {!!usuario.disciplinas?.length && (
            <label className="flex shrink-0 items-center gap-2">
              <span className="font-semibold text-text">Disciplina</span>
              <select
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                className="tap-target rounded-lg border border-border bg-bg px-2.5 text-[13px] outline-none focus:border-green"
              >
                {usuario.disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          )}
        </div>

        {/* 1. Turma e 2. Aluno(s) lado a lado */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:items-stretch">
          {/* 1. Turma */}
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">1 · Turma</h2>
            <div className="h-[336px] overflow-y-auto rounded-[10px] border border-border bg-bg">
              {TURMAS.map((t, i) => {
                const selecionada = t.id === turmaId
                return (
                  <button
                    key={t.id}
                    onClick={() => trocarTurma(t.id)}
                    className={`tap-target flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13.5px] font-semibold ${i !== 0 ? 'border-t border-border' : ''} ${
                      selecionada ? 'bg-green-soft text-green-dark' : 'bg-bg text-text hover:bg-bg-section'
                    }`}
                  >
                    {t.nome}
                    {selecionada && <IconCheck size={15} className="text-green-dark" />}
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

            <div className="h-[280px] overflow-y-auto rounded-[10px] border border-border bg-bg">
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
        </div>

        {/* 3. Categoria */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">3 · Categoria</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {categoriasPorPeso.map((c) => {
              const selecionada = c.id === categoriaId
              const cor = c.id === 'outro' ? '#5C6661' : COR_PESO[c.peso]
              const rotulo = c.id === 'outro' ? 'Peso variável · você define' : ROTULO_PESO[c.peso]
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
                  <div className="mt-auto text-[11.5px] font-bold" style={{ color: cor }}>{rotulo}</div>
                </button>
              )
            })}
          </div>

          {ehOutro && (
            <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-bg-section p-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">Título do ocorrido *</label>
                <input
                  type="text"
                  value={tituloOutro}
                  onChange={(e) => setTituloOutro(e.target.value)}
                  placeholder="Ex.: Recusa em seguir instrução direta do professor"
                  className="tap-target w-full rounded-lg border border-border bg-bg px-3.5 text-[14.5px] outline-none focus:ring-2 focus:ring-green"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">Peso (1 a 5) *</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const cor = COR_PESO[pesoTipoDoNumero(n)]
                    const selecionadoPeso = pesoOutro === n
                    return (
                      <button
                        key={n}
                        onClick={() => setPesoOutro(n)}
                        className="tap-target flex min-w-[44px] items-center justify-center rounded-lg border-[1.5px] text-[14.5px] font-bold transition-colors"
                        style={{
                          borderColor: selecionadoPeso ? cor : 'var(--color-border)',
                          background: selecionadoPeso ? `${cor}14` : 'var(--color-bg)',
                          color: selecionadoPeso ? cor : 'var(--color-text)',
                        }}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. Descrição */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold tracking-wide text-text-secondary uppercase">4 · Descrição *</h2>
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
              : !tituloOutroValido
                ? 'Escreva o título do ocorrido'
                : !descricaoValida
                  ? 'A descrição é obrigatória'
                  : `${alunoIds.length} aluno(s) · ${ehOutro ? `${ROTULO_PESO[pesoTipoDoNumero(pesoOutro)].split(' · ')[0]} · peso ${pesoOutro}` : categoriaAtual ? ROTULO_PESO[categoriaAtual.peso] : ''}`}
          </div>
          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="tap-target rounded-lg bg-green px-5 text-[14.5px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {salvo ? 'Registro salvo ✓' : 'Salvar registro'}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
