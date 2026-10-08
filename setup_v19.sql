-- ============================================================
--  setup_v19.sql — قسم المجتمع: لايف + شات + غرفة صوتية + أدوات الإدارة
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو شغّلته أكتر من مرة).
--  لازم يكون setup_v13.sql (دالة edu_is_admin) متشغّل قبله.
--  ⚠ لو متشغّلش: الموقع هيشتغل عادي وقسم المجتمع هيظهر "قريبًا".
-- ============================================================

-- ---------- 1) إعدادات القسم (صف واحد) ----------
create table if not exists public.aa_edu_comm_settings(
  id           int primary key default 1 check (id = 1),
  chat_locked  boolean not null default false,          -- قفل الشات (الأدمن بس يكتب)
  voice_open   boolean not null default true,           -- فتح/قفل الغرفة الصوتية
  live_on      boolean not null default false,          -- في لايف شغّال دلوقتي؟
  live_title   text    not null default '',
  live_url     text    not null default '',             -- رابط لايف يوتيوب
  max_speakers int     not null default 6 check (max_speakers between 1 and 12),
  updated_at   timestamptz not null default now()
);
insert into public.aa_edu_comm_settings(id) values (1) on conflict do nothing;

-- ---------- 2) الكتم / الحظر / الطرد ----------
create table if not exists public.aa_edu_comm_restrict(
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text,
  kind       text not null check (kind in ('mute','ban','kick')),
  until      timestamptz,                                -- null = دائم
  reason     text,
  created_at timestamptz not null default now()
);

-- ---------- 3) رسائل الشات ----------
create table if not exists public.aa_edu_comm_msgs(
  id         bigint generated always as identity primary key,
  user_id    uuid    not null references auth.users(id) on delete cascade,
  name       text    not null,
  body       text    not null check (char_length(body) between 1 and 500),
  pinned     boolean not null default false,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists aa_edu_comm_msgs_t on public.aa_edu_comm_msgs(id desc);

-- ---------- 4) أعضاء الغرفة الصوتية ----------
create table if not exists public.aa_edu_voice_members(
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text    not null,
  is_admin    boolean not null default false,
  wants_speak boolean not null default false,            -- رافع إيده (طلب تحدّث)
  can_speak   boolean not null default false,            -- الأدمن وافق يتكلم
  muted       boolean not null default false,            -- الأدمن كاتمه
  joined_at   timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

-- ---------- 5) إشارات WebRTC (التوقيع) — الـ from_user بيتتحقق منه بالـ RLS فمينفعش يتزوّر ----------
create table if not exists public.aa_edu_voice_sig(
  id         bigint generated always as identity primary key,
  from_user  uuid not null default auth.uid(),
  to_user    uuid not null,
  sid        text not null,
  kind       text not null check (kind in ('offer','answer','cand')),
  side       text not null check (side in ('out','in')),
  payload    text not null check (char_length(payload) <= 12000),
  created_at timestamptz not null default now()
);
create index if not exists aa_edu_voice_sig_to on public.aa_edu_voice_sig(to_user, id);

