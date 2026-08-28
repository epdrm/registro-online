import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Papel } from '../types'

const ROTULO_PAPEL: Record<string, string> = {
  professor: 'Professor(a)',
  professor_tecnico: 'Professor(a) técnico(a)',
  professor_diretor: 'Diretor(a) de Turma',
  professor_coordenador: 'Coordenação técnica',
  coordenacao_pedagogica: 'Coordenação pedagógica',
  diretor: 'Direção escolar',
}

interface Contadores {
  professores: number
  porPapel: Partial<Record<Papel, number>>
  cursos: number
  disciplinas: number
  eixos: number
  alunos: number
}

async function contar(tabela: string): Promise<number> {
  const { count } = await supabase.from(tabela).select('*', { count: 'exact', head: true })
  return count ?? 0
}

export function PainelAdminPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados] = useState<Contadores | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      const [{ data: perfis }, cursos, disciplinas, eixos, alunos] = await Promise.all([
        supabase.from('profiles').select('papel').neq('papel', 'admin'),
        contar('cursos'),
        contar('disciplinas'),
        contar('eixos'),
        contar('alunos'),
      ])
      const porPapel: Partial<Record<Papel, number>> = {}
      for (const p of perfis ?? []) {
        const papel = p.papel as Papel
        porPapel[papel] = (porPapel[papel] ?? 0) + 1
      }
      if (ativo) {
        setDados({ professores: perfis?.length ?? 0, porPapel, cursos, disciplinas, eixos, alunos })
        setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [])

  if (!usuario) return null

  return (
    <AppShell titulo="Painel">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
        <div>
          <div className="text-xl font-bold">Olá, {usuario.nome.split(' ')[0]}</div>
          <div className="text-[13.5px] text-text-secondary">Resumo do que já está cadastrado no sistema.</div>
        </div>

        {carregando || !dados ? (
          <div className="text-sm text-text-secondary">Carregando…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-[10px] border border-border bg-bg p-5">
                <div className="text-xs font-semibold text-text-secondary">Professores</div>
                <div className="mt-1.5 text-3xl font-bold">{dados.professores}</div>
              </div>
              <div className="rounded-[10px] border border-border bg-bg p-5">
                <div className="text-xs font-semibold text-text-secondary">Eixos</div>
                <div className="mt-1.5 text-3xl font-bold">{dados.eixos}</div>
              </div>
              <div className="rounded-[10px] border border-border bg-bg p-5">
                <div className="text-xs font-semibold text-text-secondary">Cursos</div>
                <div className="mt-1.5 text-3xl font-bold">{dados.cursos}</div>
              </div>
              <div className="rounded-[10px] border border-border bg-bg p-5">
                <div className="text-xs font-semibold text-text-secondary">Disciplinas</div>
                <div className="mt-1.5 text-3xl font-bold">{dados.disciplinas}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[10px] border border-border bg-bg p-5">
                <div className="mb-3.5 text-[14.5px] font-bold">Professores por papel</div>
                {dados.professores === 0 ? (
                  <div className="text-[13px] text-text-secondary">Nenhum professor cadastrado ainda.</div>
                ) : (
                  <div className="flex flex-col divide-y divide-border">
                    {(Object.entries(ROTULO_PAPEL) as [Papel, string][]).map(([papel, rotulo]) => {
                      const total = dados.porPapel[papel] ?? 0
                      if (total === 0) return null
                      return (
                        <div key={papel} className="flex items-center justify-between py-2 text-[13.5px]">
                          <span>{rotulo}</span>
                          <span className="font-bold">{total}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[10px] border border-border bg-bg p-5">
                  <div className="text-xs font-semibold text-text-secondary">Alunos cadastrados</div>
                  <div className="mt-1.5 text-3xl font-bold">{dados.alunos}</div>
                  <div className="mt-0.5 text-xs text-text-secondary">por diretores(as) de turma</div>
                </div>

                <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-bg p-5">
                  <div className="mb-1 text-[14.5px] font-bold">Ações rápidas</div>
                  <button
                    onClick={() => navigate('/app/professores')}
                    className="tap-target flex items-center justify-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-green-dark"
                  >
                    Cadastrar professor
                  </button>
                  <button
                    onClick={() => navigate('/app/cursos')}
                    className="tap-target flex items-center justify-center rounded-lg border border-border text-sm font-semibold text-text hover:bg-bg-section"
                  >
                    Gerenciar cursos e disciplinas
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
