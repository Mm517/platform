-- ============================================================
--  setup_v17.sql — قسم «الفعاليات» (مواجهة 1 ضد 1 في نفس الدرس)
--  شغّله مرة واحدة من Supabase → SQL Editor (آمن لو شغّلته أكتر من مرة، مفيش فيه حذف لبيانات موجودة).
--  ⚠ شغّله قبل رفع الموقع الجديد.
--
--  الفكرة:  الطالب يختار درس عليه فعالية → السيستم يدوّر على طالب تاني في نفس الدرس
--           → 10 دقايق مراجعة (PDF) → امتحان 20 سؤال في 5 دقايق.
--           أول واحد يخلّص: وقت التاني المتبقي بيتقسم على 2.
--           الوقت لو خلص: الإجابات المحفوظة بس هي اللي بتتحسب والباقي = لم يُجب.
--           الأعلى درجة يكسب 50 نقطة (لو التعادل: الأسرع).
--  كل المنطق (الوقت، التصحيح، النقاط) على السيرفر، والإجابات الصح عمرها ما بتوصل للطالب قبل ما المواجهة تخلص.
-- ============================================================

-- ---------- 1) الجداول ----------
create table if not exists public.aa_edu_events(
  lesson_id   bigint primary key references public.aa_edu_lessons(id) on delete cascade,
  active      boolean not null default true,
  pdf_url     text,
  review_secs int not null default 600 check (review_secs between 30 and 3600),
  quiz_secs   int not null default 300 check (quiz_secs between 30 and 3600),
  created_at  timestamptz not null default now()
);

create table if not exists public.aa_edu_event_questions(
  id        bigint generated always as identity primary key,
  lesson_id bigint not null references public.aa_edu_lessons(id) on delete cascade,
  q         text not null check (char_length(q) between 2 and 600),
  options   jsonb not null,
  answer    int  not null check (answer between 0 and 5),
  created_at timestamptz not null default now()
);
create index if not exists aa_edu_evq_lesson on public.aa_edu_event_questions(lesson_id);

create table if not exists public.aa_edu_event_queue(
  user_id   uuid primary key references auth.users(id) on delete cascade,
  lesson_id bigint not null,
  seen      timestamptz not null default now()
);
create index if not exists aa_edu_evqueue_l on public.aa_edu_event_queue(lesson_id, seen);

create table if not exists public.aa_edu_matches(
  id          bigint generated always as identity primary key,
  lesson_id   bigint not null,
  status      text not null default 'review' check (status in ('review','quiz','done')),
  qids        bigint[] not null,
  review_ends timestamptz not null,
  quiz_secs   int not null,
  winner      uuid,
  awarded     boolean not null default false,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists aa_edu_matches_open on public.aa_edu_matches(status) where status <> 'done';

create table if not exists public.aa_edu_match_players(
  match_id    bigint not null references public.aa_edu_matches(id) on delete cascade,
  user_id     uuid   not null references auth.users(id) on delete cascade,
  answers     jsonb  not null default '{}'::jsonb,   -- {"0":2,"1":0,...}  رقم السؤال → رقم الاختيار
  score       int,
  deadline    timestamptz,
  finished_at timestamptz,
  primary key (match_id, user_id)
);
create index if not exists aa_edu_mp_user on public.aa_edu_match_players(user_id, match_id desc);

-- ---------- 2) الصلاحيات: الطالب مفيش له وصول مباشر، كله عن طريق الدوال ----------
alter table public.aa_edu_events          enable row level security;
alter table public.aa_edu_event_questions enable row level security;
alter table public.aa_edu_event_queue     enable row level security;
alter table public.aa_edu_matches         enable row level security;
alter table public.aa_edu_match_players   enable row level security;

revoke all on public.aa_edu_events, public.aa_edu_event_questions, public.aa_edu_event_queue,
              public.aa_edu_matches, public.aa_edu_match_players from anon, authenticated;