-- ---------- 6) الصلاحيات (RLS) ----------
do $$
declare t text;
begin
  foreach t in array array['aa_edu_comm_settings','aa_edu_comm_restrict','aa_edu_comm_msgs','aa_edu_voice_members','aa_edu_voice_sig'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

drop policy if exists comm_admin_all on public.aa_edu_comm_settings;
create policy comm_admin_all on public.aa_edu_comm_settings for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists comm_read on public.aa_edu_comm_settings;
create policy comm_read on public.aa_edu_comm_settings for select to authenticated using (true);

drop policy if exists comm_admin_all on public.aa_edu_comm_restrict;
create policy comm_admin_all on public.aa_edu_comm_restrict for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists comm_own on public.aa_edu_comm_restrict;
create policy comm_own on public.aa_edu_comm_restrict for select to authenticated using (user_id = auth.uid());

drop policy if exists comm_admin_all on public.aa_edu_comm_msgs;
create policy comm_admin_all on public.aa_edu_comm_msgs for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists comm_read on public.aa_edu_comm_msgs;
create policy comm_read on public.aa_edu_comm_msgs for select to authenticated using (true);

drop policy if exists comm_admin_all on public.aa_edu_voice_members;
create policy comm_admin_all on public.aa_edu_voice_members for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists comm_read on public.aa_edu_voice_members;
create policy comm_read on public.aa_edu_voice_members for select to authenticated using (true);

drop policy if exists sig_read on public.aa_edu_voice_sig;
create policy sig_read on public.aa_edu_voice_sig for select to authenticated using (to_user = auth.uid());
drop policy if exists sig_write on public.aa_edu_voice_sig;
create policy sig_write on public.aa_edu_voice_sig for insert to authenticated
  with check (from_user = auth.uid()
              and exists (select 1 from public.aa_edu_voice_members m
                          where m.user_id = auth.uid() and m.last_seen > now() - interval '3 minutes'));

-- ---------- 7) دوال مساعدة ----------
-- نوع القيد الشغّال على الطالب دلوقتي (ban / kick / mute) أو null
create or replace function public.aa_edu_comm_block(uid uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare k text;
begin
  if exists (select 1 from public.aa_edu_profiles where id = uid and coalesce(banned, false)) then return 'ban'; end if;
  select kind into k from public.aa_edu_comm_restrict where user_id = uid and (until is null or until > now());
  return k;
end $$;

create or replace function public.aa_edu_comm_name(uid uuid) returns text
language sql stable security definer set search_path = public as $$
  select split_part(btrim(coalesce(nullif(name, ''), 'طالب')), ' ', 1) from public.aa_edu_profiles where id = uid $$;

-- ---------- 8) الشات ----------
create or replace function public.comm_send(p_body text) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); b text := btrim(coalesce(p_body, '')); adm boolean; blk text; s record; last_t timestamptz; nid bigint;
begin
  if uid is null then raise exception 'auth'; end if;
  if b = '' or char_length(b) > 500 then raise exception 'bad_body'; end if;
  adm := public.edu_is_admin();
  select * into s from public.aa_edu_comm_settings where id = 1;
  if not adm then
    blk := public.aa_edu_comm_block(uid);
    if blk is not null then raise exception 'blocked_%', blk; end if;
    if s.chat_locked then raise exception 'locked'; end if;
    select max(created_at) into last_t from public.aa_edu_comm_msgs where user_id = uid;
    if last_t is not null and last_t > now() - interval '1500 milliseconds' then raise exception 'slow'; end if;
  end if;
  insert into public.aa_edu_comm_msgs(user_id, name, body, is_admin)
  values (uid, case when adm then 'الإدارة' else coalesce(public.aa_edu_comm_name(uid), 'طالب') end, b, adm)
  returning id into nid;
  return json_build_object('id', nid);
end $$;

-- ---------- 9) ملخص للشاشة الرئيسية ----------
create or replace function public.comm_summary() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'live_on',     (select live_on from public.aa_edu_comm_settings where id = 1),
    'live_title',  (select live_title from public.aa_edu_comm_settings where id = 1),
    'voice_open',  (select voice_open from public.aa_edu_comm_settings where id = 1),
    'chat_locked', (select chat_locked from public.aa_edu_comm_settings where id = 1),
    'voice_count', (select count(*) from public.aa_edu_voice_members where last_seen > now() - interval '120 seconds'),
    'last', coalesce((select json_agg(x order by x.id desc) from (
              select id, name, left(body, 80) as body, created_at
              from public.aa_edu_comm_msgs order by id desc limit 2) x), '[]'::json)
  ) $$;

-- ---------- 10) الغرفة الصوتية ----------
create or replace function public.aa_edu_voice_view() returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'settings', (select json_build_object('voice_open', voice_open, 'max_speakers', max_speakers) from public.aa_edu_comm_settings where id = 1),
    'members',  coalesce((select json_agg(json_build_object(
                    'id', user_id, 'name', name, 'admin', is_admin, 'want', wants_speak,
                    'can', (can_speak or is_admin) and not muted, 'muted', muted and not is_admin)
                  order by is_admin desc, can_speak desc, joined_at)
                  from public.aa_edu_voice_members where last_seen > now() - interval '120 seconds'), '[]'::json)
  ) $$;

create or replace function public.voice_join() returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); adm boolean; blk text; s record;
begin
  if uid is null then raise exception 'auth'; end if;
  adm := public.edu_is_admin();
  select * into s from public.aa_edu_comm_settings where id = 1;
  if not adm then
    if not s.voice_open then raise exception 'closed'; end if;
    blk := public.aa_edu_comm_block(uid);
    if blk in ('ban', 'kick') then raise exception 'blocked_%', blk; end if;
  end if;
  delete from public.aa_edu_voice_sig where created_at < now() - interval '5 minutes';
  delete from public.aa_edu_voice_members where last_seen < now() - interval '10 minutes';
  insert into public.aa_edu_voice_members(user_id, name, is_admin, can_speak)
  values (uid, case when adm then 'الإدارة' else coalesce(public.aa_edu_comm_name(uid), 'طالب') end, adm, adm)
  on conflict (user_id) do update set last_seen = now(), is_admin = excluded.is_admin, name = excluded.name;
  return public.aa_edu_voice_view();
