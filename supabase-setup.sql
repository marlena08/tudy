-- tudy: schema per Supabase. Incolla tutto nello SQL Editor e premi Run.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, lang text default 'en', theme text default 'dark', toured boolean default false,
  created_at timestamptz default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null, date date not null, time text default '17:00',
  pri text default 'Medium', progress int default 0, done boolean default false, done_on date,
  subs jsonb default '[]', created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text, body text, cat text default 'Quick Ideas', pinned boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text, title text, created_at timestamptz default now()
);
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.activity enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notes" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own activity" on public.activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Aggiunta successiva (foto profilo). Da eseguire anche su progetti già creati:
alter table public.profiles add column if not exists avatar text;
