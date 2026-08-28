import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { corAleatoria, iniciaisDe } from '../lib/pessoas'
import { PainelAdminPage } from './PainelAdminPage'

export function AdministracaoPage() {
  const { usuario } = useAuth()
  if (!usuario) return null

  if (usuario.papel === 'admin') {
    return <PainelAdminPage />
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

// --- Professor-diretor: cadastro de alunos ---------------------------------

interface AlunoLinha {
  id: string
  nome: string
  iniciais: string
  avatar_color: string
}

interface SerieComContexto {
  nome: string
  cursos: { nome: string; eixos: { nome: string } | null } | null
}

function CadastroAlunos({ turmaId }: { turmaId: string }) {
  const [lista, setLista] = useState<AlunoLinha[]>([])
  const [carregandoLista, setCarregandoLista] = useState(true)
  const [turma, setTurma] = useState<SerieComContexto | null>(null)
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

  const carregarTurma = useCallback(async () => {
    const { data } = await supabase
      .from('series')
      .select('nome, cursos(nome, eixos(nome))')
      .eq('id', turmaId)
      .maybeSingle<SerieComContexto>()
    setTurma(data ?? null)
  }, [turmaId])

  useEffect(() => {
    carregarLista()
    carregarTurma()
  }, [carregarLista, carregarTurma])

  const rotuloTurma = turma
    ? [turma.nome, turma.cursos?.nome, turma.cursos?.eixos?.nome].filter(Boolean).join(' · ')
    : 'carregando…'

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
        <div className="text-[15px] font-bold">Cadastrar aluno(a) — {rotuloTurma}</div>
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
