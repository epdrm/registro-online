import type { Aluno, Categoria, Curso, Eixo, Registro, Tratativa, Turma, Usuario } from '../types'
import { comData } from '../utils/date'

export const EIXOS: Eixo[] = [
  { id: 'ti', nome: 'Tecnologia da Informação' },
  { id: 'gestao', nome: 'Gestão e Negócios' },
]

export const CURSOS: Curso[] = [
  { id: 'ds', nome: 'Desenvolvimento de Sistemas', eixoId: 'ti' },
  { id: 'rc', nome: 'Redes de Computadores', eixoId: 'ti' },
  { id: 'inf', nome: 'Informática', eixoId: 'ti' },
  { id: 'adm', nome: 'Administração', eixoId: 'gestao' },
  { id: 'fin', nome: 'Finanças', eixoId: 'gestao' },
  { id: 'com', nome: 'Comércio', eixoId: 'gestao' },
]

const TURNOS_POR_CURSO: Record<string, Turma['turno']> = {
  ds: 'Tarde',
  rc: 'Manhã',
  inf: 'Manhã',
  adm: 'Noite',
  fin: 'Noite',
  com: 'Tarde',
}

const TOTAL_ALUNOS_POR_TURMA: Record<string, number> = {
  'ds-1': 34, 'ds-2': 32, 'ds-3': 30,
  'rc-1': 33, 'rc-2': 31, 'rc-3': 30,
  'inf-1': 35, 'inf-2': 33, 'inf-3': 29,
  'adm-1': 31, 'adm-2': 29, 'adm-3': 27,
  'fin-1': 30, 'fin-2': 28, 'fin-3': 26,
  'com-1': 32, 'com-2': 30, 'com-3': 28,
}

const NUMERAL_SERIE = ['1º', '2º', '3º']

export const TURMAS: Turma[] = CURSOS.flatMap((curso) =>
  ([1, 2, 3] as const).map((serie) => {
    const id = `${curso.id}-${serie}`
    return {
      id,
      cursoId: curso.id,
      serie,
      nome: `${NUMERAL_SERIE[serie - 1]} ${curso.nome}`,
      turno: TURNOS_POR_CURSO[curso.id],
      totalAlunos: TOTAL_ALUNOS_POR_TURMA[id] ?? 30,
    }
  }),
)

export function turmaPorId(id: string): Turma | undefined {
  return TURMAS.find((t) => t.id === id)
}

export function cursoPorId(id: string | null): Curso | undefined {
  return CURSOS.find((c) => c.id === id)
}

export const CATEGORIAS: Categoria[] = [
  { id: 'comportamento', nome: 'Comportamento em sala', peso: 'moderada', pesoNumero: 3 },
  { id: 'entrega', nome: 'Não entrega de atividade', peso: 'leve', pesoNumero: 1 },
  { id: 'ausencia', nome: 'Ausência / atraso', peso: 'leve', pesoNumero: 1 },
  { id: 'celular', nome: 'Uso indevido de celular', peso: 'moderada', pesoNumero: 3 },
  { id: 'patrimonio', nome: 'Dano ao patrimônio', peso: 'grave', pesoNumero: 5 },
  { id: 'conflito', nome: 'Conflito entre alunos', peso: 'grave', pesoNumero: 5 },
  { id: 'elogio', nome: 'Elogio / destaque positivo', peso: 'positiva', pesoNumero: 0 },
]

export function categoriaPorId(id: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id)
}

