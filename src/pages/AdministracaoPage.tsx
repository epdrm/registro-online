import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { IconEdit, IconTrash } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { criarClienteDescartavel, supabase } from '../lib/supabase'
import { emailInterno, REGEX_USUARIO } from '../lib/username'
import type { Papel } from '../types'

type TipoDisciplina = 'base_comum' | 'base_tecnica' | 'base_diversificada'

const CORES = ['#5C6661', '#16794C', '#0F5138', '#B98900']

function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '??'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function corAleatoria(): string {
  return CORES[Math.floor(Math.random() * CORES.length)]
}

const ROTULO_TIPO_DISCIPLINA: Record<string, string> = {
  base_comum: 'Base comum',
  base_tecnica: 'Base técnica',
  base_diversificada: 'Base diversificada',
}

const ROTULO_PAPEL_PROFESSOR: Record<string, string> = {
  professor: 'Professor(a)',
  professor_tecnico: 'Professor(a) técnico(a)',
  professor_diretor: 'Diretor(a) de Turma',
  professor_coordenador: 'Coordenação técnica',
  coordenacao_pedagogica: 'Coordenação pedagógica',
  diretor: 'Direção escolar',
}

export function AdministracaoPage() {
  const { usuario } = useAuth()
  if (!usuario) return null

  if (usuario.papel === 'admin') {
    return (
      <AppShell titulo="Administração">
        <CadastroProfessores />
      </AppShell>
    )
  }

  if (usuario.papel === 'professor_diretor' && usuario.turmaResponsavelId) {
    return (
      <AppShell titulo="Alunos da turma">
        <CadastroAlunos turmaId={usuario.turmaResponsavelId} />
      </AppShell>
    )
  }

  return (
    <AppShell titulo="Administração">
      <div className="p-6 text-sm text-text-secondary">Você não tem permissão para acessar esta página.</div>
    </AppShell>
  )
}

// --- Admin: cadastro de professores ---------------------------------------

interface PerfilLinha {
  id: string
  nome: string
  username: string
  papel: Papel
  iniciais: string
  avatar_color: string
  turma_responsavel_id: string | null
  professor_disciplinas: { disciplina_id: string; disciplinas: { nome: string } | null }[] | null
}

function BotoesAcao({ aoEditar, aoExcluir }: { aoEditar: () => void; aoExcluir: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" onClick={aoEditar} aria-label="Editar"
        className="tap-target flex items-center justify-center rounded-lg text-text-secondary hover:bg-bg-section">
        <IconEdit size={16} />
      </button>
      <button type="button" onClick={aoExcluir} aria-label="Excluir"
        className="tap-target flex items-center justify-center rounded-lg text-grave hover:bg-grave/10">
        <IconTrash size={16} />
      </button>
    </div>
  )
}

interface Eixo { id: string; nome: string }
interface Curso { id: string; nome: string; eixo_id: string }
interface Serie { id: string; nome: string; curso_id: string }
interface DisciplinaCat { id: string; nome: string; tipo: TipoDisciplina; serie_id: string }

