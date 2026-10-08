/* إعدادات قاعدة البيانات (Supabase) - المفتاح هنا عام (publishable) وآمن للاستخدام في المتصفح */
const SUPA_URL = "https://dbzqejwsivgndftfnezb.supabase.co";
const SUPA_KEY = "sb_publishable_JtpQxfx0h2GkUm6xoGEUNw_bQKopifH";
/* تحديث المحتوى لحظي عبر Realtime (اتصال واحد على جدول aa_edu_content_version). لو الاتصال وقع أو وصلت حد الخطة بيرجع يفحص كل LIVE_POLL ثانية.
   LIVE_POLL = كل كام ثانية يفحص التاب المفتوح (90 = توازن كويس) — 0 أو LIVE_ON=false يوقف الفحص والموقع يكمّل بالكاش (5 دقايق) */
const LIVE_ON = true;
const LIVE_POLL = 90;
/* Cloudflare Turnstile (كابتشا مجانية ضد البوتات): حط هنا الـ Site Key (العام) بتاع الـ Widget. سيبه فاضي = الكابتشا مقفولة.
   ⚠ فعّلها في Supabase بعد ما ترفع الموقع وفيه المفتاح، مش قبل. */
const TURNSTILE_SITEKEY = "";

/* ===== المجتمع / الغرفة الصوتية (WebRTC) =====
   STUN مجاني شغّال تلقائيًا. لكن شبكات الموبايل في مصر (CGNAT) ساعات بتحتاج TURN عشان الصوت يوصل لكل الطلاب.
   سجّل مجانًا في metered.ca (Open Relay) أو Cloudflare Calls أو أي TURN وحط بياناتك هنا (سيبه null = STUN بس):
   const ICE_SERVERS = [{urls:"stun:stun.l.google.com:19302"},{urls:"turn:YOUR_HOST:443?transport=tcp",username:"USER",credential:"PASS"}]; */
const ICE_SERVERS = null;
