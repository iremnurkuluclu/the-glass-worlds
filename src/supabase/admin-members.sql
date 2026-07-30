-- The Glass Worlds: admin member management
-- Run this once in Supabase > SQL Editor.

alter table public.profiles
  add column if not exists is_disabled boolean not null default false;

create index if not exists profiles_is_disabled_idx
  on public.profiles (is_disabled);

-- Member actions are performed only by the admin-users Edge Function.
-- The service role used by that function bypasses RLS. Never expose it in Vite.

