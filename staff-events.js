/* ===== إدارة الفعاليات (للأدمن فقط): تفعيل فعالية على درس + رابط PDF المراجعة + أسئلة الامتحان =====
   بيشتغل فوق staff-core.js (تبويب ev). الجداول: aa_edu_events / aa_edu_event_questions (من setup_v17.sql) */
let EVs=[],EVQ=[],EVopen=0,EVerr=false;
const EVL=['أ','ب','ج','د','هـ','و'];

async function evLoad(){
 EVerr=false;
 try{
  [subs,ls]=await Promise.all([LK('aa_edu_subjects?order=sort'),LK('aa_edu_lessons?select=id,subject_id,title,sort&order=subject_id,sort,id')]);
  const r=await rest('aa_edu_events?order=created_at.desc');if(!r.ok)throw 0;EVs=await r.json();
  EVQ=await getAll('aa_edu_event_questions?select=id,lesson_id,q,options,answer&order=id');
 }catch(_){EVerr=true;EVs=[];EVQ=[]}
}

/* لصق أسئلة كتير مرة واحدة. الفورمات (سؤال بعد التاني بسطر فاضي بينهم):
   نص السؤال؟
   أ) الاختيار الأول
   ب) الاختيار الثاني
   ج) ...
   د) ...
   الإجابة: ب                                                                    */
function evParse(t){
 const blocks=String(t||'').replace(/\r/g,'').split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean),ok=[],bad=[];
 const L={'أ':0,'ا':0,'ب':1,'ج':2,'د':3,'هـ':4,'ه':4,'و':5,'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'1':0,'2':1,'3':2,'4':3,'5':4,'6':5};
 const reA=/^(?:الإجابة الصحيحة|الإجابة|الاجابة|الجواب|answer)\s*[:：\-]?\s*(.+)$/i,reO=/^(هـ|[أابجدهوA-Fa-f1-6])\s*[)\-.:：]\s*(.+)$/;
 blocks.forEach((b,bi)=>{
  const ln=b.split('\n').map(x=>x.trim()).filter(Boolean);let q='',o=[],a=-1;
  ln.forEach((x,i)=>{
   if(i==0){q=x.replace(/^\d+\s*[.)\-]\s*/,'');return}
   let m=x.match(reA);
   if(m){const k=m[1].trim().split(/[\s).\-:]/)[0].toLowerCase();a=(k in L)?L[k]:-1;return}
   m=x.match(reO);
   if(m){o.push(m[2].trim());return}
   if(o.length)o[o.length-1]+=' '+x;else q+=' '+x;
  });
  if(q.length>=2&&q.length<=600&&o.length>=2&&o.length<=6&&o.every(Boolean)&&a>=0&&a<o.length)ok.push({q,options:o,answer:a});else bad.push(bi+1);
 });
 return{ok,bad};
}

/* صف اختيار واحد: دايرة (الإجابة الصحيحة) + حرف + خانة الكتابة + زرار حذف */
function evRow(i,on){return `<div class="evo-r"><input type="radio" name="evc" value="${i}" ${on?'checked':''} aria-label="الإجابة الصحيحة"><b class="evo-l">${EVL[i]}</b><input class="evo-i" maxlength="300" placeholder="الاختيار ${EVL[i]}"><button type="button" class="evo-x" data-ev="orm" title="حذف الاختيار" aria-label="حذف الاختيار">×</button></div>`}
function evRenum(){const rs=[...document.querySelectorAll('#evo .evo-r')];rs.forEach((r,i)=>{r.querySelector('input[type=radio]').value=i;r.querySelector('.evo-l').textContent=EVL[i];r.querySelector('.evo-i').placeholder='الاختيار '+EVL[i]});if(!document.querySelector('#evo input[type=radio]:checked')&&rs[0])rs[0].querySelector('input[type=radio]').checked=true;const ad=document.querySelector('[data-ev=oadd]');if(ad)ad.disabled=rs.length>=6}

