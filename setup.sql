-- جداول الصفحات الجديدة (نفّذه مرة واحدة في Supabase SQL Editor)
create table if not exists edu_books(id serial primary key,title text not null,subject text,url text,cover text,created_at timestamptz default now());
create table if not exists edu_updates(id serial primary key,title text not null,body text,created_at timestamptz default now());
create table if not exists edu_support(id serial primary key,user_id uuid,subject text,body text not null,created_at timestamptz default now());
alter table edu_books enable row level security;alter table edu_updates enable row level security;alter table edu_support enable row level security;
create policy "read books" on edu_books for select using(true);
create policy "read updates" on edu_updates for select using(true);
create policy "send support" on edu_support for insert to authenticated with check(auth.uid()=user_id);
