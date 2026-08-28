import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AppShell } from '../components/AppShell'
import { IconEdit, IconTrash } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

type TipoDisciplina = 'base_comum' | 'base_tecnica' | 'base_diversificada'

const ROTULO_TIPO: Record<TipoDisciplina, string> = {
  base_comum: 'Base comum',
  base_tecnica: 'Base técnica',
  base_diversificada: 'Base diversificada',
}

interface Eixo { id: string; nome: string }
interface Curso { id: string; nome: string; eixo_id: string }
interface Serie { id: string; nome: string; curso_id: string }
interface Disciplina { id: string; nome: string; tipo: TipoDisciplina; serie_id: string }

type Mensagem = { tipo: 'erro' | 'sucesso'; texto: string } | null

export function CursosPage() {
  const { usuario } = useAuth()
  if (!usuario) return null

  if (usuario.papel !== 'admin') {
    return (
      <AppShell titulo="Cursos e disciplinas">
        <div className="p-6 text-sm text-text-secondary">Você não tem permissão para acessar esta página.</div>
      </AppShell>
    )
  }

  return (
    <AppShell titulo="Cursos e disciplinas">
      <CatalogoAcademico />
    </AppShell>
  )
}

type Aba = 'eixo' | 'curso' | 'serie' | 'disciplina'

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'eixo', rotulo: '1. Eixo' },
  { id: 'curso', rotulo: '2. Curso' },
  { id: 'serie', rotulo: '3. Série' },
  { id: 'disciplina', rotulo: '4. Disciplina' },
]

