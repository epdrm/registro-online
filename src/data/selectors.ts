import type { Aluno, Categoria, Notificacao, PesoTipo, Registro, Turma } from '../types'
import { ALUNOS, CATEGORIAS, CURSOS, TURMAS, categoriaPorId } from './mockData'
import { diasEntre } from '../utils/date'

const JANELA_ACUMULO_DIAS = 30
const LIMIAR_ACUMULO = 6

export function registrosDentroDaJanela(registros: Registro[], dias = JANELA_ACUMULO_DIAS): Registro[] {
  return registros.filter((r) => diasEntre(r.dataHora) <= dias)
}

/** Classifica um peso numérico (1 a 5, usado na categoria "Outro") no mesmo bucket visual das categorias fixas. */
export function pesoTipoDoNumero(n: number): PesoTipo {
  if (n >= 5) return 'grave'
  if (n >= 3) return 'moderada'
  return 'leve'
}

export interface CategoriaEfetiva {
  nome: string
  peso: PesoTipo
  pesoNumero: number
}

/**
 * Nome/peso "reais" de um registro para exibição — para a categoria "Outro" o peso é o
 * escolhido pelo professor (1 a 5) e o nome é o título digitado, não o rótulo fixo da categoria.
 */
export function categoriaEfetivaDoRegistro(r: Registro): CategoriaEfetiva {
  if (r.categoriaId === 'outro') {
    const numero = r.pesoNumero ?? 1
    return { nome: r.titulo?.trim() || 'Outro', peso: pesoTipoDoNumero(numero), pesoNumero: numero }
  }
  const categoria = categoriaPorId(r.categoriaId)
  return { nome: categoria?.nome ?? 'Categoria', peso: categoria?.peso ?? 'leve', pesoNumero: categoria?.pesoNumero ?? 0 }
}

export function pesoDoRegistro(r: Registro): number {
  return categoriaEfetivaDoRegistro(r).pesoNumero
}

/** Peso acumulado de um aluno nos últimos `dias` (padrão 30), somando todos os registros em que ele aparece. */
export function pesoAcumuladoAluno(alunoId: string, registros: Registro[], dias = JANELA_ACUMULO_DIAS): number {
  return registros
    .filter((r) => r.alunoIds.includes(alunoId) && diasEntre(r.dataHora) <= dias)
    .reduce((soma, r) => soma + pesoDoRegistro(r), 0)
}

export function registrosDoAluno(alunoId: string, registros: Registro[]): Registro[] {
  return registros
    .filter((r) => r.alunoIds.includes(alunoId))
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
}

export function registrosDoAutor(autorId: string, registros: Registro[]): Registro[] {
  return registros
    .filter((r) => r.autorId === autorId)
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
}

export function registrosDaTurma(turmaId: string, registros: Registro[]): Registro[] {
  return registros
    .filter((r) => r.turmaId === turmaId)
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
}

export function registrosDoEixo(eixoId: string, registros: Registro[]): Registro[] {
  const cursosDoEixo = new Set(CURSOS.filter((c) => c.eixoId === eixoId).map((c) => c.id))
  const turmasDoEixo = new Set(TURMAS.filter((t) => t.cursoId && cursosDoEixo.has(t.cursoId)).map((t) => t.id))
  return registros
    .filter((r) => turmasDoEixo.has(r.turmaId))
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
}

export interface RankingAluno {
  aluno: Aluno
  peso: number
  status: 'grave' | 'moderada' | 'leve' | 'ok'
}

export function rankingAlunosDaTurma(turmaId: string, registros: Registro[]): RankingAluno[] {
  return ALUNOS
    .filter((a) => a.turmaId === turmaId)
    .map((aluno) => {
      const peso = pesoAcumuladoAluno(aluno.id, registros)
      const status: RankingAluno['status'] = peso >= LIMIAR_ACUMULO ? 'grave' : peso >= 4 ? 'moderada' : peso >= 1 ? 'leve' : 'ok'
      return { aluno, peso, status }
    })
    .sort((a, b) => b.peso - a.peso)
}

