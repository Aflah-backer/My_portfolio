-- Run this once in the Supabase SQL Editor.
-- If the portfolio owner email changes, update each email comparison below.

create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "Published portfolio is readable" on public.portfolio_content;
create policy "Published portfolio is readable"
  on public.portfolio_content for select
  to anon, authenticated
  using (id = 'main');

drop policy if exists "Owner manages portfolio content" on public.portfolio_content;
create policy "Owner manages portfolio content"
  on public.portfolio_content for all
  to authenticated
  using (id = 'main' and lower((select auth.jwt() ->> 'email')) = 'aflahbacker2000@gmail.com')
  with check (id = 'main' and lower((select auth.jwt() ->> 'email')) = 'aflahbacker2000@gmail.com');

grant select on public.portfolio_content to anon, authenticated;
grant insert, update, delete on public.portfolio_content to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio images are public" on storage.objects;
create policy "Portfolio images are public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Owner uploads portfolio images" on storage.objects;
create policy "Owner uploads portfolio images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and lower((select auth.jwt() ->> 'email')) = 'aflahbacker2000@gmail.com');

drop policy if exists "Owner updates portfolio images" on storage.objects;
create policy "Owner updates portfolio images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media' and lower((select auth.jwt() ->> 'email')) = 'aflahbacker2000@gmail.com')
  with check (bucket_id = 'portfolio-media' and lower((select auth.jwt() ->> 'email')) = 'aflahbacker2000@gmail.com');

drop policy if exists "Owner deletes portfolio images" on storage.objects;
create policy "Owner deletes portfolio images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and lower((select auth.jwt() ->> 'email')) = 'aflahbacker2000@gmail.com');