V.ev=()=>{
 if(R!='admin')return '<p class="empty">الصفحة دي للأدمن فقط.</p>';
 if(EVerr)return '<p class="empty">تعذر تحميل الفعاليات — شغّل ملف <b>setup_v17.sql</b> من Supabase → SQL Editor ثم حدّث الصفحة.</p>';
 const used=new Set(EVs.map(e=>e.lesson_id)),sm=Object.fromEntries(subs.map(s=>[s.id,s])),lm=Object.fromEntries(ls.map(l=>[l.id,l]));
 const free=subs.map(s=>{const A=ls.filter(l=>l.subject_id==s.id&&!used.has(l.id));return A.length?`<optgroup label="${esc(s.name)}">${A.map(l=>`<option value="${l.id}">${esc(l.title)}</option>`).join('')}</optgroup>`:''}).join('');
 const add=`<div class="box fm sf"><b>تفعيل فعالية على درس</b>
  <small class="muted">الفعالية بتظهر للطلاب لما يبقى عليها <b>20 سؤال على الأقل</b>. كل مواجهة بتختار 20 سؤال عشوائي من بنك الأسئلة.</small>
  <select id="evl" style="width:100%;margin:8px 0"><option value="">— اختر الدرس —</option>${free}</select>
  <input id="evp" dir="ltr" placeholder="رابط PDF المراجعة (Google Drive أو رابط مباشر)">
  <small class="muted">لو من درايف: خلّي الملف «أي شخص معه الرابط يمكنه العرض».</small>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><label style="flex:1;min-width:130px"><small class="muted">دقايق المراجعة</small><input id="evr" type="number" min="1" max="60" value="10"></label><label style="flex:1;min-width:130px"><small class="muted">دقايق الامتحان</small><input id="evz" type="number" min="1" max="60" value="5"></label></div>
  <button class="btn btn-p btn-s" data-ev="add" style="margin-top:8px">${ic('plus',16)} تفعيل الفعالية</button></div>`;
 const list=EVs.map(e=>{
  const l=lm[e.lesson_id]||{title:'درس محذوف'},sj=sm[l.subject_id],qs=EVQ.filter(x=>x.lesson_id==e.lesson_id),n=qs.length,open=EVopen==e.lesson_id;
  const st=!e.active?'<span class="ev-b off">متوقفة</span>':n<20?`<span class="ev-b warn">ناقص ${20-n} سؤال — مش ظاهرة للطلاب</span>`:'<span class="ev-b on">ظاهرة للطلاب</span>';
  return `<div class="box"><div class="row"><span><b>${esc(l.title)}</b>${sj?` <small class="muted">— ${esc(sj.name)}</small>`:''}<br><small class="muted">${n} سؤال · ${Math.round(e.review_secs/60)} د مراجعة · ${Math.round(e.quiz_secs/60)} د امتحان</small> ${st}</span>
   <span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-o btn-s" data-ev="qs" data-id="${e.lesson_id}">${open?'إخفاء':'الإعدادات والأسئلة'}</button><button class="btn btn-o btn-s" data-ev="tg" data-id="${e.lesson_id}">${e.active?'إيقاف':'تشغيل'}</button><button class="btn btn-o btn-s" data-ev="del" data-id="${e.lesson_id}">حذف</button></span></div>
  ${open?`<div class="fm" style="margin-top:12px;border-top:1px solid var(--bo);padding-top:12px"><b>إعدادات الفعالية</b>
   <input id="evp2" dir="ltr" value="${esc(e.pdf_url||'')}" placeholder="رابط PDF المراجعة">
   <div style="display:flex;gap:10px;flex-wrap:wrap"><label style="flex:1;min-width:130px"><small class="muted">دقايق المراجعة</small><input id="evr2" type="number" min="1" max="60" value="${Math.round(e.review_secs/60)}"></label><label style="flex:1;min-width:130px"><small class="muted">دقايق الامتحان</small><input id="evz2" type="number" min="1" max="60" value="${Math.round(e.quiz_secs/60)}"></label></div>
   <button class="btn btn-p btn-s" data-ev="cfg" data-id="${e.lesson_id}" style="margin-top:6px">حفظ الإعدادات</button>
   <b style="display:block;margin-top:16px">إضافة سؤال</b>
   <div class="box evf" id="evform">
    <label class="evf-l">نص السؤال</label>
    <textarea id="evq" rows="2" maxlength="600" placeholder="اكتب السؤال هنا..."></textarea>
    <label class="evf-l">الاختيارات <small class="muted">— دوس على الدايرة جنب الإجابة الصحيحة</small></label>
    <div id="evo">${[0,1,2,3].map(i=>evRow(i,i==0)).join('')}</div>
    <div class="evf-act"><button type="button" class="btn btn-o btn-s" data-ev="oadd">${ic('plus',14)} إضافة اختيار</button><button type="button" class="btn btn-p btn-s" data-ev="q1" data-id="${e.lesson_id}">${ic('check',16)} حفظ السؤال</button></div>
   </div>
   <details class="evf-bulk"><summary>إضافة كذا سؤال مرة واحدة (نسخ ولصق)</summary>
    <small class="muted">سؤال بعد التاني بسطر فاضي بينهم. الفورمات:<br><span dir="rtl" style="white-space:pre-line;display:block;background:var(--soft);border-radius:8px;padding:8px;margin-top:4px">نص السؤال؟\nأ) الاختيار الأول\nب) الاختيار الثاني\nج) الاختيار الثالث\nد) الاختيار الرابع\nالإجابة: ب</span></small>
    <textarea id="evb" rows="9" placeholder="الصق الأسئلة هنا..."></textarea>
    <button class="btn btn-p btn-s" data-ev="qadd" data-id="${e.lesson_id}">${ic('plus',16)} إضافة الأسئلة</button>
   </details>
   <b style="display:block;margin-top:16px">أسئلة الدرس (${n})</b>
   ${qs.map((x,i)=>`<div class="ev-aq"><div class="row"><span><b>${i+1}. ${esc(x.q)}</b></span><button class="btn btn-o btn-s" data-ev="qdel" data-id="${x.id}">حذف</button></div>${(x.options||[]).map((o,j)=>`<div class="${j==x.answer?'c':''}">${EVL[j]||j+1}) ${esc(o)}${j==x.answer?' ✓':''}</div>`).join('')}</div>`).join('')||'<p class="empty">مفيش أسئلة لسه.</p>'}
  </div>`:''}</div>`}).join('')||'<p class="empty">مفيش فعاليات لسه — فعّل أول فعالية من الأعلى.</p>';
 return add+`<h2 class="lsn">الفعاليات الحالية <small>${EVs.length}</small></h2>`+list;
};

