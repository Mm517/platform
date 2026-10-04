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
/* ===== أيقونات SVG موحّدة (بدون إيموجي) ===== */
const IP={star:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',crown:'<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',play:'<path d="M8 5v14l11-7z"/>',pause:'<path d="M8 5v14M16 5v14"/>',vol:'<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 010 7"/>',mute:'<path d="M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6"/>',full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',bell:'<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0"/>',check:'<path d="M5 12.5l4.5 4.5L19 7"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',file:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5"/>',note:'<path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h5"/>',quiz:'<path d="M9 4h6v3H9zM7 5.5H6v15h12v-15h-1M9 12l2 2 4-4"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',trophy:'<path d="M8 4h8v5a4 4 0 01-8 0zM8 6H4v1a3 3 0 003 3M16 6h4v1a3 3 0 01-3 3M12 13v4M8 20h8"/>',book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 18"/>',mega:'<path d="M3 11v3l12 5V6zM15 8.5a4 4 0 010 7"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M18 14.2a6.5 6.5 0 013.5 5.8"/>',ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',left:'<path d="M15 6l-6 6 6 6"/>',right:'<path d="M9 6l6 6-6 6"/>',up:'<path d="M6 15l6-6 6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',send:'<path d="M3 11l18-8-8 18-2-8z"/>',ticket:'<path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4zM14 6v12"/>',layers:'<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',image:'<path d="M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4"/>',home:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',msg:'<path d="M4 5h16v11H9l-5 4z"/>',star2:'<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',cap:'<path d="M12 3l9 5-9 5-9-5zM7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',inbox:'<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',video:'<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'};
Object.assign(IP,{search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',heart:'<path d="M12 20s-7-4.4-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.6-9 9-9 9z"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',back:'<path d="M3 12a9 9 0 109-9M3 4v5h5"/>',fwd:'<path d="M21 12a9 9 0 11-9-9M21 4v5h-5"/>',alert:'<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',skip:'<path d="M5 5l9 7-9 7zM18 5v14"/>'});
const ic=(n,s=18,c='')=>`<svg class="ic ${c}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IP[n]||''}</svg>`;
const stars=n=>{const f=Math.round(n);return '<span class="stars">'+[1,2,3,4,5].map(i=>ic('star',14,i<=f?'fill on':'')).join('')+'</span>'};
const ago=d=>{const s=(Date.now()-new Date(d))/1000;return s<60?'الآن':s<3600?'منذ '+Math.floor(s/60)+' دقيقة':s<86400?'منذ '+Math.floor(s/3600)+' ساعة':new Date(d).toLocaleDateString('ar-EG')};
function toast(t,bad){let h=$('#tst');if(!h){document.body.insertAdjacentHTML('beforeend','<div id="tst" role="status" aria-live="polite"></div>');h=$('#tst')}const e=document.createElement('div');e.className='ts'+(bad?' bad':'');e.innerHTML=ic(bad?'x':'check',16)+'<span>'+esc(t)+'</span>';h.appendChild(e);setTimeout(()=>e.remove(),3800)}
const ICON={book:'<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 18"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',math:'<path d="M6 6h6M9 3v6M14 8h6M6 17h6M15 15l5 5M20 15l-5 5"/>',flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M8 15h8"/>',map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'};
const ico=(k,s=28)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON[k]||ICON.book}</svg>`;
const NAV=[['home','الرئيسية','home','<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>'],['courses','الكورسات','courses','<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 006.5 18"/>'],['books','الكتب','books','<path d="M5 3h11a3 3 0 013 3v15H8a3 3 0 01-3-3zM5 18a3 3 0 013-3h11"/>'],['files','الملفات','files','<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5"/>'],['updates','التحديثات','updates','<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0"/>'],['analytics','التحليلات','analytics','<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'],['about','عن المنصة','about','<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'],['support','الدعم','support','<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>'],['profile','البروفايل','profile','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>']];
function shell(active){const u=U();
 const li=NAV.map(([k,t,h,p])=>`<a href="${h}" class="sl ${k==active?'on':''}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg><span>${t}</span></a>`).join('');
 document.body.insertAdjacentHTML('afterbegin',`<div class="mbar"><button id="mb" aria-label="القائمة">${ic('menu',24)}</button><a href="home" class="logo"><span class="logo-mark"></span><span>أكاديمية</span></a><span class="mb-r"><button class="bell" aria-label="الإشعارات">${ic('bell',22)}<i class="bell-n" hidden></i></button><span class="pt">${ic('star',14,'fill amber')} <b class="pts">0</b></span></span></div><div class="ov" id="ov"></div>
 <aside class="sb" id="sb"><div class="sb-h"><a href="home" class="logo"><span class="logo-mark"></span><span>أكاديمية</span></a><span style="display:flex;gap:4px"><button class="bell" aria-label="الإشعارات">${ic('bell',20)}<i class="bell-n" hidden></i></button><button class="bell sbx" id="sbc" aria-label="إخفاء القائمة" title="إخفاء القائمة">${ic('right',20)}</button></span></div><nav>${li}</nav>
 <div class="sb-f">${u?`<div class="pt">${ic('star',14,'fill amber')} <b class="pts" id="pts">0</b> نقطة</div><div class="sb-n">${esc(u.name||'')}</div><button id="lo" class="btn btn-o btn-s">تسجيل الخروج</button>`:'<a class="btn btn-p btn-s" href="auth#login">تسجيل الدخول</a>'}</div></aside>`);
 document.body.insertAdjacentHTML('beforeend',`<button id="sbo" class="sbo" aria-label="إظهار القائمة" title="إظهار القائمة">${ic('menu',22)}</button>`);
 const sc=v=>{document.body.classList.toggle('sbc',v);try{localStorage.setItem('acad_sbc',v?'1':'')}catch(_){}};try{if(localStorage.getItem('acad_sbc'))document.body.classList.add('sbc')}catch(_){}
 $('#sbc').onclick=e=>{e.stopPropagation();sc(true)};$('#sbo').onclick=()=>sc(false);
 notifInit();const tg=()=>document.body.classList.toggle('so');$('#mb').onclick=tg;$('#ov').onclick=tg;
 const lo=$('#lo');if(lo)lo.onclick=()=>{setU(null);location.href='auth#login'};
 if(u)get('edu_profiles?select=points,banned').then(r=>{if(r[0]&&r[0].banned){setU(null);alert('تم حظر حسابك. تواصل مع الإدارة.');location.href='auth#login';return}if(r[0])document.querySelectorAll('.pts').forEach(e=>e.textContent=r[0].points)}).catch(()=>{});
 if(u)get('edu_staff?select=role').then(r=>{window.ROLE=r[0]&&r[0].role;if(r[0])$('.sb nav').insertAdjacentHTML('beforeend',`<a href="staff" class="sl ${active=='staff'?'on':''}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5zM7 11v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5"/></svg><span>${r[0].role=='admin'?'لوحة الإدارة':'لوحة المدرس'}</span></a>`);if(r[0]&&r[0].role=='admin'){const n=$('.sb-n');if(n)n.insertAdjacentHTML('afterend',`<span class="pt" style="align-self:flex-start">${ic('crown',14)} أدمن</span>`)}}).catch(()=>{})}
const topbar=()=>shell(document.body.dataset.p||'');
const lvl=p=>Math.floor(p/100)+1;

/* رفع ملف إلى Supabase Storage (bucket: academy) ويرجع الرابط العام */
/* تحويل الصور تلقائيًا إلى WebP + تصغيرها وضغطها قبل الرفع (يتجاهل GIF/SVG وأي ملف مش صورة) */
async function toWebp(file,max,q){max=max||1920;q=q||.82;
 if(!file||!/^image\/(jpe?g|png|bmp|webp)$/i.test(file.type))return file;
 try{let bmp;try{bmp=await createImageBitmap(file)}catch(_){bmp=await new Promise((ok,no)=>{const i=new Image(),u=URL.createObjectURL(file);i.onload=()=>{URL.revokeObjectURL(u);ok(i)};i.onerror=no;i.src=u})}
  const w0=bmp.width||bmp.naturalWidth,h0=bmp.height||bmp.naturalHeight;if(!w0||!h0)return file;
  const k=Math.min(1,max/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*k)),h=Math.max(1,Math.round(h0*k)),c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(bmp,0,0,w,h);if(bmp.close)bmp.close();
  const mk=qq=>new Promise(r=>c.toBlob(r,'image/webp',qq));let b=await mk(q);
  if(!b||b.type!=='image/webp')return file;
  if(b.size>500*1024){const b2=await mk(.7);if(b2&&b2.size<b.size)b=b2}
  if(k===1&&file.type==='image/webp'&&b.size>=file.size)return file;
  return new File([b],(file.name.replace(/\.[^.]+$/,'')||'image')+'.webp',{type:'image/webp'})}catch(_){return file}}
async function upload(file,folder,onp){file=await toWebp(file);await refresh();const u=U();if(!u||!u.token)throw 'auth';
 const ext=((file.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8))||'bin',path=folder+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
 return new Promise((ok,no)=>{const x=new XMLHttpRequest();x.open('POST',SUPA_URL+'/storage/v1/object/academy/'+path);
  x.setRequestHeader('apikey',SUPA_KEY);x.setRequestHeader('Authorization','Bearer '+u.token);x.setRequestHeader('Content-Type',file.type||'application/octet-stream');x.setRequestHeader('Cache-Control','max-age=31536000');
  x.upload.onprogress=e=>{if(e.lengthComputable&&onp)onp(Math.round(e.loaded/e.total*100))};
  x.onload=()=>x.status<300?ok(SUPA_URL+'/storage/v1/object/public/academy/'+path):no(x.responseText);x.onerror=()=>no('network');x.send(file)})}


/* ===== مشغّل فيديو آمن للتضمين (يوتيوب / درايف / فيميو / mp4) =====
   - يرسل referrer صحيح (يحل خطأ 153) ويستخدم IFrame API لالتقاط أخطاء "التضمين غير مسموح"
   - لو الفيديو ممنوع تضمينه أو تأخر التحميل يظهر كارت بزر "شاهد على يوتيوب" بدل شاشة سوداء */
const ytId=u=>{const m=String(u||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);return m?m[1]:null};
let _ytP=null;
const ytApi=()=>_ytP||(_ytP=new Promise((ok,no)=>{if(window.YT&&YT.Player)return ok();
 const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{prev&&prev();ok()};
 const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>no();document.head.appendChild(s);setTimeout(no,10000)}));
function ytFallback(box,id,why,opt={}){const url='https://www.youtube.com/watch?v='+id;
 box.innerHTML=`<div class="yf" style="background-image:url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')"><div class="yf-c"><span class="yf-i">${ic('lock',26)}</span><span class="yf-tag">فيديو خارجي</span><b>${esc(why||'هذا الفيديو غير مسموح بتشغيله داخل الموقع')}</b><small class="yf-sub">صاحب الفيديو مانع التضمين، فشاهده على يوتيوب وارجع كمّل هنا</small><ol class="yf-s"><li>اضغط «شاهد على يوتيوب» وخلّص الفيديو</li><li>ارجع هنا واضغط «خلّصت المشاهدة» وكمّل</li></ol><small class="yf-n" hidden></small><div class="yf-a"><a class="btn btn-p btn-s" data-yt target="_blank" rel="noopener" href="${url}">${ic('ext',16)} شاهد على يوتيوب</a><button class="btn btn-s yf-d" data-yd>${ic('check',16)} خلّصت المشاهدة</button></div><div class="fe" hidden></div></div></div>`;
 let opened=false;let lastOpen=0;box.querySelector('[data-yt]').onclick=e=>{const n=Date.now();if(n-lastOpen<4000){e.preventDefault();return}lastOpen=n;opened=true;opt.ontick&&opt.ontick(1,1000)};
 const vis=()=>{if(!box.isConnected){document.removeEventListener('visibilitychange',vis);return}const d=box.querySelector('[data-yd]'),n=box.querySelector('.yf-n');if(!document.hidden&&opened&&d&&n){d.classList.add('pulse');n.hidden=false;n.innerHTML=ic('check',14)+' رجعت؟ اضغط «خلّصت المشاهدة» وكمّل'}};document.addEventListener('visibilitychange',vis);
 box.querySelector('[data-yd]').onclick=()=>{opt.onend&&opt.onend();const e=box.querySelector('.fe');e.innerHTML=opt.end?opt.end():'';e.hidden=false;e.style.marginTop='12px';e.style.color='#fff';box.querySelector('.yf-a').remove();box.querySelector('.yf-s').remove();const n=box.querySelector('.yf-n');if(n)n.hidden=true}}
const fmtT=t=>{t=Math.max(0,Math.floor(t||0));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
const NE=u=>/#noembed\b/.test(String(u||'')),cleanU=u=>String(u||'').replace(/#noembed\b/,'').trim();

/* مشغّل يوتيوب العادي (بأزراره وإعلاناته وزر "تخطي" الأصلي) + التقاط انتهاء الفيديو وحفظ التقدم */
function mountYT(box,id,opt={}){
 box.className='vid yt';box.innerHTML='<div class="pl-m"></div><div class="pl-end" hidden></div>';
 const mEl=box.querySelector('.pl-m'),end=box.querySelector('.pl-end');let P=null,iv=null,tries=0,t0=null,mainDur=0,fired=false,qSet=false;
 const fail=why=>{clearInterval(iv);clearTimeout(t0);try{P&&P.destroy()}catch(_){}ytFallback(box,id,why,opt)};
 const showEnd=()=>{if(!fired){fired=true;opt.onend&&opt.onend()}end.innerHTML=opt.end?opt.end():'<div><div style="font-size:20px;font-weight:700">انتهى الفيديو</div><button class="btn btn-s" style="background:#fff;color:#075B98;margin-top:10px" data-c="replay">إعادة المشاهدة</button></div>';end.hidden=false};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-c=replay]');if(b&&P){end.hidden=true;fired=false;P.seekTo(0,true);P.playVideo()}});
 const isAd=()=>{try{const vd=P.getVideoData(),d=P.getDuration()||0;return !!(vd&&vd.video_id&&vd.video_id!==id)||(mainDur>5&&d>0&&Math.abs(d-mainDur)>3)}catch(_){return false}};
 t0=setTimeout(()=>fail('تعذر تحميل المشغّل — افتح الفيديو مباشرة'),12000);
 const mk=host=>{mEl.innerHTML='';const h=document.createElement('div');mEl.appendChild(h);
  const pv={controls:1,fs:1,rel:0,playsinline:1,hl:'ar',cc_load_policy:0,iv_load_policy:3,modestbranding:1,vq:'hd1080'};if(/^https?:$/.test(location.protocol))pv.origin=location.origin;if(opt.start>5)pv.start=Math.floor(opt.start);
  const cfg={videoId:id,width:'100%',height:'100%',playerVars:pv,events:{
   onReady:()=>{clearTimeout(t0);mainDur=P.getDuration()||0;
    iv=setInterval(()=>{if(!box.isConnected)return clearInterval(iv);try{if(P.getPlayerState()!==1)return;const d=P.getDuration()||0;if(!mainDur&&d>60)mainDur=d;if(isAd())return;opt.ontick&&opt.ontick(P.getCurrentTime()||0,d)}catch(_){}},1000)},
   onStateChange:e=>{if(e.data===1){end.hidden=true;if(!qSet){qSet=true;try{const l=P.getAvailableQualityLevels()||[];P.setPlaybackQuality(['hd1080','hd720'].find(x=>l.includes(x))||'hd1080')}catch(_){}}}else if(e.data===0&&!isAd())showEnd()},
   onError:e=>{if([101,150,153].includes(e.data)&&!tries++){try{P.destroy()}catch(_){}return mk('https://www.youtube-nocookie.com')}fail([101,150,153].includes(e.data)?'هذا الفيديو غير مسموح بتشغيله داخل الموقع':'الفيديو غير متاح أو محذوف')}}};
  if(host)cfg.host=host;P=new YT.Player(h,cfg)};
 ytApi().then(()=>mk()).catch(()=>fail('تعذر تحميل المشغّل — افتح الفيديو مباشرة'))}
const QL={hd2160:'2160p',hd1440:'1440p',hd1080:'1080p',hd720:'720p',large:'480p',medium:'360p',small:'240p',tiny:'144p'},RATES=[0.5,0.75,1,1.25,1.5,1.75,2];
/* مشغّل بواجهة الموقع: تحكم خاص + إعدادات (سرعة/جودة/صوت/تقديم/وقت محدد) + إطار إعلان خاص + بطاقة للفيديو الممنوع تضمينه */
function mountVideo(box,url0,opt={}){if(!box)return;const flag=NE(url0),url=cleanU(url0);box.innerHTML='';box.className='vid';const id=ytId(url),raw=!id&&!/drive\.google\.com|vimeo\.com/.test(url||'');
 if(id)return flag?ytFallback(box,id,'هذا الفيديو غير مسموح بتشغيله داخل الموقع',opt):mountYT(box,id,opt);
 if(!id&&!raw){let m=String(url).match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if(m)return void(box.innerHTML=`<iframe src="https://drive.google.com/file/d/${m[1]}/preview" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>`);
  m=String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);return void(box.innerHTML=`<iframe src="https://player.vimeo.com/video/${m[1]}?title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>`)}
 box.classList.add('pl');
 box.innerHTML=`<div class="pl-m"></div>${id?`<div class="pl-poster" style="background-image:url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')"></div>`:''}<div class="pl-sh"></div><button class="pl-big" data-c="pp" aria-label="تشغيل"><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></button>
 <div class="pl-ads"></div><div class="pl-adb"><span class="pl-dot"></span><b>إعلان</b><small>سيكمل الدرس تلقائيًا بعد الإعلان — اضغط «تخطي» لما يظهر</small><span class="pl-ab"><button data-c="set" aria-label="الإعدادات">${ic('gear',16)}</button><button data-c="mute" aria-label="الصوت">${ic('vol',16)}</button><button data-c="fs" aria-label="ملء الشاشة">${ic('full',16)}</button></span></div>
 <div class="pl-bar"><button data-c="pp" class="pb" aria-label="تشغيل/إيقاف">${ic('play',18,'fill')}</button><button data-c="j" data-v="-10" class="pb pj" title="رجوع 10 ثواني">${ic('back',18)}</button><button data-c="j" data-v="10" class="pb pj" title="تقديم 10 ثواني">${ic('fwd',18)}</button><span class="pl-t">0:00</span><input type="range" class="pl-s" min="0" max="1000" value="0" aria-label="التقدم"><span class="pl-d">0:00</span><button data-c="ad" class="pb pr" title="ظهر إعلان؟ اضغط لتفعيل زر التخطي">${ic('skip',14)} إعلان؟</button><button data-c="mute" class="pb" aria-label="الصوت">${ic('vol',18)}</button><button data-c="set" class="pb" aria-label="الإعدادات">${ic('gear',18)}</button><button data-c="fs" class="pb" aria-label="ملء الشاشة">${ic('full',18)}</button></div>
 <div class="pl-set" hidden><div class="pl-sp"><div class="pl-sx"><b>إعدادات التشغيل</b><button data-c="setx" class="pl-close" aria-label="إغلاق">${ic('x',18)}</button></div>
  <div class="pl-sg"><label>السرعة</label><div class="pl-ch" id="plr">${RATES.map(r=>`<button data-c="r" data-v="${r}">${r==1?'عادية':r+'×'}</button>`).join('')}</div></div>
  <div class="pl-sg" id="plqg"><label>الجودة</label><div class="pl-ch" id="plq"></div></div>
  <div class="pl-sg"><label>الصوت</label><input type="range" class="pl-v" min="0" max="100" value="100"></div>
  <div class="pl-sg"><label>التنقل في الفيديو</label><div class="pl-ch"><button data-c="j" data-v="-10">رجوع 10 ث</button><button data-c="j" data-v="10">تقديم 10 ث</button><button data-c="j" data-v="-30">رجوع 30 ث</button><button data-c="j" data-v="30">تقديم 30 ث</button></div><div class="pl-go"><input class="pl-ti" inputmode="numeric" placeholder="اكتب الوقت مثل 12:30" dir="ltr"><button data-c="go">اذهب</button></div></div></div></div><div class="pl-end" hidden></div>`;
 const q=s=>box.querySelector(s),mEl=q('.pl-m'),sl=q('.pl-s'),end=q('.pl-end'),set=q('.pl-set');let A=null,state='pause',drag=false,idleT,started=false,adOn=false,adT,mainDur=0,curRate=1;
 const setSt=s=>{state=s;box.classList.toggle('playing',s=='play');q('.pb').innerHTML=s=='play'?ic('pause',18):ic('play',18,'fill');
  if(s=='play'&&!started){started=true;const p=q('.pl-poster');p&&p.remove()}
  if(s=='end'){opt.onend&&opt.onend();end.innerHTML=opt.end?opt.end():'<div><div style="font-size:20px;font-weight:700">انتهى الفيديو</div><button class="btn btn-s" style="background:#fff;color:#075B98;margin-top:10px" data-c="replay">إعادة المشاهدة</button></div>';end.hidden=false}else end.hidden=true};
 let idleDown=false;box.addEventListener('pointerdown',()=>{idleDown=box.classList.contains('idle')&&state=='play'},true);
 const wake=()=>{box.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>box.classList.add('idle'),2600)};
 const toggle=()=>{if(!A)return;state=='play'?A.pause():A.play()};
 const tick=()=>{if(!A||drag)return;if(A.ad){const x=A.ad();if(x!==adOn){adOn=x;box.classList.toggle('ad',x)}if(adOn)return}const d=A.dur(),c=A.cur();if(d>0){sl.value=c/d*1000;q('.pl-d').textContent=fmtT(d)}q('.pl-t').textContent=fmtT(c);if(state=='play'&&opt.ontick)opt.ontick(c,d)};
 const parseT=v=>{v=String(v).replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x)).trim();if(!/^\d+(:\d{1,2}){0,2}$/.test(v))return null;return v.split(':').reduce((a,x)=>a*60+ +x,0)};
 const refSet=()=>{box.querySelectorAll('#plr button').forEach(b=>b.classList.toggle('on',+b.dataset.v==curRate));
  const g=q('#plqg');if(!A||!A.quals){g.hidden=true}else{g.hidden=false;let l=[];try{l=A.quals().filter(x=>QL[x])}catch(_){}const c=A.getq?A.getq():'';
   q('#plq').innerHTML=l.length?`<button data-c="q" data-v="auto" class="${!c||c=='auto'?'on':''}">تلقائي</button>`+l.map(x=>`<button data-c="q" data-v="${x}" class="${x==c?'on':''}">${QL[x]}</button>`).join(''):'<small>شغّل الفيديو أولًا لتظهر الجودات المتاحة</small>'}
  const v=q('.pl-v');if(A&&A.getvol)v.value=A.muted()?0:A.getvol()};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b&&box.contains(b)){const k=b.dataset.c,v=b.dataset.v;
   if(k=='pp')toggle();
   if(k=='set'){if(set.hidden){refSet();set.hidden=false}}
   if(k=='setx')set.hidden=true;
   if(k=='r'){curRate=+v;A&&A.rate(curRate);refSet()}
   if(k=='q'){try{A.setq(v)}catch(_){}setTimeout(refSet,600)}
   if(k=='j'&&A){A.seek(Math.max(0,Math.min(A.dur()||1e9,A.cur()+ +v)))}
   if(k=='go'&&A){const t=parseT(q('.pl-ti').value);if(t==null)return toast('اكتب الوقت بالشكل 12:30 أو 1:05:00',true);A.seek(Math.min(t,A.dur()||t));q('.pl-ti').value=''}
   if(k=='ad'){box.classList.add('ad');clearTimeout(adT);adT=setTimeout(()=>{if(!adOn)box.classList.remove('ad')},25000)}
   if(k=='replay'){A.seek(0);A.play()}
   if(k=='mute'){const m=!A.muted();A.mute(m);box.querySelectorAll('[data-c=mute]').forEach(x=>x.innerHTML=m?ic('mute',18):ic('vol',18))}
   if(k=='fs'){const f=document.fullscreenElement||document.webkitFullscreenElement;if(f)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const r=box.requestFullscreen||box.webkitRequestFullscreen;if(r)r.call(box);else if(A.native)A.native()}}
   return}
  if(e.target.classList.contains('pl-sh')){if(idleDown&&matchMedia('(hover:none)').matches){idleDown=false;return wake()}toggle()}});
 box.querySelectorAll('.pl-ads,.pl-set').forEach(x=>x.addEventListener('click',e=>{if(e.target===x)e.stopPropagation()}));
 /* لوحة الإعدادات: الضغط على الجنب لا يقفلها — بس زر الإغلاق */
 q('.pl-v').addEventListener('input',e=>{if(A&&A.vol){A.vol(+e.target.value);A.mute(+e.target.value==0)}});
 q('.pl-ti').addEventListener('keydown',e=>{if(e.key=='Enter'){e.preventDefault();q('[data-c=go]').click()}});
 box.addEventListener('dblclick',e=>{if(e.target.classList.contains('pl-sh'))q('.pl-bar [data-c=fs]').click()});
 box.addEventListener('contextmenu',e=>{if(e.target.classList.contains('pl-sh'))e.preventDefault()});
 ['mousemove','touchstart','keydown'].forEach(n=>box.addEventListener(n,wake,{passive:true}));wake();
 sl.addEventListener('input',()=>{drag=true;const d=A?A.dur():0;q('.pl-t').textContent=fmtT(sl.value/1000*d)});
 sl.addEventListener('change',()=>{if(A)A.seek(sl.value/1000*A.dur());drag=false});
 const iv=setInterval(()=>{if(!box.isConnected)return clearInterval(iv);tick()},300);
 if(raw){const v=document.createElement('video');v.playsInline=true;v.preload='metadata';v.src=url;mEl.appendChild(v);
  A={play:()=>v.play(),pause:()=>v.pause(),seek:t=>{v.currentTime=t},cur:()=>v.currentTime,dur:()=>v.duration||0,rate:r=>{v.playbackRate=r},mute:m=>{v.muted=m},muted:()=>v.muted,vol:x=>{v.volume=x/100},getvol:()=>v.volume*100,native:()=>v.webkitEnterFullscreen&&v.webkitEnterFullscreen()};
  v.onplay=()=>setSt('play');v.onpause=()=>{if(!v.ended)setSt('pause')};v.onended=()=>setSt('end');v.onloadedmetadata=()=>{if(opt.start>5&&opt.start<v.duration-5)v.currentTime=opt.start;tick()};v.onerror=()=>{mEl.innerHTML='<span style="color:#fff;display:grid;place-items:center;height:100%">تعذر تشغيل الفيديو</span>'};return}}


