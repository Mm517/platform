-- شغّله مرة واحدة في Supabase SQL Editor (بعد setup_staff.sql و setup.sql)
-- يفعّل: دخول الأدمن بإيميل وباسورد + صندوق رسائل الدعم للأدمن + تعيين الصلاحيات من لوحة الإدارة

-- 1) إلغاء "كود الأدمن" القديم (أي حد يعرف الكود كان يقدر يبقى أدمن) - الأدمن بقى بالإيميل والباسورد فقط
drop function if exists edu_claim_admin(text);

-- 2) رسائل الدعم: الأدمن يقدر يحذفها (القراءة عبر الدالة تحت)
alter table edu_support enable row level security;
drop policy if exists support_admin_del on edu_support;
create policy support_admin_del on edu_support for delete to authenticated using(edu_role()='admin');

create or replace function edu_admin_support() returns table(id int,subject text,body text,created_at timestamptz,name text,phone text,email text)
language sql stable security definer set search_path=public as $$
 select s.id,s.subject,s.body,s.created_at,p.name,p.phone,u.email::text
 from edu_support s left join edu_profiles p on p.id=s.user_id left join auth.users u on u.id=s.user_id
 where edu_role()='admin' order by s.created_at desc limit 300
$$;

-- 3) قائمة الفريق (أدمن/مدرسين) للأدمن فقط
create or replace function edu_staff_list() returns table(user_id uuid,role text,teacher_id int,email text,name text,phone text)
language sql stable security definer set search_path=public as $$
 select s.user_id,s.role,s.teacher_id,u.email::text,p.name,p.phone
 from edu_staff s join auth.users u on u.id=s.user_id left join edu_profiles p on p.id=s.user_id
 where edu_role()='admin' order by s.role,s.created_at
$$;

-- 4) تعيين / تعديل صلاحية حساب (برقم الموبايل أو الإيميل) - للأدمن فقط
create or replace function edu_set_staff(p_ident text,p_role text default 'teacher',p_teacher int default null) returns text
language plpgsql security definer set search_path=public as $$
declare uid uuid; k text:=trim(coalesce(p_ident,''));
begin
 if edu_role() is distinct from 'admin' then return 'غير مسموح — للأدمن فقط'; end if;
 if p_role not in('admin','teacher') then return 'صلاحية غير صحيحة'; end if;
 if k like '%@%' then select id into uid from auth.users where lower(email)=lower(k);
 else k:=regexp_replace(k,'\D','','g'); if k like '20%' and length(k)=12 then k:='0'||substr(k,3); end if;
  select id into uid from auth.users where email='u'||k||'@academy-users.com'; end if;
 if uid is null then return 'لا يوجد حساب بهذا الرقم/الإيميل — لازم يسجّل حساب أولًا'; end if;
 if p_role='teacher' and p_teacher is null then return 'اختر المدرس المرتبط بالحساب'; end if;
 if uid=auth.uid() and p_role<>'admin' then return 'لا يمكنك سحب صلاحية الأدمن من نفسك'; end if;
 insert into edu_staff(user_id,role,teacher_id) values(uid,p_role,case when p_role='teacher' then p_teacher end)
 on conflict(user_id) do update set role=excluded.role,teacher_id=excluded.teacher_id;
 return 'تم';
end$$;

create or replace function edu_remove_staff(p_user uuid) returns text
language plpgsql security definer set search_path=public as $$
begin
 if edu_role() is distinct from 'admin' then return 'غير مسموح — للأدمن فقط'; end if;
 if p_user=auth.uid() then return 'لا يمكنك إزالة صلاحيتك أنت'; end if;
 delete from edu_staff where user_id=p_user; return 'تم';
end$$;

-- 5) نفس دالة edu_make_staff القديمة لكن تقبل إيميل أيضًا (للتشغيل من SQL Editor فقط)
create or replace function edu_make_staff(p_phone text,p_role text default 'teacher',p_teacher int default null) returns text
language plpgsql security definer set search_path=public as $$
declare uid uuid;
begin
 if p_phone like '%@%' then select id into uid from auth.users where lower(email)=lower(trim(p_phone));
 else select id into uid from auth.users where email='u'||p_phone||'@academy-users.com'; end if;
 if uid is null then return 'لا يوجد حساب بهذا الرقم/الإيميل — أنشئ الحساب أولًا'; end if;
 insert into edu_staff(user_id,role,teacher_id) values(uid,p_role,p_teacher)
 on conflict(user_id) do update set role=excluded.role,teacher_id=excluded.teacher_id;
 return 'تم';
end$$;

-- صلاحيات التنفيذ
revoke all on function edu_make_staff(text,text,int) from public,anon,authenticated;
revoke all on function edu_admin_support(),edu_staff_list(),edu_remove_staff(uuid),edu_set_staff(text,text,int) from public,anon;
grant execute on function edu_admin_support(),edu_staff_list(),edu_remove_staff(uuid),edu_set_staff(text,text,int) to authenticated;

-- ===== أول أدمن (مرة واحدة) =====
-- أ) من Supabase: Authentication → Users → Add user → Create new user
--    اكتب الإيميل والباسورد وفعّل "Auto Confirm User".
-- ب) ثم شغّل (بدّل الإيميل):
-- select edu_make_staff('admin@example.com','admin');
-- ج) ادخل من صفحة تسجيل الدخول بنفس الإيميل والباسورد، وهتلاقي "لوحة الإدارة" في القائمة وفي البروفايل.
