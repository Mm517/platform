-- ============================================================
--  setup_v14.sql — إصلاح صفحة الدعم («تعذر التحميل، حدّث الصفحة»)
--  السبب: جدول aa_edu_tickets ناقص أعمدة rating / rating_note / closed_at
--  (كانت في setup_v9 على اسم الجدول القديم edu_tickets قبل ما يتغير الاسم)
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو اتشغّل أكتر من مرة، ومش بيمسح أي بيانات)
-- ============================================================

alter table public.aa_edu_tickets add column if not exists rating smallint check (rating between 1 and 5);
alter table public.aa_edu_tickets add column if not exists rating_note text;
alter table public.aa_edu_tickets add column if not exists closed_at timestamptz;

-- وقت الإغلاق تلقائي (وإعادة الفتح بتمسحه)
create or replace function public.aa_edu_ticket_closed_at() returns trigger language plpgsql as $$
begin
  if new.status = 'closed' and old.status is distinct from 'closed' then new.closed_at := now();
  elsif new.status <> 'closed' then new.closed_at := null; end if;
  return new;
end $$;
drop trigger if exists aa_edu_ticket_closed_t on public.aa_edu_tickets;
create trigger aa_edu_ticket_closed_t before update on public.aa_edu_tickets
  for each row execute function public.aa_edu_ticket_closed_at();

-- حد أقصى 5 تذاكر مفتوحة للطالب (منع الإزعاج)
create or replace function public.aa_edu_ticket_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.aa_edu_tickets where user_id = new.user_id and status <> 'closed') >= 5 then
    raise exception 'عندك 5 تذاكر مفتوحة. انتظر الرد عليها أو أغلق ما انتهى.';
  end if;
  return new;
end $$;
drop trigger if exists aa_edu_ticket_limit_t on public.aa_edu_tickets;
create trigger aa_edu_ticket_limit_t before insert on public.aa_edu_tickets
  for each row execute function public.aa_edu_ticket_limit();

notify pgrst, 'reload schema';
