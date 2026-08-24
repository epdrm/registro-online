# Registro Online — Plano Inicial

> Versão 0.1 — documento vivo. Tudo aqui é proposta sujeita a validação com a escola.

## 1. Problema

O registro de ocorrências de alunos hoje é disperso: cada professor anota do seu jeito, a
informação demora a chegar em quem pode agir e não existe visão acumulada por aluno. Um
aluno pode acumular cinco ocorrências leves com cinco professores diferentes sem que
ninguém perceba o padrão.

O sistema resolve três coisas:

1. Registrar rápido, em sala, sem atrito.
2. Fazer a informação chegar automaticamente a quem é responsável.
3. Mostrar o acúmulo — que é o sinal que hoje se perde.

## 2. Escopo

### No MVP

- Autenticação e cadastro de usuários com papéis
- Estrutura acadêmica: eixos, cursos, séries, turmas, disciplinas, alunos
- Alocação professor × turma × disciplina
- Criação e consulta de ocorrências, com peso
- Regras de visibilidade por papel
- Notificações in-app e por e-mail
- Painéis por turma, por eixo e por escola
- Perfil do aluno com linha do tempo e peso acumulado

### Fora do MVP

- Boletim, frequência e notas
- Portal para pais e alunos
- App nativo (o web responsivo cobre o uso em sala)
- Integração com sistemas estaduais de gestão escolar
- Chat interno

## 3. Papéis

| Papel | Vínculo com turmas | Escopo de leitura | Recebe notificação |
|---|---|---|---|
| Professor | Várias turmas | Próprios registros | Não |
| Professor técnico | Turmas de um curso | Próprios registros | Não |
| Professor-diretor | Várias turmas, responsável por **1** | Próprios registros + tudo da turma sob responsabilidade | Sim, da sua turma |
| Professor coordenador | Algumas turmas + coordena **1 eixo** | Próprios registros + todos os cursos do eixo | Sim, dos cursos do seu eixo |
| Coordenação pedagógica | — | Escola inteira | Sim, todas |
| Diretor | — | Escola inteira | Resumo diário, não alerta individual |

Um usuário pode ter mais de um papel (ex.: professor-diretor que também é professor
técnico). As permissões são a **união** dos escopos, nunca a interseção.

## 4. Modelo de domínio

```
Eixo ──< Curso ──< Turma >── Serie
                     │
                     ├──< Matricula >── Aluno
                     └──< Alocacao >── Usuario (professor)
                                │
                                └── Disciplina

Ocorrencia
  ├── aluno
  ├── turma
  ├── disciplina
  ├── autor (usuario)
  ├── categoria ── peso
  ├── descricao, anexo, data_ocorrencia
  └──< Tratativa >── usuario (coordenação)

Notificacao
  ├── destinatario (usuario)
  ├── ocorrencia (origem)
  ├── motivo (grave | acumulo)
  └── lida_em
```

### Entidades-chave

| Entidade | Observação |
|---|---|
| `Eixo` | TI e Gestão & Negócios no primeiro momento |
| `Curso` | Desenvolvimento de Sistemas, Redes, Informática, Administração, Finanças, Comércio |
| `Turma` | Sempre `serie + curso + ano_letivo`. Ex.: 2º Desenvolvimento de Sistemas / 2026 |
| `Disciplina` | Marcada como `base_comum` ou `base_tecnica`; a técnica pertence a um curso |
| `Alocacao` | Define o que o professor pode ver e onde pode registrar |
| `ResponsabilidadeTurma` | Liga o professor-diretor à turma que ele responde. Uma por turma |
| `CoordenacaoEixo` | Liga o professor coordenador ao eixo |

## 5. Ocorrências e peso

| Categoria | Peso |
|---|---|
| Elogio / destaque positivo | 0 (não soma) |
| Não entrega de atividade | 1 |
| Atraso | 1 |
| Uso indevido de celular | 1 |
| Comportamento inadequado em sala | 3 |
| Conflito entre alunos | 3 |
| Dano ao patrimônio | 5 |
| Agressão / falta grave | 5 |

