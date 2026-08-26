-- Permite que o admin exclua um perfil (o professor perde acesso ao app;
-- a conta de login em si só pode ser removida via painel do Supabase Auth,
-- já que isso exige a service_role key, que não fica no frontend).
-- Rode no SQL Editor depois das migrações 0001 a 0004.

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());