function CatalogoAcademico() {
  const [eixos, setEixos] = useState<Eixo[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState<Aba>('eixo')

  const carregarTudo = useCallback(async () => {
    setCarregando(true)
    const [e, c, s, d] = await Promise.all([
      supabase.from('eixos').select('id, nome').order('nome'),
      supabase.from('cursos').select('id, nome, eixo_id').order('nome'),
      supabase.from('series').select('id, nome, curso_id').order('nome'),
      supabase.from('disciplinas').select('id, nome, tipo, serie_id').order('nome'),
    ])
    setEixos((e.data as Eixo[] | null) ?? [])
    setCursos((c.data as Curso[] | null) ?? [])
    setSeries((s.data as Serie[] | null) ?? [])
    setDisciplinas((d.data as Disciplina[] | null) ?? [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregarTudo()
  }, [carregarTudo])

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-7">
      <div className="flex gap-1.5 overflow-x-auto rounded-lg border border-border bg-bg p-1.5">
        {ABAS.map((item) => (
          <button
            key={item.id}
            onClick={() => setAba(item.id)}
            className={`tap-target shrink-0 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
              aba === item.id ? 'bg-green-soft text-green-dark' : 'text-text-secondary hover:bg-bg-section'
            }`}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="text-sm text-text-secondary">Carregando…</div>
      ) : (
        <>
          {aba === 'eixo' && <SecaoEixos eixos={eixos} recarregar={carregarTudo} />}
          {aba === 'curso' && <SecaoCursos eixos={eixos} cursos={cursos} recarregar={carregarTudo} />}
          {aba === 'serie' && <SecaoSeries cursos={cursos} eixos={eixos} series={series} recarregar={carregarTudo} />}
          {aba === 'disciplina' && (
            <SecaoDisciplinas eixos={eixos} cursos={cursos} series={series} disciplinas={disciplinas} recarregar={carregarTudo} />
          )}
        </>
      )}
    </div>
  )
}

function CaixaMensagem({ mensagem }: { mensagem: Mensagem }) {
  if (!mensagem) return null
  return (
    <div className={`rounded-lg px-3.5 py-2.5 text-[13.5px] ${
      mensagem.tipo === 'erro' ? 'border border-grave/30 bg-grave/10 text-grave' : 'border border-green/30 bg-green-soft text-green-dark'
    }`}>
      {mensagem.texto}
    </div>
  )
}

const campoClasse = 'tap-target rounded-lg border border-border bg-bg px-3.5 text-[14px] outline-none focus:border-green'
const campoPequeno = 'tap-target rounded-lg border border-border bg-bg px-2.5 text-[13.5px] outline-none focus:border-green'

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

// --- 1) Eixos -------------------------------------------------------------

function SecaoEixos({ eixos, recarregar }: { eixos: Eixo[]; recarregar: () => void }) {
  const [nome, setNome] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<Mensagem>(null)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)
    setEnviando(true)
    const { error } = await supabase.from('eixos').insert({ nome: nome.trim() })
    setEnviando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setMensagem({ tipo: 'sucesso', texto: `Eixo "${nome}" cadastrado.` })
    setNome('')
    recarregar()
  }

  function iniciarEdicao(e: Eixo) {
    setEditandoId(e.id)
    setEditNome(e.nome)
  }

  async function salvarEdicao(id: string) {
    setSalvandoEdicao(true)
    const { error } = await supabase.from('eixos').update({ nome: editNome.trim() }).eq('id', id)
    setSalvandoEdicao(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setEditandoId(null)
    recarregar()
  }

  async function excluir(e: Eixo) {
    if (!confirm(`Excluir o eixo "${e.nome}"? Cursos, séries e disciplinas vinculados também serão removidos.`)) return
    const { error } = await supabase.from('eixos').delete().eq('id', e.id)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    recarregar()
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <form onSubmit={aoEnviar} className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cadastrar eixo</div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Nome do eixo</span>
          <input required value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder="ex.: Tecnologia da Informação" className={campoClasse} />
        </label>
        <CaixaMensagem mensagem={mensagem} />
        <button type="submit" disabled={enviando}
          className="tap-target flex items-center justify-center self-start rounded-lg bg-green px-5 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60">
          {enviando ? 'Cadastrando…' : 'Cadastrar eixo'}
        </button>
      </form>

      <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Eixos cadastrados</div>
        {eixos.length === 0 && <div className="text-sm text-text-secondary">Nenhum eixo cadastrado ainda.</div>}
        <div className="flex flex-col divide-y divide-border">
          {eixos.map((e) => (
            <div key={e.id} className="flex items-center gap-2 py-2">
              {editandoId === e.id ? (
                <>
                  <input value={editNome} onChange={(ev) => setEditNome(ev.target.value)} className={`${campoPequeno} flex-1`} autoFocus />
                  <button type="button" onClick={() => salvarEdicao(e.id)} disabled={salvandoEdicao}
                    className="tap-target rounded-lg bg-green px-3 text-xs font-semibold text-white hover:bg-green-dark disabled:opacity-60">
                    Salvar
                  </button>
                  <button type="button" onClick={() => setEditandoId(null)}
                    className="tap-target rounded-lg px-3 text-xs font-semibold text-text-secondary hover:bg-bg-section">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 text-[13.5px]">{e.nome}</div>
                  <BotoesAcao aoEditar={() => iniciarEdicao(e)} aoExcluir={() => excluir(e)} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- 2) Cursos --------------------------------------------------------------

function SecaoCursos({ eixos, cursos, recarregar }: { eixos: Eixo[]; cursos: Curso[]; recarregar: () => void }) {
  const [nome, setNome] = useState('')
  const [eixoId, setEixoId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<Mensagem>(null)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editEixoId, setEditEixoId] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  const [abaEixoLista, setAbaEixoLista] = useState('')

  useEffect(() => {
    if (eixos.length === 0) {
      setAbaEixoLista('')
      return
    }
    if (!eixos.some((e) => e.id === abaEixoLista)) setAbaEixoLista(eixos[0].id)
  }, [eixos, abaEixoLista])

  const cursosDaAba = useMemo(() => cursos.filter((c) => c.eixo_id === abaEixoLista), [cursos, abaEixoLista])

  function nomeEixo(id: string): string {
    return eixos.find((e) => e.id === id)?.nome ?? id
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)
    if (!eixoId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um eixo.' })
      return
    }
    setEnviando(true)
    const { error } = await supabase.from('cursos').insert({ nome: nome.trim(), eixo_id: eixoId })
    setEnviando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setMensagem({ tipo: 'sucesso', texto: `Curso "${nome}" cadastrado.` })
    setNome('')
    recarregar()
  }

  function iniciarEdicao(c: Curso) {
    setEditandoId(c.id)
    setEditNome(c.nome)
    setEditEixoId(c.eixo_id)
  }

  async function salvarEdicao(id: string) {
    setSalvandoEdicao(true)
    const { error } = await supabase.from('cursos').update({ nome: editNome.trim(), eixo_id: editEixoId }).eq('id', id)
    setSalvandoEdicao(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setEditandoId(null)
    recarregar()
  }

  async function excluir(c: Curso) {
    if (!confirm(`Excluir o curso "${c.nome}"? Séries e disciplinas vinculadas também serão removidas.`)) return
    const { error } = await supabase.from('cursos').delete().eq('id', c.id)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    recarregar()
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cadastrar curso</div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Eixo</span>
            <select required value={eixoId} onChange={(e) => setEixoId(e.target.value)} className={campoClasse} disabled={eixos.length === 0}>
              <option value="">Selecione…</option>
              {eixos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
            {eixos.length === 0 && <span className="text-xs text-text-secondary">Cadastre um eixo primeiro.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Nome do curso</span>
            <input required value={nome} onChange={(e) => setNome(e.target.value)}
              placeholder="ex.: Desenvolvimento de Sistemas" className={campoClasse} />
          </label>
        </div>
        <CaixaMensagem mensagem={mensagem} />
        <button type="submit" disabled={enviando || eixos.length === 0}
          className="tap-target flex items-center justify-center self-start rounded-lg bg-green px-5 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60">
          {enviando ? 'Cadastrando…' : 'Cadastrar curso'}
        </button>
      </form>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cursos cadastrados</div>
        {eixos.length === 0 && <div className="text-sm text-text-secondary">Nenhum eixo cadastrado ainda.</div>}

        {eixos.length > 0 && (
          <>
            <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-bg-section p-1">
              {eixos.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setAbaEixoLista(e.id)}
                  className={`tap-target shrink-0 rounded-md px-3 text-[13px] font-semibold transition-colors ${
                    abaEixoLista === e.id ? 'bg-bg text-green-dark shadow-sm' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {e.nome}
                </button>
              ))}
            </div>

            {cursosDaAba.length === 0 && (
              <div className="text-sm text-text-secondary">Nenhum curso cadastrado neste eixo ainda.</div>
            )}
            <div className="flex flex-col divide-y divide-border">
              {cursosDaAba.map((c) => (
                <div key={c.id} className="py-2.5">
                  {editandoId === c.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select value={editEixoId} onChange={(ev) => setEditEixoId(ev.target.value)} className={campoPequeno}>
                        {eixos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                      </select>
                      <input value={editNome} onChange={(ev) => setEditNome(ev.target.value)} className={`${campoPequeno} flex-1`} autoFocus />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => salvarEdicao(c.id)} disabled={salvandoEdicao}
                          className="tap-target rounded-lg bg-green px-3 text-xs font-semibold text-white hover:bg-green-dark disabled:opacity-60">
                          Salvar
                        </button>
                        <button type="button" onClick={() => setEditandoId(null)}
                          className="tap-target rounded-lg px-3 text-xs font-semibold text-text-secondary hover:bg-bg-section">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-[13.5px] font-semibold">{c.nome}</div>
                        <div className="text-xs text-text-secondary">{nomeEixo(c.eixo_id)}</div>
                      </div>
                      <BotoesAcao aoEditar={() => iniciarEdicao(c)} aoExcluir={() => excluir(c)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// --- 3) Séries ----------------------------------------------------------

function SecaoSeries({ eixos, cursos, series, recarregar }: {
  eixos: Eixo[]; cursos: Curso[]; series: Serie[]; recarregar: () => void
}) {
  const [nome, setNome] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<Mensagem>(null)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editCursoId, setEditCursoId] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  const [abaCursoLista, setAbaCursoLista] = useState('')

  useEffect(() => {
    if (cursos.length === 0) {
      setAbaCursoLista('')
      return
    }
    if (!cursos.some((c) => c.id === abaCursoLista)) setAbaCursoLista(cursos[0].id)
  }, [cursos, abaCursoLista])

  const seriesDaAba = useMemo(() => series.filter((s) => s.curso_id === abaCursoLista), [series, abaCursoLista])

  function rotuloCurso(c: Curso): string {
    const eixo = eixos.find((e) => e.id === c.eixo_id)
    return eixo ? `${c.nome} · ${eixo.nome}` : c.nome
  }

  function nomeCurso(id: string): string {
    return cursos.find((c) => c.id === id)?.nome ?? id
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)
    if (!cursoId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um curso.' })
      return
    }
    setEnviando(true)
    const { error } = await supabase.from('series').insert({ nome: nome.trim(), curso_id: cursoId })
    setEnviando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setMensagem({ tipo: 'sucesso', texto: `Série "${nome}" cadastrada.` })
    setNome('')
    recarregar()
  }

  function iniciarEdicao(s: Serie) {
    setEditandoId(s.id)
    setEditNome(s.nome)
    setEditCursoId(s.curso_id)
  }

  async function salvarEdicao(id: string) {
    setSalvandoEdicao(true)
    const { error } = await supabase.from('series').update({ nome: editNome.trim(), curso_id: editCursoId }).eq('id', id)
    setSalvandoEdicao(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setEditandoId(null)
    recarregar()
  }

  async function excluir(s: Serie) {
    if (!confirm(`Excluir a série "${s.nome}"? Disciplinas vinculadas também serão removidas.`)) return
    const { error } = await supabase.from('series').delete().eq('id', s.id)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    recarregar()
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cadastrar série</div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Curso</span>
            <select required value={cursoId} onChange={(e) => setCursoId(e.target.value)} className={campoClasse} disabled={cursos.length === 0}>
              <option value="">Selecione…</option>
              {cursos.map((c) => <option key={c.id} value={c.id}>{rotuloCurso(c)}</option>)}
            </select>
            {cursos.length === 0 && <span className="text-xs text-text-secondary">Cadastre um curso primeiro.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Nome da série</span>
            <input required value={nome} onChange={(e) => setNome(e.target.value)}
              placeholder="ex.: 1º ano" className={campoClasse} />
          </label>
        </div>
        <CaixaMensagem mensagem={mensagem} />
        <button type="submit" disabled={enviando || cursos.length === 0}
          className="tap-target flex items-center justify-center self-start rounded-lg bg-green px-5 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60">
          {enviando ? 'Cadastrando…' : 'Cadastrar série'}
        </button>
      </form>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Séries cadastradas</div>
        {cursos.length === 0 && <div className="text-sm text-text-secondary">Nenhum curso cadastrado ainda.</div>}

        {cursos.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 flex-row gap-1.5 overflow-x-auto rounded-lg bg-bg-section p-1 sm:w-48 sm:flex-col sm:overflow-visible">
              {cursos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAbaCursoLista(c.id)}
                  className={`tap-target shrink-0 rounded-md px-3 text-left text-[13px] font-semibold transition-colors ${
                    abaCursoLista === c.id ? 'bg-bg text-green-dark shadow-sm' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {c.nome}
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {seriesDaAba.length === 0 && (
                <div className="text-sm text-text-secondary">Nenhuma série cadastrada neste curso ainda.</div>
              )}
              <div className="flex flex-col divide-y divide-border">
                {seriesDaAba.map((s) => (
                  <div key={s.id} className="py-2.5">
                    {editandoId === s.id ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select value={editCursoId} onChange={(ev) => setEditCursoId(ev.target.value)} className={campoPequeno}>
                          {cursos.map((c) => <option key={c.id} value={c.id}>{rotuloCurso(c)}</option>)}
                        </select>
                        <input value={editNome} onChange={(ev) => setEditNome(ev.target.value)} className={`${campoPequeno} flex-1`} autoFocus />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => salvarEdicao(s.id)} disabled={salvandoEdicao}
                            className="tap-target rounded-lg bg-green px-3 text-xs font-semibold text-white hover:bg-green-dark disabled:opacity-60">
                            Salvar
                          </button>
                          <button type="button" onClick={() => setEditandoId(null)}
                            className="tap-target rounded-lg px-3 text-xs font-semibold text-text-secondary hover:bg-bg-section">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-[13.5px] font-semibold">{s.nome}</div>
                          <div className="text-xs text-text-secondary">{nomeCurso(s.curso_id)}</div>
                        </div>
                        <BotoesAcao aoEditar={() => iniciarEdicao(s)} aoExcluir={() => excluir(s)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- 4) Disciplinas -------------------------------------------------------

function SecaoDisciplinas({ eixos, cursos, series, disciplinas, recarregar }: {
  eixos: Eixo[]; cursos: Curso[]; series: Serie[]; disciplinas: Disciplina[]; recarregar: () => void
}) {
  const [eixoId, setEixoId] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [serieId, setSerieId] = useState('')
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoDisciplina>('base_comum')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<Mensagem>(null)

  const cursosDoEixo = useMemo(() => cursos.filter((c) => c.eixo_id === eixoId), [cursos, eixoId])
  const seriesDoCurso = useMemo(() => series.filter((s) => s.curso_id === cursoId), [series, cursoId])

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editTipo, setEditTipo] = useState<TipoDisciplina>('base_comum')
  const [editEixoId, setEditEixoId] = useState('')
  const [editCursoId, setEditCursoId] = useState('')
  const [editSerieId, setEditSerieId] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  const cursosDoEixoEdit = useMemo(() => cursos.filter((c) => c.eixo_id === editEixoId), [cursos, editEixoId])
  const seriesDoCursoEdit = useMemo(() => series.filter((s) => s.curso_id === editCursoId), [series, editCursoId])

  const [abaEixoLista, setAbaEixoLista] = useState('')
  const [abaSerieLista, setAbaSerieLista] = useState('')
  const [abaTipoLista, setAbaTipoLista] = useState<TipoDisciplina>('base_comum')

  useEffect(() => {
    if (eixos.length === 0) {
      setAbaEixoLista('')
      return
    }
    if (!eixos.some((e) => e.id === abaEixoLista)) setAbaEixoLista(eixos[0].id)
  }, [eixos, abaEixoLista])

  const cursosDaAbaEixo = useMemo(() => cursos.filter((c) => c.eixo_id === abaEixoLista), [cursos, abaEixoLista])

  useEffect(() => {
    const seriesDisponiveis = series.filter((s) => cursosDaAbaEixo.some((c) => c.id === s.curso_id))
    if (seriesDisponiveis.length === 0) {
      setAbaSerieLista('')
      return
    }
    if (!seriesDisponiveis.some((s) => s.id === abaSerieLista)) setAbaSerieLista(seriesDisponiveis[0].id)
  }, [cursosDaAbaEixo, series, abaSerieLista])

  const disciplinasDaAba = useMemo(
    () => disciplinas.filter((d) => d.serie_id === abaSerieLista && d.tipo === abaTipoLista),
    [disciplinas, abaSerieLista, abaTipoLista],
  )

  function aoTrocarEixo(id: string) {
    setEixoId(id)
    setCursoId('')
    setSerieId('')
  }

  function aoTrocarCurso(id: string) {
    setCursoId(id)
    setSerieId('')
  }

  function aoTrocarEixoEdit(id: string) {
    setEditEixoId(id)
    setEditCursoId('')
    setEditSerieId('')
  }

  function aoTrocarCursoEdit(id: string) {
    setEditCursoId(id)
    setEditSerieId('')
  }

  function rotuloSerie(id: string): string {
    const serie = series.find((s) => s.id === id)
    if (!serie) return id
    const curso = cursos.find((c) => c.id === serie.curso_id)
    const eixo = curso ? eixos.find((e) => e.id === curso.eixo_id) : undefined
    return [serie.nome, curso?.nome, eixo?.nome].filter(Boolean).join(' · ')
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setMensagem(null)
    if (!serieId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione eixo, curso e série.' })
      return
    }
    setEnviando(true)
    const { error } = await supabase.from('disciplinas').insert({ nome: nome.trim(), tipo, serie_id: serieId })
    setEnviando(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setMensagem({ tipo: 'sucesso', texto: `Disciplina "${nome}" cadastrada.` })
    setNome('')
    recarregar()
  }

  function iniciarEdicao(d: Disciplina) {
    const serie = series.find((s) => s.id === d.serie_id)
    const curso = serie ? cursos.find((c) => c.id === serie.curso_id) : undefined
    setEditandoId(d.id)
    setEditNome(d.nome)
    setEditTipo(d.tipo)
    setEditEixoId(curso?.eixo_id ?? '')
    setEditCursoId(curso?.id ?? '')
    setEditSerieId(d.serie_id)
  }

  async function salvarEdicao(id: string) {
    setSalvandoEdicao(true)
    const { error } = await supabase.from('disciplinas')
      .update({ nome: editNome.trim(), tipo: editTipo, serie_id: editSerieId })
      .eq('id', id)
    setSalvandoEdicao(false)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    setEditandoId(null)
    recarregar()
  }

  async function excluir(d: Disciplina) {
    if (!confirm(`Excluir a disciplina "${d.nome}"?`)) return
    const { error } = await supabase.from('disciplinas').delete().eq('id', d.id)
    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
      return
    }
    recarregar()
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Cadastrar disciplina</div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Eixo</span>
            <select required value={eixoId} onChange={(e) => aoTrocarEixo(e.target.value)} className={campoClasse} disabled={eixos.length === 0}>
              <option value="">Selecione…</option>
              {eixos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Curso</span>
            <select required value={cursoId} onChange={(e) => aoTrocarCurso(e.target.value)} className={campoClasse} disabled={!eixoId}>
              <option value="">Selecione…</option>
              {cursosDoEixo.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {eixoId && cursosDoEixo.length === 0 && <span className="text-xs text-text-secondary">Nenhum curso nesse eixo ainda.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Série</span>
            <select required value={serieId} onChange={(e) => setSerieId(e.target.value)} className={campoClasse} disabled={!cursoId}>
              <option value="">Selecione…</option>
              {seriesDoCurso.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            {cursoId && seriesDoCurso.length === 0 && <span className="text-xs text-text-secondary">Nenhuma série nesse curso ainda.</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Nome da disciplina</span>
            <input required value={nome} onChange={(e) => setNome(e.target.value)}
              placeholder="ex.: Programação Orientada a Objetos" className={campoClasse} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoDisciplina)} className={campoClasse}>
              {(Object.entries(ROTULO_TIPO) as [TipoDisciplina, string][]).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </select>
          </label>
        </div>

        <CaixaMensagem mensagem={mensagem} />

        <button type="submit" disabled={enviando || !serieId}
          className="tap-target flex items-center justify-center self-start rounded-lg bg-green px-5 text-sm font-semibold text-white transition-colors hover:bg-green-dark disabled:opacity-60">
          {enviando ? 'Cadastrando…' : 'Cadastrar disciplina'}
        </button>
      </form>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-5 sm:p-6">
        <div className="text-[15px] font-bold">Disciplinas cadastradas</div>
        {eixos.length === 0 && <div className="text-sm text-text-secondary">Nenhum eixo cadastrado ainda.</div>}

        {eixos.length > 0 && (
          <>
            <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-bg-section p-1">
              {eixos.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setAbaEixoLista(e.id)}
                  className={`tap-target shrink-0 rounded-md px-3 text-[13px] font-semibold transition-colors ${
                    abaEixoLista === e.id ? 'bg-bg text-green-dark shadow-sm' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {e.nome}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex shrink-0 flex-col gap-3 sm:w-56">
                {cursosDaAbaEixo.length === 0 && (
                  <div className="text-sm text-text-secondary">Nenhum curso nesse eixo ainda.</div>
                )}
                {cursosDaAbaEixo.map((c) => {
                  const seriesDoCursoAba = series.filter((s) => s.curso_id === c.id)
                  return (
                    <div key={c.id} className="flex flex-col gap-0.5">
                      <div className="px-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{c.nome}</div>
                      {seriesDoCursoAba.length === 0 && (
                        <div className="px-2 text-xs text-text-secondary">Nenhuma série</div>
                      )}
                      {seriesDoCursoAba.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setAbaSerieLista(s.id)}
                          className={`tap-target rounded-md px-2 text-left text-[13px] font-semibold transition-colors ${
                            abaSerieLista === s.id ? 'bg-green-soft text-green-dark' : 'text-text-secondary hover:bg-bg-section'
                          }`}
                        >
                          {s.nome}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {!abaSerieLista ? (
                  <div className="text-sm text-text-secondary">Selecione uma série.</div>
                ) : (
                  <>
                    <div className="flex gap-1.5 overflow-x-auto rounded-lg bg-bg-section p-1">
                      {(Object.entries(ROTULO_TIPO) as [TipoDisciplina, string][]).map(([valor, rotulo]) => (
                        <button
                          key={valor}
                          onClick={() => setAbaTipoLista(valor)}
                          className={`tap-target shrink-0 rounded-md px-3 text-[13px] font-semibold transition-colors ${
                            abaTipoLista === valor ? 'bg-bg text-green-dark shadow-sm' : 'text-text-secondary hover:text-text'
                          }`}
                        >
                          {rotulo}
                        </button>
                      ))}
                    </div>

                    {disciplinasDaAba.length === 0 && (
                      <div className="text-sm text-text-secondary">Nenhuma disciplina cadastrada aqui ainda.</div>
                    )}
                    <div className="flex flex-col divide-y divide-border">
                      {disciplinasDaAba.map((d) => (
                        <div key={d.id} className="py-2">
                          {editandoId === d.id ? (
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <select value={editEixoId} onChange={(ev) => aoTrocarEixoEdit(ev.target.value)} className={campoPequeno}>
                                  {eixos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                </select>
                                <select value={editCursoId} onChange={(ev) => aoTrocarCursoEdit(ev.target.value)} className={campoPequeno}>
                                  {cursosDoEixoEdit.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                                <select value={editSerieId} onChange={(ev) => setEditSerieId(ev.target.value)} className={campoPequeno}>
                                  {seriesDoCursoEdit.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </select>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input value={editNome} onChange={(ev) => setEditNome(ev.target.value)} className={`${campoPequeno} flex-1`} autoFocus />
                                <select value={editTipo} onChange={(ev) => setEditTipo(ev.target.value as TipoDisciplina)} className={campoPequeno}>
                                  {(Object.entries(ROTULO_TIPO) as [TipoDisciplina, string][]).map(([valor, rotulo]) => (
                                    <option key={valor} value={valor}>{rotulo}</option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => salvarEdicao(d.id)} disabled={salvandoEdicao || !editSerieId}
                                    className="tap-target rounded-lg bg-green px-3 text-xs font-semibold text-white hover:bg-green-dark disabled:opacity-60">
                                    Salvar
                                  </button>
                                  <button type="button" onClick={() => setEditandoId(null)}
                                    className="tap-target rounded-lg px-3 text-xs font-semibold text-text-secondary hover:bg-bg-section">
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="text-[13.5px]">{d.nome}</div>
                                <div className="text-xs text-text-secondary">{rotuloSerie(d.serie_id)}</div>
                              </div>
                              <BotoesAcao aoEditar={() => iniciarEdicao(d)} aoExcluir={() => excluir(d)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
