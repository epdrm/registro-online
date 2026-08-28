-- Cursos e disciplinas, cadastrados pelo admin.
-- Rode no SQL Editor do Supabase depois da 0001_auth_papeis_alunos.sql.

create type public.tipo_disciplina as enum (
  'base_comum',
  'base_tecnica',
  'base_diversificada'
);

-- eixo_id é texto livre por enquanto (bate com os ids mock 'ti' / 'gestao' em
-- src/data/mockData.ts), até eixo virar tabela própria.
create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  eixo_id text not null,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Base comum e base diversificada não pertencem a um curso específico
-- (curso_id nulo); base técnica pertence a exatamente um curso.
create table public.disciplinas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo public.tipo_disciplina not null,
  curso_id uuid references public.cursos (id) on delete cascade,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint disciplina_curso_coerente check (
    (tipo = 'base_tecnica' and curso_id is not null)
    or (tipo <> 'base_tecnica' and curso_id is null)
  )
);

alter table public.cursos enable row level security;
alter table public.disciplinas enable row level security;

create policy "cursos_select_autenticado" on public.cursos
  for select using (auth.uid() is not null);

create policy "cursos_admin_insert" on public.cursos
  for insert with check (public.is_admin());

create policy "cursos_admin_update" on public.cursos
  for update using (public.is_admin());

create policy "cursos_admin_delete" on public.cursos
  for delete using (public.is_admin());

create policy "disciplinas_select_autenticado" on public.disciplinas
  for select using (auth.uid() is not null);

create policy "disciplinas_admin_insert" on public.disciplinas
  for insert with check (public.is_admin());

create policy "disciplinas_admin_update" on public.disciplinas
  for update using (public.is_admin());

create policy "disciplinas_admin_delete" on public.disciplinas
  for delete using (public.is_admin());
