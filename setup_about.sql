-- جدول صفحة «عن المنصة» (صف واحد فقط id = 1)
-- شغّل الملف مرة واحدة من Supabase → SQL Editor
create table if not exists public.edu_about(
  id int primary key default 1 check (id = 1),
  platform_title text,
  platform_text  text,
  name           text,
  role_title     text,
  bio            text,
  photo          text,
  experience     text,   -- كل خبرة في سطر
  page_url       text,   -- رابط صفحتك الرئيسية
  page_label     text,
  socials        text,   -- كل سطر: الاسم|الرابط
  updated_at     timestamptz default now()
);

alter table public.edu_about enable row level security;

drop policy if exists about_read on public.edu_about;
create policy about_read on public.edu_about for select using (true);

drop policy if exists about_admin_ins on public.edu_about;
create policy about_admin_ins on public.edu_about for insert to authenticated
  with check (exists (select 1 from public.edu_staff s where s.user_id = auth.uid() and s.role = 'admin'));

drop policy if exists about_admin_upd on public.edu_about;
create policy about_admin_upd on public.edu_about for update to authenticated
  using      (exists (select 1 from public.edu_staff s where s.user_id = auth.uid() and s.role = 'admin'))
  with check (exists (select 1 from public.edu_staff s where s.user_id = auth.uid() and s.role = 'admin'));

grant select on public.edu_about to anon, authenticated;
grant insert, update on public.edu_about to authenticated;

insert into public.edu_about(id) values (1) on conflict (id) do nothing;