drop policy if exists aa_admin_all on public.aa_edu_events;
create policy aa_admin_all on public.aa_edu_events for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists aa_admin_all on public.aa_edu_event_questions;
create policy aa_admin_all on public.aa_edu_event_questions for all to authenticated using (public.edu_is_admin()) with check (public.edu_is_admin());
drop policy if exists aa_admin_sel on public.aa_edu_matches;
create policy aa_admin_sel on public.aa_edu_matches for select to authenticated using (public.edu_is_admin());
drop policy if exists aa_admin_sel on public.aa_edu_match_players;
create policy aa_admin_sel on public.aa_edu_match_players for select to authenticated using (public.edu_is_admin());

grant select, insert, update, delete on public.aa_edu_events, public.aa_edu_event_questions to authenticated;
grant select on public.aa_edu_matches, public.aa_edu_match_players to authenticated;

-- ---------- 3) النقاط (50 للفايز) ----------
-- ⚠ ملف إنشاء aa_edu_points_log / edu_award مش ضمن ملفات الـ SQL المرفوعة، فالدالة دي دفاعية:
--   بتسجّل في السجل لو الأعمدة مطابقة، وبتزوّد points في البروفايل مرة واحدة بس (حتى لو عندك تريجر بيزوّدها).
create or replace function public.aa_edu_event_award(p_user uuid, p_match bigint, p_amount int default 50) returns void
language plpgsql security definer set search_path = public as $$
declare b int; a int;
begin
  select points into b from public.aa_edu_profiles where id = p_user;
  begin
    insert into public.aa_edu_points_log(user_id, reason, ref, amount) values (p_user, 'event', p_match::text, p_amount);
  exception when others then null;
  end;
  select points into a from public.aa_edu_profiles where id = p_user;
  if a is not distinct from b then
    update public.aa_edu_profiles set points = coalesce(points, 0) + p_amount where id = p_user;
  end if;
end $$;
revoke all on function public.aa_edu_event_award(uuid, bigint, int) from public, anon, authenticated;

-- ---------- 4) محرّك المواجهة (بيتنفّذ تلقائيًا مع أي طلب من أي لاعب) ----------
create or replace function public.aa_edu_match_tick(p_match bigint) returns void
language plpgsql security definer set search_path = public as $$
declare m public.aa_edu_matches; r record; sc int; w uuid; n_open int; a record; b record;
begin
  select * into m from public.aa_edu_matches where id = p_match for update;
  if not found or m.status = 'done' then return; end if;

  if m.status = 'review' and now() >= m.review_ends then
    update public.aa_edu_matches set status = 'quiz' where id = m.id;
    update public.aa_edu_match_players set deadline = m.review_ends + make_interval(secs => m.quiz_secs) where match_id = m.id;
    m.status := 'quiz';
  end if;
  if m.status <> 'quiz' then return; end if;

  -- اللي وقته خلص: بنقفل إجاباته المحفوظة لحد دلوقتي
  update public.aa_edu_match_players set finished_at = deadline
   where match_id = m.id and finished_at is null and deadline <= now();

  select count(*) into n_open from public.aa_edu_match_players where match_id = m.id and finished_at is null;
  if n_open > 0 then return; end if;

  -- التصحيح: الإجابة الغلط أو اللي ما اتجاوبتش = صفر
  for r in select * from public.aa_edu_match_players where match_id = m.id loop
    select count(*) into sc
      from unnest(m.qids) with ordinality as t(qid, i)
      join public.aa_edu_event_questions q on q.id = t.qid
     where (r.answers ->> ((t.i - 1)::text)) = q.answer::text;
    update public.aa_edu_match_players set score = sc where match_id = m.id and user_id = r.user_id;
  end loop;

  select * into a from public.aa_edu_match_players where match_id = m.id order by user_id limit 1;
  select * into b from public.aa_edu_match_players where match_id = m.id order by user_id desc limit 1;
  select * into a from public.aa_edu_match_players where match_id = m.id and user_id = a.user_id;
  select * into b from public.aa_edu_match_players where match_id = m.id and user_id = b.user_id;

  w := null;
  if a.user_id <> b.user_id then
    if a.score > b.score then w := a.user_id;
    elsif b.score > a.score then w := b.user_id;
    elsif a.finished_at < b.finished_at then w := a.user_id;      -- تعادل في الدرجة: الأسرع يكسب
    elsif b.finished_at < a.finished_at then w := b.user_id;
    end if;
  end if;

  update public.aa_edu_matches set status = 'done', winner = w, resolved_at = now() where id = m.id;
  -- نقاط الفوز بس لو الفايز جاوب صح على سؤال على الأقل (بيمنع كسب نقاط من مواجهة محدش لعبها)
  if w is not null and not m.awarded and (select score from public.aa_edu_match_players where match_id = m.id and user_id = w) > 0 then
    perform public.aa_edu_event_award(w, m.id, 50);
    update public.aa_edu_matches set awarded = true where id = m.id;
  end if;