/* ===== الإشعارات: جرس + لوحة + عدّاد غير المقروء ===== */
const NT={list:[]};
async function notifLoad(){const u=U();if(!u)return;
 try{const [n,s,p]=await Promise.all([get('edu_notifications?order=created_at.desc&limit=40'),get('edu_notif_state?select=last_read'),get('edu_profiles?select=created_at')]);
  const lr=new Date((s[0]&&s[0].last_read)||(p[0]&&p[0].created_at)||0).getTime();
  NT.list=n.filter(x=>!x.user_id||x.user_id==u.id).slice(0,25).map(x=>({...x,un:new Date(x.created_at).getTime()>lr}));
  const c=NT.list.filter(x=>x.un).length;
  document.querySelectorAll('.bell-n').forEach(e=>{e.textContent=c>9?'9+':c;e.hidden=!c});
  if($('#np')&&!$('#np').hidden)notifDraw()}catch(_){}}
function notifDraw(){const p=$('#np');
 p.innerHTML=`<div class="np-h"><b>الإشعارات</b><button id="nra" class="lnk">تعليم الكل كمقروء</button></div><div class="np-l">${NT.list.length?NT.list.map(x=>{const t=x.link?'a':'div';return `<${t} ${x.link?`href="${esc(x.link)}"`:''} class="ni ${x.un?'un':''}"><b>${esc(x.title)}</b>${x.body?`<p>${esc(x.body)}</p>`:''}<small>${ago(x.created_at)}</small></${t}>`}).join(''):'<p class="empty">لا توجد إشعارات.</p>'}</div>`}