end $$;

create or replace function public.voice_ping() returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); adm boolean; blk text; s record;
begin
  if uid is null then raise exception 'auth'; end if;
  adm := public.edu_is_admin();
  select * into s from public.aa_edu_comm_settings where id = 1;
  if not adm then
    blk := public.aa_edu_comm_block(uid);
    if blk in ('ban', 'kick') then
      delete from public.aa_edu_voice_members where user_id = uid;
      raise exception 'blocked_%', blk;
    end if;
    if not s.voice_open then delete from public.aa_edu_voice_members where user_id = uid; raise exception 'closed'; end if;
  end if;
  update public.aa_edu_voice_members set last_seen = now() where user_id = uid;
  if not found then raise exception 'not_member'; end if;
  return public.aa_edu_voice_view();
end $$;

create or replace function public.voice_leave() returns void
language sql security definer set search_path = public as $$
  delete from public.aa_edu_voice_members where user_id = auth.uid() $$;

-- رفع/إنزال الإيد (طلب تحدّث). p_up=false بينزّل الإيد وبيخرّج الطالب من المنصة لو كان بيتكلم.
create or replace function public.voice_hand(p_up boolean) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if p_up and public.aa_edu_comm_block(uid) = 'mute' then raise exception 'blocked_mute'; end if;
  if p_up then
    update public.aa_edu_voice_members set wants_speak = true where user_id = uid and not is_admin;
  else
    update public.aa_edu_voice_members set wants_speak = false, can_speak = false where user_id = uid and not is_admin;
  end if;
end $$;

-- أوامر الأدمن على عضو في الغرفة: accept / deny / revoke / mute / unmute / kick / ban
create or replace function public.voice_admin(p_user uuid, p_act text, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
declare m record; n int; mx int;
begin
  if not public.edu_is_admin() then raise exception 'forbidden'; end if;
  select * into m from public.aa_edu_voice_members where user_id = p_user;
  if p_act in ('kick', 'ban') and m.user_id is null then
    -- مش في الغرفة: ممكن يتحظر برضه
    if p_act = 'kick' then return; end if;
  end if;
  if m.is_admin then raise exception 'target_admin'; end if;
  if p_act = 'accept' then
    if m.user_id is null then raise exception 'gone'; end if;
    if public.aa_edu_comm_block(p_user) = 'mute' then raise exception 'target_muted'; end if;
    select max_speakers into mx from public.aa_edu_comm_settings where id = 1;
    select count(*) into n from public.aa_edu_voice_members
      where can_speak and not is_admin and last_seen > now() - interval '120 seconds';
    if n >= mx and not m.can_speak then raise exception 'speakers_full'; end if;
    update public.aa_edu_voice_members set can_speak = true, wants_speak = false, muted = false where user_id = p_user;
  elsif p_act = 'deny' then
    update public.aa_edu_voice_members set wants_speak = false where user_id = p_user;
  elsif p_act = 'revoke' then
    update public.aa_edu_voice_members set can_speak = false, wants_speak = false, muted = false where user_id = p_user;
  elsif p_act = 'mute' then
    update public.aa_edu_voice_members set muted = true where user_id = p_user;
  elsif p_act = 'unmute' then
    update public.aa_edu_voice_members set muted = false where user_id = p_user;
  elsif p_act = 'kick' then
    insert into public.aa_edu_comm_restrict(user_id, name, kind, until, reason)
    values (p_user, m.name, 'kick', now() + interval '5 minutes', p_reason)
    on conflict (user_id) do update set kind = case when public.aa_edu_comm_restrict.kind = 'ban' then 'ban' else 'kick' end,
      until = case when public.aa_edu_comm_restrict.kind = 'ban' then public.aa_edu_comm_restrict.until else excluded.until end,
      reason = excluded.reason;
    delete from public.aa_edu_voice_members where user_id = p_user;
  elsif p_act = 'ban' then
    insert into public.aa_edu_comm_restrict(user_id, name, kind, until, reason)
    values (p_user, coalesce(m.name, public.aa_edu_comm_name(p_user)), 'ban', null, p_reason)
    on conflict (user_id) do update set kind = 'ban', until = null, reason = excluded.reason;
    delete from public.aa_edu_voice_members where user_id = p_user;
  else
    raise exception 'bad_act';
  end if;
end $$;

-- ---------- 11) أوامر الإدارة العامة ----------
-- delete / pin / unpin / clear | mute / ban / unrestrict | lock / unlock | voice_open / voice_close
-- mute_all / unmute_all (الغرفة الصوتية) | live (p_text=الرابط، p_reason=العنوان) / live_off | max_speakers (p_minutes=العدد)
create or replace function public.comm_admin(p_act text, p_user uuid default null, p_minutes int default null,
                                             p_reason text default null, p_id bigint default null, p_text text default null) returns void
