# Registro Online

Protótipo navegável (Etapa 1 do [plano](docs/plan.md)) do sistema de registro de
ocorrências escolares descrito em [docs/design-system.md](docs/design-system.md).

React + TypeScript + Vite + Tailwind CSS v4. Sem back-end — os dados (turmas,
alunos, registros, notificações) vivem em memória no navegador e são reiniciados
a cada recarregamento da página.

## Rodando

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` e entre com um dos usuários de demonstração na
tela de login (não há senha real — é um protótipo).

## O que está implementado

- Login por seleção de usuário demo, cobrindo os 6 papéis do design-system:
  professor, professor técnico, professor-diretor, professor coordenador,
  coordenação pedagógica e diretor.
- **Novo registro**: turma → aluno(s) (multi-seleção com busca) → categoria
  (peso visível) → descrição → salvar. O registro criado aparece na hora em
  "Meus registros", no painel da turma/eixo/escola e pode disparar notificação.
- **Meus registros**: lista filtrável por turma, categoria e período.
- **Minha turma** (professor-diretor): ranking de peso acumulado, ocorrências
  por categoria no mês, alertas pendentes.
- **Meu eixo** (professor coordenador): cartões por curso com as 3 séries.
- **Visão geral** (coordenação pedagógica / diretor): ranking de turmas e linha
  do tempo — por regra de sensibilidade, sem nomes de aluno nessa visão ampla.
- **Perfil do aluno**: peso acumulado (30 dias e semestre), linha do tempo com
  autor/disciplina, tratativas da coordenação.
- **Central de notificações**: derivadas das regras do plano (peso grave dispara
  na hora; 6+ pontos em 30 dias dispara uma vez), com lidas/não lidas.
- Layout responsivo (sidebar no desktop, menu gaveta + barra inferior no
  mobile), sem UI falsa de status bar/teclado.

## Fora do escopo desta etapa

Persistência real, autenticação de verdade, e os itens listados em "Fora do
escopo" no [plano](docs/plan.md) (acesso de responsáveis, e-mail/WhatsApp,
exportação em PDF, etc.).