function notifInit(){if(!U())return;document.body.insertAdjacentHTML('beforeend','<div id="np" class="np" hidden></div>');
 document.addEventListener('click',async e=>{const b=e.target.closest('.bell:not(.sbx)'),p=$('#np');
  if(b){p.hidden=!p.hidden;if(!p.hidden)notifDraw();return}
  if(e.target.id=='nra'){await post('edu_notif_state',{user_id:U().id,last_read:new Date().toISOString()},'resolution=merge-duplicates,return=minimal');await notifLoad();return}
  if(p&&!p.hidden&&!p.contains(e.target))p.hidden=true});
 notifLoad();setInterval(notifLoad,60000)}

/* مكان الطالب: آخر جزء شاهده -> يكمّل منه، أو الجزء/الدرس التالي */
async function resume(){if(!U())return null;try{
 const[pg,cs,ls]=await Promise.all([get('edu_progress?select=course_id,done&order=updated_at.desc'),get('edu_courses?select=id,lesson_id,teacher_id,title&order=sort,id'),get('edu_lessons?select=id,subject_id,title&order=sort,id')]);
 const p=pg[0],dn=new Set(pg.filter(x=>x.done).map(x=>x.course_id)),c=p&&cs.find(x=>x.id==p.course_id),l=c&&ls.find(x=>x.id==c.lesson_id);if(!l)return null;
 const lessonDone=cs.filter(x=>x.lesson_id==l.id).some(x=>{const m=cs.filter(y=>y.lesson_id==l.id&&y.teacher_id==x.teacher_id);return m.every(y=>dn.has(y.id))});
 if(!p.done)return{t:'أنت هنا — كمّل من حيث وقفت',h:'course?id='+c.id,a:l.title,b:c.title};
 const sib=cs.filter(x=>x.lesson_id==c.lesson_id&&x.teacher_id==c.teacher_id),n=lessonDone?null:sib[sib.findIndex(x=>x.id==c.id)+1];
 if(n)return{t:'الجزء التالي',h:'course?id='+n.id,a:l.title,b:n.title};
 const sl=ls.filter(x=>x.subject_id==l.subject_id),nl=sl.slice(sl.findIndex(x=>x.id==l.id)+1).find(x=>cs.some(y=>y.lesson_id==x.id));
 return nl?{t:'خلّصت «'+l.title+'» — الدرس التالي',h:'courses#'+l.subject_id+'-'+nl.id,a:nl.title,b:''}:{t:'خلّصت كل دروس المادة',h:'courses#'+l.subject_id,a:l.title,b:''}}catch(_){return null}}
