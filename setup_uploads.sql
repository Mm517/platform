-- شغّله مرة واحدة في Supabase SQL Editor (بعد setup_staff.sql): رفع الملفات والصور والفيديوهات + الاختبارات
insert into storage.buckets(id,name,public) values('academy','academy',true) on conflict(id) do update set public=true;
drop policy if exists academy_ins on storage.objects;
create policy academy_ins on storage.objects for insert to authenticated with check(bucket_id='academy' and public.edu_role() is not null);
drop policy if exists academy_del on storage.objects;
create policy academy_del on storage.objects for delete to authenticated using(bucket_id='academy' and public.edu_role() is not null);

create table if not exists edu_quizzes(id serial primary key,course_id int not null references edu_courses(id) on delete cascade,title text not null,created_at timestamptz default now());
create table if not exists edu_quiz_questions(id serial primary key,quiz_id int not null references edu_quizzes(id) on delete cascade,q text not null,options jsonb not null,answer int not null,sort int default 0);
create table if not exists edu_quiz_attempts(id serial primary key,user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,quiz_id int not null references edu_quizzes(id) on delete cascade,score int not null,total int not null,created_at timestamptz default now());
alter table edu_quizzes enable row level security;alter table edu_quiz_questions enable row level security;alter table edu_quiz_attempts enable row level security;
drop policy if exists qz_read on edu_quizzes;create policy qz_read on edu_quizzes for select using(true);
drop policy if exists qz_w on edu_quizzes;create policy qz_w on edu_quizzes for all to authenticated using(edu_can_course(course_id)) with check(edu_can_course(course_id));
drop policy if exists qq_read on edu_quiz_questions;create policy qq_read on edu_quiz_questions for select using(true);
drop policy if exists qq_w on edu_quiz_questions;create policy qq_w on edu_quiz_questions for all to authenticated using(exists(select 1 from edu_quizzes z where z.id=quiz_id and edu_can_course(z.course_id))) with check(exists(select 1 from edu_quizzes z where z.id=quiz_id and edu_can_course(z.course_id)));
drop policy if exists qa_own on edu_quiz_attempts;create policy qa_own on edu_quiz_attempts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
