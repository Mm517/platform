/* ===== إعدادات قابلة للتعديل ===== */
const brandName = "أكاديمية";
const images = {
  heroStudent: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=70",
  community:   "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=70"
};
let stats = [["0","طالب مسجّل"],["0","درس"],["0","اختبار"],["0","مدرس"]];
const kpis = [["92%","متوسط النتائج"],["48","الدروس المكتملة"],["24","الاختبارات"],["1,850","النقاط"]];
const subjectScores = [["عربي",88],["إنجليزي",93],["رياضيات",94],["علوم",91],["دراسات",87]];
/* المواد: [الاسم، أيقونة، عدد المدرسين] */
const subjects = [["اللغة العربية","book",3],["اللغة الإنجليزية","globe",3],["الرياضيات","math",4],["العلوم","flask",3],["الدراسات","map",2]];
const communityPoints = ["مجتمع مجاني","أسئلة ومناقشات","مشاركة المعرفة","التواصل مع الطلاب","مساعدة بعضنا البعض"];
const faqs = [
  ["هل المنصة مجانية؟","نعم، التسجيل والمجتمع والدروس مجانية لطلاب الصف الثالث الإعدادي."],
  ["هل تشمل كل مواد الصف الثالث الإعدادي؟","نعم، عربي وإنجليزي ورياضيات وعلوم ودراسات."],
  ["هل يمكنني اختيار أكثر من مدرس؟","نعم، لكل مادة أكثر من مدرس، ويمكنك التنقل بينهم وقتما تشاء."],
  ["كيف أسأل المدرس؟","من خانة «اسأل المدرس» في الصفحة الرئيسية للمادة، أو من التعليقات أسفل أي درس."],
  ["كيف تُحسب النقاط؟","تحصل على نقاط عند إنهاء الدروس وحل الامتحانات ومساعدة زملائك في المجتمع."],
  ["كيف تظهر نتيجتي؟","تظهر نتيجتك فور انتهاء الامتحان وتُحفظ في صفحة متابعة التقدم."]
];

