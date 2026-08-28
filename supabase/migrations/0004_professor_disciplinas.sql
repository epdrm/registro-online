-- Um professor pode lecionar várias disciplinas (de eixos/cursos/séries
-- diferentes). Tabela de ligação profiles <-> disciplinas.
-- Rode no SQL Editor depois das migrações 0001 a 0003.

create table public.professor_disciplinas (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  disciplina_id uuid not null references public.disciplinas (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, disciplina_id)
);

alter table public.professor_disciplinas enable row level security;

create policy "professor_disciplinas_select_autenticado" on public.professor_disciplinas
  for select using (auth.uid() is not null);

create policy "professor_disciplinas_admin_insert" on public.professor_disciplinas
  for insert with check (public.is_admin());

create policy "professor_disciplinas_admin_delete" on public.professor_disciplinas
  for delete using (public.is_admin());
