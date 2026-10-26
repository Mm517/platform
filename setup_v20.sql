-- ============================================================
--  setup_v20.sql — مجتمع كورس الفايب كودينج (تسجيل بإيميل + باسوورد)
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو شغّلته أكتر من مرة، مفيش فيه حذف لبيانات موجودة).
--  حسابات المجتمع منفصلة تمامًا عن حسابات الطلاب (@academy-users.com) ومش بتتحسب في حد الـ 150 طالب.
--
--  ⚠ الخطوة الأخيرة (مهمة): سجّل في صفحة vibe بإيميلك الأول، وبعدين شغّل السطر ده بإيميلك عشان تبقى أدمن المجتمع:
--     insert into public.aa_vc_admins(user_id) select id from auth.users where email = 'ضع-ايميلك-هنا@gmail.com' on conflict do nothing;
--
--  ⚠ لو عايز التسجيل يفتح الحساب فورًا من غير رسالة تأكيد: Supabase → Authentication → Providers → Email → اقفل "Confirm email".
-- ============================================================

-- ---------- 1) الأعضاء + الأدمن ----------
create table if not exists public.aa_vc_members(
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 2 and 40),
  banned     boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.aa_vc_admins(
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.aa_vc_members enable row level security;
alter table public.aa_vc_admins  enable row level security;
revoke all on public.aa_vc_admins from anon, authenticated;

create or replace function public.vc_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.aa_vc_admins a where a.user_id = auth.uid()) $$;

create or replace function public.vc_is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.aa_vc_members m where m.user_id = auth.uid() and not m.banned)
      or exists (select 1 from public.aa_vc_admins a where a.user_id = auth.uid()) $$;

grant execute on function public.vc_is_admin(), public.vc_is_member() to authenticated;

-- العضو بيشوف نفسه، والأدمن بيشوف الكل ويحظر
drop policy if exists vc_mem_sel on public.aa_vc_members;
create policy vc_mem_sel on public.aa_vc_members for select to authenticated
  using (user_id = auth.uid() or public.vc_is_admin());
drop policy if exists vc_mem_ins on public.aa_vc_members;
create policy vc_mem_ins on public.aa_vc_members for insert to authenticated
  with check (user_id = auth.uid() and banned = false);
drop policy if exists vc_mem_upd on public.aa_vc_members;
create policy vc_mem_upd on public.aa_vc_members for update to authenticated
  using (public.vc_is_admin()) with check (public.vc_is_admin());
drop policy if exists vc_mem_del on public.aa_vc_members;
create policy vc_mem_del on public.aa_vc_members for delete to authenticated
  using (public.vc_is_admin());

-- عدّاد عام لعدد الأعضاء (للصفحة الخارجية)
create or replace function public.vc_public_stats() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('members', (select count(*) from public.aa_vc_members where not banned),
                           'courses', (select count(*) from public.aa_vc_courses where published),
                           'lessons', (select count(*) from public.aa_vc_lessons l join public.aa_vc_courses c on c.id = l.course_id where c.published)); $$;
grant execute on function public.vc_public_stats() to anon, authenticated;

