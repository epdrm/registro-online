-- Reestrutura o catálogo acadêmico em hierarquia completa:
-- Eixo → Curso → Série → Disciplina (base comum / técnica / diversificada).
-- Substitui as tabelas cursos/disciplinas criadas em 0002 (ainda sem dados reais).
-- Rode no SQL Editor do Supabase depois da 0001 e da 0002.

drop table if exists public.disciplinas;
drop table if exists public.cursos;

-- 1) Eixos ----------------------------------------------------------------

create table public.eixos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.eixos enable row level security;

create policy "eixos_select_autenticado" on public.eixos
  for select using (auth.uid() is not null);

create policy "eixos_admin_insert" on public.eixos
  for insert with check (public.is_admin());

create policy "eixos_admin_update" on public.eixos
  for update using (public.is_admin());

create policy "eixos_admin_delete" on public.eixos
  for delete using (public.is_admin());

-- 2) Cursos (pertencem a um eixo) ------------------------------------------

create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  eixo_id uuid not null references public.eixos (id) on delete cascade,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.cursos enable row level security;

create policy "cursos_select_autenticado" on public.cursos
  for select using (auth.uid() is not null);

create policy "cursos_admin_insert" on public.cursos
  for insert with check (public.is_admin());

create policy "cursos_admin_update" on public.cursos
  for update using (public.is_admin());

create policy "cursos_admin_delete" on public.cursos
  for delete using (public.is_admin());

-- 3) Séries (pertencem a um curso) -----------------------------------------

create table public.series (
  id uuid primary key default gen_random_uuid(),
  nome text not null,           -- ex.: "1º ano"
  curso_id uuid not null references public.cursos (id) on delete cascade,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.series enable row level security;

create policy "series_select_autenticado" on public.series
  for select using (auth.uid() is not null);

create policy "series_admin_insert" on public.series
  for insert with check (public.is_admin());

create policy "series_admin_update" on public.series
  for update using (public.is_admin());

create policy "series_admin_delete" on public.series
  for delete using (public.is_admin());

-- 4) Disciplinas (pertencem a uma série; eixo e curso vêm por join) --------

create table public.disciplinas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo public.tipo_disciplina not null,
  serie_id uuid not null references public.series (id) on delete cascade,
  criado_por uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.disciplinas enable row level security;

create policy "disciplinas_select_autenticado" on public.disciplinas
  for select using (auth.uid() is not null);

create policy "disciplinas_admin_insert" on public.disciplinas
  for insert with check (public.is_admin());

create policy "disciplinas_admin_update" on public.disciplinas
  for update using (public.is_admin());

create policy "disciplinas_admin_delete" on public.disciplinas
  for delete using (public.is_admin());