end $$;
revoke all on function public.aa_edu_match_tick(bigint) from public, anon, authenticated;

-- ---------- 5) الدوال اللي بيناديها الموقع ----------
-- قايمة الدروس اللي عليها فعاليات (لازم 20 سؤال على الأقل) + كام واحد مستني في كل درس
create or replace function public.edu_event_list() returns json
language plpgsql stable security definer set search_path = public as $$
declare me bigint;
begin
  if auth.uid() is null then return '[]'::json; end if;
  return coalesce((
    select json_agg(json_build_object(
      'lesson_id', e.lesson_id, 'title', l.title, 'subject_id', l.subject_id, 'unit', l.unit,
      'review_secs', e.review_secs, 'quiz_secs', e.quiz_secs,
      'waiting', (select count(*) from public.aa_edu_event_queue z where z.lesson_id = e.lesson_id and z.seen > now() - interval '20 seconds' and z.user_id <> auth.uid())
    ) order by l.subject_id, l.sort, l.id)
    from public.aa_edu_events e join public.aa_edu_lessons l on l.id = e.lesson_id
    where e.active and (select count(*) from public.aa_edu_event_questions q where q.lesson_id = e.lesson_id) >= 20
  ), '[]'::json);
end $$;

-- دخول الطابور / إيجاد خصم. الموقع بيناديها كل ~3 ثواني وهو مستني (idempotent)
create or replace function public.edu_event_join(p_lesson bigint) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); ev public.aa_edu_events; mid bigint; opp uuid; ids bigint[];
begin
  if uid is null then raise exception 'not_authenticated'; end if;

  -- عنده مواجهة شغالة؟ كمّل فيها
  for mid in select mp.match_id from public.aa_edu_match_players mp join public.aa_edu_matches m on m.id = mp.match_id
              where mp.user_id = uid and m.status <> 'done' and m.created_at > now() - interval '3 hours' order by mp.match_id desc loop
    perform public.aa_edu_match_tick(mid);
    if (select status from public.aa_edu_matches where id = mid) <> 'done' then
      delete from public.aa_edu_event_queue where user_id = uid;
      return json_build_object('match_id', mid);
    end if;
  end loop;

  select * into ev from public.aa_edu_events where lesson_id = p_lesson and active;
  if not found then raise exception 'event_not_found'; end if;
  if (select count(*) from public.aa_edu_event_questions where lesson_id = p_lesson) < 20 then raise exception 'event_not_ready'; end if;

  -- بنمسح أي طابور قديم له، وندوّر على خصم لسه بيستنى
  delete from public.aa_edu_event_queue where user_id = uid;
  select user_id into opp from public.aa_edu_event_queue
   where lesson_id = p_lesson and user_id <> uid and seen > now() - interval '20 seconds'
     and not exists (select 1 from public.aa_edu_match_players mp2 join public.aa_edu_matches m2 on m2.id = mp2.match_id
                      where mp2.user_id = aa_edu_event_queue.user_id and m2.status <> 'done' and m2.created_at > now() - interval '3 hours')
   order by seen limit 1 for update skip locked;

  if opp is null then
    insert into public.aa_edu_event_queue(user_id, lesson_id, seen) values (uid, p_lesson, now())
      on conflict (user_id) do update set lesson_id = excluded.lesson_id, seen = now();
    return json_build_object('waiting', true);
  end if;

  delete from public.aa_edu_event_queue where user_id = opp;
  select array_agg(id) into ids from (select id from public.aa_edu_event_questions where lesson_id = p_lesson order by random() limit 20) s;
  insert into public.aa_edu_matches(lesson_id, qids, review_ends, quiz_secs)
    values (p_lesson, ids, now() + make_interval(secs => ev.review_secs), ev.quiz_secs) returning id into mid;
  insert into public.aa_edu_match_players(match_id, user_id) values (mid, uid), (mid, opp);
  return json_build_object('match_id', mid);
