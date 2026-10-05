-- تفعيل التحديث الفوري للمحتوى (Realtime)
-- شغّل الملف مرة واحدة من Supabase → SQL Editor
-- بيضيف جداول المحتوى لقناة supabase_realtime عشان أي تعديل من الأدمن يوصل للطلاب لحظتها.
-- (التغيير بيتبعت كإشارة بس والموقع بيعيد تحميل المحتوى مرة واحدة، مفيش polling)
do $$
declare t text;
begin
  foreach t in array array[
    'edu_books','edu_course_files','edu_course_solutions','edu_courses','edu_lessons',
    'edu_subjects','edu_teachers','edu_ads','edu_updates','edu_about','edu_quizzes','edu_quiz_questions'
  ] loop
    if to_regclass('public.'||t) is not null
       and not exists (select 1 from pg_publication_tables
                       where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
