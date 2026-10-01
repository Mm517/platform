-- شغّله مرة واحدة في Supabase SQL Editor: صلاحيات المدرسين/الإدارة + الإعلانات + الاشتراكات
create table if not exists edu_staff(user_id uuid primary key references auth.users(id) on delete cascade,role text not null check(role in('admin','teacher')),teacher_id int references edu_teachers(id) on delete set null,created_at timestamptz default now());
create table if not exists edu_ads(id serial primary key,title text,image text,link text,sort int default 0,active boolean default true,created_at timestamptz default now());
create table if not exists edu_enrollments(user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,course_id int not null references edu_courses(id) on delete cascade,created_at timestamptz default now(),primary key(user_id,course_id));
alter table edu_staff enable row level security;alter table edu_ads enable row level security;alter table edu_enrollments enable row level security;
create or replace function edu_role() returns text language sql stable security definer set search_path=public as $$select role from edu_staff where user_id=auth.uid()$$;
create or replace function edu_my_teacher() returns int language sql stable security definer set search_path=public as $$select teacher_id from edu_staff where user_id=auth.uid()$$;
create or replace function edu_can_course(cid int) returns boolean language sql stable security definer set search_path=public as $$select coalesce(edu_role()='admin' or exists(select 1 from edu_courses where id=cid and teacher_id=edu_my_teacher()),false)$$;
drop policy if exists staff_self on edu_staff;create policy staff_self on edu_staff for select to authenticated using(user_id=auth.uid());
drop policy if exists ads_read on edu_ads;create policy ads_read on edu_ads for select using(true);
drop policy if exists ads_admin on edu_ads;create policy ads_admin on edu_ads for all to authenticated using(edu_role()='admin') with check(edu_role()='admin');
drop policy if exists enr_own on edu_enrollments;create policy enr_own on edu_enrollments for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists log_own on edu_points_log;create policy log_own on edu_points_log for select to authenticated using(user_id=auth.uid());
drop policy if exists staff_lessons_w on edu_lessons;create policy staff_lessons_w on edu_lessons for all to authenticated using(edu_role() is not null) with check(edu_role() is not null);
drop policy if exists staff_courses_w on edu_courses;create policy staff_courses_w on edu_courses for all to authenticated using(edu_can_course(id)) with check(edu_role()='admin' or teacher_id=edu_my_teacher());
drop policy if exists staff_files_w on edu_course_files;create policy staff_files_w on edu_course_files for all to authenticated using(edu_can_course(course_id)) with check(edu_can_course(course_id));
drop policy if exists staff_sols_w on edu_course_solutions;create policy staff_sols_w on edu_course_solutions for all to authenticated using(edu_can_course(course_id)) with check(edu_can_course(course_id));
drop policy if exists staff_teachers_w on edu_teachers;create policy staff_teachers_w on edu_teachers for all to authenticated using(edu_role()='admin') with check(edu_role()='admin');
drop policy if exists staff_updates_w on edu_updates;create policy staff_updates_w on edu_updates for all to authenticated using(edu_role()='admin') with check(edu_role()='admin');
drop policy if exists staff_books_w on edu_books;create policy staff_books_w on edu_books for all to authenticated using(edu_role()='admin') with check(edu_role()='admin');
-- دالة لمنح الصلاحية (تُشغَّل من SQL Editor فقط)
create or replace function edu_make_staff(p_phone text,p_role text default 'teacher',p_teacher int default null) returns text language plpgsql security definer set search_path=public as $$
declare uid uuid;begin select id into uid from auth.users where email='u'||p_phone||'@academy-users.com';
if uid is null then return 'لا يوجد حساب بهذا الرقم - سجّل الحساب من الموقع أولًا';end if;
insert into edu_staff(user_id,role,teacher_id) values(uid,p_role,p_teacher) on conflict(user_id) do update set role=excluded.role,teacher_id=excluded.teacher_id;return 'تم';end$$;
revoke all on function edu_make_staff(text,text,int) from public,anon,authenticated;
-- أمثلة (بدّل الرقم):
-- select edu_make_staff('01XXXXXXXXX','admin');
-- select edu_make_staff('01XXXXXXXXX','teacher',1);  -- 1 = رقم المدرس في edu_teachers
