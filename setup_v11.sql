-- ============================================================
--  setup_v11.sql — (1) ترتيب الجداول في Table Editor  (2) عدّاد الطلاب + قفل التسجيل
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو شغّلته أكتر من مرة).
--  ⚠ شغّله ثم ارفع ملفات الموقع الجديدة فورًا (الكود القديم بيدوّر على أسماء الجداول القديمة).
-- ============================================================

-- (1) كل جداول/Views المنصة (اللي بتبدأ بـ edu_) بتتسمّى aa_edu_... عشان تظهر في أول Table Editor.
--     كمان بيعدّل أسماء الجداول جوه أي دوال موجودة (الدوال بتخزّن الأسماء كنص ومبتتغيرش لوحدها).
do $$
declare r record; f record; t text; def text; nm text; olds text[] := '{}';
begin
  for r in select c.relname, c.relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace
           where n.nspname='public' and c.relkind in ('r','p','v')
             and c.relname like 'edu\_%' and c.relname not like 'aa\_edu\_%' loop
    olds := olds || r.relname;
    if r.relkind='v' then execute format('alter view public.%I rename to %I', r.relname, 'aa_'||r.relname);
    else execute format('alter table public.%I rename to %I', r.relname, 'aa_'||r.relname); end if;
  end loop;

  if coalesce(array_length(olds,1),0) > 0 then
    for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.prokind='f' loop
      def := pg_get_functiondef(f.oid); nm := def;
      foreach t in array olds loop
        nm := regexp_replace(nm, '\y'||t||'\y', 'aa_'||t, 'g');
      end loop;
      if nm <> def then execute nm; end if;
    end loop;

    if to_regclass('public.aa_edu_content_version') is not null then
      update public.aa_edu_content_version set tbl='aa_'||tbl where tbl like 'edu\_%';
    end if;
  end if;
end $$;

-- تريجرات نسخة المحتوى: شيل القديم وركّب بالأسماء الجديدة
do $$
declare r record; t text;
begin
  for r in select tg.tgname, c.relname from pg_trigger tg join pg_class c on c.oid=tg.tgrelid
           join pg_namespace n on n.oid=c.relnamespace
           where n.nspname='public' and not tg.tgisinternal and tg.tgname like 'edu\_ver\_%' loop
    execute format('drop trigger if exists %I on public.%I', r.tgname, r.relname);
  end loop;
  foreach t in array array[
    'aa_edu_books','aa_edu_course_files','aa_edu_course_solutions','aa_edu_courses','aa_edu_lessons',
    'aa_edu_subjects','aa_edu_teachers','aa_edu_ads','aa_edu_updates','aa_edu_about','aa_edu_quizzes','aa_edu_quiz_questions'
  ] loop
    if to_regclass('public.'||t) is not null then
      insert into public.aa_edu_content_version(tbl) values (t) on conflict (tbl) do nothing;
      execute format('create trigger edu_ver_%1$s after insert or update or delete on public.%1$I
                      for each statement execute function public.edu_bump_version()', t);
    end if;
  end loop;
end $$;

-- (2) إعدادات المنصة + حد التسجيل (غيّر الرقم من Table Editor → aa_edu_settings → signup_limit)
create table if not exists public.aa_edu_settings(key text primary key, value text not null);
alter table public.aa_edu_settings enable row level security;
revoke all on public.aa_edu_settings from anon, authenticated;
insert into public.aa_edu_settings(key, value) values ('signup_limit','150') on conflict (key) do nothing;

-- عدّاد عام (الصفحة الخارجية وصفحة التسجيل): عدد الطلاب + الحد
create or replace function public.edu_public_stats() returns json
language sql stable security definer set search_path = public, auth as $$
  select json_build_object(
    'n',   (select count(*) from auth.users where email like '%@academy-users.com'),
    'lim', coalesce((select value::int from public.aa_edu_settings where key='signup_limit'), 150));
$$;
grant execute on function public.edu_public_stats() to anon, authenticated;

-- قفل فعلي من السيرفر: أي حساب جديد بعد الحد بيترفض (مش بس إخفاء الزرار)
create or replace function public.edu_signup_guard() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare lim int; n int;
begin
  if new.email is null or new.email not like '%@academy-users.com' then return new; end if;
  select value::int into lim from public.aa_edu_settings where key='signup_limit';
  if lim is null then return new; end if;
  select count(*) into n from auth.users where email like '%@academy-users.com';
  if n >= lim then raise exception 'signup_closed'; end if;
  return new;
end $$;
drop trigger if exists edu_signup_guard_t on auth.users;
create trigger edu_signup_guard_t before insert on auth.users for each row execute function public.edu_signup_guard();

notify pgrst, 'reload schema';
