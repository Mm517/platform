-- ============================================================
--  setup_v9.sql (محدّث) — جدول التقديمات بالأسماء الجديدة aa_edu_*
--  ✅ اتطبّق فعلًا على المشروع. آمن لو شغّلته تاني.
--  (الـ slug وربط المدرس بالمادة موجودين في setup_v13.sql، وتحسينات الدعم موجودة من قبل)
-- ============================================================

-- ---------- 3) التقديمات ----------
create table if not exists public.aa_edu_applications(
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
create unique index if not exists aa_edu_app_one_active on public.aa_edu_applications(user_id, kind) where status in ('pending','approved');
create index if not exists aa_edu_app_status on public.aa_edu_applications(status, created_at desc);

alter table public.aa_edu_applications enable row level security;
drop policy if exists app_sel on public.aa_edu_applications;
create policy app_sel on public.aa_edu_applications for select to authenticated using (user_id = auth.uid() or public.edu_is_admin());
drop policy if exists app_ins on public.aa_edu_applications;
create policy app_ins on public.aa_edu_applications for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
drop policy if exists app_upd_own on public.aa_edu_applications;
create policy app_upd_own on public.aa_edu_applications for update to authenticated
  using (user_id = auth.uid() and status = 'pending') with check (user_id = auth.uid());
drop policy if exists app_upd_admin on public.aa_edu_applications;
create policy app_upd_admin on public.aa_edu_applications for update to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists app_del_admin on public.aa_edu_applications;
create policy app_del_admin on public.aa_edu_applications for delete to authenticated using (public.edu_is_admin());
grant select, insert, update, delete on public.aa_edu_applications to authenticated;

-- الطالب مايقدرش يغيّر قرار الإدارة ولا الملاحظة؛ وكل تعديل يتسجّل وقته
create or replace function public.aa_edu_app_guard() returns trigger language plpgsql security definer set search_path = public as $$
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
drop trigger if exists aa_edu_app_guard_t on public.aa_edu_applications;
create trigger aa_edu_app_guard_t before update on public.aa_edu_applications for each row execute function public.aa_edu_app_guard();

-- إشعار للطالب لما الإدارة تقبل أو ترفض
create or replace function public.aa_edu_app_notify() returns trigger language plpgsql security definer set search_path = public as $$
declare k text;
begin
  if new.status is distinct from old.status and new.status in ('approved','rejected') then
    k := case new.kind when 'top_student' then 'طالب متفوق' when 'programmer' then 'مبرمج' when 'teacher' then 'مدرس' else 'سبورت' end;
    insert into public.aa_edu_notifications(user_id, title, body, link) values (
      new.user_id,
      case when new.status = 'approved' then 'تم قبول تقديمك كـ ' || k else 'بخصوص تقديمك كـ ' || k end,
      case when new.status = 'approved' then coalesce(nullif(new.admin_note,''), 'مبروك! هنتواصل معاك قريبًا.')
           else coalesce(nullif(new.admin_note,''), 'للأسف لم يتم قبول التقديم هذه المرة. تقدر تقدّم من جديد.') end,
      'profile#apply');
  end if;
  return new;
end $$;
drop trigger if exists aa_edu_app_notify_t on public.aa_edu_applications;
create trigger aa_edu_app_notify_t after update on public.aa_edu_applications for each row execute function public.aa_edu_app_notify();

