/* قسم الألعاب: 26 لعبة تعليمية. كله على جهاز الطالب (بدون ريكوستات)، والنقاط بتتمنح عبر award() من lib.js */
(()=>{
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[R(0,a.length-1)],shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const L=s=>`<bdi dir="ltr">${s}</bdi>`,gcd=(a,b)=>b?gcd(b,a%b):a,isP=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i==0)return false;return true};
const mk=(q,r,w)=>{w=[...new Set(w.map(String))].filter(v=>v!==String(r)).slice(0,3);const o=shuf([String(r),...w]);return{q,o,a:o.indexOf(String(r))}};
const near=(n,k=3)=>{const s=new Set(),m=Math.max(3,Math.round(n*.25));let g=0;while(s.size<k&&g++<80){const v=n+R(1,m)*(R(0,1)?1:-1);if(v>=1&&v!==n)s.add(v)}for(let t=1;s.size<k;t++)s.add(n+t);return[...s]};
const B=s=>s.trim().split('\n').map(l=>l.trim().split('|')),bk=b=>()=>{const[q,r,...w]=pick(b);return mk(q,r,w)};
const pg=(p,qa,qb,fa=x=>x,fb=x=>x)=>()=>{const t=pick(p),o=shuf(p.filter(x=>x!==t)).slice(0,3);if(qb&&R(0,1))return mk(qb(t[1]),fa(t[0]),o.map(x=>fa(x[0])));return mk(qa(t[0]),fb(t[1]),o.map(x=>fb(x[1])))};
const fr=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;return d==1?String(n):L(n+'/'+d)};
/* ===== بنوك المحتوى ===== */
const EL=B(`الهيدروجين|H
الهيليوم|He
الكربون|C
النيتروجين|N
الأكسجين|O
الصوديوم|Na
المغنيسيوم|Mg
الألومنيوم|Al
السيليكون|Si
الفوسفور|P
الكبريت|S
الكلور|Cl
البوتاسيوم|K
الكالسيوم|Ca
الحديد|Fe
النحاس|Cu
الزنك|Zn
الفضة|Ag
الذهب|Au
الرصاص|Pb
الزئبق|Hg`);
const CAP=B(`مصر|القاهرة
السعودية|الرياض
الإمارات|أبوظبي
الأردن|عمّان
لبنان|بيروت
سوريا|دمشق
العراق|بغداد
قطر|الدوحة
عُمان|مسقط
اليمن|صنعاء
ليبيا|طرابلس
تونس|تونس
الجزائر|الجزائر
المغرب|الرباط
السودان|الخرطوم
فرنسا|باريس
ألمانيا|برلين
إيطاليا|روما
إسبانيا|مدريد
بريطانيا|لندن
اليابان|طوكيو
الصين|بكين
روسيا|موسكو
تركيا|أنقرة
الهند|نيودلهي
البرازيل|برازيليا
كندا|أوتاوا
أستراليا|كانبيرا
الولايات المتحدة|واشنطن
كوريا الجنوبية|سول
إندونيسيا|جاكرتا`);
const GOV=B(`الدقهلية|المنصورة
الغربية|طنطا
الشرقية|الزقازيق
المنوفية|شبين الكوم
البحيرة|دمنهور
القليوبية|بنها
أسيوط|أسيوط
سوهاج|سوهاج
قنا|قنا
الأقصر|الأقصر
أسوان|أسوان
الفيوم|الفيوم
بني سويف|بني سويف
المنيا|المنيا
دمياط|دمياط
بورسعيد|بورسعيد
الإسماعيلية|الإسماعيلية
السويس|السويس
شمال سيناء|العريش
جنوب سيناء|الطور
البحر الأحمر|الغردقة
مطروح|مرسى مطروح
الوادي الجديد|الخارجة
كفر الشيخ|كفر الشيخ`);
const EN=B(`book|كتاب
pencil|قلم رصاص
window|نافذة
teacher|معلم
school|مدرسة
water|ماء
sun|شمس
moon|قمر
tree|شجرة
house|منزل
friend|صديق
family|أسرة
apple|تفاحة
happy|سعيد
big|كبير
small|صغير
fast|سريع
slow|بطيء
hot|ساخن
cold|بارد
always|دائمًا
never|أبدًا
library|مكتبة
homework|واجب منزلي
exam|امتحان
success|نجاح
brave|شجاع
language|لغة
important|مهم
early|مبكرًا`);
const GRM=B(`الفاعل في جملة «كتب الطالبُ الدرسَ» هو؟|الطالب|الدرس|كتب|لا يوجد
المفعول به في جملة «قرأ أحمدُ القصةَ» هو؟|القصة|أحمد|قرأ|لا يوجد
أي الكلمات التالية فعل؟|ذهب|حديقة|جميل|هذا
جمع كلمة «كتاب» هو؟|كتب|كتّاب|كتابات|أكتاب
مفرد كلمة «أقلام» هو؟|قلم|قلمان|مقلمة|قُلَيم
مثنى كلمة «طالب» في حالة الرفع؟|طالبان|طالبين|طلاب|طالبون
جمع المذكر السالم لكلمة «معلم» في حالة الرفع؟|معلمون|معلمين|معلمات|معالم
ضد كلمة «سعيد»؟|حزين|مسرور|فرِح|ضاحك
مرادف كلمة «جميل»؟|حسن|قبيح|سيئ|ضيق
علامة رفع المبتدأ في «العلمُ نورٌ»؟|الضمة|الفتحة|الكسرة|السكون
نوع الجملة «ذهب الولد إلى المدرسة»؟|فعلية|اسمية|شبه جملة|شرطية
نوع الجملة «الجو جميل»؟|اسمية|فعلية|شرطية|استفهامية
أي الكلمات التالية تبدأ بهمزة قطع؟|أخ|اسم|ابن|امرأة
الفعل «يكتبُ» فعل؟|مضارع|ماضٍ|أمر|جامد
أي الكلمات مكتوبة كتابة صحيحة؟|مدرسة|مدرسه|مدرصة|مدرسأ
إعراب «الطالبُ» في «نجح الطالبُ»؟|فاعل مرفوع|مفعول به منصوب|مبتدأ مرفوع|مضاف إليه مجرور
«في» في جملة «الكتاب في الحقيبة» حرف؟|جر|نصب|جزم|عطف
ضد كلمة «قريب»؟|بعيد|دانٍ|مجاور|ملاصق`);
const SCI=B(`أقرب كوكب إلى الشمس؟|عطارد|الزهرة|الأرض|المريخ
أكبر كواكب المجموعة الشمسية؟|المشتري|زحل|الأرض|نبتون
الغاز الذي تحتاجه النباتات في البناء الضوئي؟|ثاني أكسيد الكربون|الأكسجين|النيتروجين|الهيدروجين
الغاز الذي نتنفسه لنعيش؟|الأكسجين|ثاني أكسيد الكربون|الهيليوم|الميثان
عدد عظام جسم الإنسان البالغ؟|206|156|306|106
أصلب مادة طبيعية؟|الألماس|الحديد|الذهب|الجرانيت
درجة غليان الماء النقي عند مستوى سطح البحر؟|100 درجة مئوية|90 درجة مئوية|120 درجة مئوية|80 درجة مئوية
الكائنات التي تصنع غذاءها بنفسها تسمى؟|ذاتية التغذية|مستهلكات|محللات|متطفلة
العضو المسؤول عن ضخ الدم؟|القلب|الكبد|الرئتان|المعدة
وحدة قياس القوة؟|النيوتن|الجول|الوات|الباسكال
وحدة قياس الطاقة؟|الجول|النيوتن|الأمبير|الفولت
وحدة قياس شدة التيار الكهربي؟|الأمبير|الفولت|الأوم|الوات
أكثر الغازات وجودًا في الهواء؟|النيتروجين|الأكسجين|ثاني أكسيد الكربون|الأرجون
المادة التي تعطي النبات لونه الأخضر؟|الكلوروفيل|الهيموجلوبين|الميلانين|الكيراتين
الصيغة الكيميائية للماء؟|H₂O|CO₂|O₂|NaCl
تحول الماء إلى بخار يسمى؟|التبخر|التكثف|التجمد|الانصهار
عدد أيام السنة الكبيسة؟|366|365|364|360
الحيوان الملقب بسفينة الصحراء؟|الجمل|الحصان|الفيل|الحمار
أطول نهر في أفريقيا؟|النيل|الكونغو|النيجر|زامبيزي
الكوكب الأحمر؟|المريخ|الزهرة|المشتري|زحل
العضو المسؤول عن التفكير والتحكم؟|المخ|القلب|الكلية|المعدة
القمر يدور حول؟|الأرض|الشمس|المريخ|المشتري`);
const TF=[['الشمس نجم وليست كوكبًا',1],['الماء يغلي عند 50 درجة مئوية على مستوى سطح البحر',0],['مجموع زوايا المثلث 180 درجة',1],['العدد 1 عدد أولي',0],['العدد 2 هو العدد الزوجي الوحيد الذي هو أولي',1],['الخفافيش من الطيور',0],['الحوت من الأسماك',0],['الصوت ينتقل في الفراغ',0],['مساحة المربع = طول الضلع × نفسه',1],['العدد 0.5 أكبر من 0.25',1],['نهر النيل يصب في البحر الأحمر',0],['الأرض تدور حول الشمس',1],['العدد 91 عدد أولي',0],['الذهب فلز',1],['الزجاج موصل جيد للكهرباء',0],['الكسر ½ يساوي 50%',1],['قلب الإنسان له أربع حجرات',1],['للحشرات ثمانية أرجل',0],['المحيط الهادي أكبر محيطات العالم',1],['مساحة المثلث = القاعدة × الارتفاع فقط',0],['النبات يطلق الأكسجين أثناء البناء الضوئي',1],['الجذر التربيعي للعدد 49 هو 7',1],['الحديد لا يصدأ أبدًا',0],['الزهرة أقرب إلى الشمس من الأرض',1]];
const RID=B(`ما الشيء الذي كلما أخذت منه كبر؟|الحفرة|الجبل|الكتاب|الماء
له أسنان ولا يعضّ، فما هو؟|المشط|الأسد|المنشار الكهربائي|الثوم
يسير بلا أرجل ويبكي بلا عيون، فما هو؟|السحاب|النهر|الظل|الريح
ما الشيء الذي يكتب ولا يقرأ؟|القلم|الكتاب|الدفتر|الطالب
يسمع بلا أذن ويتكلم بلا لسان، فما هو؟|الهاتف|الببغاء|الصدى|المذياع القديم
أب له 5 أبناء، ولكل ابن أخت واحدة. كم عدد أفراد الأسرة؟|8|7|11|12
معك 3 تفاحات وأخذتَ منها 2. كم تفاحة معك؟|2|1|3|5
كم شهرًا في السنة فيه 28 يومًا؟|12|1|2|6
أحمد أكبر من علي، وعلي أكبر من سعيد. من الأصغر؟|سعيد|علي|أحمد|لا يمكن معرفته
اليوم الأحد. بعد 10 أيام يكون اليوم؟|الأربعاء|الثلاثاء|الخميس|الاثنين
ساعة حائط تدق بعدد الساعة (الواحدة دقة، والثانية عشرة اثنتا عشرة دقة). كم دقة في يوم كامل؟|156|78|144|288
ما نصف العدد 2، ثم نضيف إليه 2؟|3|2|4|1
ما العدد التالي في: 1، 1، 2، 3، 5، 8؟|13|11|12|10`);
const DAD=[...'ضوء ضيف ضفدع ضمير ضخم ضباب ضحك ضرس حاضر أرض مريض رياضة قاضي فضاء'.split(' ').map(w=>[w,'ض']),...'ظل ظرف ظلم ظهر ظبي ظفر ظهيرة انتظار نظافة عظيم حافظ موظف يقظة لحظة ملاحظة نظام'.split(' ').map(w=>[w,'ظ'])];
const COL=[['أحمر','#dc2626'],['أزرق','#2563eb'],['أخضر','#16a34a'],['أصفر','#ca8a04'],['برتقالي','#f97316'],['بنفسجي','#7c3aed']];
const UN=[['كم','م',1000],['م','سم',100],['كجم','جم',1000],['لتر','مل',1000],['ساعة','دقيقة',60],['دقيقة','ثانية',60],['طن','كجم',1000],['سم','مم',10],['يوم','ساعة',24]];
const WS='مدرسة معلم كتاب حاسوب رياضيات علوم تاريخ جغرافيا مكتبة مختبر امتحان نجاح تفوق مذاكرة واجب ممحاة سبورة طالب مسطرة'.split(' ');
const HW=[['مدرسة','مكان'],['رياضيات','مادة دراسية'],['جغرافيا','مادة دراسية'],['مثلث','شكل هندسي'],['مستطيل','شكل هندسي'],['كوكب','فضاء'],['حاسوب','تقنية'],['مكتبة','مكان'],['ذاكرة','عقل'],['معادلة','رياضيات'],['نيل','نهر مصري'],['هرم','آثار'],['تاريخ','مادة دراسية'],['مجموعة','رياضيات'],['بركان','طبيعة'],['حديقة','مكان']];
/* ===== تعريف الألعاب ===== */
const CAT={m:'حساب',l:'لغة',s:'علوم ومعلومات',b:'ذكاء وتركيز'};
const C=[['#0878C9','#5cc0ff'],['#7c3aed','#c4b5fd'],['#059669','#6ee7b7'],['#ea580c','#fdba74'],['#db2777','#f9a8d4'],['#0891b2','#67e8f9'],['#ca8a04','#fde047'],['#4f46e5','#a5b4fc']];
const Q=(id,n,d,c,g,gen,t,rn)=>({id,n,d,c,g,gen,t,rn,k:'q'}),X=(id,n,d,c,g,run)=>({id,n,d,c,g,run,k:'x'});
const GM=[
Q('sprint','سباق الحساب','جمع وطرح وضرب وقسمة بسرعة','m','+×',i=>{const t=R(0,3),h=i>4?2:1;let a,b,r,s;if(t==0){a=R(10*h,40*h);b=R(10*h,40*h);r=a+b;s='+'}else if(t==1){a=R(30*h,90*h);b=R(10,a-1);r=a-b;s='−'}else if(t==2){a=R(3,9+h*3);b=R(3,9+h*3);r=a*b;s='×'}else{b=R(2,9);r=R(2,9+h*3);a=b*r;s='÷'}return mk(L(`${a} ${s} ${b} = ؟`),r,near(r))},12),
Q('times','جدول الضرب','ثبّت جدول الضرب من ٢ إلى ١٢','m','12×',()=>{const a=R(2,12),b=R(2,12);return mk(L(`${a} × ${b} = ؟`),a*b,[a*b+a,a*b-b,a*(b+1)+1,...near(a*b)])},8,12),
Q('eqn','صاروخ المعادلات','حلّ معادلات الدرجة الأولى','m','س=',()=>{const x=R(1,12),a=R(2,9),b=R(1,20),p=R(0,1),c=p?a*x+b:a*x-b;return mk(`إذا كان ${L(`${a}س ${p?'+':'−'} ${b} = ${c}`)} فإن س = ؟`,x,near(x))},25),
Q('frac','أمير الكسور','اجمع الكسور واختصر الناتج','m','½',()=>{const d=pick([2,3,4,5,6,8,10]),k=pick([1,1,2]),d2=d*k,a=R(1,d-1),c=R(1,d2-1),n=a*k+c;return mk(`ناتج ${L(a+'/'+d)} + ${L(c+'/'+d2)} = ؟`,fr(n,d2),[fr(a+c,d+d2),fr(n+1,d2),fr(Math.max(1,n-1),d2),fr(a+c,d2),fr(n+2,d2),fr(n+3,d2)])},35),
Q('geo','مهندس صغير','مساحات ومحيطات الأشكال','m','△',()=>{const t=R(0,4);let q,r,a=R(3,15),b=R(2,12);if(t==0){q=`مستطيل طوله ${a} سم وعرضه ${b} سم. مساحته = ؟ سم²`;r=a*b}else if(t==1){q=`مستطيل طوله ${a} سم وعرضه ${b} سم. محيطه = ؟ سم`;r=2*(a+b)}else if(t==2){q=`مربع طول ضلعه ${a} سم. مساحته = ؟ سم²`;r=a*a}else if(t==3){a*=2;q=`مثلث قاعدته ${a} سم وارتفاعه ${b} سم. مساحته = ؟ سم²`;r=a*b/2}else{const k=pick([7,14,21]);q=`دائرة نصف قطرها ${k} سم. محيطها = ؟ سم (π = 22/7)`;r=44*k/7}return mk(q,r,near(r))},30),
Q('pct','خبير الخصومات','النسبة المئوية والخصم','m','%',()=>{const p=pick([5,10,15,20,25,30,40,50,75]),y=R(2,40)*20,d=y*p/100;if(R(0,1))return mk(`${L(p+'%')} من ${y} = ؟`,d,near(d));return mk(`سعر سلعة ${y} جنيه وعليها خصم ${L(p+'%')}. السعر بعد الخصم = ؟ جنيه`,y-d,near(y-d))},25),
Q('prime','صيّاد الأعداد','الأولية، ق.م.أ، ك.م.أ','m','٧',()=>{const t=R(0,2);if(t==0){const P=[];for(let n=11;n<100;n++)if(isP(n))P.push(n);return mk('أي الأعداد التالية عدد أولي؟',pick(P),shuf([21,27,33,39,49,51,57,63,77,87,91,93]))}if(t==1){const g=pick([2,3,4,5,6,8,9]);let a,b;do{a=g*R(2,7);b=g*R(2,7)}while(a==b);const r=gcd(a,b);return mk(`القاسم المشترك الأكبر للعددين ${L(a+' ، '+b)} = ؟`,r,near(r))}let a,b;do{a=R(2,9);b=R(2,9)}while(a==b);const l=a*b/gcd(a,b);return mk(`المضاعف المشترك الأصغر للعددين ${L(a+' ، '+b)} = ؟`,l,[a*b,...near(l)])},25),
Q('units','تحويل الوحدات','حوّل بين الوحدات بسرعة','m','كم',()=>{const[a,b,f]=pick(UN),n=R(2,9);return mk(`${n} ${a} = ؟ ${b}`,n*f,[n*f*10,n*f+f,n*f+n,n*f-n])},18),
Q('pattern','أكمل المتتالية','اكتشف النمط وأكمل الرقم الناقص','m','١٢٣',()=>{const t=R(0,3);let s;if(t==0){const a=R(1,20),d=R(2,9);s=[0,1,2,3,4].map(i=>a+d*i)}else if(t==1){const a=R(1,4),m=pick([2,3]);s=[0,1,2,3,4].map(i=>a*m**i)}else if(t==2){const k=R(1,6);s=[0,1,2,3,4].map(i=>(k+i)**2)}else{const x=R(1,10),a=R(2,5),b=R(6,9);s=[x,x+a,x+a+b,x+2*a+b,x+2*a+2*b]}return mk(`أكمل المتتالية: ${L(s.slice(0,4).join('، ')+'، ؟')}`,s[4],near(s[4]))},25),
Q('cmp','الأكبر أسرع','عشرية وكسور وأعداد سالبة','m','>',()=>{const t=R(0,2);let x,y,sx,sy;if(t==0){x=R(1,9)/10;y=R(10,99)/100;if(x==y)y+=.01;sx=x.toFixed(1);sy=y.toFixed(2)}else if(t==1){let a,b,c,d;do{a=R(1,9);b=R(a+1,12);c=R(1,9);d=R(c+1,12)}while(a*d==b*c);x=a/b;y=c/d;sx=a+'/'+b;sy=c+'/'+d}else{x=-R(1,20);y=-R(1,20);if(x==y)y--;sx=String(x);sy=String(y)}const r=x>y?sx:sy,w=x>y?sy:sx;return mk('أيهما أكبر؟',L(r),[L(w)])},8,14),
Q('gram','قواعد وإعراب','نحو وصرف ولغة عربية','l','نحو',bk(GRM),20),
Q('dad','ضاد أم ظاء؟','أكمل الكلمة بالحرف الصحيح','l','ض ظ',()=>{const[w,c]=pick(DAD),i=w.indexOf(c);return mk(`أكمل الكلمة: ${w.slice(0,i)}…${w.slice(i+1)}`,c,[c=='ض'?'ظ':'ض'])},12),
Q('en','English Words','ترجم الكلمات الإنجليزية','l','En',pg(EN,e=>`ما معنى ${L(e)}؟`,a=>`كيف تُكتب «${a}» بالإنجليزية؟`,e=>L(e)),12),
X('scr','رتّب الحروف','كوّن الكلمة من الحروف المبعثرة','l','حرف',scramble),
X('hang','لعبة المشنقة','خمّن الكلمة قبل ما تخسر المحاولات','l','؟_',hangman),
Q('chem','رموز العناصر','اسم العنصر ورمزه الكيميائي','s','Fe',pg(EL,n=>`ما رمز عنصر ${n}؟`,s=>`أي العناصر رمزه ${L(s)}؟`,x=>x,s=>L(s)),15),
Q('cap','عواصم العالم','اعرف عواصم الدول العربية والعالم','s','◎',pg(CAP,c=>`ما عاصمة ${c}؟`,c=>`ما الدولة التي عاصمتها ${c}؟`),12),
Q('gov','محافظات مصر','عواصم المحافظات المصرية','s','مصر',pg(GOV,g=>`ما عاصمة محافظة ${g}؟`,c=>`ما المحافظة التي عاصمتها ${c}؟`),12),
Q('sci','اسأل العلوم','أسئلة علمية متنوعة','s','؟',bk(SCI),18),
Q('tf','صح أم خطأ؟','احكم على العبارة بسرعة','s','✓✗',()=>{const[s,v]=pick(TF);return{q:s,o:['صح','خطأ'],a:v?0:1}},12),
Q('rid','ألغاز ذكاء','ألغاز ومسائل منطق ممتعة','b','!؟',bk(RID),35,8),
Q('str','تحدّي التركيز','اختر لون الخط وليس معنى الكلمة','b','Aa',()=>{const w=pick(COL),ink=pick(COL.filter(c=>c!==w)),q=mk(`<div class="stw" style="color:${ink[1]}">${w[0]}</div><small>ما لون الخط؟</small>`,ink[0],shuf(COL.filter(c=>c!==ink)).map(c=>c[0]));return q},6,12),
X('mem','لعبة الذاكرة','طابق اسم العنصر برمزه','b','▦',memory),
X('ttt','إكس أو','العب ضد الكمبيوتر','b','XO',ttt),
X('sim','ذاكرة الألوان','كرّر التسلسل بعد الكمبيوتر','b','◉',simon),
X('whk','اضرب الإجابة','اضغط على الإجابة الصحيحة قبل ما تختفي','m','٣×٣',whack)
].map((g,i)=>({...g,col:C[i%C.length]}));
if(typeof module!=='undefined'){module.exports={GM};return}
/* ===== الحالة والنتائج ===== */
const SK=()=>'acad_g:'+((U()||{}).id||'-'),ST=()=>{try{return JSON.parse(localStorage.getItem(SK())||'{}')}catch(_){return{}}},SV=s=>{try{localStorage.setItem(SK(),JSON.stringify(s))}catch(_){}},day=()=>new Date().toISOString().slice(0,10);
const root=$('#o');let stop=null,cur=null;
function fin(g,sc,mx,sub){const box=$('#gb');if(!box)return;const pct=mx?sc/mx:0,s=pct>=.9?3:pct>=.6?2:pct>=.3?1:0,S=ST(),r=S[g.id]||{b:0,p:0};r.p++;const nb=sc>r.b;if(nb)r.b=sc;S[g.id]=r;S._a=S._a||{};let pts=0;
 if(pct>=.7&&S._a[g.id]!==day()){S._a[g.id]=day();pts=1;try{award('game',g.id+':'+day())}catch(_){}}SV(S);
 const msg=pct>=.9?'أداء أسطوري! كمّل كده':pct>=.6?'شغل جامد، حاول تكسر رقمك':pct>=.3?'بداية كويسة، جرّب تاني وهتتحسن':'مفيش مشكلة، التكرار بيعلّم';
 box.innerHTML=`<div class="gr"><div class="gs">${[1,2,3].map(i=>ic('star',34,i<=s?'fill on':'')).join('')}</div><h3>${msg}</h3><div class="big">${Math.round(sc*10)/10}<small style="font-size:.4em;color:var(--mu)"> / ${mx}</small></div><p>${sub||''}</p>${nb&&r.p>1?`<span class="nb">رقم قياسي جديد</span>`:`<p>أفضل نتيجة: ${r.b}</p>`}${pts?`<p style="color:#16a34a;font-weight:700">اتسجّل لك إنجاز في الألعاب النهاردة</p>`:''}<div class="act"><button class="btn btn-p" id="ra">${ic('back',16)} العب تاني</button><button class="btn btn-o" id="bk">كل الألعاب</button></div></div>`;
 $('#ra').onclick=()=>play(g);$('#bk').onclick=hub}