end $$;

-- بيتنادى وهو مستني: يجدّد وجوده في الطابور أو يرجّع المواجهة لو خصم لقاه
create or replace function public.edu_event_poll(p_lesson bigint) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); mid bigint;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select mp.match_id into mid from public.aa_edu_match_players mp join public.aa_edu_matches m on m.id = mp.match_id
   where mp.user_id = uid and m.status <> 'done' and m.created_at > now() - interval '3 hours' order by mp.match_id desc limit 1;
  if mid is not null then
    delete from public.aa_edu_event_queue where user_id = uid;
    return json_build_object('match_id', mid);
  end if;
  return public.edu_event_join(p_lesson);   -- بيجدّد وجوده في الطابور وبيحاول يلاقي خصم (لو اتنين دخلوا في نفس اللحظة)
end $$;

create or replace function public.edu_event_leave() returns void
language sql security definer set search_path = public as $$
  delete from public.aa_edu_event_queue where user_id = auth.uid();
$$;

-- حالة المواجهة كاملة (الموقع بيسأل عنها كل ثانيتين). مفيش فيها إجابات صح إلا بعد ما المواجهة تخلص.
create or replace function public.edu_event_state(p_match bigint) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); m public.aa_edu_matches; me public.aa_edu_match_players; op public.aa_edu_match_players;
        ev public.aa_edu_events; qs json; res json := null; oname text; ttl text;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into me from public.aa_edu_match_players where match_id = p_match and user_id = uid;
  if not found then raise exception 'not_in_match'; end if;
  perform public.aa_edu_match_tick(p_match);
  select * into m  from public.aa_edu_matches where id = p_match;
  select * into me from public.aa_edu_match_players where match_id = p_match and user_id = uid;
  select * into op from public.aa_edu_match_players where match_id = p_match and user_id <> uid;
  select * into ev from public.aa_edu_events where lesson_id = m.lesson_id;
  select split_part(btrim(coalesce(name, 'طالب')), ' ', 1) into oname from public.aa_edu_profiles where id = op.user_id;
  select title into ttl from public.aa_edu_lessons where id = m.lesson_id;

  if m.status = 'quiz' and me.finished_at is null then
    select json_agg(json_build_object('i', t.i - 1, 'q', q.q, 'options', q.options) order by t.i)
      into qs from unnest(m.qids) with ordinality as t(qid, i) join public.aa_edu_event_questions q on q.id = t.qid;
  elsif m.status = 'done' then
    select json_agg(json_build_object('i', t.i - 1, 'q', q.q, 'options', q.options, 'answer', q.answer) order by t.i)
      into qs from unnest(m.qids) with ordinality as t(qid, i) join public.aa_edu_event_questions q on q.id = t.qid;
    res := json_build_object(
      'my_score', me.score, 'opp_score', op.score, 'win', m.winner = uid, 'draw', m.winner is null,
      'rank', case when m.winner is null then 0 when m.winner = uid then 1 else 2 end,
      'points', case when m.winner = uid and m.awarded then 50 else 0 end,
      'my_time', extract(epoch from (me.finished_at - m.review_ends))::int,
      'opp_time', extract(epoch from (op.finished_at - m.review_ends))::int);
  end if;

  return json_build_object(
    'status', m.status, 'lesson', ttl, 'pdf', ev.pdf_url, 'total', cardinality(m.qids),
    'now', (extract(epoch from now()) * 1000)::bigint,
    'review_ends', (extract(epoch from m.review_ends) * 1000)::bigint,
    'my_deadline', (extract(epoch from me.deadline) * 1000)::bigint,
    'opp_deadline', (extract(epoch from op.deadline) * 1000)::bigint,
    'me_finished', me.finished_at is not null,
    'opp_name', coalesce(oname, 'منافس'), 'opp_finished', op.finished_at is not null,
    'answers', case when m.status = 'review' then '{}'::jsonb else me.answers end,
    'questions', qs, 'result', res);
