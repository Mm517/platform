-- ============================================================
--  setup_v13.sql — إصلاح الحفظ + روابط نظيفة (مادة / درس / مدرس) + صلاحيات الأدمن
--  شغّله مرة واحدة من Supabase → SQL Editor بعد setup_v11.sql و setup_v12.sql
--  (آمن لو شغّلته أكتر من مرة). مش محتاج setup_admin_edit.sql تاني.
--
--  بيعمل إيه:
--   1) يضيف أعمدة slug / name_en / subject_ids لو ناقصة (ده سبب «تعذر الحفظ»)
--   2) يملأ الروابط: مادة = math ، درس = lesson-12 ، مدرس = اسمه بالإنجليزي أو اسمه معرّبًا أو عشوائي
--      => رابط الدرس يبقى: courses#course-math-lesson-12-mhmd-abrahym
--      => رابط المدرس يبقى: teachers?t=mhmd-abrahym
--   3) أي صف جديد بلا رابط يتولّد له رابط تلقائيًا (ومفيش تكرار)
--   4) يضمن إن حساب الأدمن يقدر يكتب في كل جداول المحتوى
--   5) يتأكد من إعداد حد التسجيل (150) ويفك أي قيد على طول وصف المدرس
-- ============================================================

-- ---------- 1) الأعمدة ----------
alter table public.aa_edu_subjects add column if not exists slug text;
alter table public.aa_edu_lessons  add column if not exists slug text;
alter table public.aa_edu_teachers add column if not exists slug text;
alter table public.aa_edu_teachers add column if not exists name_en text;
alter table public.aa_edu_teachers add column if not exists subject_ids int[] not null default '{}';

-- ---------- 2) دوال توليد الروابط ----------
-- تحويل الحروف العربية لإنجليزية (للروابط فقط)
create or replace function public.aa_edu_translit(t text) returns text
language plpgsql immutable as $$
declare r text := coalesce(t, '');
begin
  r := regexp_replace(r, '[\u064B-\u065F\u0640]', '', 'g');
  r := replace(r, 'ش', 'sh'); r := replace(r, 'خ', 'kh'); r := replace(r, 'ث', 'th');
  r := replace(r, 'ذ', 'dh'); r := replace(r, 'غ', 'gh');
  r := translate(r, 'اأإآبتجحدرزسصضطظعفقكلمنهوىيةؤئء', 'aaaabtghdrzssdtzafqklmnhwyyawy');
  r := trim(both '-' from regexp_replace(lower(r), '[^a-z0-9]+', '-', 'g'));
  return left(r, 40);
end $$;

-- تنضيف أي نص ليصلح رابطًا (حروف إنجليزية وأرقام وشرطات)
create or replace function public.aa_edu_clean_slug(t text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(t, '')), '[^a-z0-9]+', '-', 'g')) $$;

-- المواد: اسم إنجليزي معروف → وإلا اسمها معرّبًا → وإلا subject-ID
create or replace function public.aa_edu_subject_slug() returns trigger language plpgsql as $$
declare b text; s text; i int := 1;
begin
  b := public.aa_edu_clean_slug(new.slug);
  if b = '' or b ~ '^s?[0-9]+$' then
    b := case
      when new.name ilike '%رياضيات%' then 'math'
      when new.name ilike '%عربي%' then 'arabic'
      when new.name ilike '%انجليزي%' or new.name ilike '%إنجليزي%' or new.name ilike '%english%' then 'english'
      when new.name ilike '%علوم%' then 'science'
      when new.name ilike '%دراسات%' then 'social-studies'
      when new.name ilike '%حاسب%' then 'computer'
      when new.name ilike '%فرنس%' then 'french'
      when new.name ilike '%دين%' or new.name ilike '%إسلام%' then 'religion'
      else nullif(public.aa_edu_translit(new.name), '') end;
    b := coalesce(b, 'subject-' || new.id);
  end if;
  s := b;
  while exists (select 1 from public.aa_edu_subjects x where x.slug = s and x.id is distinct from new.id) loop
    i := i + 1; s := b || '-' || i;
  end loop;
  new.slug := s;
  return new;
end $$;

-- الدروس: lesson-ID (ثابت حتى لو اتغيّر الترتيب)، والأدمن يقدر يغيّره
create or replace function public.aa_edu_lesson_slug() returns trigger language plpgsql as $$
declare b text; s text; i int := 1;
begin
  b := public.aa_edu_clean_slug(new.slug);
  if b = '' or b ~ '^l?[0-9]+$' then b := 'lesson-' || new.id; end if;
  s := b;
  while exists (select 1 from public.aa_edu_lessons x where x.subject_id = new.subject_id and x.slug = s and x.id is distinct from new.id) loop
    i := i + 1; s := b || '-' || i;
  end loop;
  new.slug := s;
  return new;
end $$;