/* ===== محرك الأسئلة ===== */
function quiz(g,box){let i=0,ok=0,st=0,best=0,tm,lock=0;const N=g.rn||10,T=g.t||15,used=new Set();
 const next=()=>{if(i>=N)return fin(g,ok,N,`أطول سلسلة إجابات صحيحة: ${best}`);let q,k=0;do q=g.gen(i);while(used.has(q.q+q.o[q.a])&&k++<30);used.add(q.q+q.o[q.a]);lock=0;
  box.innerHTML=`<div class="gq-top"><span>سؤال <b>${i+1}</b> من ${N}</span><span class="gq-st">${ic('star',14,'fill amber')} ${ok}</span>${st>1?`<span class="gq-sk">سلسلة ${st}</span>`:''}</div><div class="gq-tm"><i style="animation-duration:${T}s"></i></div><div class="gq-q">${q.q}</div><div class="gq-o">${q.o.map((o,j)=>`<button data-j="${j}">${/[\u0600-\u06FF]/.test(o)?o:L(o)}</button>`).join('')}</div><div class="gq-fb" aria-live="polite"></div>`;
  const bs=[...box.querySelectorAll('.gq-o button')];
  const ans=j=>{if(lock)return;lock=1;clearTimeout(tm);const right=j===q.a;if(j>=0)bs[j].classList.add(right?'ok':'no');bs[q.a].classList.add('ok');bs.forEach(b=>b.disabled=true);
   if(right){ok++;st++;best=Math.max(best,st)}else st=0;box.querySelector('.gq-fb').textContent=j<0?'خلص الوقت، الإجابة الصحيحة بالأخضر':right?pick(['صح، برافو','ممتاز','إجابة سريعة وصحيحة']):'الإجابة الصحيحة متعلّمة بالأخضر';
   i++;tm=setTimeout(next,right?800:1600)};
  bs.forEach((b,j)=>b.onclick=()=>ans(j));tm=setTimeout(()=>ans(-1),T*1000)};
 next();return()=>{lock=1;clearTimeout(tm)}}