/* ===== أيقونات ===== */
const svg = (p, s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const P = {
  video:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M17 5a3 3 0 010 6M21.5 20c0-2.5-1.5-4.5-4-5.3"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  ask:'<path d="M4 5h16v11H9l-5 4z"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.5-1.5 1-1.5 2M12 14.8v.2"/>',
  exam:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16l1.5 1.5L14 14"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 18"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  math:'<path d="M6 6h6M9 3v6M14 8h6M6 17h6M15 15l5 5M20 15l-5 5"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M8 15h8"/>',
  map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  file:'<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
  bell:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',
  loop:'<path d="M20 11a8 8 0 00-14-4L4 9M4 4v5h5M4 13a8 8 0 0014 4l2-2M20 20v-5h-5"/>',
  mark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  chart:'<path d="M3 20h18M6 16v-5M11 16V7M16 16v-8M21 4l-5 5"/>',
  headset:'<path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.5-1.5 1-1.5 2M12 16.8v.2"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
};
const ico = k => `<span class="ico">${svg(P[k])}</span>`;
const ck = svg('<path d="M5 12.5l4.5 4.5L19 7"/>', 16);
const plus = svg('<path d="M12 5v14M5 12h14"/>', 20);
const av = (n, c = "#0878C9") => `<span class="av" style="--c:${c}">${n}</span>`;
const cols = ["#0878C9", "#075B98", "#4BA3E0"];

/* ===== رسومات الميزات (HTML/CSS فقط) ===== */
const mocks = {
  lessons: `<div class="win"><div class="vid">${svg('<path d="M8 5v14l11-7z" fill="currentColor"/>', 40)}</div><div class="pb"><i style="width:62%"></i></div>
    <div class="li">${ck}<span>مقدمة في المعادلات</span><em>08:20</em></div>
    <div class="li on">${svg('<path d="M8 5v14l11-7z" fill="currentColor"/>', 16)}<span>حل المعادلات خطوة بخطوة</span><em>12:40</em></div>
    <div class="li"><span class="dot"></span><span>تدريبات الدرس</span><em>10:05</em></div></div>`,
  teachers: `<div class="win"><div class="hd">الرياضيات<span>اختر المدرس</span></div>
    <div class="tr on">${av("أ")}<b>مدرس 1</b><small>شرح مبسط</small></div>
    <div class="tr">${av("س", cols[1])}<b>مدرس 2</b><small>تدريبات كثيرة</small></div>
    <div class="tr">${av("م", cols[2])}<b>مدرس 3</b><small>مراجعات سريعة</small></div></div>`,
  comments: `<div class="win"><div class="bub">${av("ن", cols[2])}<p>هل يمكن حل السؤال الثالث بطريقة ثانية؟</p></div>
    <div class="bub">${av("أ")}<p>نعم، جرّب التعويض المباشر وستصل لنفس الناتج.</p></div>
    <div class="bub">${av("ك", cols[1])}<p>شكرًا، الآن فهمت الفكرة.</p></div>
    <div class="inp">اكتب تعليقك...<span class="go">إرسال</span></div></div>`,
  ask: `<div class="win"><div class="hd">اسأل المدرس<span>العلوم</span></div>
    <div class="inp tall">اكتب سؤالك هنا بوضوح...</div><div class="inp"><span class="muted">إرفاق صورة</span><span class="go">إرسال السؤال</span></div>
    <div class="bub">${av("م", cols[1])}<p>تم الرد على سؤالك السابق عن قانون نيوتن.</p></div></div>`,
  exam: `<div class="win"><div class="hd">امتحان الجبر<span>12:30</span></div><div class="pb"><i style="width:30%"></i></div>
    <b>السؤال 3 من 10: ما قيمة س في 2س + 4 = 10؟</b>
    <div class="opt">1</div><div class="opt on">3</div><div class="opt">5</div><div class="opt">7</div></div>`,
  points: `<div class="win"><div class="hd">نقاطك<span>المستوى 5</span></div><div class="big">1,850</div><div class="pb"><i style="width:74%"></i></div>
    <div class="bdg">${[1,1,1,0].map(o => `<span class="${o ? "" : "off"}">${svg(P.star, 22)}</span>`).join("")}</div>
    <div class="rk"><b>1</b>${av("ن", cols[2])}<span>نور</span><em>2,240</em></div>
    <div class="rk"><b>2</b>${av("ي", cols[1])}<span>أنت</span><em>1,850</em></div></div>`
};
const showcase = [
  ["video","الدروس","شاهد الدروس مرتبة حسب المادة والوحدة، وأكمل من حيث توقفت.","lessons"],
  ["users","أكثر من مدرس لكل مادة","اختر المدرس المناسب لك، وبدّل بين المدرسين وقتما تشاء.","teachers"],
  ["chat","تعليقات ونقاش","اكتب تعليقك أسفل أي درس، وتبادل الإجابات مع زملائك والمدرس.","comments"],
  ["ask","اسأل المدرس","خانة مستقلة لإرسال سؤالك، مع إمكانية إرفاق صورة، والرد يصلك داخل المنصة.","ask"],
  ["exam","الامتحانات","اختبر نفسك بامتحانات بوقت محدد، واعرف نتيجتك ومستواك فور الانتهاء.","exam"],
  ["star","نظام النقاط","اجمع نقاطًا من الدروس والامتحانات والمشاركة، وافتح شارات جديدة وتصدّر القائمة.","points"]
];
const extras = [
  ["file","ملخصات وملازم","ملخصات مختصرة لكل وحدة."],
  ["bell","تنبيهات الامتحانات","تذكير قبل مواعيد الامتحانات."],
  ["loop","المراجعة النهائية","أسئلة مراجعة قبل امتحان آخر العام."],
  ["mark","حفظ الدروس","احفظ دروسك المهمة وارجع لها بسرعة."],
  ["award","شهادات الإنجاز","شهادة عند إكمال كل مادة."],
  ["phone","سريعة على الموبايل","تعمل بسلاسة حتى على الأجهزة الضعيفة."]
];
const support = [["headset","الدعم الفني","حل مشاكل الحساب والدخول."],["help","الأسئلة الشائعة","إجابات سريعة على أكثر الأسئلة."],["mail","تواصل معنا","أرسل لنا رسالة وسنرد عليك."]];

/* ===== البناء ===== */
const $ = id => document.getElementById(id);
document.querySelectorAll("[data-brand]").forEach(e => e.textContent = brandName);
document.querySelectorAll("[data-img]").forEach(i => { i.src = images[i.dataset.img]; });
const drawStats = () => $("stats").innerHTML = stats.map(s => `<div class="stat"><b data-n="${s[0]}">${s[0]}</b><span>${s[1]}</span></div>`).join("");
drawStats();
$("show").innerHTML = showcase.map(s => `<div class="show fade"><div>${ico(s[0])}<h3>${s[1]}</h3><p>${s[2]}</p></div><div class="mock">${mocks[s[3]]}</div></div>`).join("");
$("feats").innerHTML = extras.map(f => `<div class="feat fade">${svg(P[f[0]], 30)}<h3>${f[1]}</h3><p>${f[2]}</p></div>`).join("");
const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const person = svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>', 16);
const tav = (t, i) => t.image ? `<span class="av ph" title="${esc(t.name)}"><img src="${esc(t.image)}" alt="${esc(t.name)}" loading="lazy" decoding="async"></span>` : av("", cols[i % 3]).replace("></span>", `title="${esc(t.name)}">${person}</span>`);
function drawSubs(list) {
  $("subs").innerHTML = list.map(s => { const ts = s.teachers || [];
    return `<div class="sb fade">${ico(P[s.icon] ? s.icon : "book")}<h3>${esc(s.name)}</h3><div class="stack">${ts.slice(0, 4).map(tav).join("")}</div>${ts.length ? `<div class="tn">${ts.slice(0, 3).map(t => esc(t.name)).join(" · ")}</div>` : ""}<small>${ts.length ? ts.length + (ts.length > 2 ? " مدرسين" : ts.length === 2 ? " مدرسان" : " مدرس") : "قريبًا"}</small></div>`; }).join("");
  document.querySelectorAll("#subs .fade").forEach(el => io.observe(el));
}
$("clist").innerHTML = communityPoints.map(t => `<li>${ck}${t}</li>`).join("");
$("kpis").innerHTML = kpis.map(k => `<div class="kpi"><b>${k[0]}</b><span>${k[1]}</span></div>`).join("");
$("bars").innerHTML = subjectScores.map(s => `<div class="bar"><span>${s[0]}</span><div class="track"><div class="fill" data-w="${s[1]}"></div></div><em>${s[1]}%</em></div>`).join("");
$("sup").innerHTML = support.map(s => `<div class="fade">${svg(P[s[0]], 30)}<h3>${s[1]}</h3><p>${s[2]}</p></div>`).join("");
$("faqList").innerHTML = faqs.map((f, i) => `<div class="q"><button aria-expanded="false" aria-controls="a${i}"><span>${f[0]}</span>${plus}</button><div class="a" id="a${i}" role="region"><p>${f[1]}</p></div></div>`).join("");

$("faqList").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const q = b.parentElement, a = q.querySelector(".a"), open = q.classList.toggle("open");
  b.setAttribute("aria-expanded", open);
  a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
});
const nav = $("nav"), links = $("links"), burger = $("burger");
addEventListener("scroll", () => nav.classList.toggle("sc", scrollY > 10), {passive: true});
burger.addEventListener("click", () => { const o = links.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
links.addEventListener("click", () => { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); });

function count(el) {
  const raw = el.dataset.n, n = parseInt(raw.replace(/\D/g, "")), pre = raw.startsWith("+") ? "+" : "", t0 = performance.now();
  (function step(t) {
    const p = Math.min((t - t0) / 1200, 1);
    el.textContent = pre + Math.round(n * (1 - Math.pow(1 - p, 3))).toLocaleString("en");
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add("in");
  el.querySelectorAll("[data-n]").forEach(count);
  el.querySelectorAll(".fill").forEach(f => f.style.width = f.dataset.w + "%");
  io.unobserve(el);
}), {threshold: .12});
document.querySelectorAll(".fade,.trust,.dash").forEach(el => io.observe(el));

/* رسومات Hero والمجتمع + مقدمة الكتاب */
$("heroGfx").innerHTML = mocks.lessons;
$("comGfx").innerHTML = mocks.comments;
(() => {
  const i = $("intro"); let s = 0;
  try { s = sessionStorage.getItem("intro"); } catch (e) {}
  const end = () => { i.classList.add("out"); setTimeout(() => i.remove(), 700); try { sessionStorage.setItem("intro", 1); } catch (e) {} };
  if (s || matchMedia("(prefers-reduced-motion:reduce)").matches) { i.remove(); return; }
  $("skip").onclick = end; setTimeout(end, 3800);
})();

/* ===== v4: تفاعل الرسومات ===== */
(() => {
  const mocks = document.querySelectorAll(".mock");
  mocks.forEach(m => m.querySelectorAll(".win>*").forEach((c, i) => c.style.setProperty("--i", i)));
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const still = matchMedia("(prefers-reduced-motion:reduce)").matches;

  if (!still) {
    if (!fine) {
      /* موبايل: تشتغل الحركة لما الرسمة تظهر في الشاشة */
      const lo = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("live", e.isIntersecting)), {threshold: .55});
      mocks.forEach(m => lo.observe(m));
    } else {
      /* كمبيوتر: تتفاعل لما المؤشر يقرب منها */
      let px = -999, py = -999, raf = 0;
      const clamp = v => Math.min(Math.max(v, 0), 1);
      const run = () => {
        raf = 0;
        mocks.forEach(m => {
          const r = m.getBoundingClientRect();
          const dx = Math.max(r.left - px, 0, px - r.right), dy = Math.max(r.top - py, 0, py - r.bottom);
          const near = Math.hypot(dx, dy) < 110;
          m.classList.toggle("near", near);
          if (near) {
            const x = clamp((px - r.left) / r.width), y = clamp((py - r.top) / r.height);
            m.style.setProperty("--mx", x * 100 + "%"); m.style.setProperty("--my", y * 100 + "%");
            m.style.setProperty("--rx", ((x - .5) * 8).toFixed(2) + "deg"); m.style.setProperty("--ry", ((.5 - y) * 6).toFixed(2) + "deg");
          } else { m.style.setProperty("--rx", "0deg"); m.style.setProperty("--ry", "0deg"); }
        });
      };
      addEventListener("pointermove", e => { if (e.pointerType !== "mouse") return; px = e.clientX; py = e.clientY; raf || (raf = requestAnimationFrame(run)); }, {passive: true});
      document.documentElement.addEventListener("mouseleave", () => { px = py = -999; run(); });
    }
  }

  /* ضغط على عنصر داخل الرسمة يخليه هو المختار */
  mocks.forEach(m => m.addEventListener("click", e => {
    const it = e.target.closest(".tr,.opt,.li"); if (!it || !m.contains(it)) return;
    const sel = it.classList.contains("li") ? ".li" : it.classList.contains("tr") ? ".tr" : ".opt";
    m.querySelectorAll(sel).forEach(x => x.classList.toggle("on", x === it));
  }));
})();


