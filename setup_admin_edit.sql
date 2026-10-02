-- شغّله مرة واحدة في Supabase SQL Editor: ترتيب الكورسات + صورة المدرس (للوحة الأدمن الجديدة)
alter table edu_teachers add column if not exists image text;
alter table edu_courses add column if not exists sort int default 0;
