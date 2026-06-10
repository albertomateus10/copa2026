-- 🏆 CONFIGURAÇÃO DO BANCO DE DADOS - MONITOR DE TORCIDA COPA 2026
-- Execute este script no SQL Editor do seu projeto Supabase.

-- 1. Criar a tabela de votos
create table if not exists public.votos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  team_name text not null,
  team_code text not null,
  user_name text default 'Anônimo',
  comment text
);

-- 2. Habilitar o Row Level Security (RLS) para proteção
alter table public.votos enable row level security;

-- 3. Criar política para permitir que qualquer pessoa insira votos (votação pública)
create policy "Permitir inserções públicas de votos"
on public.votos
for insert
with check (true);

-- 4. Criar política para permitir que qualquer pessoa leia os votos (para os gráficos e mural)
create policy "Permitir leitura pública de votos"
on public.votos
for select
using (true);

-- 5. Adicionar a tabela de votos à publicação Supabase Realtime
-- Isso permite que o aplicativo ouça novos votos instantaneamente sem recarregar a página!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.votos;