/* ===== ألعاب خاصة ===== */
function memory(g,box){const els=shuf(EL).slice(0,8),cs=shuf(els.flatMap(([n,s],k)=>[{k,t:n},{k,t:s,s:1}]));let a=-1,lock=0,mv=0,m=0,t0=Date.now(),to;
 box.innerHTML=`<div class="gq-top"><span>الحركات <b id="mm">0</b></span><span>الوقت <b id="mt">0</b> ث</span><span>طابق العنصر برمزه</span></div><div class="gmem">${cs.map((c,i)=>`<button class="mc" data-i="${i}"><span class="mf">؟</span><span class="mb">${c.s?L(c.t):c.t}</span></button>`).join('')}</div>`;
 const bs=[...box.querySelectorAll('.mc')],iv=setInterval(()=>{const e=$('#mt');if(e)e.textContent=Math.round((Date.now()-t0)/1000)},1000);
 bs.forEach((b,i)=>b.onclick=()=>{if(lock||b.classList.contains('on'))return;b.classList.add('on');if(a<0){a=i;return}mv++;$('#mm').textContent=mv;
  if(cs[a].k==cs[i].k){bs[a].classList.add('mt');b.classList.add('mt');a=-1;if(++m==8){clearInterval(iv);to=setTimeout(()=>fin(g,Math.max(0,100-(mv-8)*6),100,`خلّصتها في ${mv} حركة وفي ${Math.round((Date.now()-t0)/1000)} ثانية`),700)}}
  else{lock=1;const p=a;a=-1;to=setTimeout(()=>{bs[p].classList.remove('on');b.classList.remove('on');lock=0},850)}});
 return()=>{clearInterval(iv);clearTimeout(to)}}
