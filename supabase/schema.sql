-- CampusDesk AI: conversation history tables.
-- Run this once in the Supabase SQL editor. Authentication itself needs no tables (Supabase Auth handles it).

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  category text,
  answerable boolean,
  sources jsonb,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_updated on public.conversations (user_id, updated_at desc);
create index if not exists messages_conversation_created on public.messages (conversation_id, created_at);

-- Row level security: a student can only read and write their own rows.
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Students manage their own conversations" on public.conversations;
create policy "Students manage their own conversations" on public.conversations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Students manage their own messages" on public.messages;
create policy "Students manage their own messages" on public.messages
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
