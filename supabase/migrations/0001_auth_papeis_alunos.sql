-- Registro Online — schema inicial de autenticação, papéis e alunos.
-- Rode este arquivo inteiro no SQL Editor do projeto Supabase (Project > SQL Editor > New query).
-- Turmas, ocorrências e notificações continuam mock no frontend por enquanto —
-- esta etapa cobre só login real e o cadastro de professores/alunos.

-- 1) Papéis -------------------------------------------------------------

create type public.papel_usuario as enum (
  'admin',
  'professor',
  'professor_tecnico',
  'professor_diretor',
  'professor_coordenador',
  'coordenacao_pedagogica',
  'diretor'
);

-- 2) Perfis (1:1 com auth.users) -----------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  papel public.papel_usuario not null,
  disciplina text,
  turma_responsavel_id text,   -- professor_diretor: turma pela qual responde
  eixo_coordenado_id text,     -- professor_coordenador: eixo que coordena
  iniciais text not null,
  avatar_color text not null default '#0F5138',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Funções auxiliares (security definer: leem profiles ignorando RLS,
-- evitando recursão nas próprias políticas de profiles).

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'admin'
  );
$$;

create or replace function public.papel_atual()
returns public.papel_usuario
language sql
security definer
set search_path = public
stable
as $$
  select papel from public.profiles where id = auth.uid();
$$;

create or replace function public.turma_responsavel_atual()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select turma_responsavel_id from public.profiles where id = auth.uid();
$$;

-- Políticas de profiles: cada um lê o próprio perfil; admin lê, cria e
-- atualiza qualquer perfil (é assim que professores são cadastrados).

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_insert_admin" on public.profiles
  for insert with check (public.is_admin());

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 3) Alunos --------------------------------------------------------------
-- turma_id é texto livre por enquanto (bate com os ids mock em src/data/mockData.ts,
-- ex. 'ds-2') até turmas virarem tabela própria numa próxima etapa.

create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  turma_id text not null,
  iniciais text not null,
  avatar_color text not null default '#0F5138',
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.alunos enable row level security;

-- Qualquer usuário autenticado pode listar alunos (necessário para registrar
-- ocorrências mais adiante). Só admin e o professor-diretor da turma cadastram.

create policy "alunos_select_autenticado" on public.alunos
  for select using (auth.uid() is not null);

create policy "alunos_insert_diretor_admin" on public.alunos
  for insert with check (
    public.is_admin()
    or (public.papel_atual() = 'professor_diretor' and turma_id = public.turma_responsavel_atual())
  );

create policy "alunos_update_diretor_admin" on public.alunos
  for update using (
    public.is_admin()
    or (public.papel_atual() = 'professor_diretor' and turma_id = public.turma_responsavel_atual())
  );

create policy "alunos_delete_admin" on public.alunos
  for delete using (public.is_admin());