/* ===== v5: نقاط الكروت الطولية ===== */
(() => {
  const sh = $("show"), dots = $("dots"), cards = [...sh.children];
  if (!dots || !cards.length) return;
  dots.innerHTML = cards.map(() => "<i></i>").join("");
  const ds = [...dots.children];
  const upd = () => {
    const x = Math.abs(sh.scrollLeft), end = x + sh.clientWidth >= sh.scrollWidth - 4;
    const i = end ? cards.length - 1 : Math.min(cards.length - 1, Math.round(x / (cards[0].offsetWidth + 14)));
    ds.forEach((d, k) => d.classList.toggle("on", k === i));
  };
  sh.addEventListener("scroll", upd, {passive: true}); addEventListener("resize", upd); upd();
  ds.forEach((d, k) => d.onclick = () => cards[k].scrollIntoView({behavior: "smooth", inline: "center", block: "nearest"}));
})();

/* بيانات حقيقية من السيرفر (طلب واحد): عدّاد الطلاب + أرقام المنصة + المواد ومدرسينها. لو فشل بنعرض نسخة بسيطة */
const fallbackSubs = () => drawSubs(subjects.map(x => ({ name: x[0], icon: x[1], teachers: [] })));
fetch(SUPA_URL + "/rest/v1/rpc/edu_public_home", { method: "POST", headers: { apikey: SUPA_KEY, "Content-Type": "application/json" }, body: "{}" })
  .then(r => r.ok ? r.json() : Promise.reject()).then(j => {
    const n = +j.n || 0, lim = +j.lim || 0, full = lim > 0 && n >= lim, left = Math.max(lim - n, 0);
    const pct = lim ? Math.min(Math.round(n / lim * 100), 100) : 0, hot = !full && lim > 0 && left <= Math.max(10, lim * .15);
    const capN = $("capN"), t0 = performance.now();
    (function tick(t) { const k = Math.min((t - t0) / 1200, 1); capN.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
    $("capL").textContent = lim; $("chipN").textContent = n; $("capP").textContent = pct + "%"; $("capBar").setAttribute("aria-valuenow", pct);
    $("capS").textContent = full ? "اكتمل العدد" : "التسجيل مفتوح الآن";
    $("capR").textContent = full ? "المقاعد اكتملت - انضم لقائمة الانتظار وهنبلغك أول ما يتفتح مكان" : hot ? "آخر " + left + " مقعد فقط - سجّل قبل ما يخلصوا!" : "باقي " + left + " مقعد من " + lim + " - أمّن مكانك مجانًا";
    $("cap").classList.toggle("full", full); $("cap").classList.toggle("hot", hot); $("cap").hidden = false;
    requestAnimationFrame(() => $("capF").style.width = pct + "%");
    stats = [[String(n), "طالب مسجّل"], [String(j.lessons || 0), "درس"], [String(j.quizzes || 0), "اختبار"], [String(j.teachers || 0), "مدرس"]];
    drawStats(); document.querySelectorAll(".trust").forEach(el => { io.unobserve(el); io.observe(el); });
    if (j.subjects && j.subjects.length) drawSubs(j.subjects); else fallbackSubs();
    if (full) document.querySelectorAll('a[href="auth#signup"]').forEach(a => { a.textContent = "انضم لقائمة الانتظار"; });
  }).catch(fallbackSubs);
