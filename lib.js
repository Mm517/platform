/* مساعدات مشتركة: المستخدم + الاتصال بـ Supabase + تجديد الجلسة */
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const U=()=>{try{return JSON.parse(localStorage.getItem('acad_user')||'null')}catch(_){return null}};
const setU=u=>{try{u?localStorage.setItem('acad_user',JSON.stringify(u)):localStorage.removeItem('acad_user')}catch(_){}};
async function refresh(){const u=U();if(!u||!u.refresh)return false;
 try{const r=await fetch(SUPA_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SUPA_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:u.refresh})});
 if(!r.ok)return false;const j=await r.json();setU({...u,token:j.access_token,refresh:j.refresh_token});return true}catch(_){return false}}
async function rest(path,o={},retry=true){const u=U(),h={apikey:SUPA_KEY,'Content-Type':'application/json',...(o.headers||{})};
 if(u&&u.token)h.Authorization='Bearer '+u.token;
 const r=await fetch(SUPA_URL+'/rest/v1/'+path,{...o,headers:h});
 if(r.status===401&&u&&retry){if(await refresh())return rest(path,o,false);setU(null)}
 return r}
const get=async p=>{const r=await rest(p);if(!r.ok)throw 0;return r.json()};
const post=(p,b,pref)=>rest(p,{method:'POST',body:JSON.stringify(b),headers:pref?{Prefer:pref}:{}});
const award=async(reason,ref)=>{if(!U())return;try{const r=await post('rpc/edu_award',{p_reason:reason,p_ref:String(ref)});if(r.ok){const n=await r.json();document.querySelectorAll('.pts').forEach(e=>e.textContent=n)}}catch(_){}};
const stars=n=>{const f=Math.round(n);return '★'.repeat(f)+'☆'.repeat(5-f)};
const ICON={book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 18"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',math:'<path d="M6 6h6M9 3v6M14 8h6M6 17h6M15 15l5 5M20 15l-5 5"/>',flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M8 15h8"/>',map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'};
const ico=(k,s=28)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[k]||ICON.book}</svg>`;
const NAV=[['home','الرئيسية','home.html','<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>'],['courses','الكورسات','courses.html','<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 18"/>'],['books','الكتب','books.html','<path d="M5 3h11a3 3 0 013 3v15H8a3 3 0 01-3-3zM5 18a3 3 0 013-3h11"/>'],['files','الملفات','files.html','<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5"/>'],['updates','التحديثات','updates.html','<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0"/>'],['analytics','التحليلات','analytics.html','<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'],['support','الدعم','support.html','<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>'],['profile','البروفايل','profile.html','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>']];
function shell(active){const u=U();
 const li=NAV.map(([k,t,h,p])=>`<a href="${h}" class="sl ${k==active?'on':''}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg><span>${t}</span></a>`).join('');
 document.body.insertAdjacentHTML('afterbegin',`<div class="mbar"><button id="mb" aria-label="القائمة">☰</button><a href="home.html" class="logo"><span class="logo-mark"></span><span>أكاديمية</span></a><span class="pt">⭐ <b class="pts">0</b></span></div><div class="ov" id="ov"></div>
 <aside class="sb" id="sb"><a href="home.html" class="logo"><span class="logo-mark"></span><span>أكاديمية</span></a><nav>${li}</nav>
 <div class="sb-f">${u?`<div class="pt">⭐ <b class="pts" id="pts">0</b> نقطة</div><div class="sb-n">${esc(u.name||'')}</div><button id="lo" class="btn btn-o btn-s">تسجيل الخروج</button>`:'<a class="btn btn-p btn-s" href="auth.html#login">تسجيل الدخول</a>'}</div></aside>`);
 const tg=()=>document.body.classList.toggle('so');$('#mb').onclick=tg;$('#ov').onclick=tg;
 const lo=$('#lo');if(lo)lo.onclick=()=>{setU(null);location.href='auth.html#login'};
 if(u)get('edu_profiles?select=points').then(r=>{if(r[0])document.querySelectorAll('.pts').forEach(e=>e.textContent=r[0].points)}).catch(()=>{});
 if(u)get('edu_staff?select=role').then(r=>{if(r[0])$('.sb nav').insertAdjacentHTML('beforeend',`<a href="staff.html" class="sl ${active=='staff'?'on':''}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5zM7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5"/></svg><span>لوحة المدرس</span></a>`)}).catch(()=>{})}
const topbar=()=>shell(document.body.dataset.p||'');
const lvl=p=>Math.floor(p/100)+1;

/* رفع ملف إلى Supabase Storage (bucket: academy) ويرجع الرابط العام */
async function upload(file,folder,onp){await refresh();const u=U();if(!u||!u.token)throw 'auth';
 const ext=((file.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8))||'bin',path=folder+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
 return new Promise((ok,no)=>{const x=new XMLHttpRequest();x.open('POST',SUPA_URL+'/storage/v1/object/academy/'+path);
  x.setRequestHeader('apikey',SUPA_KEY);x.setRequestHeader('Authorization','Bearer '+u.token);x.setRequestHeader('Content-Type',file.type||'application/octet-stream');x.setRequestHeader('Cache-Control','max-age=31536000');
  x.upload.onprogress=e=>{if(e.lengthComputable&&onp)onp(Math.round(e.loaded/e.total*100))};
  x.onload=()=>x.status<300?ok(SUPA_URL+'/storage/v1/object/public/academy/'+path):no(x.responseText);x.onerror=()=>no('network');x.send(file)})}