const resumeBox=r=>r?`<a class="box row" href="${r.h}" style="border-color:var(--bl);background:#eaf5ff"><span><small class="muted">${esc(r.t)}</small><br><b>${esc(r.a)}</b>${r.b?' — '+esc(r.b):''}</span>${ic('left',20)}</a>`:'';
/* تحويل رابط (درايف / pdf / مستندات) لرابط يتفتح داخل iframe */
const embedUrl=u=>{u=String(u||'');let m=u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/);if(m)return'https://drive.google.com/file/d/'+m[1]+'/preview';
 m=u.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);if(m)return'https://docs.google.com/'+m[1]+'/d/'+m[2]+'/preview';return u};
const frameHtml=u=>`<div style="margin-top:10px"><iframe src="${esc(embedUrl(u))}" style="width:100%;height:70vh;border:1px solid var(--bo);border-radius:12px;background:#fff" allow="fullscreen" referrerpolicy="no-referrer" loading="lazy"></iframe><a class="muted" target="_blank" rel="noopener" href="${esc(u)}">فتح في تبويب جديد</a></div>`;
const saveProg=(cid,pos,dur,done)=>U()&&post('edu_progress?on_conflict=user_id,course_id',{user_id:U().id,course_id:cid,position:pos,duration:dur,done:!!done,updated_at:new Date().toISOString()},'resolution=merge-duplicates,return=minimal').catch(()=>{});

