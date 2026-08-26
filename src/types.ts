export type Papel =
  | 'admin'
  | 'professor'
  | 'professor_tecnico'
  | 'professor_diretor'
  | 'professor_coordenador'
  | 'coordenacao_pedagogica'
  | 'diretor'

export interface Usuario {
  id: string
  nome: string
  email: string
  iniciais: string
  avatarColor: string
  papel: Papel
  disciplina?: string
  /** professor_diretor: turma pela qual é responsável */
  turmaResponsavelId?: string
  /** professor_coordenador: eixo que coordena */
  eixoCoordenadoId?: string
}

export interface Eixo {
  id: string
  nome: string
}

export interface Curso {
  id: string
  nome: string
  eixoId: string
}

export interface Turma {
  id: string
  cursoId: string | null
  serie: 1 | 2 | 3
  nome: string
  turno: 'Manhã' | 'Tarde' | 'Noite'
  totalAlunos: number
}

export type PesoTipo = 'leve' | 'moderada' | 'grave' | 'positiva'

export interface Categoria {
  id: string
  nome: string
  peso: PesoTipo
  pesoNumero: 0 | 1 | 3 | 5
}

export interface Aluno {
  id: string
  nome: string
  turmaId: string
  iniciais: string
  avatarColor: string
}

export type StatusTratativa = 'sem_tratativa' | 'em_acompanhamento' | 'resolvido'

export interface Registro {
  id: string
  alunoIds: string[]
  turmaId: string
  disciplina: string
  autorId: string
  categoriaId: string
  descricao: string
  dataHora: string // ISO
  status: StatusTratativa
}

export type MotivoNotificacao = 'grave' | 'acumulo'

export interface Notificacao {
  id: string
  motivo: MotivoNotificacao
  turmaId: string
  alunoId?: string
  registroId?: string
  dataHora: string // ISO
  lida: boolean
  titulo: string
  descricao: string
}

export interface Tratativa {
  id: string
  alunoId: string
  autor: string
  dataHora: string
  texto: string
}