export const USUARIOS: Usuario[] = [
  {
    id: 'marina', nome: 'Marina Alves Ferreira', email: 'marina.ferreira@escolavaleverde.edu.br',
    iniciais: 'MF', avatarColor: '#5C6661', papel: 'professor', disciplina: 'Matemática',
  },
  {
    id: 'carlos', nome: 'Carlos Eduardo Lima', email: 'carlos.lima@escolavaleverde.edu.br',
    iniciais: 'CL', avatarColor: '#16794C', papel: 'professor_tecnico', disciplina: 'Redes de Computadores',
  },
  {
    id: 'renata', nome: 'Renata Souza Prado', email: 'renata.prado@escolavaleverde.edu.br',
    iniciais: 'RP', avatarColor: '#0F5138', papel: 'professor_diretor', disciplina: 'Física',
    turmaResponsavelId: 'ds-2',
  },
  {
    id: 'paulo', nome: 'Paulo Henrique Costa', email: 'paulo.costa@escolavaleverde.edu.br',
    iniciais: 'PC', avatarColor: '#0F5138', papel: 'professor_coordenador', disciplina: 'Programação',
    eixoCoordenadoId: 'ti',
  },
  {
    id: 'luciana', nome: 'Luciana Martins Rocha', email: 'luciana.rocha@escolavaleverde.edu.br',
    iniciais: 'LR', avatarColor: '#0F5138', papel: 'coordenacao_pedagogica', disciplina: 'Coordenação pedagógica',
  },
  {
    id: 'fabio', nome: 'Fábio Antunes Rezende', email: 'fabio.rezende@escolavaleverde.edu.br',
    iniciais: 'FR', avatarColor: '#0F5138', papel: 'diretor', disciplina: 'Direção escolar',
  },
]

export function usuarioPorId(id: string): Usuario | undefined {
  return USUARIOS.find((u) => u.id === id)
}

export const ALUNOS: Aluno[] = [
  // 2º Desenvolvimento de Sistemas — turma-modelo, com histórico mais completo
  { id: 'gabriel', nome: 'Gabriel Nunes Teixeira', turmaId: 'ds-2', iniciais: 'GT', avatarColor: '#5C6661' },
  { id: 'ana', nome: 'Ana Beatriz Gonçalves', turmaId: 'ds-2', iniciais: 'AG', avatarColor: '#16794C' },
  { id: 'rafael', nome: 'Rafael Oliveira Mendes', turmaId: 'ds-2', iniciais: 'RM', avatarColor: '#0F5138' },
  { id: 'isabela', nome: 'Isabela Cristina Ramos', turmaId: 'ds-2', iniciais: 'IR', avatarColor: '#B98900' },
  { id: 'lucas', nome: 'Lucas Fernando Barros', turmaId: 'ds-2', iniciais: 'LB', avatarColor: '#5C6661' },
  { id: 'yasmin', nome: 'Yasmin Alves Cardoso', turmaId: 'ds-2', iniciais: 'YC', avatarColor: '#16794C' },
  { id: 'thiago', nome: 'Thiago Almeida Souza', turmaId: 'ds-2', iniciais: 'TS', avatarColor: '#0F5138' },
  { id: 'bruna', nome: 'Bruna Kaline Duarte', turmaId: 'ds-2', iniciais: 'BD', avatarColor: '#B98900' },

  // outras turmas — usadas nos painéis agregados e na linha do tempo da escola
  { id: 'felipe', nome: 'Felipe Augusto Nogueira', turmaId: 'ds-1', iniciais: 'FN', avatarColor: '#5C6661' },
  { id: 'sophia', nome: 'Sophia Beatriz Falcão', turmaId: 'ds-3', iniciais: 'SF', avatarColor: '#16794C' },
  { id: 'diego', nome: 'Diego Henrique Farias', turmaId: 'rc-2', iniciais: 'DF', avatarColor: '#5C6661' },
  { id: 'camila', nome: 'Camila Rocha Pinto', turmaId: 'rc-2', iniciais: 'CP', avatarColor: '#0F5138' },
  { id: 'eduarda', nome: 'Eduarda Nascimento Lopes', turmaId: 'rc-3', iniciais: 'EL', avatarColor: '#B98900' },
  { id: 'pedro', nome: 'Pedro Augusto Vilela', turmaId: 'inf-1', iniciais: 'PV', avatarColor: '#5C6661' },
  { id: 'larissa', nome: 'Larissa Meireles Cunha', turmaId: 'com-3', iniciais: 'LC', avatarColor: '#16794C' },
  { id: 'vinicius', nome: 'Vinícius Cordeiro Braga', turmaId: 'adm-1', iniciais: 'VB', avatarColor: '#5C6661' },
  { id: 'juliana', nome: 'Juliana Prates Andrade', turmaId: 'fin-2', iniciais: 'JA', avatarColor: '#0F5138' },
]