export interface ContagemCategoria {
  categoria: Categoria
  total: number
}

export function contagemPorCategoria(registros: Registro[]): ContagemCategoria[] {
  return CATEGORIAS
    .map((categoria) => ({
      categoria,
      total: registros.filter((r) => r.categoriaId === categoria.id).length,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
}

export interface RankingTurma {
  turma: Turma
  ocorrencias: number
  peso: number
}

export function rankingTurmas(registros: Registro[]): RankingTurma[] {
  return TURMAS
    .map((turma) => {
      const doTurma = registros.filter((r) => r.turmaId === turma.id && diasEntre(r.dataHora) <= JANELA_ACUMULO_DIAS)
      return {
        turma,
        ocorrencias: doTurma.length,
        peso: doTurma.reduce((soma, r) => soma + pesoDoRegistro(r), 0),
      }
    })
    .filter((r) => r.ocorrencias > 0)
    .sort((a, b) => b.peso - a.peso)
}

export function turmasSemOcorrencia(registros: Registro[]): number {
  const comOcorrencia = new Set(registros.filter((r) => diasEntre(r.dataHora) <= JANELA_ACUMULO_DIAS).map((r) => r.turmaId))
  return TURMAS.filter((t) => !comOcorrencia.has(t.id)).length
}

/**
 * Notificações são derivadas dos registros — não é um dado separado — seguindo
 * as regras do plano (seção 5): peso grave dispara na hora; acúmulo de 6+ pontos
 * em 30 dias dispara uma única vez, no registro que faz o aluno cruzar o limiar.
 */
export function derivarNotificacoes(registros: Registro[]): Notificacao[] {
  const ordenados = [...registros].sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
  const notificacoes: Notificacao[] = []

  for (const r of ordenados) {
    if (pesoDoRegistro(r) === 5) {
      const categoria = categoriaPorId(r.categoriaId)
      notificacoes.push({
        id: `grave-${r.id}`,
        motivo: 'grave',
        turmaId: r.turmaId,
        alunoId: r.alunoIds[0],
        registroId: r.id,
        dataHora: r.dataHora,
        lida: false,
        titulo: 'Ocorrência grave registrada',
        descricao: `${categoria?.nome ?? 'Ocorrência'} — peso 5`,
      })
    }
  }

  const jaAlertados = new Set<string>()
  for (const alunoAtual of ALUNOS) {
    const doAluno = ordenados.filter((r) => r.alunoIds.includes(alunoAtual.id))
    for (const r of doAluno) {
      const dentroDaJanela = doAluno
        .filter((x) => new Date(x.dataHora) <= new Date(r.dataHora))
        .filter((x) => (new Date(r.dataHora).getTime() - new Date(x.dataHora).getTime()) / (1000 * 60 * 60 * 24) <= JANELA_ACUMULO_DIAS)
        .reduce((soma, x) => soma + pesoDoRegistro(x), 0)
      if (dentroDaJanela >= LIMIAR_ACUMULO && !jaAlertados.has(alunoAtual.id)) {
        jaAlertados.add(alunoAtual.id)
        notificacoes.push({
          id: `acumulo-${alunoAtual.id}`,
          motivo: 'acumulo',
          turmaId: alunoAtual.turmaId,
          alunoId: alunoAtual.id,
          registroId: r.id,
          dataHora: r.dataHora,
          lida: false,
          titulo: 'Aluno atingiu o limite de acúmulo',
          descricao: `${dentroDaJanela} pontos nos últimos 30 dias`,
        })
      }
    }
  }

  return notificacoes.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
}

export function statusPeso(peso: number): 'grave' | 'moderada' | 'leve' | 'ok' {
  if (peso >= LIMIAR_ACUMULO) return 'grave'
  if (peso >= 4) return 'moderada'
  if (peso >= 1) return 'leve'
  return 'ok'
}

export { JANELA_ACUMULO_DIAS, LIMIAR_ACUMULO }
