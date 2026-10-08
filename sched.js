/* جدول المذاكرة — مشترك بين الرئيسية وصفحة «جدول المذاكرة» (لازم يتحمّل بعد lib.js) */
const DAYS=[[6,'السبت'],[0,'الأحد'],[1,'الإثنين'],[2,'الثلاثاء'],[3,'الأربعاء'],[4,'الخميس'],[5,'الجمعة']],TD=new Date().getDay(),DN=d=>(DAYS.find(x=>x[0]==d)||[0,''])[1];
const fmtTm=t=>{if(!t)return '';const[a,b]=t.split(':').map(Number);return(a%12||12)+':'+String(b).padStart(2,'0')+(a<12?' ص':' م')};
const timeout=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);
let SCH=[],SCM='db',SUBS=[];
const LKS='acad_sch:'+((U()||{}).id||'-');
const subOf=id=>SUBS.find(s=>s.id==id);
/* لو جدول Supabase مش موجود (setup_v18.sql ماتشغّلش) بيتحفظ على جهاز الطالب */
const schGet=()=>timeout(get('aa_edu_schedule?select=id,day,tm,title,subject_id,done&order=tm').then(r=>{SCM='db';return r}).catch(()=>{SCM='local';try{return JSON.parse(localStorage.getItem(LKS)||'[]')}catch(_){return []}}),5000).then(r=>r||[]);
const schSave=()=>{if(SCM=='local')try{localStorage.setItem(LKS,JSON.stringify(SCH))}catch(_){}};
function drawSch(){const w=document.getElementById('schw');if(!w)return;
 const by=d=>SCH.filter(x=>x.day==d).sort((a,b)=>(a.tm||'99').localeCompare(b.tm||'99')),tn=by(TD),dn=tn.filter(x=>x.done).length;
 const si=x=>{const s=subOf(x.subject_id),c=(s&&s.color)||'#0878C9';return `<div class="si${x.done?' dn':''}" style="--c:${esc(c)}">${x.tm?`<span class="st">${fmtTm(x.tm)}</span>`:''}<span class="sx">${esc(x.title)}</span>${s?`<small>${esc(s.name)}</small>`:''}<span class="sa"><button type="button" data-t="${x.id}" title="${x.done?'إلغاء التم':'تم'}" aria-label="تم">${ic('check',14)}</button><button type="button" data-x="${x.id}" title="حذف" aria-label="حذف">${ic('x',14)}</button></span></div>`};
 document.getElementById('sct').innerHTML=`<span class="tdb">${ic('cal',14)} النهاردة · ${DN(TD)}</span><span>${tn.length?`${tn.length} مهام${dn?` · خلّصت ${dn}`:''}`:'مفيش مهام النهاردة'}</span>`;
 w.innerHTML=`<table class="sch"><thead><tr>${DAYS.map(([d,n])=>`<th class="${d==TD?'today':''}"><span class="dn">${n}</span>${d==TD?'<em>النهاردة</em>':''}</th>`).join('')}</tr></thead><tbody><tr>${DAYS.map(([d])=>`<td class="${d==TD?'today':''}">${by(d).map(si).join('')||'<span class="se">—</span>'}</td>`).join('')}</tr></tbody></table>`;
 const t=w.querySelector('td.today');if(t&&w.scrollWidth>w.clientWidth){const sw=w.scrollWidth,cw=w.clientWidth,x=t.offsetLeft+t.offsetWidth/2-cw/2;w.scrollLeft=Math.max(-(sw-cw),Math.min(0,x-(sw-cw)))}}

async function schAdd(o){
 if(SCH.length>=60)return toast('وصلت للحد الأقصى (60 مهمة)',1);
 if(SCM=='local'){SCH.push({id:Date.now(),...o,done:false});schSave();drawSch();return toast('اتضافت للجدول')}
 try{const r=await post('aa_edu_schedule',o,'return=representation');if(!r.ok)throw 0;const a=await r.json();SCH.push(a[0]);drawSch();toast('اتضافت للجدول')}
 catch(_){toast('تعذّرت الإضافة، جرّب تاني',1)}}
async function schSet(id,patch){const x=SCH.find(y=>y.id==id);if(!x)return;
 if(patch===null){SCH=SCH.filter(y=>y.id!=id)}else Object.assign(x,patch);drawSch();
 if(SCM=='local')return schSave();
 try{const r=await rest('aa_edu_schedule?id=eq.'+id,patch===null?{method:'DELETE'}:{method:'PATCH',body:JSON.stringify(patch)});if(!r.ok)throw 0}catch(_){toast('تعذّر الحفظ',1);SCH=await schGet();drawSch()}}