function scramble(g,box){const ws=shuf(WS).slice(0,8);let i=0,sc=0,tm,hints=3;
 const nx=()=>{if(i>=8)return fin(g,sc,8,'كلمات رتّبتها صح');const w=ws[i];let ls;do ls=shuf(Array.from(w));while(ls.join('')===w);let cr=[],lock=0;
  box.innerHTML=`<div class="gq-top"><span>كلمة <b>${i+1}</b> من 8</span><span class="gq-st">${ic('star',14,'fill amber')} ${sc}</span><span>${w.length} حروف</span></div><div class="gq-tm"><i style="animation-duration:40s"></i></div><div class="ga" id="ga">·</div><div class="gt">${ls.map((c,k)=>`<button data-k="${k}">${c}</button>`).join('')}</div><div class="gact"><button class="btn btn-o btn-s" id="gd">مسح حرف</button><button class="btn btn-o btn-s" id="gh">تلميح (${hints})</button><button class="btn btn-o btn-s" id="gs">تخطي</button></div><div class="gq-fb"></div>`;
  const bs=[...box.querySelectorAll('.gt button')],ga=$('#ga'),fb=box.querySelector('.gq-fb');const go=()=>{clearTimeout(tm);lock=1;i++;setTimeout(nx,900)};
  const dr=()=>{ga.textContent=cr.length?cr.map(k=>ls[k]).join(''):'·';bs.forEach((b,k)=>b.disabled=cr.includes(k))};
  bs.forEach((b,k)=>b.onclick=()=>{if(lock)return;cr.push(k);dr();if(cr.length==w.length){if(cr.map(k=>ls[k]).join('')===w){sc++;ga.style.color='#16a34a';fb.textContent='صح، برافو';go()}else{ga.classList.add('shk');setTimeout(()=>{ga.classList.remove('shk');cr=[];dr()},450)}}});
  $('#gd').onclick=()=>{if(!lock){cr.pop();dr()}};$('#gs').onclick=()=>{if(lock)return;fb.textContent='الكلمة: '+w;go()};
  $('#gh').onclick=()=>{if(lock||!hints)return;hints--;$('#gh').textContent=`تلميح (${hints})`;fb.textContent='أول حرف: '+w[0]};
  tm=setTimeout(()=>{if(!lock){fb.textContent='خلص الوقت، الكلمة: '+w;go()}},40000)};
 nx();return()=>clearTimeout(tm)}