function CadastroProfessores() {
  const [lista, setLista] = useState<PerfilLinha[]>([])
  const [carregandoLista, setCarregandoLista] = useState(true)

  const [eixos, setEixos] = useState<Eixo[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [disciplinasCat, setDisciplinasCat] = useState<DisciplinaCat[]>([])

  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [papel, setPapel] = useState<Papel>('professor')
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<Set<string>>(new Set())
  const [turmaResponsavelId, setTurmaResponsavelId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

  const carregarLista = useCallback(async () => {
    setCarregandoLista(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, username, papel, iniciais, avatar_color, turma_responsavel_id, professor_disciplinas(disciplina_id, disciplinas(nome))')
      .order('nome')
    setLista((data as PerfilLinha[] | null) ?? [])
    setCarregandoLista(false)
  }, [])

  const carregarCatalogo = useCallback(async () => {
    const [e, c, s, d] = await Promise.all([
      supabase.from('eixos').select('id, nome').order('nome'),
      supabase.from('cursos').select('id, nome, eixo_id').order('nome'),
      supabase.from('series').select('id, nome, curso_id').order('nome'),
      supabase.from('disciplinas').select('id, nome, tipo, serie_id').order('nome'),
    ])
    setEixos((e.data as Eixo[] | null) ?? [])
    setCursos((c.data as Curso[] | null) ?? [])
    setSeries((s.data as Serie[] | null) ?? [])
    setDisciplinasCat((d.data as DisciplinaCat[] | null) ?? [])
  }, [])

  useEffect(() => {
    carregarLista()
    carregarCatalogo()
  }, [carregarLista, carregarCatalogo])

  function alternarDisciplina(id: string) {
    setDisciplinasSelecionadas((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editPapel, setEditPapel] = useState<Papel>('professor')
  const [editTurmaResponsavelId, setEditTurmaResponsavelId] = useState('')
  const [editDisciplinasSelecionadas, setEditDisciplinasSelecionadas] = useState<Set<string>>(new Set())
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  function alternarDisciplinaEdit(id: string) {
    setEditDisciplinasSelecionadas((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  function iniciarEdicao(p: PerfilLinha) {
    setEditandoId(p.id)
    setEditNome(p.nome)
    setEditPapel(p.papel)
    setEditTurmaResponsavelId(p.turma_responsavel_id ?? '')
    setEditDisciplinasSelecionadas(new Set((p.professor_disciplinas ?? []).map((pd) => pd.disciplina_id)))
    setMensagem(null)
  }

  async function salvarEdicao(p: PerfilLinha) {
    setSalvandoEdicao(true)
    try {
      const { error: erroPerfil } = await supabase.from('profiles').update({
        nome: editNome.trim(),
        papel: editPapel,
        turma_responsavel_id: editPapel === 'professor_diretor' ? editTurmaResponsavelId.trim() || null : null,
        iniciais: iniciaisDe(editNome),
      }).eq('id', p.id)
      if (erroPerfil) {
        setMensagem({ tipo: 'erro', texto: erroPerfil.message })
        return
      }

      // Substitui o conjunto de disciplinas: remove tudo e insere a seleção atual.
      const { error: erroRemover } = await supabase.from('professor_disciplinas').delete().eq('profile_id', p.id)
      if (erroRemover) {
        setMensagem({ tipo: 'erro', texto: `Perfil salvo, mas as disciplinas falharam: ${erroRemover.message}` })
        return
      }
      if (editDisciplinasSelecionadas.size > 0) {
        const { error: erroInserir } = await supabase.from('professor_disciplinas').insert(
          Array.from(editDisciplinasSelecionadas).map((disciplina_id) => ({ profile_id: p.id, disciplina_id })),
        )
        if (erroInserir) {
          setMensagem({ tipo: 'erro', texto: `Perfil salvo, mas as disciplinas falharam: ${erroInserir.message}` })
          return
        }
      }

      setEditandoId(null)
      carregarLista()
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function excluir(p: PerfilLinha) {
    if (!confirm(`Remover o acesso de "${p.nome}" ao sistema? Isso apaga o perfil dele — a conta de login continua existindo no Supabase Auth e precisa ser removida por lá se quiser liberar o e-mail.`)) return
    const { error } = await supabase.from('profiles').delete().eq('id', p.id)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    carregarLista()
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)

    const usuarioLimpo = username.trim()
    if (!REGEX_USUARIO.test(usuarioLimpo)) {
      setMensagem({ tipo: 'erro', texto: 'Usuário só pode ter letras, números, ponto, hífen ou underscore, sem espaços.' })
      return
    }
    if (senha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A senha temporária precisa ter ao menos 6 caracteres.' })
      return
    }

    setEnviando(true)
    try {
      // Cliente descartável: cria a conta no Auth sem derrubar a sessão do admin.
      const clienteTemp = criarClienteDescartavel()
      const { data, error } = await clienteTemp.auth.signUp({ email: emailInterno(usuarioLimpo), password: senha })
      if (error || !data.user) {
        const mensagemErro = error?.message.includes('already registered')
          ? 'Esse nome de usuário já está em uso.'
          : (error?.message ?? 'Não foi possível criar a conta.')
        setMensagem({ tipo: 'erro', texto: mensagemErro })
        return
      }

      const novoUsuarioId = data.user.id

      const { error: erroPerfil } = await supabase.from('profiles').insert({
        id: novoUsuarioId,
        nome: nome.trim(),
        username: usuarioLimpo,
        email: emailInterno(usuarioLimpo),
        papel,
        turma_responsavel_id: papel === 'professor_diretor' ? turmaResponsavelId.trim() || null : null,
        eixo_coordenado_id: null,
        iniciais: iniciaisDe(nome),
        avatar_color: corAleatoria(),
      })
      if (erroPerfil) {
        setMensagem({ tipo: 'erro', texto: `Conta criada, mas o perfil falhou: ${erroPerfil.message}` })
        return
      }

      if (disciplinasSelecionadas.size > 0) {
        const { error: erroDisciplinas } = await supabase.from('professor_disciplinas').insert(
          Array.from(disciplinasSelecionadas).map((disciplina_id) => ({ profile_id: novoUsuarioId, disciplina_id })),
        )
        if (erroDisciplinas) {
          setMensagem({ tipo: 'erro', texto: `Conta criada, mas as disciplinas falharam: ${erroDisciplinas.message}` })
          return
        }
      }

      setMensagem({ tipo: 'sucesso', texto: `Conta criada para ${nome}. Usuário: ${usuarioLimpo}. Envie a senha temporária por um canal seguro.` })
      setNome(''); setUsername(''); setSenha(''); setTurmaResponsavelId('')
      setDisciplinasSelecionadas(new Set())
      setPapel('professor')
      carregarLista()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-7">
      <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cadastrar professor(a)</div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Nome e sobrenome</span>
            <input required value={nome} onChange={(e) => setNome(e.target.value)}
              placeholder="ex.: Marina Ferreira"
              className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Nome de usuário</span>
            <input required value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="ex.: marina.ferreira" autoComplete="off"
              className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Senha temporária</span>
            <input required type="text" value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="mín. 6 caracteres"
              className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Papel</span>
            <select value={papel} onChange={(e) => setPapel(e.target.value as Papel)}
              className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green">
              {Object.entries(ROTULO_PAPEL_PROFESSOR).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </select>
          </label>
          {papel === 'professor_diretor' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">Id da turma responsável</span>
              <input value={turmaResponsavelId} onChange={(e) => setTurmaResponsavelId(e.target.value)}
                placeholder="ex.: ds-2"
                className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Disciplinas que leciona</span>
          <SeletorDisciplinas
            eixos={eixos}
            cursos={cursos}
            series={series}
            disciplinas={disciplinasCat}
            selecionadas={disciplinasSelecionadas}
            aoAlternar={alternarDisciplina}
          />
        </div>

        {mensagem && (
          <div className={`rounded-lg px-3.5 py-2.5 text-[13.5px] ${
            mensagem.tipo === 'erro' ? 'border border-grave/30 bg-grave/10 text-grave' : 'border border-green/30 bg-green-soft text-green-dark'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <button type="submit" disabled={enviando}
          className="tap-target flex items-center justify-center self-start rounded-lg bg-green px-5 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60">
          {enviando ? 'Cadastrando…' : 'Cadastrar professor(a)'}
        </button>
      </form>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Professores cadastrados</div>
        {carregandoLista && <div className="text-sm text-text-secondary">Carregando…</div>}
        {!carregandoLista && lista.length === 0 && (
          <div className="text-sm text-text-secondary">Nenhum professor cadastrado ainda.</div>
        )}
        <div className="flex flex-col divide-y divide-border">
          {lista.map((p) => (
            <div key={p.id} className="py-2.5">
              {editandoId === p.id ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold">Nome e sobrenome</span>
                      <input value={editNome} onChange={(e) => setEditNome(e.target.value)}
                        className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" autoFocus />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold">Papel</span>
                      <select value={editPapel} onChange={(e) => setEditPapel(e.target.value as Papel)}
                        className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green">
                        {Object.entries(ROTULO_PAPEL_PROFESSOR).map(([valor, rotulo]) => (
                          <option key={valor} value={valor}>{rotulo}</option>
                        ))}
                      </select>
                    </label>
                    {editPapel === 'professor_diretor' && (
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-semibold">Id da turma responsável</span>
                        <input value={editTurmaResponsavelId} onChange={(e) => setEditTurmaResponsavelId(e.target.value)}
                          placeholder="ex.: ds-2"
                          className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
                      </label>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-semibold">Disciplinas que leciona</span>
                    <SeletorDisciplinas
                      eixos={eixos}
                      cursos={cursos}
                      series={series}
                      disciplinas={disciplinasCat}
                      selecionadas={editDisciplinasSelecionadas}
                      aoAlternar={alternarDisciplinaEdit}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => salvarEdicao(p)} disabled={salvandoEdicao}
                      className="tap-target rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-60">
                      {salvandoEdicao ? 'Salvando…' : 'Salvar'}
                    </button>
                    <button type="button" onClick={() => setEditandoId(null)}
                      className="tap-target rounded-lg px-4 text-sm font-semibold text-text-secondary hover:bg-bg-section">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar iniciais={p.iniciais} cor={p.avatar_color} tamanho={34} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold">{p.nome}</div>
                    <div className="truncate text-xs text-text-secondary">
                      {ROTULO_PAPEL_PROFESSOR[p.papel] ?? p.papel}
                      {!!p.professor_disciplinas?.length && ` · ${p.professor_disciplinas.map((pd) => pd.disciplinas?.nome).filter(Boolean).join(', ')}`}
                      {' · '}{p.username}
                    </div>
                  </div>
                  <BotoesAcao aoEditar={() => iniciarEdicao(p)} aoExcluir={() => excluir(p)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Seletor de disciplinas (eixo → curso → série → disciplinas, múltipla escolha) ---

function SeletorDisciplinas({ eixos, cursos, series, disciplinas, selecionadas, aoAlternar }: {
  eixos: Eixo[]; cursos: Curso[]; series: Serie[]; disciplinas: DisciplinaCat[]
  selecionadas: Set<string>; aoAlternar: (id: string) => void
}) {
  const [abaEixo, setAbaEixo] = useState('')
  const [serieAtiva, setSerieAtiva] = useState('')

  useEffect(() => {
    if (eixos.length === 0) {
      setAbaEixo('')
      return
    }
    if (!eixos.some((e) => e.id === abaEixo)) setAbaEixo(eixos[0].id)
  }, [eixos, abaEixo])

  const cursosDoEixo = useMemo(() => cursos.filter((c) => c.eixo_id === abaEixo), [cursos, abaEixo])

  useEffect(() => {
    const seriesDisponiveis = series.filter((s) => cursosDoEixo.some((c) => c.id === s.curso_id))
    if (seriesDisponiveis.length === 0) {
      setSerieAtiva('')
      return
    }
    if (!seriesDisponiveis.some((s) => s.id === serieAtiva)) setSerieAtiva(seriesDisponiveis[0].id)
  }, [cursosDoEixo, series, serieAtiva])

  const disciplinasDaSerie = useMemo(() => disciplinas.filter((d) => d.serie_id === serieAtiva), [disciplinas, serieAtiva])

  function nomeDisciplina(id: string): string {
    return disciplinas.find((d) => d.id === id)?.nome ?? id
  }

  if (eixos.length === 0) {
    return <div className="text-xs text-text-secondary">Cadastre eixos, cursos, séries e disciplinas em "Cursos" primeiro.</div>
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-bg-section p-1">
        {eixos.map((e) => (
          <button
            type="button"
            key={e.id}
            onClick={() => setAbaEixo(e.id)}
            className={`tap-target shrink-0 rounded-md px-2.5 text-xs font-semibold transition-colors ${
              abaEixo === e.id ? 'bg-bg text-green-dark shadow-sm' : 'text-text-secondary hover:text-text'
            }`}
          >
            {e.nome}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex shrink-0 flex-col gap-2 sm:w-44">
          {cursosDoEixo.length === 0 && <div className="text-xs text-text-secondary">Nenhum curso nesse eixo.</div>}
          {cursosDoEixo.map((c) => {
            const seriesDoCurso = series.filter((s) => s.curso_id === c.id)
            return (
              <div key={c.id} className="flex flex-col gap-0.5">
                <div className="px-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{c.nome}</div>
                {seriesDoCurso.length === 0 && <div className="px-1.5 text-[11px] text-text-secondary">Nenhuma série</div>}
                {seriesDoCurso.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSerieAtiva(s.id)}
                    className={`tap-target rounded-md px-1.5 text-left text-xs font-semibold transition-colors ${
                      serieAtiva === s.id ? 'bg-green-soft text-green-dark' : 'text-text-secondary hover:bg-bg-section'
                    }`}
                  >
                    {s.nome}
                  </button>
                ))}
              </div>
            )
          })}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {!serieAtiva ? (
            <div className="text-xs text-text-secondary">Selecione uma série.</div>
          ) : disciplinasDaSerie.length === 0 ? (
            <div className="text-xs text-text-secondary">Nenhuma disciplina cadastrada nessa série.</div>
          ) : (
            (['base_comum', 'base_tecnica', 'base_diversificada'] as const).map((tipo) => {
              const opcoes = disciplinasDaSerie.filter((d) => d.tipo === tipo)
              if (opcoes.length === 0) return null
              return (
                <div key={tipo} className="flex flex-col gap-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{ROTULO_TIPO_DISCIPLINA[tipo]}</div>
                  {opcoes.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 text-[13px]">
                      <input
                        type="checkbox"
                        checked={selecionadas.has(d.id)}
                        onChange={() => aoAlternar(d.id)}
                        className="h-3.5 w-3.5 accent-green"
                      />
                      {d.nome}
                    </label>
                  ))}
                </div>
              )
            })
          )}
        </div>
      </div>

      {selecionadas.size > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2.5">
          {Array.from(selecionadas).map((id) => (
            <span key={id} className="flex items-center gap-1 rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green-dark">
              {nomeDisciplina(id)}
              <button
                type="button"
                onClick={() => aoAlternar(id)}
                aria-label={`Remover ${nomeDisciplina(id)}`}
                className="text-green-dark/70 hover:text-green-dark"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Professor-diretor: cadastro de alunos ---------------------------------

interface AlunoLinha {
  id: string
  nome: string
  iniciais: string
  avatar_color: string
}

function CadastroAlunos({ turmaId }: { turmaId: string }) {
  const [lista, setLista] = useState<AlunoLinha[]>([])
  const [carregandoLista, setCarregandoLista] = useState(true)
  const [nome, setNome] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

  const carregarLista = useCallback(async () => {
    setCarregandoLista(true)
    const { data } = await supabase
      .from('alunos')
      .select('id, nome, iniciais, avatar_color')
      .eq('turma_id', turmaId)
      .order('nome')
    setLista((data as AlunoLinha[] | null) ?? [])
    setCarregandoLista(false)
  }, [turmaId])

  useEffect(() => {
    carregarLista()
  }, [carregarLista])

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)
    setEnviando(true)
    const { error } = await supabase.from('alunos').insert({
      nome: nome.trim(),
      turma_id: turmaId,
      iniciais: iniciaisDe(nome),
      avatar_color: corAleatoria(),
    })
    setEnviando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setMensagem({ tipo: 'sucesso', texto: `${nome} cadastrado(a) na turma.` })
    setNome('')
    carregarLista()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-7">
      <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cadastrar aluno(a) — turma {turmaId}</div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Nome completo</span>
          <input required value={nome} onChange={(e) => setNome(e.target.value)}
            className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
        </label>

        {mensagem && (
          <div className={`rounded-lg px-3.5 py-2.5 text-[13.5px] ${
            mensagem.tipo === 'erro' ? 'border border-grave/30 bg-grave/10 text-grave' : 'border border-green/30 bg-green-soft text-green-dark'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <button type="submit" disabled={enviando}
          className="tap-target flex items-center justify-center self-start rounded-lg bg-green px-5 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60">
          {enviando ? 'Cadastrando…' : 'Cadastrar aluno(a)'}
        </button>
      </form>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Alunos da turma</div>
        {carregandoLista && <div className="text-sm text-text-secondary">Carregando…</div>}
        {!carregandoLista && lista.length === 0 && (
          <div className="text-sm text-text-secondary">Nenhum aluno cadastrado ainda.</div>
        )}
        <div className="flex flex-col divide-y divide-border">
          {lista.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2.5">
              <Avatar iniciais={a.iniciais} cor={a.avatar_color} tamanho={34} />
              <div className="truncate text-[13.5px] font-semibold">{a.nome}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