-- المدرسين: الاسم بالإنجليزي → وإلا الاسم العربي معرّبًا (من غير «مستر» وما بعد |) → وإلا عشوائي
create or replace function public.aa_edu_teacher_slug() returns trigger language plpgsql as $$
declare b text; s text; i int := 1; nm text;
begin
  b := public.aa_edu_clean_slug(new.slug);
  if b = '' or b ~ '^t?[0-9]+$' then
    b := public.aa_edu_clean_slug(new.name_en);
    if b = '' then
      nm := regexp_replace(split_part(coalesce(new.name, ''), '|', 1),
            '^\s*(مستر|ميستر|مس|الأستاذ|الاستاذ|أستاذ|استاذ|دكتور|د\.|أ\.)\s+', '');
      b := public.aa_edu_translit(nm);
    end if;
    if b = '' then b := 't-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6); end if;
  end if;
  s := b;
  while exists (select 1 from public.aa_edu_teachers x where x.slug = s and x.id is distinct from new.id) loop
    i := i + 1; s := b || '-' || i;
  end loop;
  new.slug := s;
  return new;
end $$;

-- شيل التريجرات القديمة (بتاعة v9) وركّب الجديدة
drop trigger if exists edu_subjects_slug on public.aa_edu_subjects;
drop trigger if exists edu_lessons_slug  on public.aa_edu_lessons;
drop trigger if exists edu_teachers_slug on public.aa_edu_teachers;
drop trigger if exists aa_subjects_slug on public.aa_edu_subjects;
drop trigger if exists aa_lessons_slug  on public.aa_edu_lessons;
drop trigger if exists aa_teachers_slug on public.aa_edu_teachers;
create trigger aa_subjects_slug before insert or update of slug, name on public.aa_edu_subjects
  for each row execute function public.aa_edu_subject_slug();
create trigger aa_lessons_slug before insert or update of slug on public.aa_edu_lessons
  for each row execute function public.aa_edu_lesson_slug();
create trigger aa_teachers_slug before insert or update of slug, name_en on public.aa_edu_teachers
  for each row execute function public.aa_edu_teacher_slug();

-- ---------- 3) تعبئة الروابط الحالية (لو فاضية أو أرقام زي 2 / t2 / s3 / l11) ----------
do $$
declare r record;
begin
  for r in select id from public.aa_edu_subjects where coalesce(slug, '') = '' or slug ~ '^s?[0-9]+$' order by id loop
    update public.aa_edu_subjects set slug = '' where id = r.id;
  end loop;
  for r in select id from public.aa_edu_lessons where coalesce(slug, '') = '' or slug ~ '^l?[0-9]+$' order by id loop
    update public.aa_edu_lessons set slug = '' where id = r.id;
  end loop;
  for r in select id from public.aa_edu_teachers where coalesce(slug, '') = '' or slug ~ '^t?[0-9]+$' order by id loop
    update public.aa_edu_teachers set slug = '' where id = r.id;
  end loop;
end $$;

create unique index if not exists aa_edu_subjects_slug_u on public.aa_edu_subjects(slug);
create unique index if not exists aa_edu_lessons_slug_u  on public.aa_edu_lessons(subject_id, slug);
create unique index if not exists aa_edu_teachers_slug_u on public.aa_edu_teachers(slug);

-- المدرسين القدام: املأ موادهم من كورساتهم لو لسه فاضية
update public.aa_edu_teachers t set subject_ids = coalesce((
  select array_agg(distinct l.subject_id order by l.subject_id)
  from public.aa_edu_courses c join public.aa_edu_lessons l on l.id = c.lesson_id
  where c.teacher_id = t.id), '{}')
where cardinality(t.subject_ids) = 0;

-- ---------- 4) صلاحيات الأدمن للكتابة في جداول المحتوى ----------
create or replace function public.edu_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.aa_edu_staff s where s.user_id = auth.uid() and s.role = 'admin') $$;

do $$
declare t text;
begin
  foreach t in array array[
    'aa_edu_subjects','aa_edu_lessons','aa_edu_teachers','aa_edu_courses','aa_edu_course_files',
    'aa_edu_course_solutions','aa_edu_ads','aa_edu_books','aa_edu_updates','aa_edu_about',
    'aa_edu_quizzes','aa_edu_quiz_questions'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('grant select, insert, update, delete on public.%I to authenticated', t);
      execute format('drop policy if exists aa_admin_all on public.%I', t);
      execute format('create policy aa_admin_all on public.%I for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin())', t);
    end if;
  end loop;
end $$;

-- ---------- 5) قيود وإعدادات ----------
-- فك أي قيد (check) على طول وصف المدرس (الوصف الطويل كان بيفشل الحفظ)
do $$
declare c record;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.aa_edu_teachers'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%bio%' loop
    execute format('alter table public.aa_edu_teachers drop constraint %I', c.conname);
  end loop;
end $$;

-- حد التسجيل (غيّره من Table Editor → aa_edu_settings → signup_limit)
create table if not exists public.aa_edu_settings(key text primary key, value text not null);
alter table public.aa_edu_settings enable row level security;
revoke all on public.aa_edu_settings from anon, authenticated;
insert into public.aa_edu_settings(key, value) values ('signup_limit', '150') on conflict (key) do nothing;

notify pgrst, 'reload schema';

-- للتأكد: لازم الأرقام دي كلها 0
select
  (select count(*) from public.aa_edu_subjects where coalesce(slug, '') = '') as subjects_without_slug,
  (select count(*) from public.aa_edu_lessons  where coalesce(slug, '') = '') as lessons_without_slug,
  (select count(*) from public.aa_edu_teachers where coalesce(slug, '') = '') as teachers_without_slug;