document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-ev]');if(!b||R!='admin')return;
 const a=b.dataset.ev,id=+b.dataset.id||0,mins=v=>{v=Math.round(+v);return v>=1&&v<=60?v*60:0};
 const pdfOk=u=>!u||/^https?:\/\//i.test(u);
 if(a=='oadd'){const box=$('#evo'),n=box.children.length;if(n>=6)return;box.insertAdjacentHTML('beforeend',evRow(n,false));evRenum();box.lastElementChild.querySelector('.evo-i').focus();return}
 if(a=='orm'){const box=$('#evo');if(box.children.length<=2)return say('غير ممكن — لازم اختيارين على الأقل');b.closest('.evo-r').remove();evRenum();return}
 if(a=='q1'){
  const q=$('#evq').value.trim(),rows=[...document.querySelectorAll('#evo .evo-r')],sel=rows.findIndex(r=>r.querySelector('input[type=radio]').checked),opts=[];let ans=-1;
  if(q.length<2)return say('اكتب نص السؤال أولًا');
  rows.forEach((r,i)=>{const v=r.querySelector('.evo-i').value.trim();if(v){if(i==sel)ans=opts.length;opts.push(v)}});
  if(opts.length<2)return say('اكتب اختيارين على الأقل');
  if(ans<0)return say('اختار الإجابة الصحيحة (الدايرة جنب الاختيار) وتأكد إنها مكتوبة');
  b.disabled=true;const rr=await post('aa_edu_event_questions',{lesson_id:id,q,options:opts,answer:ans});b.disabled=false;
  const ok=await run(rr,'تمت إضافة السؤال');if(ok)setTimeout(()=>{const f=$('#evq');if(f)f.focus()},50);return;
 }
 if(a=='qs'){EVopen=EVopen==id?0:id;return draw()}
 if(a=='add'){
  const lid=+($('#evl').value||0),pdf=$('#evp').value.trim(),rs=mins($('#evr').value),zs=mins($('#evz').value);
  if(!lid)return say('اختر الدرس أولًا');
  if(!pdfOk(pdf))return say('غير صالح — رابط الـ PDF لازم يبدأ بـ https://');
  if(!rs||!zs)return say('غير صالح — الدقايق من 1 إلى 60');
  EVopen=lid;return run(await post('aa_edu_events',{lesson_id:lid,pdf_url:pdf||null,review_secs:rs,quiz_secs:zs,active:true}),'تم تفعيل الفعالية — أضف الأسئلة (20 على الأقل)');
 }
 if(a=='cfg'){
  const pdf=$('#evp2').value.trim(),rs=mins($('#evr2').value),zs=mins($('#evz2').value);
  if(!pdfOk(pdf))return say('غير صالح — رابط الـ PDF لازم يبدأ بـ https://');
  if(!rs||!zs)return say('غير صالح — الدقايق من 1 إلى 60');
  return run(await rest('aa_edu_events?lesson_id=eq.'+id,{method:'PATCH',body:JSON.stringify({pdf_url:pdf||null,review_secs:rs,quiz_secs:zs})}),'تم حفظ الإعدادات');
 }
 if(a=='tg'){const x=EVs.find(v=>v.lesson_id==id);return run(await rest('aa_edu_events?lesson_id=eq.'+id,{method:'PATCH',body:JSON.stringify({active:!(x&&x.active)})}),'تم التحديث')}
 if(a=='del'){if(!confirm('حذف الفعالية؟ (أسئلة الدرس هتفضل محفوظة)'))return;if(EVopen==id)EVopen=0;return run(await rest('aa_edu_events?lesson_id=eq.'+id,{method:'DELETE'}),'تم حذف الفعالية')}
 if(a=='qadd'){
  const r=evParse($('#evb').value);
  if(!r.ok.length)return say('السؤال غير مكتوب بالشكل الصحيح'+(r.bad.length?' — راجع الأسئلة رقم: '+r.bad.join('، '):'، اكتب أو الصق الأسئلة أولًا'));
  if(r.bad.length&&!confirm('فيه '+r.bad.length+' سؤال فيهم خطأ في الفورمات (رقم '+r.bad.join('، ')+') وهيتخطّوا. نضيف الـ '+r.ok.length+' سؤال السليمين؟'))return;
  b.disabled=true;const rr=await post('aa_edu_event_questions',r.ok.map(x=>({...x,lesson_id:id})));b.disabled=false;
  return run(rr,'تمت إضافة '+r.ok.length+' سؤال');
 }
 if(a=='qdel'){if(!confirm('حذف السؤال؟'))return;return run(await rest('aa_edu_event_questions?id=eq.'+id,{method:'DELETE'}),'تم حذف السؤال')}
});
