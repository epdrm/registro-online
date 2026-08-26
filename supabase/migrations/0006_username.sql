-- Login por nome de usuário em vez de e-mail. O Supabase Auth continua
-- exigindo um e-mail internamente; o app gera um e-mail sintético
-- (usuario@interno.escola) que nunca é mostrado nem usado para enviar nada.
-- Rode no SQL Editor depois das migrações 0001 a 0005.

alter table public.profiles add column username text;

-- Preenche quem já existe com um valor provisório (prefixo do e-mail atual)
-- só para não deixar a coluna nula; ajuste manualmente se quiser outro valor.
update public.profiles set username = split_part(email, '@', 1) where username is null;

alter table public.profiles alter column username set not null;

create unique index profiles_username_key on public.profiles (lower(username));