function hangman(g,box){const ws=shuf(HW).slice(0,5),KB='ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' '),nm=c=>c.replace(/[أإآ]/g,'ا').replace('ى','ي').replace('ة','ه');let i=0,sc=0,to;
 const nx=()=>{if(i>=5)return fin(g,sc,5,'كلمات خمّنتها');const[w,h]=ws[i],gs=new Set();let lv=6,lock=0;
  box.innerHTML=`<div class="gq-top"><span>كلمة <b>${i+1}</b> من 5</span><span>التصنيف: <b>${h}</b></span></div><div class="hl" id="hl"></div><div class="hw" id="hw"></div><div class="gk">${KB.map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div><div class="gq-fb"></div>`;
  const dr=()=>{$('#hw').innerHTML=Array.from(w).map(c=>`<span>${gs.has(nm(c))?c:''}</span>`).join('');$('#hl').innerHTML=[0,1,2,3,4,5].map(k=>ic('heart',20,k<lv?'fill':'off')).join('')};dr();
  const end=won=>{lock=1;if(won)sc++;const f=box.querySelector('.gq-fb');f.textContent=won?'برافو، خمّنتها':'الكلمة كانت: '+w;if(!won)$('#hw').innerHTML=Array.from(w).map(c=>`<span>${c}</span>`).join('');i++;to=setTimeout(nx,1500)};
  box.querySelectorAll('.gk button').forEach(b=>b.onclick=()=>{if(lock)return;const k=b.dataset.k;gs.add(k);b.disabled=true;if(Array.from(w).some(c=>nm(c)==k)){b.classList.add('ok');dr();if(Array.from(w).every(c=>gs.has(nm(c))))end(1)}else{b.classList.add('no');lv--;dr();if(!lv)end(0)}})};
 nx();return()=>clearTimeout(to)}