O peso é atributo da categoria, não escolha livre do professor — isso mantém o critério
uniforme entre docentes. A coordenação pode ajustar a tabela nas configurações.

**Peso acumulado** = soma dos pesos das ocorrências do aluno em janela móvel de 30 dias.
O total do semestre também é exibido, mas quem dispara alerta é a janela de 30 dias.

## 6. Regra de notificação

Duas condições disparam alerta:

1. **Imediata** — ocorrência de peso 5 registrada.
2. **Por acúmulo** — o peso acumulado do aluno em 30 dias cruza 10 pontos. Dispara uma vez
   por cruzamento; só volta a disparar se cair abaixo e subir de novo, ou a cada +10.

Destinatários de cada alerta:

- Professor-diretor responsável pela turma do aluno
- Professor coordenador do eixo ao qual o curso da turma pertence
- Coordenação pedagógica (todos os alertas)
- Diretor recebe apenas um resumo diário consolidado

Entrega: notificação in-app sempre; e-mail conforme preferência do usuário.
Sem notificação para o próprio autor do registro.

> **Ponto a confirmar com a escola:** o limiar de 10 pontos em 30 dias é um chute
> informado. Vale calibrar depois de um bimestre de dados reais.

## 7. Telas

| Tela | Papéis | Prioridade |
|---|---|---|
| Login | Todos | P0 |
| Novo registro | Todos | P0 |
| Meus registros | Todos | P0 |
| Perfil do aluno | Diretor de turma, coordenadores, pedagógico, diretor | P0 |
| Central de notificações | Quem recebe alerta | P1 |
| Painel da turma | Professor-diretor | P1 |
| Painel do eixo | Professor coordenador | P1 |
| Painel da escola | Pedagógico, diretor | P1 |
| Tratativas | Pedagógico, diretor de turma | P2 |
| Administração (usuários, turmas, pesos) | Diretor, pedagógico | P2 |
| Relatórios exportáveis | Pedagógico, diretor | P2 |

O fluxo de **novo registro** é o coração do produto. Se ele levar mais de 30 segundos no
celular, os professores voltam para o caderno. Todas as decisões técnicas se subordinam a
isso.

## 8. Fases

### Fase 0 — Fundação
Modelagem do banco, autenticação, papéis e permissões, seed com a estrutura real da escola
(18 turmas, disciplinas, professores).

### Fase 1 — Registro
Criação de ocorrência (incluindo múltiplos alunos de uma vez), listagem com filtros,
perfil do aluno com linha do tempo e peso acumulado. **Entregável testável em sala.**

### Fase 2 — Notificações e painéis
Motor de regras de alerta, central in-app, e-mail, painéis de turma, eixo e escola.

### Fase 3 — Tratativas e relatórios
Registro de encaminhamentos pela coordenação, fechamento de ocorrência, exportação em
PDF/planilha para conselho de classe.

### Fase 4 — Refino
Calibragem dos pesos e limiares com dados reais, ajustes de usabilidade, acessibilidade.

## 9. Considerações de dados pessoais

Ocorrência disciplinar de adolescente é dado sensível. Diretrizes desde a Fase 0:

- Log de auditoria de toda leitura de perfil de aluno
- Nenhum papel enxerga fora do seu escopo, nem por URL direta
- Descrições devem ser factuais; a interface orienta isso no placeholder do campo
- Retenção definida (proposta: ocorrências arquivadas ao fim do ciclo do aluno)
- Termo de uso aceito no primeiro login, explicando a responsabilidade do registro

## 10. Questões em aberto

1. O professor pode editar ou excluir o próprio registro? Por quanto tempo?
2. Ocorrências de anos anteriores acompanham o aluno na progressão de série?
3. Quando um aluno é transferido de turma, quem passa a receber os alertas dele?
4. Registro positivo deve abater peso acumulado ou apenas coexistir?
5. Um professor coordenador que também é professor-diretor recebe alerta duplicado ou
   agrupado?
6. Existe fluxo formal de convocação de responsáveis que o sistema deva refletir?