-- ---------- 2) الكورسات والدروس ----------
create table if not exists public.aa_vc_courses(
  id          bigint generated always as identity primary key,
  title       text not null check (char_length(btrim(title)) between 2 and 120),
  description text not null default '',
  cover_url   text not null default '',
  level       text not null default 'مبتدئ',
  sort        int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
create table if not exists public.aa_vc_lessons(
  id         bigint generated always as identity primary key,
  course_id  bigint not null references public.aa_vc_courses(id) on delete cascade,
  title      text not null check (char_length(btrim(title)) between 2 and 140),
  video_url  text not null default '',
  notes      text not null default '',
  sort       int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists aa_vc_lessons_course on public.aa_vc_lessons(course_id, sort, id);
create table if not exists public.aa_vc_progress(
  user_id    uuid   not null default auth.uid() references auth.users(id) on delete cascade,
  lesson_id  bigint not null references public.aa_vc_lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ---------- 3) اللايفات ----------
create table if not exists public.aa_vc_lives(
  id          bigint generated always as identity primary key,
  title       text not null check (char_length(btrim(title)) between 2 and 140),
  description text not null default '',
  url         text not null default '',                 -- رابط لايف يوتيوب (أو أي رابط اجتماع)
  starts_at   timestamptz not null,
  status      text not null default 'upcoming' check (status in ('upcoming','live','ended')),
  replay_url  text not null default '',                -- رابط التسجيل بعد ما يخلص
  created_at  timestamptz not null default now()
);
create index if not exists aa_vc_lives_t on public.aa_vc_lives(starts_at desc);

-- ---------- 4) الأسئلة والأجوبة ----------
create table if not exists public.aa_vc_questions(
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null default '',
  title      text not null check (char_length(btrim(title)) between 4 and 140),
  body       text not null default '' check (char_length(body) <= 2000),
  solved     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists aa_vc_questions_t on public.aa_vc_questions(id desc);
create table if not exists public.aa_vc_answers(
  id          bigint generated always as identity primary key,
  question_id bigint not null references public.aa_vc_questions(id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null default '',
  body        text not null check (char_length(btrim(body)) between 1 and 2000),
  is_staff    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists aa_vc_answers_q on public.aa_vc_answers(question_id, id);

-- ---------- 5) الشات ----------
create table if not exists public.aa_vc_msgs(
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name       text not null default '',
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  pinned     boolean not null default false,
  is_staff   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists aa_vc_msgs_t on public.aa_vc_msgs(id desc);

create table if not exists public.aa_vc_settings(
  id          int primary key default 1 check (id = 1),
  chat_locked boolean not null default false
);
insert into public.aa_vc_settings(id) values (1) on conflict do nothing;

-- ---------- 6) تريجرز: الاسم والصفة (أدمن/عضو) من السيرفر فمينفعش تتزوّر + حد سرعة الشات ----------
create or replace function public.vc_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  select m.name into nm from public.aa_vc_members m where m.user_id = auth.uid();
  new.user_id := auth.uid();
  new.name    := coalesce(nm, 'مدرّس');
  if tg_table_name in ('aa_vc_msgs','aa_vc_answers') then
    new.is_staff := public.vc_is_admin();
  end if;
  if tg_table_name = 'aa_vc_msgs' then
    if (select chat_locked from public.aa_vc_settings where id = 1) and not public.vc_is_admin() then
      raise exception 'locked';
    end if;
    if not public.vc_is_admin() then
      new.pinned := false;
      if exists (select 1 from public.aa_vc_msgs x where x.user_id = auth.uid() and x.created_at > now() - interval '1 second') then
        raise exception 'slow';
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists vc_stamp_q on public.aa_vc_questions;
create trigger vc_stamp_q before insert on public.aa_vc_questions for each row execute function public.vc_stamp();
drop trigger if exists vc_stamp_a on public.aa_vc_answers;
create trigger vc_stamp_a before insert on public.aa_vc_answers for each row execute function public.vc_stamp();
drop trigger if exists vc_stamp_m on public.aa_vc_msgs;
create trigger vc_stamp_m before insert on public.aa_vc_msgs for each row execute function public.vc_stamp();

-- ---------- 7) الصلاحيات (RLS): الأعضاء الغير محظورين بس يشوفوا ويكتبوا، والأدمن يدير كل حاجة ----------
do $$
declare t text;
begin
  foreach t in array array['aa_vc_courses','aa_vc_lessons','aa_vc_progress','aa_vc_lives','aa_vc_questions','aa_vc_answers','aa_vc_msgs','aa_vc_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists vc_admin_all on public.%I', t);
    execute format('create policy vc_admin_all on public.%I for all to authenticated using (public.vc_is_admin()) with check (public.vc_is_admin())', t);
    execute format('drop policy if exists vc_member_sel on public.%I', t);
    execute format('create policy vc_member_sel on public.%I for select to authenticated using (public.vc_is_member())', t);
  end loop;
end $$;

-- الكورسات غير المنشورة مخفية عن الأعضاء
drop policy if exists vc_member_sel on public.aa_vc_courses;
create policy vc_member_sel on public.aa_vc_courses for select to authenticated using (public.vc_is_member() and published);

-- تقدّم العضو: بتاعه هو بس
drop policy if exists vc_member_sel on public.aa_vc_progress;
drop policy if exists vc_progress_sel on public.aa_vc_progress;
create policy vc_progress_sel on public.aa_vc_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists vc_progress_ins on public.aa_vc_progress;
create policy vc_progress_ins on public.aa_vc_progress for insert to authenticated with check (user_id = auth.uid() and public.vc_is_member());
drop policy if exists vc_progress_del on public.aa_vc_progress;
create policy vc_progress_del on public.aa_vc_progress for delete to authenticated using (user_id = auth.uid());

-- الأسئلة والأجوبة والشات: العضو يكتب باسمه، ويمسح بتاعه بس
drop policy if exists vc_q_ins on public.aa_vc_questions;
create policy vc_q_ins on public.aa_vc_questions for insert to authenticated with check (public.vc_is_member());
drop policy if exists vc_q_del on public.aa_vc_questions;
create policy vc_q_del on public.aa_vc_questions for delete to authenticated using (user_id = auth.uid());
drop policy if exists vc_q_upd on public.aa_vc_questions;
create policy vc_q_upd on public.aa_vc_questions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists vc_a_ins on public.aa_vc_answers;
create policy vc_a_ins on public.aa_vc_answers for insert to authenticated with check (public.vc_is_member());
drop policy if exists vc_a_del on public.aa_vc_answers;
create policy vc_a_del on public.aa_vc_answers for delete to authenticated using (user_id = auth.uid());
drop policy if exists vc_m_ins on public.aa_vc_msgs;
create policy vc_m_ins on public.aa_vc_msgs for insert to authenticated with check (public.vc_is_member());
drop policy if exists vc_m_del on public.aa_vc_msgs;
create policy vc_m_del on public.aa_vc_msgs for delete to authenticated using (user_id = auth.uid());

-- ---------- 8) تحديث لحظي (Realtime) للشات واللايفات والأسئلة ----------
do $$
declare t text;
begin
  foreach t in array array['aa_vc_msgs','aa_vc_lives','aa_vc_questions','aa_vc_answers','aa_vc_settings'] loop
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- 9) كورس تجريبي (مرة واحدة بس لو مفيش كورسات) ----------
insert into public.aa_vc_courses(title, description, level, sort)
select 'أساسيات الفايب كودينج', 'ابدأ من الصفر: إزاي تكلّم الذكاء الاصطناعي وتبني مواقع كاملة بالبرومبتات.', 'مبتدئ', 1
where not exists (select 1 from public.aa_vc_courses);

notify pgrst, 'reload schema';
