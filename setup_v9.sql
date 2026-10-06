-- ============================================================
--  setup_v9.sql  —  شغّله مرة واحدة من Supabase → SQL Editor
--  (آمن لو شغّلته أكتر من مرة)
--  1) روابط نظيفة (slug) للمواد والدروس والمدرسين
--  2) ربط كل مدرس بمواده + حماية من السيرفر
--  3) جدول التقديمات (طالب متفوق / مبرمج / مدرس / سبورت)
--  4) تحسينات تدفق الدعم (حالة تلقائية + تقييم + حد التذاكر المفتوحة)
-- ============================================================

-- ---------- 1) slugs ----------
alter table public.edu_subjects add column if not exists slug text;
alter table public.edu_lessons  add column if not exists slug text;
alter table public.edu_teachers add column if not exists slug text;
alter table public.edu_teachers add column if not exists name_en text;
alter table public.edu_teachers add column if not exists subject_ids int[] not null default '{}';

-- تعبئة المواد الحالية بأسماء إنجليزية معروفة (وإلا subject-ID)
update public.edu_subjects set slug = case
  when name ilike '%رياضيات%' then 'math'
  when name ilike '%عربي%' then 'arabic'
  when name ilike '%انجليزي%' or name ilike '%إنجليزي%' or name ilike '%english%' then 'english'
  when name ilike '%علوم%' then 'science'
  when name ilike '%دراسات%' then 'social-studies'
  when name ilike '%حاسب%' then 'computer'
  when name ilike '%فرنس%' then 'french'
  when name ilike '%دين%' or name ilike '%إسلام%' then 'religion'
  else 'subject-'||id end
where slug is null or slug = '';
update public.edu_subjects s set slug = s.slug||'-'||s.id
where s.id in (select id from (select id, row_number() over(partition by slug order by id) rn from public.edu_subjects) x where rn > 1);

update public.edu_lessons set slug = 'lesson-'||id where slug is null or slug = '';
update public.edu_teachers set slug = 't-'||substr(md5(id::text||clock_timestamp()::text),1,6) where slug is null or slug = '';

create unique index if not exists edu_subjects_slug_u on public.edu_subjects(slug);
create unique index if not exists edu_lessons_slug_u  on public.edu_lessons(subject_id, slug);
create unique index if not exists edu_teachers_slug_u on public.edu_teachers(slug);

-- أي صف جديد بلا slug ياخد واحد عشوائي + تنضيف الصيغة (حروف إنجليزية وأرقام وشرطات)
create or replace function public.edu_fill_slug() returns trigger language plpgsql as $$
begin
  new.slug := trim(both '-' from regexp_replace(lower(coalesce(new.slug,'')), '[^a-z0-9]+', '-', 'g'));
  if new.slug = '' then
    new.slug := tg_argv[0] || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);
  end if;
  return new;
end $$;

drop trigger if exists edu_subjects_slug on public.edu_subjects;
create trigger edu_subjects_slug before insert or update of slug on public.edu_subjects
  for each row execute function public.edu_fill_slug('subject');
drop trigger if exists edu_lessons_slug on public.edu_lessons;
create trigger edu_lessons_slug before insert or update of slug on public.edu_lessons
  for each row execute function public.edu_fill_slug('lesson');
drop trigger if exists edu_teachers_slug on public.edu_teachers;
create trigger edu_teachers_slug before insert or update of slug on public.edu_teachers
  for each row execute function public.edu_fill_slug('t');

-- ---------- 2) مادة كل مدرس ----------
-- المدرسين الحاليين: نملأ موادهم من كورساتهم الموجودة (عشان مفيش حاجة تقع)
update public.edu_teachers t set subject_ids = coalesce((
  select array_agg(distinct l.subject_id order by l.subject_id)
  from public.edu_courses c join public.edu_lessons l on l.id = c.lesson_id
  where c.teacher_id = t.id), '{}')
where cardinality(t.subject_ids) = 0;

-- حماية من السيرفر: مينفعش كورس يتضاف/يتنقل لمدرس مش مربوط بمادة الدرس
create or replace function public.edu_chk_teacher_subject() returns trigger language plpgsql as $$
declare sid int; ids int[];
begin
  select subject_id into sid from public.edu_lessons where id = new.lesson_id;
  select subject_ids into ids from public.edu_teachers where id = new.teacher_id;
  if ids is not null and cardinality(ids) > 0 and sid is not null and not (sid = any(ids)) then
    raise exception 'هذا المدرس غير مربوط بمادة هذا الدرس';
  end if;
  return new;
end $$;
drop trigger if exists edu_courses_teacher_subject on public.edu_courses;
create trigger edu_courses_teacher_subject before insert or update of lesson_id, teacher_id on public.edu_courses
  for each row execute function public.edu_chk_teacher_subject();