language plpgsql security definer set search_path = public as $$
declare nm text; u text;
begin
  if not public.edu_is_admin() then raise exception 'forbidden'; end if;
  if p_act = 'delete' then
    delete from public.aa_edu_comm_msgs where id = p_id;
  elsif p_act = 'pin' then
    update public.aa_edu_comm_msgs set pinned = false where pinned;
    update public.aa_edu_comm_msgs set pinned = true where id = p_id;
  elsif p_act = 'unpin' then
    update public.aa_edu_comm_msgs set pinned = false where id = p_id;
  elsif p_act = 'clear' then
    delete from public.aa_edu_comm_msgs;
  elsif p_act in ('mute', 'ban') then
    if p_user is null then raise exception 'bad_user'; end if;
    if exists (select 1 from public.aa_edu_staff where user_id = p_user and role = 'admin') then raise exception 'target_admin'; end if;
    nm := public.aa_edu_comm_name(p_user);
    insert into public.aa_edu_comm_restrict(user_id, name, kind, until, reason)
    values (p_user, nm, p_act, case when coalesce(p_minutes, 0) > 0 then now() + make_interval(mins => p_minutes) end, p_reason)
    on conflict (user_id) do update set kind = excluded.kind, until = excluded.until, reason = excluded.reason, name = excluded.name, created_at = now();
    if p_act = 'ban' then
      delete from public.aa_edu_voice_members where user_id = p_user;
    else
      update public.aa_edu_voice_members set can_speak = false, wants_speak = false where user_id = p_user;
    end if;
  elsif p_act = 'unrestrict' then
    delete from public.aa_edu_comm_restrict where user_id = p_user;
  elsif p_act = 'lock' then
    update public.aa_edu_comm_settings set chat_locked = true, updated_at = now() where id = 1;
  elsif p_act = 'unlock' then
    update public.aa_edu_comm_settings set chat_locked = false, updated_at = now() where id = 1;
  elsif p_act = 'voice_open' then
    update public.aa_edu_comm_settings set voice_open = true, updated_at = now() where id = 1;
  elsif p_act = 'voice_close' then
    update public.aa_edu_comm_settings set voice_open = false, updated_at = now() where id = 1;
    delete from public.aa_edu_voice_members where not is_admin;
  elsif p_act = 'mute_all' then
    update public.aa_edu_voice_members set muted = true where not is_admin and can_speak;
  elsif p_act = 'unmute_all' then
    update public.aa_edu_voice_members set muted = false where not is_admin;
  elsif p_act = 'max_speakers' then
    update public.aa_edu_comm_settings set max_speakers = greatest(1, least(12, coalesce(p_minutes, 6))), updated_at = now() where id = 1;
  elsif p_act = 'live' then
    u := btrim(coalesce(p_text, ''));
    if u !~ '^https://(www\.|m\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)/' then raise exception 'bad_url'; end if;
    update public.aa_edu_comm_settings set live_on = true, live_url = u, live_title = left(btrim(coalesce(p_reason, '')), 120), updated_at = now() where id = 1;
  elsif p_act = 'live_off' then
    update public.aa_edu_comm_settings set live_on = false, updated_at = now() where id = 1;
  else
    raise exception 'bad_act';
  end if;
end $$;

-- ---------- 12) صلاحيات تنفيذ الدوال ----------
do $$
declare f text;
begin
  foreach f in array array[
    'comm_send(text)', 'comm_summary()', 'voice_join()', 'voice_ping()', 'voice_leave()', 'voice_hand(boolean)',
    'voice_admin(uuid,text,text)', 'comm_admin(text,uuid,integer,text,bigint,text)', 'aa_edu_voice_view()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
revoke all on function public.aa_edu_comm_block(uuid) from public, anon, authenticated;
revoke all on function public.aa_edu_comm_name(uuid) from public, anon, authenticated;

-- ---------- 13) Realtime ----------
do $$
declare t text;
begin
  foreach t in array array['aa_edu_comm_msgs','aa_edu_comm_settings','aa_edu_comm_restrict','aa_edu_voice_members','aa_edu_voice_sig'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
