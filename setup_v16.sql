-- v16: تصليح عدد الطلاب (الخارجي 22 مقابل الأدمن 9) + عدّاد الأدمن
-- السبب: 13 حساب دخول اتعمل من غير صف في aa_edu_profiles (والأدمن بيعرض الصفوف دي بس).
-- ✅ الملف ده اتطبّق فعلًا على المشروع — محفوظ هنا للتوثيق ولو احتجت تعيد تشغيله (آمن: مفيش فيه حذف ولا تعديل لبيانات موجودة).

-- 1) تريجر يعمل بروفايل الطالب تلقائيًا من السيرفر (حسابات @academy-users.com بس)
create or replace function public.aa_edu_profile_on_signup() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  begin
    insert into public.aa_edu_profiles(id, name, phone, grade)
    values (
      new.id,
      coalesce(nullif(btrim(new.raw_user_meta_data->>'name'), ''), 'طالب'),
      coalesce(nullif(btrim(new.raw_user_meta_data->>'phone'), ''), regexp_replace(split_part(new.email, '@', 1), '^u', '')),
      'prep3')
    on conflict (id) do nothing;
  exception when others then
    null;
  end;
  return new;
end $$;

drop trigger if exists aa_edu_profile_on_signup_t on auth.users;
create trigger aa_edu_profile_on_signup_t after insert on auth.users
  for each row when (new.email like '%@academy-users.com')
  execute function public.aa_edu_profile_on_signup();

-- 2) إنشاء البروفايلات الناقصة للحسابات الموجودة (إضافة فقط)
insert into public.aa_edu_profiles(id, name, phone, grade)
select u.id,
       coalesce(nullif(btrim(u.raw_user_meta_data->>'name'), ''), 'طالب'),
       coalesce(nullif(btrim(u.raw_user_meta_data->>'phone'), ''), regexp_replace(split_part(u.email, '@', 1), '^u', '')),
       'prep3'
from auth.users u
where u.email like '%@academy-users.com'
  and not exists (select 1 from public.aa_edu_profiles p where p.id = u.id)
on conflict (id) do nothing;

-- 3) عدّاد الأدمن في طلب واحد (الأدمن بس)
create or replace function public.aa_edu_cnt(t text, w text default '') returns bigint
language plpgsql stable security definer set search_path = public as $$
declare n bigint;
begin
  if to_regclass('public.' || t) is null then return null; end if;
  execute format('select count(*) from public.%I %s', t, w) into n;
  return n;
exception when others then return null;
end $$;
revoke all on function public.aa_edu_cnt(text, text) from public, anon, authenticated;

create or replace function public.edu_admin_counts() returns json
language sql stable security definer set search_path = public, auth as $$
  select case when public.edu_role() = 'admin' then json_build_object(
    'users',     (select count(*) from auth.users where email like '%@academy-users.com'),
    'courses',   public.aa_edu_cnt('aa_edu_courses'),
    'lessons',   public.aa_edu_cnt('aa_edu_lessons'),
    'teachers',  public.aa_edu_cnt('aa_edu_teachers'),
    'tickets',   public.aa_edu_cnt('aa_edu_tickets', 'where status = ''open'''),
    'questions', public.aa_edu_cnt('aa_edu_questions', 'where answer is null'),
    'apps',      public.aa_edu_cnt('aa_edu_applications', 'where status = ''pending''')
  ) end
$$;
revoke all on function public.edu_admin_counts() from public, anon;
grant execute on function public.edu_admin_counts() to authenticated;

notify pgrst, 'reload schema';
