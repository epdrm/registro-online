# Registro Online — Plano Inicial

**Versão:** 0.1 (primeiro plano)
**Status:** rascunho, aguardando validação da escola
**Última atualização:** 24/08/2026

---

## 1. Objetivo

Substituir o registro de ocorrências em papel/planilha por um sistema web único, no qual o professor registra o fato em menos de um minuto e a direção enxerga o quadro completo em tempo real — sem depender de repasse verbal ou bilhete.

**Problema atual:** ocorrências ficam espalhadas entre cadernos, mensagens de WhatsApp e conversas de corredor. A direção só descobre um caso grave quando ele já se repetiu várias vezes.

**Como saberemos que deu certo:**
- Professor consegue criar um registro em até 60 segundos.
- Direção recebe notificação de ocorrência grave no mesmo dia.
- Todo aluno em situação de alerta é identificado antes de acumular reincidência.

---

## 2. Escopo da versão 1

### Dentro do escopo
- Login com dois perfis: Professor e Professor-Diretor.
- Criação, visualização e edição de registros de ocorrência.
- Classificação por tipo e por peso (1 leve, 2 moderado, 3 grave).
- Painel do Professor com os próprios registros.
- Painel do Professor-Diretor com todos os registros e filtros.
- Notificações automáticas para o Professor-Diretor.
- Página de detalhe do aluno com histórico e pontuação acumulada.
- Interface responsiva, utilizável no celular.

### Fora do escopo (avaliar depois)
- Acesso de pais e responsáveis.
- Notificação por e-mail ou WhatsApp.
- Integração com o sistema acadêmico/diário de classe da escola.
- Registros positivos (elogios, destaques).
- Exportação em PDF e relatórios impressos.
- Perfis de coordenação e secretaria.
- Aplicativo nativo.

---

## 3. Perfis e permissões

| Ação | Professor | Professor-Diretor |
|---|---|---|
| Criar registro | Sim | Sim |
| Ver os próprios registros | Sim | Sim |
| Ver registros de outros professores | Não | Sim |
| Editar registro próprio | Sim, até 24h após criação | Sim |
| Excluir registro | Não | Sim, com justificativa |
| Ver detalhe/histórico do aluno | Somente ocorrências próprias | Histórico completo |
| Receber notificações | Não | Sim |

> **Decisão pendente:** o Professor-Diretor também dá aula. O sistema deve permitir alternar entre as duas visões, ou o painel completo já contempla os registros dele? Proposta: painel único com filtro "Meus registros".

---

## 4. Modelo de dados

**Aluno** — id, nome, turma, matrícula, situação (ativo/inativo)

**Turma** — id, nome (ex.: 7º B), turno, ano letivo

**Usuário** — id, nome, e-mail, perfil (professor | professor-diretor), disciplina

**Registro** — id, aluno, turma, autor (usuário), tipo, peso (1–3), descrição, data/hora da ocorrência, data/hora de criação, editado_em

**Notificação** — id, destinatário, registro relacionado, motivo (grave | acúmulo), lida, criada_em

### Tipos de ocorrência
Comportamento · Falta de entrega de atividade · Atraso · Uso indevido de celular · Ausência sem justificativa · Outro

---

## 5. Regras de notificação

1. **Ocorrência grave** — qualquer registro com peso 3 gera notificação imediata.
2. **Acúmulo** — quando um aluno soma **6 ou mais pontos** de peso nos **últimos 30 dias**, gera notificação de alerta.
3. A notificação de acúmulo não se repete para o mesmo aluno enquanto o alerta estiver ativo, para evitar excesso de avisos.
4. Notificações aparecem no sino do cabeçalho, com contador de não lidas.

> **Decisão pendente:** os limites (6 pontos / 30 dias) são uma proposta inicial e precisam ser validados com a direção. Idealmente devem ser configuráveis.

---

## 6. Telas

1. **Login** — e-mail e senha, seletor de perfil apenas no protótipo.
2. **Painel do Professor** — lista dos próprios registros, botão "Novo Registro" em destaque, busca por aluno, filtros por tipo e período.
3. **Novo Registro** — formulário com autocomplete de aluno, tipo, peso em botões coloridos, descrição, data/hora pré-preenchidas.
4. **Painel do Professor-Diretor** — cards de resumo (registros no mês, registros graves, alunos em alerta), tabela completa com filtros por turma, professor, tipo e peso.
5. **Detalhe do aluno** — histórico completo, pontuação acumulada dos últimos 30 dias, gráfico de evolução mensal.

---

## 7. Identidade visual

- Fundo branco, layout limpo, bastante espaço em branco.
- Verde (#16A34A) como cor de destaque: botões primários, ícones, links ativos, itens de menu selecionados.
- Cinzas neutros para texto e bordas sutis.
- **Exceção deliberada:** o peso usa escala de semáforo — verde (leve), âmbar (moderado), vermelho (grave). A gravidade precisa ser lida de relance; usar verde para os três níveis anularia essa leitura.
- Tipografia sem serifa, cantos levemente arredondados, sombras discretas.
- Todo o texto da interface em português do Brasil.

---

## 8. Etapas de construção

**Etapa 1 — Protótipo navegável**
Todas as telas com dados fictícios, sem persistência. Objetivo: validar fluxo e layout com dois ou três professores antes de escrever qualquer back-end.

**Etapa 2 — Registro funcional**
Autenticação, criação e listagem de registros com dados reais, permissões por perfil.

**Etapa 3 — Notificações e visão da direção**
Regras de peso e acúmulo, sino de notificações, painel completo, detalhe do aluno.

**Etapa 4 — Piloto**
Uso real com uma ou duas turmas por um bimestre, ajustes a partir do retorno dos professores.

---

## 9. Riscos e pontos de atenção

- **Dados sensíveis de menores.** O sistema registra informações comportamentais de crianças e adolescentes. Antes do piloto é preciso definir com a escola: quem tem acesso, por quanto tempo os registros ficam armazenados, como responder a um pedido de acesso de um responsável e como isso se enquadra na LGPD. Esse ponto precisa ser resolvido com a gestão da escola, não apenas tecnicamente.
- **Descrições em texto livre.** Campo aberto pode receber julgamento de valor sobre o aluno em vez de descrição do fato. Vale incluir um texto de apoio no formulário orientando a descrever o comportamento observado.
- **Risco de virar ferramenta punitiva.** Se o único uso for acumular pontos negativos, o sistema pode reforçar rótulos sobre alunos. Considerar registros positivos numa versão futura.
- **Adesão dos professores.** Se o registro não for rápido de verdade, o sistema não é usado. O tempo de preenchimento é o principal critério do protótipo.
- **Excesso de notificações.** Se o limite de acúmulo for baixo demais, a direção passa a ignorar os avisos.

---

## 10. Próximos passos

1. Validar com a direção os limites de peso e o prazo de acúmulo.
2. Definir a política de privacidade e retenção de dados.
3. Confirmar se haverá perfil de coordenação na versão 1.
4. Construir a Etapa 1 no Claude Design e testar com professores.