end $$;

create or replace function public.edu_event_answer(p_match bigint, p_idx int, p_choice int) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); m public.aa_edu_matches; me public.aa_edu_match_players;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  perform public.aa_edu_match_tick(p_match);
  select * into m from public.aa_edu_matches where id = p_match;
  select * into me from public.aa_edu_match_players where match_id = p_match and user_id = uid for update;
  if not found or m.status <> 'quiz' or me.finished_at is not null then return json_build_object('ok', false); end if;
  if p_idx < 0 or p_idx >= cardinality(m.qids) or p_choice < 0 or p_choice > 5 then return json_build_object('ok', false); end if;
  update public.aa_edu_match_players set answers = jsonb_set(answers, array[p_idx::text], to_jsonb(p_choice), true)
   where match_id = p_match and user_id = uid;
  return json_build_object('ok', true);
end $$;

-- «خلّصت»: وقت الخصم المتبقي بيتقسم على 2
create or replace function public.edu_event_finish(p_match bigint) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); m public.aa_edu_matches; me public.aa_edu_match_players;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  perform public.aa_edu_match_tick(p_match);
  select * into m from public.aa_edu_matches where id = p_match;
  select * into me from public.aa_edu_match_players where match_id = p_match and user_id = uid for update;
  if not found then raise exception 'not_in_match'; end if;
  if m.status = 'quiz' and me.finished_at is null then
    update public.aa_edu_match_players set finished_at = now() where match_id = p_match and user_id = uid;
    update public.aa_edu_match_players
       set deadline = now() + (deadline - now()) / 2
     where match_id = p_match and user_id <> uid and finished_at is null and deadline > now();
    perform public.aa_edu_match_tick(p_match);
  end if;
  return json_build_object('ok', true);
end $$;

-- سجل مواجهات الطالب (آخر 15)
create or replace function public.edu_event_history() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x order by x.id desc), '[]'::json) from (
    select m.id, l.title, mp.score as my_score, op.score as opp_score,
           case when m.winner is null then 0 when m.winner = auth.uid() then 1 else 2 end as rank,
           m.resolved_at
      from public.aa_edu_match_players mp
      join public.aa_edu_matches m on m.id = mp.match_id and m.status = 'done'
      join public.aa_edu_match_players op on op.match_id = m.id and op.user_id <> mp.user_id
      join public.aa_edu_lessons l on l.id = m.lesson_id
     where mp.user_id = auth.uid() order by m.id desc limit 15) x
$$;

revoke all on function public.edu_event_list(), public.edu_event_join(bigint), public.edu_event_poll(bigint), public.edu_event_leave(),
  public.edu_event_state(bigint), public.edu_event_answer(bigint, int, int), public.edu_event_finish(bigint), public.edu_event_history() from public, anon;
grant execute on function public.edu_event_list(), public.edu_event_join(bigint), public.edu_event_poll(bigint), public.edu_event_leave(),
  public.edu_event_state(bigint), public.edu_event_answer(bigint, int, int), public.edu_event_finish(bigint), public.edu_event_history() to authenticated;

notify pgrst, 'reload schema';