function ttt(g,box){const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],win=b=>{for(const[a,c,d]of W)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(Boolean)?'d':null};
 const mm=(b,p)=>{const w=win(b);if(w=='O')return 1;if(w=='X')return -1;if(w=='d')return 0;let r=p=='O'?-2:2;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const s=mm(b,p=='O'?'X':'O');b[i]=0;r=p=='O'?Math.max(r,s):Math.min(r,s)}return r};
 const cpu=(b,lv)=>{const e=[0,1,2,3,4,5,6,7,8].filter(i=>!b[i]);if(lv==0||(lv==1&&R(0,9)<4))return pick(e);let bs=-2,mv=[];for(const i of e){b[i]='O';const s=mm(b,'X');b[i]=0;if(s>bs){bs=s;mv=[i]}else if(s==bs)mv.push(i)}return pick(mv)};
 box.innerHTML=`<p class="gdesc">اختار المستوى وابدأ، إنت دايمًا X وبتلعب الأول</p><div class="gl"><button class="btn btn-o" data-l="0">سهل</button><button class="btn btn-o" data-l="1">متوسط</button><button class="btn btn-p" data-l="2">صعب</button></div>`;
 let to;box.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const lv=+b.dataset.l,bd=Array(9).fill(0);let lock=0;
  box.innerHTML=`<div class="gq-top"><span>دورك: X</span></div><div class="tt">${bd.map((_,i)=>`<button data-i="${i}"></button>`).join('')}</div><div class="gq-fb"></div>`;
  const bs=[...box.querySelectorAll('.tt button')],dr=()=>bs.forEach((x,i)=>{x.textContent=bd[i]||'';x.className=bd[i]=='X'?'x':bd[i]=='O'?'o':''}),chk=()=>{const w=win(bd);if(!w)return 0;lock=1;to=setTimeout(()=>fin(g,w=='X'?3:w=='d'?1:0,3,w=='X'?'كسبت الكمبيوتر':w=='d'?'تعادل':'الكمبيوتر كسب المرة دي'),900);return 1};
  bs.forEach((x,i)=>x.onclick=()=>{if(lock||bd[i])return;bd[i]='X';dr();if(chk())return;lock=1;to=setTimeout(()=>{bd[cpu(bd,lv)]='O';dr();lock=0;chk()},450)})});
 return()=>clearTimeout(to)}
