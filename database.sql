-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age between 1 and 120),
  course text not null,
  year_level text not null,
  sport text not null,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

-- This starter policy allows public read/write access to the registry.
-- Use only for a class/demo project. For real personal data, add authentication
-- and replace these policies with role-based access rules.
drop policy if exists "Public can read students" on public.students;
create policy "Public can read students"
on public.students for select to anon, authenticated using (true);

drop policy if exists "Public can insert students" on public.students;
create policy "Public can insert students"
on public.students for insert to anon, authenticated with check (true);

drop policy if exists "Public can update students" on public.students;
create policy "Public can update students"
on public.students for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public can delete students" on public.students;
create policy "Public can delete students"
on public.students for delete to anon, authenticated using (true);
