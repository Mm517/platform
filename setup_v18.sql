-- ============================================================
--  setup_v18.sql — الشاشة الرئيسية الجديدة
--    1) ترتيب الطلاب حسب النقاط  (edu_leaderboard)
--    2) جدول المذاكرة الأسبوعي الخاص بكل طالب (aa_edu_schedule)
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو شغّلته أكتر من مرة، مفيش فيه حذف لبيانات موجودة).
--  ⚠ لو متشغّلش: الموقع هيشتغل عادي — الترتيب هيظهر "غير متاح"، والجدول هيتحفظ على جهاز الطالب بس.
-- ============================================================

-- ---------- 1) ترتيب الطلاب ----------
-- بيرجّع أول 10 + ترتيب الطالب الحالي (الاسم الأول والنقاط بس — مفيش أرقام تليفونات ولا بيانات حساسة).
-- المحظورين مش بيظهروا في الترتيب.
create or replace function public.edu_leaderboard() returns json
language sql stable security definer set search_path = public as $$
  with r as (
    select p.id,
           split_part(btrim(coalesce(nullif(p.name, ''), 'طالب')), ' ', 1) as nm,
           coalesce(p.points, 0) as pts,
           row_number() over (order by coalesce(p.points, 0) desc, p.created_at asc, p.id) as rk
    from public.aa_edu_profiles p
    where not coalesce(p.banned, false)
  )
  select json_build_object(
    'total', (select count(*) from r),
    'me',    (select json_build_object('rank', rk, 'points', pts) from r where id = auth.uid()),
    'top',   coalesce((select json_agg(json_build_object('rank', rk, 'name', nm, 'points', pts, 'me', id = auth.uid()) order by rk)
                       from r where rk <= 10), '[]'::json)
  );
$$;
revoke all on function public.edu_leaderboard() from public, anon;
grant execute on function public.edu_leaderboard() to authenticated;

-- ---------- 2) جدول المذاكرة ----------
create table if not exists public.aa_edu_schedule(
  id         bigint generated always as identity primary key,
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  day        int    not null check (day between 0 and 6),          -- 0 = الأحد ... 6 = السبت (زي JavaScript getDay)
  tm         text   check (tm is null or tm ~ '^[0-2][0-9]:[0-5][0-9]$'),
  title      text   not null check (char_length(btrim(title)) between 1 and 80),
  subject_id bigint,
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists aa_edu_schedule_user on public.aa_edu_schedule(user_id);

alter table public.aa_edu_schedule enable row level security;

drop policy if exists aa_edu_schedule_own on public.aa_edu_schedule;
create policy aa_edu_schedule_own on public.aa_edu_schedule
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- حد أقصى 60 مهمة لكل طالب (منع التضخيم)
create or replace function public.aa_edu_schedule_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.aa_edu_schedule where user_id = new.user_id) >= 60 then
    raise exception 'schedule_limit';
  end if;
  return new;
end $$;
drop trigger if exists aa_edu_schedule_limit on public.aa_edu_schedule;
create trigger aa_edu_schedule_limit before insert on public.aa_edu_schedule
  for each row execute function public.aa_edu_schedule_limit();

grant select, insert, update, delete on public.aa_edu_schedule to authenticated;