function simon(g,box){const CL=['#ef4444','#3b82f6','#22c55e','#eab308'],F=[262,330,392,494];let seq=[],pi=0,busy=1,lvl=0,ac,tms=[];const t=(f,ms)=>tms.push(setTimeout(f,ms));
 box.innerHTML=`<div class="gq-top"><span>المستوى <b id="sl">1</b></span><span id="si">ركّز...</span><span>اوصل لمستوى 10</span></div><div class="sm">${CL.map((c,k)=>`<button data-k="${k}" style="background:${c};color:${c}" aria-label="لون ${k+1}"></button>`).join('')}</div>`;
 const ps=[...box.querySelectorAll('.sm button')],info=$('#si');
 const beep=k=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),gn=ac.createGain();o.frequency.value=F[k];gn.gain.value=.1;o.connect(gn);gn.connect(ac.destination);o.start();setTimeout(()=>o.stop(),220)}catch(_){}};
 const fl=k=>{ps[k].classList.add('lit');beep(k);t(()=>ps[k].classList.remove('lit'),300)};
 const nr=()=>{busy=1;seq.push(R(0,3));lvl=seq.length;$('#sl').textContent=lvl;info.textContent='ركّز...';seq.forEach((k,j)=>t(()=>fl(k),700+j*620));t(()=>{busy=0;pi=0;info.textContent='دورك'},700+seq.length*620)};
 ps.forEach((b,k)=>b.onclick=()=>{if(busy)return;fl(k);if(k!==seq[pi]){busy=1;info.textContent='غلط';t(()=>fin(g,lvl-1,10,`وصلت للمستوى ${lvl-1}`),700);return}if(++pi==seq.length){busy=1;if(lvl>=10)t(()=>fin(g,10,10,'خلّصت كل المستويات'),600);else t(nr,900)}});
 t(nr,500);return()=>{tms.forEach(clearTimeout);try{ac&&ac.close()}catch(_){}}}
