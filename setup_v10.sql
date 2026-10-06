-- ============================================================
--  setup_v10.sql — نسخة المحتوى (بديل الـ Realtime / WebSocket)
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو شغّلته أكتر من مرة)
--  كل تعديل على جداول المحتوى بيزوّد رقم جدوله تلقائيًا،
--  والموقع بيتابع الجدول ده بس عبر Realtime (لحظي)، ولو الاتصال وقع بيفحصه بطلب صغير كل 90 ثانية.
-- ============================================================
create table if not exists public.edu_content_version(
  tbl        text primary key,
  v          bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.edu_content_version enable row level security;
drop policy if exists ecv_read on public.edu_content_version;
create policy ecv_read on public.edu_content_version for select using (true);
grant select on public.edu_content_version to anon, authenticated;
-- الكتابة بس من الـ trigger (security definer) — مفيش صلاحية كتابة لأي مستخدم
revoke insert, update, delete on public.edu_content_version from anon, authenticated;

create or replace function public.edu_bump_version() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.edu_content_version(tbl, v) values (tg_table_name, 1)
  on conflict (tbl) do update set v = public.edu_content_version.v + 1, updated_at = now();
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'edu_books','edu_course_files','edu_course_solutions','edu_courses','edu_lessons',
    'edu_subjects','edu_teachers','edu_ads','edu_updates','edu_about','edu_quizzes','edu_quiz_questions'
  ] loop
    if to_regclass('public.'||t) is not null then
      insert into public.edu_content_version(tbl) values (t) on conflict (tbl) do nothing;
      execute format('drop trigger if exists edu_ver_%1$s on public.%1$I', t);
      execute format('create trigger edu_ver_%1$s after insert or update or delete on public.%1$I
                      for each statement execute function public.edu_bump_version()', t);
    end if;
  end loop;
end $$;

-- تفعيل Realtime على جدول النسخة فقط (اتصال واحد لكل طالب بدل متابعة 12 جدول)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='edu_content_version') then
    alter publication supabase_realtime add table public.edu_content_version;
  end if;
end $$;

-- setup_realtime.sql القديم مبقاش مطلوب (الموقع بقى يتابع edu_content_version بس).
