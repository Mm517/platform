-- v15: حصر المدرس في دروس معيّنة (للأدمن فقط)
-- المدرس اللي lesson_ids بتاعته فاضية = يظهر في كل دروس مواده (زي ما كان).
-- المدرس اللي عنده دروس محددة = يظهر في اختيار المدرس عند إضافة محتوى للدروس دي بس.
alter table public.aa_edu_teachers add column if not exists lesson_ids int[] not null default '{}';

notify pgrst, 'reload schema';

-- للتأكد: لازم يرجّع صف واحد
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'aa_edu_teachers' and column_name = 'lesson_ids';