function whack(g,box){let sc=0,left=45,cor,wt,lock=0;const gen=()=>{const a=R(2,12),b=R(2,9),t=R(0,2);return t==0?[`${a} × ${b}`,a*b]:t==1?[`${a*b} ÷ ${b}`,a]:[`${a+3*b} − ${b}`,a+2*b]};
 box.innerHTML=`<div class="gq-top"><span>الوقت <b id="wt">45</b> ث</span><span class="gq-st">${ic('star',14,'fill amber')} <b id="ws">0</b></span></div><div class="gq-q" id="wq" style="min-height:56px"></div><div class="wh">${Array(9).fill(0).map((_,i)=>`<button data-i="${i}"></button>`).join('')}</div><div class="gq-fb">+10 للصح و −5 للغلط</div>`;
 const hs=[...box.querySelectorAll('.wh button')],up=()=>$('#ws').textContent=sc;
 const wave=()=>{const[q,r]=gen();cor=r;hs.forEach(h=>{h.textContent='';h.classList.remove('up')});const cells=shuf([0,1,2,3,4,5,6,7,8]);[r,...near(r)].forEach((v,k)=>{const h=hs[cells[k]];h.textContent=v;h.classList.add('up')});$('#wq').innerHTML=L(q+' = ؟');clearTimeout(wt);wt=setTimeout(wave,2800)};
 hs.forEach(h=>h.onclick=()=>{if(lock||!h.classList.contains('up'))return;if(+h.textContent===cor){sc+=10;up();wave()}else{sc=Math.max(0,sc-5);up();h.classList.remove('up');h.textContent='';h.classList.add('shk');setTimeout(()=>h.classList.remove('shk'),350)}});
 const iv=setInterval(()=>{left--;$('#wt').textContent=left;if(left<=0){lock=1;clearInterval(iv);clearTimeout(wt);fin(g,sc,150,'كل إجابة صح بـ 10 نقاط')}},1000);wave();
 return()=>{lock=1;clearInterval(iv);clearTimeout(wt)}}
/* ===== الواجهة ===== */
function play(g){if(stop)stop();cur=g;root.onclick=null;root.innerHTML=`<div class="gbar"><button class="btn btn-o btn-s" id="bk">${ic('right',14)} الألعاب</button><h2>${g.n}</h2></div><div class="gbox" id="gb"></div>`;$('#bk').onclick=hub;window.scrollTo({top:0});stop=g.k=='q'?quiz(g,$('#gb')):g.run(g,$('#gb'))}
function hub(f){if(stop){stop();stop=null}cur=null;f=typeof f=='string'?f:'all';const S=ST(),pl=GM.filter(g=>S[g.id]).length,tp=GM.reduce((a,g)=>a+((S[g.id]||{}).p||0),0),fg=GM[Math.floor(Date.now()/864e5)%GM.length],ls=GM.filter(g=>f=='all'||g.c==f);
 root.innerHTML=`<div class="hm-hi"><h1>${ic('star',26)} الألعاب</h1></div><p class="muted">${GM.length} لعبة بتخلّي المذاكرة أحلى: حساب ولغة وعلوم وتركيز. العب، اتسلّى، وراجع معلوماتك من غير ما تحس.</p>
 <div class="gfe" style="--c1:${fg.col[0]};--c2:${fg.col[1]}"><span class="gi">${fg.g}</span><div><small>لعبة النهاردة</small><b>${fg.n}</b><small>${fg.d}</small></div><button class="btn" data-id="${fg.id}">العب دلوقتي</button></div>
 <div class="gh"><div class="hs" style="--c1:#0878C9;--c2:#5cc0ff"><b>${GM.length}</b><small>لعبة متاحة</small></div><div class="hs" style="--c1:#059669;--c2:#6ee7b7"><b>${pl}</b><small>لعبة جرّبتها</small></div><div class="hs" style="--c1:#ea580c;--c2:#fdba74"><b>${tp}</b><small>مرات لعب</small></div></div>
 <div class="chips">${[['all','الكل'],...Object.entries(CAT)].map(([k,t])=>`<button class="chp ${k==f?'on':''}" data-f="${k}">${t}</button>`).join('')}</div>
 <div class="gg">${ls.map(g=>{const b=(S[g.id]||{}).b;return`<button class="gc" data-id="${g.id}" style="--c1:${g.col[0]};--c2:${g.col[1]}"><span class="gi">${g.g}</span><b>${g.n}</b><small>${g.d}</small><span class="gm"><em>${CAT[g.c]}</em>${b?`<i>${ic('star',12,'fill amber')} ${b}</i>`:''}</span></button>`}).join('')}</div>`;
 root.onclick=e=>{const c=e.target.closest('[data-f]');if(c){hub(c.dataset.f);return}const p=e.target.closest('[data-id]');if(p)play(GM.find(g=>g.id==p.dataset.id))}}
hub();
})();
