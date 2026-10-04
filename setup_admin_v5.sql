-- شغّله مرة واحدة في Supabase SQL Editor (بعد باقي ملفات setup): حظر المستخدمين + قائمة المستخدمين + قائمة الانتظار + ملخصات + الدروس للأدمن فقط
alter table edu_profiles add column if not exists banned boolean not null default false;
alter table edu_profiles add column if not exists ban_reason text;
alter table edu_courses add column if not exists sort int default 0;
alter table edu_teachers add column if not exists image text;

-- السماح بنوع "ملخص" في الملفات (يحذف أي قيد قديم على العمود kind)
do $$ declare r record; begin
 for r in select conname from pg_constraint where conrelid='edu_course_files'::regclass and contype='c' and pg_get_constraintdef(oid) ilike '%kind%' loop
  execute format('alter table edu_course_files drop constraint %I',r.conname); end loop; end $$;

-- الدروس: الأدمن فقط يضيف/يعدّل/يحذف
drop policy if exists staff_lessons_w on edu_lessons;
create policy staff_lessons_w on edu_lessons for all to authenticated using(edu_role()='admin') with check(edu_role()='admin');

create or replace function edu_is_banned() returns boolean language sql stable security definer set search_path=public as $$select coalesce((select banned from edu_profiles where id=auth.uid()),false)$$;

-- قائمة المستخدمين (للأدمن فقط)
create or replace function edu_admin_users() returns table(id uuid,name text,phone text,points int,banned boolean,ban_reason text,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select p.id,p.name,p.phone,p.points,p.banned,p.ban_reason,u.created_at from edu_profiles p left join auth.users u on u.id=p.id
 where edu_role()='admin' order by u.created_at desc nulls last limit 2000
$$;

-- حظر / فك حظر (للأدمن فقط، ولا يمكن حظر أدمن أو مدرس)
create or replace function edu_set_ban(p_user uuid,p_ban boolean,p_reason text default null) returns text
language plpgsql security definer set search_path=public as $$
begin
 if edu_role() is distinct from 'admin' then return 'غير مسموح — للأدمن فقط'; end if;
 if p_user=auth.uid() then return 'لا يمكنك حظر نفسك'; end if;
 if exists(select 1 from edu_staff where user_id=p_user) then return 'لا يمكن حظر أدمن أو مدرس — أزل صلاحيته أولًا'; end if;
 update edu_profiles set banned=p_ban,ban_reason=case when p_ban then nullif(trim(p_reason),'') end where id=p_user;
 return 'تم';
end$$;

-- قائمة الانتظار (للأدمن فقط) بدل كود الأدمن القديم
create or replace function edu_admin_wait_list() returns table(id int,phone text,created_at timestamptz)
language sql stable security definer set search_path=public as $$ select w.id::int,w.phone::text,w.created_at from edu_waitlist w where edu_role()='admin' order by w.created_at desc $$;
create or replace function edu_admin_wait_delete(p_id int) returns text language plpgsql security definer set search_path=public as $$
begin if edu_role() is distinct from 'admin' then return 'غير مسموح'; end if; delete from edu_waitlist where id=p_id; return 'تم'; end$$;

-- المحظور لا يقدر يكتب (يرسل دعم / يقيّم / يسأل / يشترك / يختبر)
do $$ declare t text; begin
 foreach t in array array['edu_support','edu_quiz_attempts','edu_enrollments','edu_questions','edu_reviews'] loop
  if to_regclass(t) is not null then
   execute format('drop policy if exists no_banned on %I',t);
   execute format('create policy no_banned on %I as restrictive for insert to authenticated with check(not edu_is_banned())',t);
  end if; end loop; end $$;

revoke all on function edu_admin_users(),edu_set_ban(uuid,boolean,text),edu_admin_wait_list(),edu_admin_wait_delete(int) from public,anon;
grant execute on function edu_admin_users(),edu_set_ban(uuid,boolean,text),edu_admin_wait_list(),edu_admin_wait_delete(int),edu_is_banned() to authenticated;

-- ===== أول أدمن (مرة واحدة) =====
-- 1) سجّل حساب عادي من الموقع برقم موبايلك وكلمة سر  2) شغّل (بدّل الرقم):
-- select edu_make_staff('01XXXXXXXXX','admin');