-- ---------- 3) التقديمات ----------
create table if not exists public.edu_applications(
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind          text not null check (kind in ('top_student','programmer','teacher','sport')),
  full_name     text not null check (char_length(full_name) between 3 and 80),
  phone         text,
  data          jsonb not null default '{}'::jsonb,
  terms_version text not null,
  terms_accepted boolean not null default false check (terms_accepted),
  accepted_at   timestamptz not null default now(),
  status        text not null default 'pending' check (status in ('pending','approved','rejected','withdrawn')),
  admin_note    text,
  reviewed_by   uuid,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- تقديم واحد نشط (قيد المراجعة أو مقبول) لكل نوع لكل مستخدم
create unique index if not exists edu_app_one_active on public.edu_applications(user_id, kind) where status in ('pending','approved');
create index if not exists edu_app_status on public.edu_applications(status, created_at desc);

alter table public.edu_applications enable row level security;
create or replace function public.edu_is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.edu_staff s where s.user_id = auth.uid() and s.role = 'admin') $$;

drop policy if exists app_sel on public.edu_applications;
create policy app_sel on public.edu_applications for select to authenticated using (user_id = auth.uid() or public.edu_is_admin());
drop policy if exists app_ins on public.edu_applications;
create policy app_ins on public.edu_applications for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
drop policy if exists app_upd_own on public.edu_applications;
create policy app_upd_own on public.edu_applications for update to authenticated
  using (user_id = auth.uid() and status = 'pending') with check (user_id = auth.uid());
drop policy if exists app_upd_admin on public.edu_applications;
create policy app_upd_admin on public.edu_applications for update to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists app_del_admin on public.edu_applications;
create policy app_del_admin on public.edu_applications for delete to authenticated using (public.edu_is_admin());
grant select, insert, update, delete on public.edu_applications to authenticated;

-- الطالب مايقدرش يغيّر قرار الإدارة ولا الملاحظة؛ وكل تعديل يتسجّل وقته
create or replace function public.edu_app_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.edu_is_admin() then
    if new.status is distinct from old.status then new.reviewed_by := auth.uid(); new.reviewed_at := now(); end if;
  else
    new.user_id := old.user_id; new.kind := old.kind; new.admin_note := old.admin_note;
    new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at;
    if new.status not in ('pending','withdrawn') then new.status := old.status; end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists edu_app_guard_t on public.edu_applications;
create trigger edu_app_guard_t before update on public.edu_applications for each row execute function public.edu_app_guard();

-- إشعار للطالب لما الإدارة تقبل أو ترفض
create or replace function public.edu_app_notify() returns trigger language plpgsql security definer set search_path = public as $$
declare k text;
begin
  if new.status is distinct from old.status and new.status in ('approved','rejected') then
    k := case new.kind when 'top_student' then 'طالب متفوق' when 'programmer' then 'مبرمج' when 'teacher' then 'مدرس' else 'سبورت' end;
    insert into public.edu_notifications(user_id, title, body, link) values (
      new.user_id,
      case when new.status = 'approved' then 'تم قبول تقديمك كـ ' || k else 'بخصوص تقديمك كـ ' || k end,
      case when new.status = 'approved' then coalesce(nullif(new.admin_note,''), 'مبروك! هنتواصل معاك قريبًا.')
           else coalesce(nullif(new.admin_note,''), 'للأسف لم يتم قبول التقديم هذه المرة. تقدر تقدّم من جديد.') end,
      'profile#apply');
  end if;
  return new;
end $$;
drop trigger if exists edu_app_notify_t on public.edu_applications;
create trigger edu_app_notify_t after update on public.edu_applications for each row execute function public.edu_app_notify();

-- ---------- 4) الدعم ----------
alter table public.edu_tickets add column if not exists rating smallint check (rating between 1 and 5);
alter table public.edu_tickets add column if not exists rating_note text;
alter table public.edu_tickets add column if not exists closed_at timestamptz;

-- أي رسالة جديدة تحدّث حالة التذكرة تلقائيًا: رد الدعم = «تم الرد»، رد الطالب = «قيد المراجعة»
create or replace function public.edu_ticket_touch() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.edu_tickets
     set updated_at = now(), status = case when new.is_staff then 'answered' else 'open' end
   where id = new.ticket_id and status <> 'closed';
  return new;
end $$;
drop trigger if exists edu_ticket_touch_t on public.edu_ticket_messages;
create trigger edu_ticket_touch_t after insert on public.edu_ticket_messages for each row execute function public.edu_ticket_touch();

create or replace function public.edu_ticket_closed_at() returns trigger language plpgsql as $$
begin
  if new.status = 'closed' and old.status is distinct from 'closed' then new.closed_at := now();
  elsif new.status <> 'closed' then new.closed_at := null; end if;
  return new;
end $$;
drop trigger if exists edu_ticket_closed_t on public.edu_tickets;
create trigger edu_ticket_closed_t before update on public.edu_tickets for each row execute function public.edu_ticket_closed_at();

-- حد أقصى 5 تذاكر مفتوحة للمستخدم (منع الإزعاج)
create or replace function public.edu_ticket_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.edu_tickets where user_id = new.user_id and status <> 'closed') >= 5 then
    raise exception 'عندك 5 تذاكر مفتوحة. انتظر الرد عليها أو أغلق ما انتهى.';
  end if;
  return new;
end $$;
drop trigger if exists edu_ticket_limit_t on public.edu_tickets;
create trigger edu_ticket_limit_t before insert on public.edu_tickets for each row execute function public.edu_ticket_limit();
