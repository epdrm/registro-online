Este é o design do sistema web responsivo chamado **Registro Online**, usado para registrar e acompanhar ocorrências de alunos.

## Contexto

A escola oferece **base comum** (Português, Matemática, Física, Química...) e **base
técnica**, organizada em cursos agrupados por eixo:

- Eixo de Tecnologia da Informação: Desenvolvimento de Sistemas, Redes de Computadores, Informática
- Eixo de Gestão e Negócios: Administração, Finanças, Comércio

Cada curso tem três turmas: 1ª, 2ª e 3ª série. As turmas são sempre identificadas por
**série + curso** (ex.: "2º Desenvolvimento de Sistemas").

## Papéis e o que cada um enxerga

| Papel | O que faz | Acesso |
|---|---|---|
| Professor | Dá aula em várias turmas | Registra ocorrências; vê apenas os próprios registros |
| Professor técnico | Dá aula em turmas de um curso | Igual ao professor |
| Professor-diretor | Dá aula em várias turmas, é responsável por **uma** turma | Registra + vê tudo da turma sob responsabilidade + recebe notificações dela |
| Professor coordenador | Dá aula em algumas turmas e coordena **um eixo** | Registra + vê todos os cursos do seu eixo + recebe notificações desses cursos |
| Coordenação pedagógica | Coordena o eixo pedagógico | Vê a escola inteira + recebe **todas** as notificações |
| Diretor | Direciona a escola | Vê a escola inteira, painéis consolidados e relatórios |

Todos os perfis podem criar registros. A diferença está no alcance da leitura e no
recebimento de notificações.

## O registro de ocorrência

Campos: aluno (ou vários alunos de uma vez), turma, disciplina, data/hora, categoria,
descrição livre e anexo opcional.

Categorias: comportamento em sala, não entrega de atividade, ausência/atraso, uso indevido
de celular, dano ao patrimônio, conflito entre alunos, elogio/destaque positivo.

Cada categoria carrega um **peso**: Leve (1), Moderada (3), Grave (5). O peso acumulado do
aluno é o dado central do sistema — precisa aparecer com destaque em listas, no perfil do
aluno e nos painéis. Registros positivos aparecem em verde e não somam peso.

## Telas a desenhar

1. **Login** — limpo, marca centralizada, seleção de perfil não aparece (vem do cadastro).
2. **Novo registro** — o fluxo mais importante. O professor precisa concluir em menos de
   30 segundos, muitas vezes pelo celular, em pé, durante a aula. Priorize: seleção rápida
   de turma → busca de aluno com foto → categoria em cartões tocáveis com o peso visível →
   descrição → salvar. Mostre o estado de seleção múltipla de alunos.
3. **Meus registros** (professor) — lista com filtros por turma, período e categoria; cada
   linha mostra aluno, turma, categoria, peso e status de tratativa.
4. **Painel do professor-diretor** — visão da turma sob sua responsabilidade: alunos
   ordenados por peso acumulado, gráfico simples de ocorrências por categoria no mês,
   alertas pendentes.
5. **Painel do professor coordenador** — recorte por eixo: cartões por curso, cada um com
   série, total de ocorrências e alunos em atenção.
6. **Painel da coordenação pedagógica / diretor** — visão escola: filtros por eixo, curso,
   série e período; ranking de turmas; linha do tempo de ocorrências.
7. **Perfil do aluno** — foto, turma, medidor de peso acumulado (últimos 30 dias e total do
   semestre), linha do tempo de ocorrências com autor e disciplina, campo de tratativas
   registradas pela coordenação.
8. **Central de notificações** — lista de alertas com o motivo do disparo ("peso grave
   registrado" ou "aluno atingiu 10 pontos em 30 dias"), lidos e não lidos.
9. **Versão mobile** do fluxo de novo registro e da central de notificações.

## Identidade visual

Base branca, detalhes em verde. Sóbrio e institucional, sem parecer um app corporativo
genérico. Nada de gradientes vistosos.

- Fundo principal: `#FFFFFF`; fundo de seções: `#F6F9F7`
- Verde primário: `#16794C` (botões, ícones ativos, links)
- Verde escuro: `#0F5138` (hover, títulos de destaque)
- Verde suave: `#E4F2EA` (fundos de tags, estados selecionados, faixas)
- Texto: `#191D1B` (principal), `#5C6661` (secundário)
- Bordas e divisórias: `#E2E8E4`

Cores semânticas usadas **apenas** nos selos de peso, em tons dessaturados para não
competir com o verde: Leve `#B98900`, Moderada `#C2601C`, Grave `#B3261E`. Ocorrência
positiva usa o próprio verde primário.

Tipografia sem serifa, legível em tela pequena. Cantos arredondados suaves (8px), sombras
mínimas, hierarquia construída por peso de fonte e espaçamento em vez de caixas coloridas.
Ícones de traço fino.

## Diretrizes

- Densidade de informação alta nos painéis, densidade baixa no fluxo de registro.
- Acessibilidade: contraste mínimo AA, alvos de toque de 44px, o peso nunca comunicado
  só por cor (use rótulo textual junto).
- Estados vazios desenhados ("nenhuma ocorrência nesta turma este mês").
- O nome do aluno é dado sensível: nos painéis amplos, mostre por padrão a turma e o
  contador; o nome aparece ao abrir o detalhe.