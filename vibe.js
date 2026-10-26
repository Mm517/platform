/* مساعدات قسم الفايب كودينج: جلسة منفصلة (vc_user) عن حسابات الطلاب (acad_user) — تسجيل بإيميل وباسوورد */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VK='vc_user';
const VU=()=>{try{return JSON.parse(localStorage.getItem(VK)||'null')}catch(_){return null}};
const setVU=u=>{try{u?localStorage.setItem(VK,JSON.stringify(u)):localStorage.removeItem(VK)}catch(_){}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function vrefresh(){const u=VU();if(!u||!u.refresh)return false;
 try{const r=await fetch(SUPA_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SUPA_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:u.refresh})});
  if(!r.ok)return false;const j=await r.json();setVU({...u,token:j.access_token,refresh:j.refresh_token});return true}catch(_){return false}}

async function vrest(path,o={},retry=true){const u=VU(),h={apikey:SUPA_KEY,'Content-Type':'application/json',...(o.headers||{})};
 if(u&&u.token)h.Authorization='Bearer '+u.token;
 const r=await fetch(SUPA_URL+'/rest/v1/'+path,{...o,headers:h});
 if(r.status===401&&u&&retry){if(await vrefresh())return vrest(path,o,false);setVU(null);location.replace('vibe')}
 return r}
async function vget(p){const r=await vrest(p);if(!r.ok)throw new Error(String(r.status));return r.json()}
async function vsend(method,p,b,pref){const r=await vrest(p,{method,body:b==null?undefined:JSON.stringify(b),headers:pref?{Prefer:pref}:{}});
 if(!r.ok){let m='';try{const j=await r.json();m=j.message||j.hint||''}catch(_){}throw new Error(m||String(r.status))}
 const t=await r.text();return t?JSON.parse(t):null}
const vpost=(p,b,pref)=>vsend('POST',p,b,pref||'return=representation');
const vpatch=(p,b)=>vsend('PATCH',p,b,'return=minimal');
const vdel=p=>vsend('DELETE',p,null,'return=minimal');
const vrpc=(n,b)=>vsend('POST','rpc/'+n,b||{});

function toast(t,bad){let h=$('#tst');if(!h){document.body.insertAdjacentHTML('beforeend','<div id="tst" role="status" aria-live="polite"></div>');h=$('#tst')}
 const e=document.createElement('div');e.className='ts'+(bad?' bad':'');e.textContent=t;h.appendChild(e);setTimeout(()=>e.remove(),3600)}
const ago=d=>{const s=(Date.now()-new Date(d))/1000;return s<60?'الآن':s<3600?'منذ '+Math.floor(s/60)+' دقيقة':s<86400?'منذ '+Math.floor(s/3600)+' ساعة':new Date(d).toLocaleDateString('ar-EG')};
const fdt=d=>new Date(d).toLocaleString('ar-EG',{weekday:'long',day:'numeric',month:'long',hour:'numeric',minute:'2-digit'});

/* يوتيوب → رابط تضمين. لو الرابط مش يوتيوب بيرجع null */
function ytId(u){try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.slice(1).split('/')[0]||null;
 if(x.hostname.includes('youtube.com')){if(x.pathname==='/watch')return x.searchParams.get('v');const m=x.pathname.match(/^\/(embed|live|shorts)\/([\w-]{6,})/);return m?m[2]:null}}catch(_){}return null}
function playerHTML(url){if(!url)return '<div class="np">لا يوجد فيديو لهذا الدرس</div>';
 const id=ytId(url);if(id)return `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;picture-in-picture;fullscreen" allowfullscreen loading="lazy" title="الفيديو"></iframe>`;
 if(/\.(mp4|webm|ogg)(\?|$)/i.test(url))return `<video src="${esc(url)}" controls playsinline preload="metadata"></video>`;
 if(/^https?:\/\//i.test(url))return `<div class="np"><div><p style="margin-bottom:12px">الفيديو على موقع خارجي</p><a class="btn btn-p" href="${esc(url)}" target="_blank" rel="noopener noreferrer">افتح الفيديو</a></div></div>`;
 return '<div class="np">رابط الفيديو غير صالح</div>'}
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';

/* ===== المصادقة (إيميل + باسوورد) + كابتشا Turnstile لو متفعّلة في config.js ===== */
const CF=typeof TURNSTILE_SITEKEY==='string'?TURNSTILE_SITEKEY:'',CFW={},CFT={};
function cfShow(k,sel){if(!CF||CFW[k]!=null||!window.turnstile)return;CFW[k]=turnstile.render(sel,{sitekey:CF,language:'ar',callback:t=>{CFT[k]=t},'expired-callback':()=>{CFT[k]=''},'error-callback':()=>{CFT[k]=''}})}
async function vauth(path,body,k){
 if(CF){if(!CFT[k])throw{error_code:'captcha_missing'};body={...body,gotrue_meta_security:{captcha_token:CFT[k]}}}
 try{const r=await fetch(SUPA_URL+path,{method:'POST',headers:{apikey:SUPA_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw j;return j}
 finally{if(CF&&CFW[k]!=null){CFT[k]='';try{turnstile.reset(CFW[k])}catch(_){}}}}
const VMSG={captcha_missing:'أكمل التحقق الأمني (أنا لست روبوت) أولًا.',captcha_failed:'تعذر التحقق الأمني، أعد المحاولة.',user_already_exists:'هذا الإيميل مسجّل بالفعل، سجّل دخولك.',email_exists:'هذا الإيميل مسجّل بالفعل، سجّل دخولك.',invalid_credentials:'الإيميل أو كلمة السر غير صحيحة.',weak_password:'كلمة السر ضعيفة، اختر أقوى (8 أحرف على الأقل).',over_request_rate_limit:'محاولات كثيرة، انتظر قليلًا ثم أعد المحاولة.',over_email_send_rate_limit:'محاولات كثيرة، انتظر قليلًا ثم أعد المحاولة.',email_not_confirmed:'أكّد إيميلك أولًا من الرسالة اللي وصلتك ثم سجّل دخولك.',validation_failed:'تأكد من كتابة الإيميل بشكل صحيح.',banned:'تم حظر هذا الحساب من المجتمع.',profile:'تعذّر إنشاء ملف العضو، أعد المحاولة.'};
const vmsg=e=>VMSG[e&&(e.error_code||e.code)]||(e&&e.msg&&/not confirmed/i.test(e.msg)?VMSG.email_not_confirmed:'حصل خطأ، جرّب مرة تانية.');
/* ينشئ ملف العضو لو مش موجود ويتأكد إنه مش محظور */
async function ensureMember(j,name){
 const h={apikey:SUPA_KEY,Authorization:'Bearer '+j.access_token,'Content-Type':'application/json'};
 const r=await fetch(SUPA_URL+'/rest/v1/aa_vc_members?on_conflict=user_id',{method:'POST',headers:{...h,Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({user_id:j.user.id,name:name||'عضو'})});
 if(!r.ok)throw{error_code:'profile'};
 const m=await fetch(SUPA_URL+'/rest/v1/aa_vc_members?select=name,banned&user_id=eq.'+j.user.id,{headers:h}).then(x=>x.ok?x.json():[]);
 if(m[0]&&m[0].banned)throw{error_code:'banned'};
 return m[0]?m[0].name:name}
