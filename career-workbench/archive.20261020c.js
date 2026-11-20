// Browser-local career records. No network, credentials, or shared server storage.
export const ARCHIVE_PREFIX='rain-career-archive-v1:';
const ids=['position-map','research','resume','interview','review'];
export const archiveIdentity=s=>JSON.stringify([s.company?.trim()||'',s.role?.trim()||'']);
const str=(x,n=100000)=>typeof x==='string'?x.slice(0,n):'';
function output(x){
 if(!x||typeof x.text!=='string'||typeof x.input!=='string')return null;
 const out={text:str(x.text),input:str(x.input,180000),at:str(x.at,80),model:str(x.model,100),edited:x.edited===true,nextQuestion:typeof x.nextQuestion==='string'?str(x.nextQuestion,2000):null};
 const list=v=>Array.isArray(v)&&v.length<=3&&v.every(y=>typeof y==='string'&&y.length<=800);
 if(x.scores&&['relevance','structure','evidence','roleFit'].every(k=>x.scores[k]&&(x.scores[k].score===null||Number.isInteger(x.scores[k].score)&&x.scores[k].score>=0&&x.scores[k].score<=25)&&typeof x.scores[k].reason==='string'))out.scores=Object.fromEntries(['relevance','structure','evidence','roleFit'].map(k=>[k,{score:x.scores[k].score,reason:str(x.scores[k].reason,600)}]));
 if(x.kiss&&['keep','improve','start','stop'].every(k=>list(x.kiss[k])))out.kiss=Object.fromEntries(['keep','improve','start','stop'].map(k=>[k,[...x.kiss[k]]]));
 if(list(x.actions))out.actions=[...x.actions];
 if(Array.isArray(x.questions)&&x.questions.length<=5&&x.questions.every(q=>q&&typeof q.question==='string'&&typeof q.focus==='string'))out.questions=x.questions.map(q=>({question:str(q.question,1200),focus:str(q.focus,300)}));
 if(x.references&&typeof x.references.version==='string'&&Array.isArray(x.references.ids)&&x.references.ids.length<=2)out.references={version:str(x.references.version,100),ids:x.references.ids.map(v=>str(v,200)),status:str(x.references.status,100)};
 if(Array.isArray(x.sources))out.sources=x.sources.slice(0,2).filter(v=>v&&typeof v.title==='string'&&typeof v.url==='string').map(v=>({title:str(v.title,300),url:str(v.url,2000),retrievedAt:str(v.retrievedAt,80)}));
 if(x.total===null||Number.isFinite(x.total))out.total=x.total;
 return out;
}
export function archiveSnapshot(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('档案内容无法读取');
 const s={notes:{},outputs:{},banks:{},practiceHistory:[],milestones:[]};
 const limits={company:160,role:200,market:80,jd:20000,candidate:18000,cvName:300,question:2000,answer:8000,practiceRound:40,practiceTarget:22000,reviewRound:40,interviewDate:20,recollection:10000,reflection:6000};
 for(const [k,n] of Object.entries(limits))s[k]=str(raw[k],n);
 s.practiceRound=['HR 面','业务面'].includes(s.practiceRound)?s.practiceRound:'HR 面';
 for(const id of ids){s.notes[id]=str(raw.notes?.[id],4000);const o=output(raw.outputs?.[id]);if(o)s.outputs[id]=o;}
 for(const round of ['HR 面','业务面']){const b=raw.banks?.[round];if(b&&typeof b.input==='string'&&Array.isArray(b.questions)&&b.questions.length<=5&&b.questions.every(q=>typeof q.question==='string'&&typeof q.focus==='string'))s.banks[round]={input:str(b.input,180000),questions:b.questions.map(q=>({question:str(q.question,1200),focus:str(q.focus,300)}))};}
 if(Array.isArray(raw.practiceHistory))s.practiceHistory=raw.practiceHistory.filter(x=>x&&typeof x.question==='string'&&typeof x.answer==='string').map(x=>({target:str(x.target,22000),round:str(x.round,40),question:str(x.question,2000),answer:str(x.answer,8000),text:str(x.text),at:str(x.at,80)}));
 if(Array.isArray(raw.milestones))s.milestones=raw.milestones.filter(x=>x&&typeof x.id==='string'&&ids.includes(x.step)&&output(x.output)).map(x=>({id:str(x.id,80),step:x.step,at:str(x.at,80),kind:str(x.kind,40),output:output(x.output)}));
 // Archives intentionally omit binary JD images. Drop only that image marker
 // from the associated practice identity, retaining company/role/market/full JD.
 // Without JD text, do not pretend an image-only target can be restored.
 const archivedTarget=value=>{try{const t=JSON.parse(value);if(Array.isArray(t)&&t.length===5&&t.slice(0,4).every(x=>typeof x==='string')&&t[3].trim()&&typeof t[4]==='string'&&/^\d+:\d+$/.test(t[4]))return JSON.stringify(t.slice(0,4));}catch{}return value;};
 s.practiceTarget=archivedTarget(s.practiceTarget);
 s.practiceHistory=s.practiceHistory.map(x=>({...x,target:archivedTarget(x.target)}));
 return s;
}
export function createArchiveStore(storage,{uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString()}={}){
 const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(id);
 function read(id){if(!validId(id))throw Error('档案编号无效');const text=storage.getItem(ARCHIVE_PREFIX+id);if(!text)return null;const r=JSON.parse(text);if(r.schema!==1||r.id!==id||typeof r.revision!=='string')throw Error('档案格式无法读取，请保留原备份');return {...r,snapshot:archiveSnapshot(r.snapshot)};}
 function list(){const items=[];let unreadable=0;for(let i=0;i<storage.length;i++){const k=storage.key(i);if(!k?.startsWith(ARCHIVE_PREFIX))continue;try{const r=read(k.slice(ARCHIVE_PREFIX.length));if(r)items.push(r);}catch{unreadable++;}}return {items:items.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),unreadable};}
 function save(raw,{id,revision}={}){
  const snapshot=archiveSnapshot(raw);if(!snapshot.company.trim()||!snapshot.role.trim())throw Error('先在岗位地图填好公司和岗位名称，再存档');
  const old=id?read(id):null;if(id&&(!old||old.revision!==revision))throw Error('档案已在另一标签页更新，当前草稿未覆盖它；请另存为新档案');
  const stamp=now();const record={schema:1,id:id||uuid(),revision:uuid(),createdAt:old?.createdAt||stamp,updatedAt:stamp,title:snapshot.company.trim()+' - '+snapshot.role.trim(),snapshot};
  const json=JSON.stringify(record);if(json.length>2000000)throw Error('这份档案已较大，请先导出备份；当前草稿仍保留');
  try{storage.setItem(ARCHIVE_PREFIX+record.id,json);}catch{throw Error('浏览器空间不足或不允许保存，存档未成功；请先导出当前资料');}
  return record;
 }
 function importRecord(text){if(text.length>4000000)throw Error('请选择 4 MB 以内的岗位档案备份');let r;try{r=JSON.parse(text);}catch{throw Error('不是有效的岗位档案 JSON 文件');}if(r.schema!==1||!r.snapshot)throw Error('请选择由工作台导出的岗位档案备份');return save(r.snapshot);}
 return {read,list,save,importRecord};
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={'position-map':'岗位地图',research:'公司调研',resume:'简历优化',interview:'面试陪练',review:'面试复盘'};
const pre=x=>`<div class="archive-prose">${esc(x||'尚未填写')}</div>`;
function content(out){
 let h=pre(out.text);
 if(out.questions)h+='<ol>'+out.questions.map(q=>`<li>${esc(q.question)} — ${esc(q.focus)}</li>`).join('')+'</ol>';
 if(out.scores)h+='<ul>'+Object.entries(out.scores).map(([k,v])=>`<li>${esc(({relevance:'切题程度',structure:'逻辑结构',evidence:'具体证据',roleFit:'岗位相关性'})[k]||k)}：${esc(v?.score??'暂不评分')}/25 · ${esc(v?.reason)}</li>`).join('')+'</ul><p>练习评分，不代表录用概率</p>';
 if(out.kiss)for(const [key,title] of [['keep','Keep · 继续保持'],['improve','Improve · 做得更好'],['start','Start · 开始做'],['stop','Stop · 停止做']])h+=`<h4>${title}</h4><ul>${(Array.isArray(out.kiss[key])?out.kiss[key]:[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 if(Array.isArray(out.actions))h+='<h4>下一轮行动</h4><ol>'+out.actions.map(x=>`<li>${esc(x)}</li>`).join('')+'</ol>';
 if(out.nextQuestion)h+='<h4>下一道追问 / 值得重练的问题</h4>'+pre(out.nextQuestion);
 if(out.sources?.length)h+='<h4>来源</h4>'+out.sources.map(x=>pre((x.title||'')+'\n'+(x.url||''))).join('');
 return h;
}
export function archiveDocumentBody(record){
 const s=archiveSnapshot(record.snapshot);let h=`<header><p>MY CAREER JOURNEY</p><h1>${esc(record.title)}</h1><p>岗位存档 · ${esc(record.updatedAt)} · 雨雨小天才制作</p></header><section><h2>01 目标岗位与原始 JD</h2><p>${esc(s.company)} · ${esc(s.role)} · ${esc(s.market)}</p>${pre(s.jd)}</section><section><h2>02 原始简历 / 经历</h2><p>${esc(s.cvName)}</p>${pre(s.candidate)}</section>`;
 for(const id of ids){const out=s.outputs[id];if(out)h+=`<section><h2>${esc(labels[id])}</h2><p>最近保存的结果 · ${esc(out.at)}${out.edited?' · 已手动编辑':''}</p>${content(out)}</section>`;}
 if(Object.keys(s.banks).length)h+='<section><h2>我的模拟题库</h2>'+Object.entries(s.banks).map(([round,b])=>`<h3>${esc(round)}</h3><ol>${b.questions.map(q=>`<li>${esc(q.question)} — ${esc(q.focus)}</li>`).join('')}</ol>`).join('')+'</section>';
 if(s.question||s.answer)h+='<section><h2>当前练习</h2><h3>题目</h3>'+pre(s.question)+'<h3>我的回答</h3>'+pre(s.answer)+'</section>';
 if(s.practiceHistory.length)h+='<section><h2>历次练习记录</h2>'+s.practiceHistory.map(x=>`<article><h3>${esc(x.round)} · ${esc(x.question)}</h3>${pre(x.answer)}<h4>当次反馈</h4>${pre(x.text)}</article>`).join('')+'</section>';
 if(s.recollection||s.reflection)h+='<section><h2>面试实录与个人感受</h2><p>'+esc(s.reviewRound)+' · '+esc(s.interviewDate)+'</p><h3>问题、回答与追问</h3>'+pre(s.recollection)+'<h3>感受与 Key Learnings</h3>'+pre(s.reflection)+'</section>';
 const notes=Object.entries(s.notes).filter(([,v])=>v);if(notes.length)h+='<section><h2>我的补充要求</h2>'+notes.map(([k,v])=>`<h3>${esc(labels[k])}</h3>${pre(v)}`).join('')+'</section>';
 if(s.milestones.length)h+='<section><h2>求职历程 · 全部已留存生成版本</h2>'+s.milestones.map((m,i)=>{let original={};try{original=JSON.parse(m.output.input);}catch{}return `<article><h3>${i+1}. ${esc(labels[m.step])}${m.kind==='question-bank'?' · 模拟题库':''}</h3><p>${esc(m.at)}</p>${content(m.output)}<details><summary>当时使用的资料</summary>${pre(JSON.stringify(original,null,2))}</details></article>`;}).join('')+'</section>';
 h+='<footer>AI 内容仅供求职准备参考，请核对事实；历史版本可能基于旧材料。文件包含个人资料，请妥善保存。</footer>';return h;
}
export function archiveDocument(record){return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(record.title)+' · 岗位档案</title><style>body{max-width:960px;margin:40px auto;padding:0 24px;background:#fffdf5;color:#292820;font:17px/1.8 system-ui,sans-serif}h1{font-size:32px}h2{font-size:25px}h3{font-size:20px}header,section{padding:26px 32px;margin-bottom:24px;background:white;border:1px solid #eee8d2;border-radius:18px}.archive-prose{white-space:pre-wrap;overflow-wrap:anywhere}article{border-top:1px solid #eee8d2;padding-block:16px}footer,header p{color:#706d62;font-size:14px}@media print{body{background:white;margin:0;max-width:none}section,header{border:0;padding:0}h2,h3{break-after:avoid}details{display:none}}</style><body>'+archiveDocumentBody(record)+'</body></html>';}
