-- "Turma" passa a ser a série real cadastrada em Curso/Série (eixo → curso →
-- série), em vez do id de exemplo fixo no código ('ds-2' etc.). Afeta a
-- turma responsável do diretor de turma e a turma dos alunos.
-- Seguro rodar: as tabelas alunos e o campo turma_responsavel_id ainda
-- estavam vazios quando essa migração foi escrita.
-- Rode no SQL Editor depois das migrações 0001 a 0006.

-- 1) profiles.turma_responsavel_id: text -> uuid, referenciando series

alter table public.profiles
  alter column turma_responsavel_id type uuid using turma_responsavel_id::uuid;

alter table public.profiles
  add constraint profiles_turma_responsavel_id_fkey
  foreign key (turma_responsavel_id) references public.series (id) on delete set null;

-- 2) função auxiliar precisa devolver uuid agora (estava text) — recriar
--    derruba as políticas de alunos que dependem dela; recriamos as duas
--    em seguida.

drop function public.turma_responsavel_atual() cascade;

create function public.turma_responsavel_atual()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select turma_responsavel_id from public.profiles where id = auth.uid();
$$;

-- 3) alunos.turma_id: text -> uuid, referenciando series

alter table public.alunos
  alter column turma_id type uuid using turma_id::uuid;

alter table public.alunos
  add constraint alunos_turma_id_fkey
  foreign key (turma_id) references public.series (id) on delete cascade;

-- 4) recria as políticas de alunos que a função dropada levou junto

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
