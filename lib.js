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


/* ===== مشغّل فيديو آمن للتضمين (يوتيوب / درايف / فيميو / mp4) =====
   - يرسل referrer صحيح (يحل خطأ 153) ويستخدم IFrame API لالتقاط أخطاء "التضمين غير مسموح"
   - لو الفيديو ممنوع تضمينه أو تأخر التحميل يظهر كارت بزر "شاهد على يوتيوب" بدل شاشة سوداء */
const ytId=u=>{const m=String(u||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);return m?m[1]:null};
let _ytP=null;
const ytApi=()=>_ytP||(_ytP=new Promise((ok,no)=>{if(window.YT&&YT.Player)return ok();
 const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{prev&&prev();ok()};
 const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>no();document.head.appendChild(s);setTimeout(no,10000)}));
function ytFallback(box,id,why){const url='https://www.youtube.com/watch?v='+id;
 box.innerHTML=`<a href="${url}" target="_blank" rel="noopener" style="position:relative;display:grid;place-items:center;width:100%;height:100%;background:#000 url('https://i.ytimg.com/vi/${id}/hqdefault.jpg') center/cover;color:#fff;text-decoration:none;text-align:center"><span style="background:rgba(0,0,0,.72);padding:14px 18px;border-radius:12px;max-width:90%;line-height:1.8"><b style="display:block;font-size:16px">▶ شاهد الفيديو على يوتيوب</b><small>${esc(why||'صاحب الفيديو لا يسمح بتشغيله داخل المواقع')}</small></span></a>`}
