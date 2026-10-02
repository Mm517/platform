-- شغّله مرة واحدة في Supabase SQL Editor: كود الأدمن (التحقق يتم داخل قاعدة البيانات، والكود غير مكتوب في ملفات الموقع)
create or replace function edu_claim_admin(p_code text) returns text language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then return 'سجّل الدخول أولًا'; end if;
 if p_code is distinct from '12xpro' then perform pg_sleep(1.5); return 'الكود غير صحيح'; end if;
 insert into edu_staff(user_id,role) values(auth.uid(),'admin') on conflict(user_id) do update set role='admin';
 return 'تم';
end$$;
revoke all on function edu_claim_admin(text) from public,anon;
grant execute on function edu_claim_admin(text) to authenticated;
-- لتغيير الكود لاحقًا: عدّل '12xpro' في الدالة أعلاه وشغّلها من جديد.