export function alunoPorId(id: string): Aluno | undefined {
  return ALUNOS.find((a) => a.id === id)
}

export function alunosDaTurma(turmaId: string): Aluno[] {
  return ALUNOS.filter((a) => a.turmaId === turmaId)
}

// --- Registros de ocorrência (seed) --------------------------------------
// Concentrados no 2º Desenvolvimento de Sistemas (turma da professora-diretora
// Renata) para dar profundidade real ao perfil do aluno e ao painel da turma,
// com alguns registros espalhados por outras turmas para alimentar o ranking
// e a linha do tempo da visão geral da escola.

let seq = 0
function novoId(prefixo: string): string {
  seq += 1
  return `${prefixo}-${seq}`
}

function criarRegistro(
  diasAtras: number, hora: number, minuto: number,
  alunoIds: string[], turmaId: string, disciplina: string,
  autorId: string, categoriaId: string, descricao: string,
  status: Registro['status'] = 'sem_tratativa',
): Registro {
  return {
    id: novoId('reg'),
    alunoIds,
    turmaId,
    disciplina,
    autorId,
    categoriaId,
    descricao,
    dataHora: comData(diasAtras, hora, minuto).toISOString(),
    status,
  }
}

export const REGISTROS_SEED: Registro[] = [
  // Thiago — acumulando peso ao longo do mês, cruza o limiar de 6 pontos
  criarRegistro(28, 8, 10, ['thiago'], 'ds-2', 'Física', 'renata', 'ausencia', 'Chegou 25 minutos após o início da aula, sem justificativa.'),
  criarRegistro(20, 10, 5, ['thiago'], 'ds-2', 'Matemática', 'marina', 'entrega', 'Não entregou a lista de exercícios combinada na semana anterior.', 'resolvido'),
  criarRegistro(9, 14, 20, ['thiago'], 'ds-2', 'Redes de Computadores', 'carlos', 'celular', 'Usou o celular durante a atividade prática em laboratório, mesmo após aviso.', 'em_acompanhamento'),
  criarRegistro(1, 15, 48, ['thiago'], 'ds-2', 'Física', 'renata', 'patrimonio', 'Danificou um monitor do laboratório de informática durante a aula.'),

  // Ana Beatriz — peso moderado
  criarRegistro(15, 9, 30, ['ana'], 'ds-2', 'Matemática', 'marina', 'comportamento', 'Conversas constantes durante a explicação, atrapalhando os colegas próximos.', 'em_acompanhamento'),
  criarRegistro(6, 13, 5, ['ana'], 'ds-2', 'Física', 'renata', 'celular', 'Usou o celular durante a prova, o aparelho foi recolhido.'),
  criarRegistro(2, 14, 10, ['ana'], 'ds-2', 'Programação', 'paulo', 'comportamento', 'Discussão em tom alterado com um colega durante o trabalho em grupo.'),

  // Gabriel — registro de hoje, peso moderado, sem tratativa ainda
  criarRegistro(0, 9, 40, ['gabriel'], 'ds-2', 'Redes de Computadores', 'carlos', 'celular', 'Usou o celular durante a explicação da atividade prática, mesmo após duas solicitações para guardar o aparelho.'),
  criarRegistro(24, 8, 30, ['gabriel'], 'ds-2', 'Matemática', 'marina', 'ausencia', 'Chegou atrasado 15 minutos, sem justificativa apresentada.', 'resolvido'),
  criarRegistro(11, 10, 40, ['gabriel'], 'ds-2', 'Física', 'renata', 'entrega', 'Não entregou o relatório do experimento na data combinada.', 'resolvido'),

  // Lucas — leve/moderado
  criarRegistro(13, 15, 0, ['lucas'], 'ds-2', 'Programação', 'paulo', 'comportamento', 'Levantou-se e circulou pela sala repetidas vezes durante a explicação.'),
  criarRegistro(4, 8, 20, ['lucas'], 'ds-2', 'Matemática', 'marina', 'ausencia', 'Faltou sem justificativa apresentada até o momento.'),

  // Isabela — leve, quase sem ocorrências
  criarRegistro(18, 10, 22, ['isabela'], 'ds-2', 'Matemática', 'marina', 'entrega', 'Entregou a atividade incompleta, faltando a segunda parte do exercício.', 'resolvido'),

  // Yasmin e Bruna — elogios (não somam peso)
  criarRegistro(21, 11, 0, ['yasmin'], 'ds-2', 'Matemática', 'marina', 'elogio', 'Ajudou os colegas de grupo a concluir o exercício antes do prazo, com boa didática.'),
  criarRegistro(3, 9, 15, ['bruna'], 'ds-2', 'Física', 'renata', 'elogio', 'Apresentou o experimento da equipe com destaque e organização.'),

  // Conflito entre dois alunos da turma — registro com múltiplos alunos selecionados
  criarRegistro(7, 16, 2, ['rafael', 'thiago'], 'ds-2', 'Redes de Computadores', 'carlos', 'conflito', 'Discussão acalorada entre os dois durante o intervalo, dentro da sala.', 'em_acompanhamento'),

  // Outras turmas do eixo de TI — alimentam o painel do coordenador
  criarRegistro(5, 14, 40, ['diego'], 'rc-2', 'Redes de Computadores', 'carlos', 'celular', 'Uso do celular durante a aula prática de cabeamento estruturado.'),
  criarRegistro(2, 8, 15, ['camila'], 'rc-2', 'Redes de Computadores', 'carlos', 'comportamento', 'Conversas paralelas durante a correção do exercício em grupo.'),
  criarRegistro(1, 11, 20, ['eduarda'], 'rc-3', 'Programação', 'paulo', 'conflito', 'Atrito com colega durante apresentação de trabalho em equipe.'),
  criarRegistro(6, 9, 10, ['pedro'], 'inf-1', 'Programação', 'paulo', 'entrega', 'Não entregou o exercício prático da semana.'),

  // Eixo de Gestão e Negócios — alimentam a visão geral da escola
  criarRegistro(0, 11, 20, ['larissa'], 'com-3', 'Administração de Vendas', 'luciana', 'conflito', 'Desentendimento entre colegas durante simulação de atendimento ao cliente.'),
  criarRegistro(1, 7, 58, ['vinicius'], 'adm-1', 'Empreendedorismo', 'marina', 'ausencia', 'Chegou atrasado à primeira aula, sem justificativa.'),
  criarRegistro(9, 15, 30, ['juliana'], 'fin-2', 'Matemática Financeira', 'marina', 'comportamento', 'Uso de linguagem inadequada durante debate em sala.'),
]

export const TRATATIVAS_SEED: Tratativa[] = [
  {
    id: 'trat-1', alunoId: 'thiago', autor: 'Luciana Martins Rocha', dataHora: comData(8, 10, 0).toISOString(),
    texto: 'Conversa com o aluno e responsáveis realizada. Combinado acompanhamento quinzenal com a coordenação.',
  },
  {
    id: 'trat-2', alunoId: 'thiago', autor: 'Luciana Martins Rocha', dataHora: comData(1, 16, 30).toISOString(),
    texto: 'Novo episódio após o dano ao patrimônio. Encaminhado para orientação educacional e reunião com a família marcada.',
  },
]
