import { useMemo } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { CURSOS, EIXOS, TURMAS } from '../data/mockData'
import { registrosDaTurma, rankingAlunosDaTurma, LIMIAR_ACUMULO } from '../data/selectors'
import { plural } from '../utils/text'

export function PainelCoordenadorPage() {
  const { usuario } = useAuth()
  const { registros } = useData()

  const eixoId = usuario?.eixoCoordenadoId ?? 'ti'
  const eixo = EIXOS.find((e) => e.id === eixoId)
  const cursos = CURSOS.filter((c) => c.eixoId === eixoId)

  const dados = useMemo(() => cursos.map((curso) => {
    const turmas = TURMAS.filter((t) => t.cursoId === curso.id)
    const linhas = turmas.map((t) => {
      const doTurma = registrosDaTurma(t.id, registros)
      const ranking = rankingAlunosDaTurma(t.id, registros)
      const emAtencao = ranking.filter((r) => r.peso >= LIMIAR_ACUMULO).length
      return { turma: t, ocorrencias: doTurma.length, emAtencao }
    })
    const totalOcorrencias = linhas.reduce((s, l) => s + l.ocorrencias, 0)
    const totalAlunos = turmas.reduce((s, t) => s + t.totalAlunos, 0)
    const maiorOcorrencias = Math.max(1, ...linhas.map((l) => l.ocorrencias))
    return { curso, linhas, totalOcorrencias, totalAlunos, maiorOcorrencias }
  }), [cursos, registros])

  const totalOcorrenciasEixo = dados.reduce((s, d) => s + d.totalOcorrencias, 0)
  const gravesEixo = registros.filter((r) => (r.categoriaId === 'patrimonio' || r.categoriaId === 'conflito') && cursos.some((c) => TURMAS.some((t) => t.id === r.turmaId && t.cursoId === c.id))).length
  const emAtencaoEixo = dados.reduce((s, d) => s + d.linhas.reduce((s2, l) => s2 + l.emAtencao, 0), 0)

  if (!usuario || !eixo) return null

  return (
    <AppShell titulo="Meu eixo">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-7">
        <div>
          <div className="text-xl font-bold">Eixo de {eixo.nome}</div>
          <div className="text-[13.5px] text-text-secondary">
            {cursos.length} cursos · {cursos.length * 3} turmas · {dados.reduce((s, d) => s + d.totalAlunos, 0)} alunos
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Ocorrências (últimos 30 dias)</div>
            <div className="mt-1.5 text-3xl font-bold">{totalOcorrenciasEixo}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Registros graves</div>
            <div className="mt-1.5 text-3xl font-bold text-grave">{gravesEixo}</div>
          </div>
          <div className="rounded-[10px] border border-border bg-bg p-5">
            <div className="text-xs font-semibold text-text-secondary">Alunos em atenção</div>
            <div className="mt-1.5 text-3xl font-bold text-moderada">{emAtencaoEixo}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {dados.map(({ curso, linhas, totalAlunos, totalOcorrencias, maiorOcorrencias }) => (
            <div key={curso.id} className="overflow-hidden rounded-[10px] border border-border bg-bg">
              <div className="flex items-center justify-between border-b border-border bg-bg-section px-5 py-4">
                <div className="text-[15px] font-bold">{curso.nome}</div>
                <div className="text-[12.5px] text-text-secondary">{totalAlunos} alunos · {totalOcorrencias} {plural(totalOcorrencias, 'ocorrência', 'ocorrências')} no período</div>
              </div>
              <div>
                {linhas.map((l, i) => (
                  <div key={l.turma.id} className={`flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-3.5 ${i !== 0 ? 'border-t border-border' : ''}`}>
                    <div className="text-[13.5px] font-semibold sm:w-56">{l.turma.nome}</div>
                    <div className="text-[13px] text-text-secondary sm:w-44">{l.ocorrencias} {plural(l.ocorrencias, 'ocorrência', 'ocorrências')} no período</div>
                    <div className="sm:w-32">
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-[11.5px] font-bold"
                        style={{ color: l.emAtencao > 0 ? '#C2601C' : '#5C6661', background: l.emAtencao > 0 ? '#C2601C14' : '#5C666114' }}
                      >
                        {l.emAtencao} em atenção
                      </span>
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-section">
                      <div className="h-full rounded-full bg-green" style={{ width: `${(l.ocorrencias / maiorOcorrencias) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
