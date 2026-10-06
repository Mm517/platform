-- ============================================================
--  setup_v12.sql — قائمة الانتظار + أرقام ومدرسين حقيقيين للصفحة الخارجية
--  شغّله بعد setup_v11.sql (مرة واحدة، آمن لو اتشغّل تاني).
-- ============================================================

-- (1) قائمة الانتظار: لما التسجيل يتقفل، الطالب بيسيب اسمه ورقمه (من Table Editor → aa_edu_waitlist)
create table if not exists public.aa_edu_waitlist(
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null unique,
  created_at timestamptz not null default now()
);
alter table public.aa_edu_waitlist enable row level security;
revoke all on public.aa_edu_waitlist from anon, authenticated;

create or replace function public.edu_join_waitlist(p_name text, p_phone text) returns json
language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g'); pos int;
begin
  if ph !~ '^01[0125][0-9]{8}$' then return json_build_object('ok', false, 'err', 'phone'); end if;
  if length(trim(coalesce(p_name,''))) < 2 then return json_build_object('ok', false, 'err', 'name'); end if;
  insert into public.aa_edu_waitlist(name, phone) values (left(trim(p_name), 60), ph) on conflict (phone) do nothing;
  select count(*) into pos from public.aa_edu_waitlist where id <= (select id from public.aa_edu_waitlist where phone = ph);
  return json_build_object('ok', true, 'pos', pos);
end $$;
grant execute on function public.edu_join_waitlist(text, text) to anon, authenticated;

-- (2) بيانات الصفحة الخارجية الحقيقية في طلب واحد: عدد الطلاب/الدروس/الاختبارات/المدرسين + المواد ومدرسينها (بصورهم)
create or replace function public.edu_public_home() returns json
language sql stable security definer set search_path = public, auth as $$
  select json_build_object(
    'n',        (select count(*) from auth.users where email like '%@academy-users.com'),
    'lim',      coalesce((select value::int from public.aa_edu_settings where key = 'signup_limit'), 150),
    'lessons',  (select count(*) from public.aa_edu_lessons),
    'courses',  (select count(*) from public.aa_edu_courses),
    'quizzes',  (select count(*) from public.aa_edu_quizzes),
    'teachers', (select count(*) from public.aa_edu_teachers),
    'subjects', coalesce((select json_agg(s order by s.sort) from (
        select sb.id, sb.name, sb.sort, sb.color, sb.icon,
          coalesce((select json_agg(json_build_object('name', t.name, 'image', t.image) order by t.id)
                    from public.aa_edu_teachers t
                    where sb.id = any(t.subject_ids)
                       or t.id in (select cv.teacher_id from public.aa_edu_courses_v cv where cv.subject_id = sb.id)),
                   '[]'::json) as teachers
        from public.aa_edu_subjects sb where sb.grade = 'prep3') s), '[]'::json));
$$;
grant execute on function public.edu_public_home() to anon, authenticated;

notify pgrst, 'reload schema';
