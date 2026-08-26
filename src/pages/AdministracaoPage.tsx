import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { criarClienteDescartavel, supabase } from '../lib/supabase'
import type { Papel } from '../types'

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

const ROTULO_PAPEL_PROFESSOR: Record<string, string> = {
  professor: 'Professor(a)',
  professor_tecnico: 'Professor(a) técnico(a)',
  professor_diretor: 'Professor(a)-diretor(a)',
  professor_coordenador: 'Professor(a) coordenador(a)',
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
  email: string
  papel: Papel
  disciplina: string | null
  iniciais: string
  avatar_color: string
}

function CadastroProfessores() {
  const [lista, setLista] = useState<PerfilLinha[]>([])
  const [carregandoLista, setCarregandoLista] = useState(true)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [papel, setPapel] = useState<Papel>('professor')
  const [disciplina, setDisciplina] = useState('')
  const [turmaResponsavelId, setTurmaResponsavelId] = useState('')
  const [eixoCoordenadoId, setEixoCoordenadoId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

  const carregarLista = useCallback(async () => {
    setCarregandoLista(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, email, papel, disciplina, iniciais, avatar_color')
      .order('nome')
    setLista((data as PerfilLinha[] | null) ?? [])
    setCarregandoLista(false)
  }, [])

  useEffect(() => {
    carregarLista()
  }, [carregarLista])

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)

    if (senha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A senha temporária precisa ter ao menos 6 caracteres.' })
      return
    }

    setEnviando(true)
    try {
      // Cliente descartável: cria a conta no Auth sem derrubar a sessão do admin.
      const clienteTemp = criarClienteDescartavel()
      const { data, error } = await clienteTemp.auth.signUp({ email: email.trim(), password: senha })
      if (error || !data.user) {
        setMensagem({ tipo: 'erro', texto: error?.message ?? 'Não foi possível criar a conta.' })
        return
      }

      const { error: erroPerfil } = await supabase.from('profiles').insert({
        id: data.user.id,
        nome: nome.trim(),
        email: email.trim(),
        papel,
        disciplina: disciplina.trim() || null,
        turma_responsavel_id: papel === 'professor_diretor' ? turmaResponsavelId.trim() || null : null,
        eixo_coordenado_id: papel === 'professor_coordenador' ? eixoCoordenadoId.trim() || null : null,
        iniciais: iniciaisDe(nome),
        avatar_color: corAleatoria(),
      })
      if (erroPerfil) {
        setMensagem({ tipo: 'erro', texto: `Conta criada, mas o perfil falhou: ${erroPerfil.message}` })
        return
      }

      setMensagem({ tipo: 'sucesso', texto: `Conta criada para ${nome}. Envie a senha temporária por um canal seguro.` })
      setNome(''); setEmail(''); setSenha(''); setDisciplina(''); setTurmaResponsavelId(''); setEixoCoordenadoId('')
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
            <span className="text-[13px] font-semibold">Nome completo</span>
            <input required value={nome} onChange={(e) => setNome(e.target.value)}
              className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">E-mail</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
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
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Disciplina</span>
            <input value={disciplina} onChange={(e) => setDisciplina(e.target.value)}
              className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
          </label>
          {papel === 'professor_diretor' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">Id da turma responsável</span>
              <input value={turmaResponsavelId} onChange={(e) => setTurmaResponsavelId(e.target.value)}
                placeholder="ex.: ds-2"
                className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
            </label>
          )}
          {papel === 'professor_coordenador' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">Id do eixo coordenado</span>
              <input value={eixoCoordenadoId} onChange={(e) => setEixoCoordenadoId(e.target.value)}
                placeholder="ex.: ti"
                className="tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green" />
            </label>
          )}
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
            <div key={p.id} className="flex items-center gap-3 py-2.5">
              <Avatar iniciais={p.iniciais} cor={p.avatar_color} tamanho={34} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold">{p.nome}</div>
                <div className="truncate text-xs text-text-secondary">
                  {ROTULO_PAPEL_PROFESSOR[p.papel] ?? p.papel}{p.disciplina && ` · ${p.disciplina}`} · {p.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