const fmtT=t=>{t=Math.max(0,Math.floor(t||0));const h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
/* مشغّل بواجهة الموقع: أزرار تحكم خاصة + درع يمنع النقر على عناصر يوتيوب + شاشة نهاية (opt.end يرجع HTML) */
function mountVideo(box,url,opt={}){if(!box)return;box.innerHTML='';box.className='vid';const id=ytId(url),raw=!id&&!/drive\.google\.com|vimeo\.com/.test(url||'');
 if(!id&&!raw){let m=String(url).match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if(m)return void(box.innerHTML=`<iframe src="https://drive.google.com/file/d/${m[1]}/preview" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>`);
  m=String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);return void(box.innerHTML=`<iframe src="https://player.vimeo.com/video/${m[1]}?title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>`)}
 box.classList.add('pl');
 box.innerHTML=`<div class="pl-m"></div>${id?`<div class="pl-poster" style="background-image:url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')"></div>`:''}<div class="pl-sh"></div><button class="pl-big" data-c="pp" aria-label="تشغيل"><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></button>
 <div class="pl-bar"><button data-c="pp" class="pb" aria-label="تشغيل/إيقاف">▶</button><span class="pl-t">0:00</span><input type="range" class="pl-s" min="0" max="1000" value="0" aria-label="التقدم"><span class="pl-d">0:00</span><button data-c="rate" class="pb pr">1×</button><button data-c="mute" class="pb">🔊</button><button data-c="fs" class="pb">⛶</button></div><div class="pl-end" hidden></div>`;
 const q=s=>box.querySelector(s),mEl=q('.pl-m'),sl=q('.pl-s'),end=q('.pl-end');let A=null,state='pause',drag=false,idleT,started=false;
 const RATES=[1,1.25,1.5,2,0.75];let ri=0;
 const setSt=s=>{state=s;box.classList.toggle('playing',s=='play');q('.pb').textContent=s=='play'?'❚❚':'▶';
  if(s=='play'&&!started){started=true;const p=q('.pl-poster');p&&p.remove()}
  if(s=='end'){end.innerHTML=opt.end?opt.end():'<div><div style="font-size:20px;font-weight:700">انتهى الفيديو</div><button class="btn btn-s" style="background:#fff;color:#075B98;margin-top:10px" data-c="replay">إعادة المشاهدة</button></div>';end.hidden=false}else end.hidden=true};
 const wake=()=>{box.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>box.classList.add('idle'),2600)};
 const toggle=()=>{if(!A)return;state=='play'?A.pause():A.play()};
 const tick=()=>{if(!A||drag)return;const d=A.dur(),c=A.cur();if(d>0){sl.value=c/d*1000;q('.pl-d').textContent=fmtT(d)}q('.pl-t').textContent=fmtT(c)};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b&&box.contains(b)){const k=b.dataset.c;
   if(k=='pp')toggle();
   if(k=='replay'){A.seek(0);A.play()}
   if(k=='rate'){ri=(ri+1)%RATES.length;A.rate(RATES[ri]);b.textContent=RATES[ri]+'×'}
   if(k=='mute'){const m=!A.muted();A.mute(m);b.textContent=m?'🔇':'🔊'}
   if(k=='fs'){const f=document.fullscreenElement||document.webkitFullscreenElement;if(f)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const r=box.requestFullscreen||box.webkitRequestFullscreen;if(r)r.call(box);else if(A.native)A.native()}}
   return}
  if(e.target.classList.contains('pl-sh')){toggle()}});
 box.addEventListener('dblclick',e=>{if(e.target.classList.contains('pl-sh'))q('[data-c=fs]').click()});
 box.addEventListener('contextmenu',e=>{if(e.target.classList.contains('pl-sh'))e.preventDefault()});
 ['mousemove','touchstart','keydown'].forEach(n=>box.addEventListener(n,wake,{passive:true}));wake();
 sl.addEventListener('input',()=>{drag=true;const d=A?A.dur():0;q('.pl-t').textContent=fmtT(sl.value/1000*d)});
 sl.addEventListener('change',()=>{if(A)A.seek(sl.value/1000*A.dur());drag=false});
 setInterval(()=>{if(!box.isConnected)return;tick()},300);
 if(raw){const v=document.createElement('video');v.playsInline=true;v.preload='metadata';v.src=url;mEl.appendChild(v);
  A={play:()=>v.play(),pause:()=>v.pause(),seek:t=>{v.currentTime=t},cur:()=>v.currentTime,dur:()=>v.duration||0,rate:r=>{v.playbackRate=r},mute:m=>{v.muted=m},muted:()=>v.muted,native:()=>v.webkitEnterFullscreen&&v.webkitEnterFullscreen()};
  v.onplay=()=>setSt('play');v.onpause=()=>{if(!v.ended)setSt('pause')};v.onended=()=>setSt('end');v.onloadedmetadata=tick;v.onerror=()=>{mEl.innerHTML='<span style="color:#fff;display:grid;place-items:center;height:100%">تعذر تشغيل الفيديو</span>'};return}
 const fail=why=>{clearTimeout(t0);ytFallback(box,id,why)};let t0=setTimeout(()=>fail('تعذر تحميل المشغّل — افتح الفيديو مباشرة'),9000);
 ytApi().then(()=>{const holder=document.createElement('div');mEl.appendChild(holder);
  const pv={controls:0,disablekb:1,fs:0,rel:0,modestbranding:1,iv_load_policy:3,playsinline:1,cc_load_policy:0,hl:'ar'};if(/^https?:$/.test(location.protocol))pv.origin=location.origin;
  const P=new YT.Player(holder,{videoId:id,width:'100%',height:'100%',playerVars:pv,events:{
   onReady:()=>{clearTimeout(t0);A={play:()=>P.playVideo(),pause:()=>P.pauseVideo(),seek:t=>P.seekTo(t,true),cur:()=>P.getCurrentTime()||0,dur:()=>P.getDuration()||0,rate:r=>P.setPlaybackRate(r),mute:m=>m?P.mute():P.unMute(),muted:()=>P.isMuted()};tick()},
   onStateChange:e=>{const s=e.data;if(s==1)setSt('play');else if(s==2)setSt('pause');else if(s==0)setSt('end')},
   onError:e=>fail([101,150,153].includes(e.data)?'صاحب الفيديو لا يسمح بتشغيله داخل المواقع':'الفيديو غير متاح أو محذوف')}})}).catch(()=>fail('تعذر تحميل المشغّل — افتح الفيديو مباشرة'))}
