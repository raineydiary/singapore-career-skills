/* Standalone, same-origin workflow UI. Never stores API keys or injects model HTML. */
import { REFERENCE_VERSION, selectReferences, resolveReferenceIds, safeReference } from './reference-library.20261018a.js';
import { findOfficialJobs } from './official-jobs.20261020i.js';
import { researchHTML, researchSources } from './research-display.20261025e.js';
import { readResume } from './resume-reader.20261020l.js';
import { resumeHTML } from './resume-format.20261020m.js';
const resumeStyles=document.createElement('link');resumeStyles.rel='stylesheet';resumeStyles.href='./resume-skill.20261020m.css';document.head.append(resumeStyles);
const jobStyles=document.createElement('link');jobStyles.rel='stylesheet';jobStyles.href='./official-jobs.20261020i.css';document.head.append(jobStyles);
import { createArchiveStore, archiveSnapshot, archiveIdentity, archiveDocument, archiveDocumentBody, ARCHIVE_PREFIX } from './archive.20261020c.js?v=20261024a';
let referenceCorpus = null;
try {
  const response = await fetch('./career-references.20261018a.json', { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(5000) });
  if (response.ok) referenceCorpus = await response.json();
} catch { /* Reference failure must not discard drafts or masquerade as success. */ }
(() => {
  'use strict';
  const publicPreview = document.documentElement.dataset.releaseMode === 'public-preview';
  const cloud = document.documentElement.dataset.releaseMode === 'cloud-acceptance';
  const apiBase = cloud ? 'https://rain-career-api.docile-chair-5319.chatgpt.site' : '';
  let clientId = crypto.randomUUID();
  try {const saved=sessionStorage.getItem('rain-workbench-client-v1');if(/^[a-f0-9-]{36}$/i.test(saved||''))clientId=saved;else sessionStorage.setItem('rain-workbench-client-v1',clientId);}catch{/* tab-memory fallback */}
  try { localStorage.removeItem('rain-public-workbench-access-v1'); } catch { /* legacy code is no longer used */ }
  const apiHeaders = () => cloud ? {'X-Client-Id':clientId} : {};
  async function loadSession() {
    try {const r=await fetch(apiBase+'/api/session',{credentials:cloud?'omit':'same-origin',cache:'no-store',headers:apiHeaders(),signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error();session=await r.json();serviceMessage();return session.authenticated;}
    catch {session={ready:false,authenticated:false,modules:[]};serviceMessage();notify('暂时无法连接生成服务，材料仍在本页');return false;}
  }
  const modules = [
    ['position-map','🗺️','岗位地图','','生成岗位分析'],
    ['research','🔎','公司调研','','生成公司调研'],
    ['resume','📄','简历优化','','生成岗位版简历'],
    ['interview','🎤','面试陪练','','查看模拟结果'],
    ['review','📝','面试复盘','','生成面试复盘']
  ];
  const questions = ['请介绍一段最能体现岗位相关能力的经历','你是怎样处理一次意见分歧的？','当信息不完整时，你会怎样推进任务？','讲一次没有达到预期的经历，你后来改变了什么？'];
  const $ = s => document.querySelector(s), key = 'rain-public-workbench-draft-v1';
  const escape = text => String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const emptyState=()=>({company:'',role:'',market:'地区不限 / 中文',jd:'',jdImage:'',jdImageName:'',candidate:'',cvName:'',contextChoices:{},notes:{},question:'',answer:'',outputs:{},practiceRound:'HR 面',practiceTarget:'',reviewRound:'',interviewDate:'',recollection:'',reflection:'',banks:{},practiceHistory:[]});
  let state = emptyState();
  let speech=null, speechStop=null;
  let fileWorker=null, fileReadId=0, confirmedTarget='';
  const imageStamp=value=>{let n=2166136261;for(let i=0;i<value.length;i++)n=Math.imul(n^value.charCodeAt(i),16777619);return value?value.length+':'+(n>>>0):'';};
  const targetStamp=()=>JSON.stringify([state.company,state.role,state.market,state.jd,...(state.jdImage?[imageStamp(state.jdImage)]:[])]);
  let session = { ready:false, authenticated:false, modules:[] }, running = null, timer = null, seconds = 60, deadline = 0, attempts = {};
  const runMessages=new Map();let voiceConsent=false;
  try { const cached = JSON.parse(sessionStorage.getItem(key+'-requests')||'{}'); if(cached && typeof cached==='object') attempts=cached; } catch { /* no automatic requests */ }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (saved && typeof saved === 'object') {
      for (const k of ['company','role','market','jd','candidate','cvName','question','answer']) if (typeof saved[k] === 'string' && saved[k].length <= 40000) state[k] = saved[k];
      if(typeof saved.jdImage==='string'&&saved.jdImage.length<=5592450&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(saved.jdImage)){state.jdImage=saved.jdImage;state.jdImageName=typeof saved.jdImageName==='string'?saved.jdImageName.slice(0,300):'';}
      for(const k of ['practiceRound','reviewRound','interviewDate','recollection','reflection'])if(typeof saved[k]==='string')state[k]=saved[k].slice(0,k==='recollection'?10000:k==='reflection'?6000:40);
      if(typeof saved.practiceTarget==='string'&&saved.practiceTarget.length<=22000)state.practiceTarget=saved.practiceTarget;
      if(saved.banks&&typeof saved.banks==='object')for(const round of ['HR 面','业务面']){const bank=saved.banks[round];if(bank&&typeof bank.input==='string'&&validQuestions(bank.questions))state.banks[round]=bank;}
      if(Array.isArray(saved.practiceHistory))state.practiceHistory=saved.practiceHistory.filter(x=>x&&typeof x.question==='string'&&typeof x.answer==='string'&&typeof x.text==='string').slice(-20);
      for(const module of ['resume','interview']){state.contextChoices[module]={};for(const parent of ['position-map','research','resume'])if(typeof saved.contextChoices?.[module]?.[parent]==='boolean')state.contextChoices[module][parent]=saved.contextChoices[module][parent];}
      for (const [id] of modules) {
        if (typeof saved.notes?.[id] === 'string') state.notes[id] = saved.notes[id].slice(0,4000);
        const out = saved.outputs?.[id];
        if (out && typeof out.text === 'string' && typeof out.input === 'string' && out.text.length <= 100000) state.outputs[id] = {text:out.text,input:out.input,at:typeof out.at==='string'?out.at:'',model:typeof out.model==='string'?out.model:'',edited:out.edited===true,nextQuestion:id==='interview'&&typeof out.nextQuestion==='string'&&out.nextQuestion.length<=2000?out.nextQuestion:null,references: cleanReferenceRecord(out.references),sources:cleanSources(out.sources)};
        if(state.outputs[id]&&['interview','review'].includes(id)){try{Object.assign(state.outputs[id],cleanStructured(out,id));}catch{/* preserve text only */}}
      }
    }
  } catch { /* Ignore malformed local state, never trust it as identity. */ }
  // Drafts remain tab-local until the visitor explicitly chooses device storage.
  let archiveStore=null,archiveActive=null,archiveTimer=null,archivePending=null;
  try{archiveStore=createArchiveStore(localStorage);const saved=JSON.parse(sessionStorage.getItem(key)||'null');state.milestones=archiveSnapshot(saved||state).milestones;const a=JSON.parse(sessionStorage.getItem(key+'-archive')||'null');if(a?.id){const r=archiveStore.read(a.id);if(r?.revision===a.revision&&archiveIdentity(r.snapshot)===archiveIdentity(state))archiveActive={id:r.id,revision:r.revision,identity:archiveIdentity(r.snapshot)};}}catch{/* Existing drafts stay available when persistent storage is blocked. */}
  function notify(message) { $('#toast').textContent=message; $('#toast').hidden=false; clearTimeout(notify.timer); notify.timer=setTimeout(()=>$('#toast').hidden=true,5500); }
  function save() { try {sessionStorage.setItem(key,JSON.stringify(state));} catch {notify('浏览器无法保存草稿，请先导出重要结果');} queueArchive(); }
  function archiveLink(){try{sessionStorage.setItem(key+'-archive',JSON.stringify(archiveActive));}catch{} }
  function archiveStatus(message){if($('#archive-save-status'))$('#archive-save-status').textContent=message;try{if($('#archive-count'))$('#archive-count').textContent=archiveStore?.list().items.length||'';}catch{} }
  function captureArchive(){
    const s=archiveSnapshot(state),identity=archiveIdentity(s);
    const belongs=input=>{try{return archiveIdentity(JSON.parse(input))===identity;}catch{return false;}};
    for(const id of Object.keys(s.outputs)){if(!belongs(s.outputs[id].input))delete s.outputs[id];else{const refs=resolveReferenceIds(referenceCorpus,s.outputs[id].references);if(refs.length)s.outputs[id].sources=refs.map(x=>({title:x.company+' · '+x.title,url:x.url}));}}
    for(const round of Object.keys(s.banks))if(!belongs(s.banks[round].input))delete s.banks[round];
    s.milestones=s.milestones.filter(x=>belongs(x.output.input));
    s.practiceHistory=s.practiceHistory.filter(x=>{try{const t=JSON.parse(x.target);return archiveIdentity({company:t[0],role:t[1]})===identity;}catch{return false;}});
    if(state.practiceTarget&&state.practiceTarget!==targetStamp()){s.question='';s.answer='';s.practiceTarget='';}
    return s;
  }
  function flushArchive(){
    clearTimeout(archiveTimer);archiveTimer=null;if(!archivePending||!archiveActive)return;
    try{const r=archiveStore.save(archivePending,{id:archiveActive.id,revision:archiveActive.revision});archiveActive.revision=r.revision;archivePending=null;archiveLink();archiveStatus('已保存到这台设备');}
    catch(error){archiveActive=null;archivePending=null;archiveLink();archiveStatus('尚未存档，请导出备份');notify(error.message);}
  }
  function queueArchive(){
    if(!archiveActive)return;
    if(archiveActive.identity!==archiveIdentity(state)){flushArchive();archiveActive=null;archiveLink();archiveStatus('新岗位尚未存档');return;}
    archivePending=captureArchive();archiveStatus('正在保存…');clearTimeout(archiveTimer);archiveTimer=setTimeout(flushArchive,500);
  }
  function exportFile(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name.replace(/[\\/:*?"<>|]/g,'-');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function draftRecord(){return {schema:1,title:[state.company||'未命名公司',state.role||'未命名岗位'].join(' - '),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),snapshot:captureArchive()};}
  function downloadArchive(r,backup=false){exportFile(r.title+(backup?' - 岗位备份.json':' - All-in-One.html'),backup?JSON.stringify(r,null,2):archiveDocument(r),backup?'application/json;charset=utf-8':'text/html;charset=utf-8');}
  function saveArchive(){
    if(running||fileWorker){notify('请等当前任务完成，避免漏掉正在生成的结果');return false;}
    if(!archiveStore){notify('浏览器不允许持久保存，请先导出当前资料');return false;}
    try{const wasActive=archiveActive;flushArchive();if(wasActive&&!archiveActive)return false;const snapshot=captureArchive();const r=archiveStore.save(snapshot,archiveActive?{id:archiveActive.id,revision:archiveActive.revision}:{});archiveActive={id:r.id,revision:r.revision,identity:archiveIdentity(snapshot)};archiveLink();archiveStatus('已保存到这台设备');notify('已存档：'+r.title);return r;}
    catch(error){notify(error.message);return false;}
  }
  function offerArchive(){
    if($('#archive-dialog'))return;if(archiveActive){saveArchive();return;}
    const d=document.createElement('dialog');d.id='archive-dialog';d.innerHTML=`<form><h2>保存岗位档案</h2><p>${escape([state.company,state.role].filter(Boolean).join(' - ')||'当前岗位')}</p>${!state.company.trim()?'<label>公司名称<input name="company" required maxlength="160"></label>':''}${!state.role.trim()?'<label>岗位名称<input name="role" required maxlength="200"></label>':''}<p class="hint">包含 JD、简历、AI 产出与面试记录，仅保存在当前浏览器，不会公开上传；清除浏览器数据后会丢失，建议同时导出备份</p><label class="consent"><input name="deviceConsent" type="checkbox" required>这是我的个人设备，同意在此保存岗位资料</label><div class="actions"><button class="primary" type="submit">保存岗位档案</button><button id="archive-later" type="button">稍后再说</button></div></form>`;
    document.body.append(d);$('#archive-later').onclick=()=>{d.close();d.remove();};d.addEventListener('cancel',()=>d.remove());d.querySelector('form').onsubmit=e=>{e.preventDefault();for(const k of ['company','role'])if(d.querySelector('[name="'+k+'"]'))state[k]=d.querySelector('[name="'+k+'"]')?.value.trim();if(saveArchive()){save();d.close();d.remove();if(location.hash==='#archives')archivePage();}};d.showModal();
  }
  function changeDraft(next,id){
    if(running||fileWorker){notify('请等当前任务完成后再切换岗位');return false;}
    stopSpeech();flushArchive();
    if(!archiveActive&&(state.jd||state.candidate||Object.keys(state.outputs).length)&&!confirm('当前草稿还未存档。建议先取消并保存；继续将切换岗位，当前草稿会暂存为本标签页的上一份草稿。继续？'))return false;
    try{sessionStorage.setItem(key+'-previous-draft',JSON.stringify(state));}catch{notify('浏览器无法备份当前草稿，请先导出后再切换');return false;}
    archiveActive=id?{id:next.id,revision:next.revision,identity:archiveIdentity(next.snapshot)}:null;archivePending=null;archiveLink();state=id?{...emptyState(),...archiveSnapshot(next.snapshot)}:emptyState();save();archiveStatus(id?'已载入岗位档案':'新岗位尚未存档');location.hash=id?'#home':'#position-map';render();return true;
  }
  function archivePage(){
    flushArchive();document.querySelectorAll('#nav a').forEach(a=>{if(a.hash==='#archives')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});serviceMessage();
    let listing={items:[],unreadable:0};try{listing=archiveStore?.list()||listing;}catch{listing.unreadable=1;}
    const selectedId=location.hash.startsWith('#archive/')?location.hash.slice(9):null;let selected;try{selected=selectedId?archiveStore?.read(selectedId):null;}catch{}
    if(selected){$('#page').innerHTML=`<div class="archive-toolbar"><a href="#archives">← 岗位档案</a><div class="actions"><button id="continue-record" class="primary">继续准备 →</button><button id="export-record">导出 All-in-One</button><button id="backup-record">导出可恢复备份</button></div></div><div class="archive-document">${archiveDocumentBody(selected)}</div>`;$('#continue-record').onclick=()=>changeDraft(selected,selected.id);$('#export-record').onclick=()=>downloadArchive(selected);$('#backup-record').onclick=()=>downloadArchive(selected,true);return;}
    $('#page').innerHTML=`<header class="page-head"><h1>🗂️ 岗位档案</h1></header><section class="archive-current panel"><div><h2>${escape([state.company,state.role].filter(Boolean).join(' - ')||'当前岗位')}</h2><p>${archiveActive?'当前岗位已存档，后续材料会自动更新':'尚未存档'}</p></div><div class="actions"><button class="primary" id="archive-current">${archiveActive?'更新当前档案':'保存当前岗位'}</button><button id="export-draft">导出当前资料</button><button id="new-role">＋ 新建岗位</button></div></section><p class="archive-privacy">仅保存在当前浏览器，不跨设备同步 · 导出备份可迁移，清除浏览器数据会删除本机档案</p><div class="archive-tools"><label>查找岗位<input id="archive-search" placeholder="搜索公司或岗位" type="search"></label><label class="archive-import">导入岗位备份<input id="archive-import" type="file" accept=".json,application/json"></label></div>${listing.unreadable?'<p role="alert">有档案暂时无法读取，原数据未删除</p>':''}<div class="archive-grid" id="archive-list">${listing.items.map(r=>`<article class="archive-card" data-title="${escape(r.title.toLowerCase())}"><small>${r.snapshot.outputs.review?'复盘已完成':'准备中'}</small><h2><a href="#archive/${r.id}">${escape(r.title)}</a></h2><p>更新于 ${escape(new Date(r.updatedAt).toLocaleString('zh-CN'))}</p><div class="archive-progress">${modules.map(([id,,label])=>`<span class="${r.snapshot.outputs[id]?'done':''}">${r.snapshot.outputs[id]?'✓ ':''}${label}</span>`).join('')}</div><div class="actions"><button class="primary" data-open="${r.id}">继续准备 →</button><a href="#archive/${r.id}">查看完整档案</a><button data-export="${r.id}">导出文档</button></div></article>`).join('')||'<div class="panel archive-empty"><h2>还没有岗位档案</h2><p>保存的岗位会显示在这里</p></div>'}</div><p id="archive-no-match" hidden>没有找到这个公司或岗位</p><details class="draft-recovery"><summary>找回本标签页切换前的草稿</summary><button id="recover-draft">恢复上一份草稿</button></details>`;
    $('#archive-current').onclick=offerArchive;$('#export-draft').onclick=()=>downloadArchive(draftRecord());$('#new-role').onclick=()=>changeDraft(null,null);
    for(const el of document.querySelectorAll('[data-open]'))el.onclick=()=>{try{const r=archiveStore.read(el.dataset.open);if(r)changeDraft(r,r.id);else notify('这份档案已不存在');}catch(e){notify(e.message);}};
    for(const el of document.querySelectorAll('[data-export]'))el.onclick=()=>{try{const r=archiveStore.read(el.dataset.export);if(r)downloadArchive(r);}catch(e){notify(e.message);}};
    $('#archive-search').oninput=e=>{let shown=0;document.querySelectorAll('.archive-card').forEach(c=>{c.hidden=!c.dataset.title.includes(e.target.value.trim().toLowerCase());if(!c.hidden)shown++;});$('#archive-no-match').hidden=shown>0||listing.items.length===0;};
    $('#archive-import').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(!/\.json$/i.test(file.name)||file.size>4000000)throw Error('请选择 4 MB 以内的 JSON 岗位备份');if(!confirm('导入的简历与面试材料将保存在这台设备，仅适合个人电脑。继续？'))return;if(!archiveStore)throw Error('浏览器不允许持久保存');const r=archiveStore.importRecord(await file.text());notify('已导入：'+r.title+'，没有覆盖现有档案');archiveStatus('备份已导入');archivePage();}catch(error){notify(error.message);}finally{e.target.value='';}};
    $('#recover-draft').onclick=()=>{try{const raw=JSON.parse(sessionStorage.getItem(key+'-previous-draft')||'null');if(!raw){notify('当前标签页没有上一份草稿');return;}const snap=archiveSnapshot(raw);if(!changeDraft(null,null))return;state={...emptyState(),...snap};save();render();}catch{notify('上一份草稿无法读取，原数据未删除');}};
    archiveStatus(archiveActive?'当前岗位已存档':'');
  }
  const active = () => modules.find(m=>m[0]===(location.hash==='#draw'?'review':location.hash.slice(1)));
  function inputFor(id) {
    const parents={research:['position-map'],resume:['position-map','research'],interview:['position-map','research','resume'],review:['position-map','research','resume','interview']}[id]||[];
    const upstream=parents.filter(p=>state.outputs[p]?.input===fingerprint(p)).map(p=>({module:p,text:state.outputs[p].text}));
    return { module:id,company:state.company,role:state.role,market:state.market,jd:state.jd,...(id==='position-map'?{jdImage:state.jdImage,jdImageName:state.jdImageName}:{}),candidate:['resume','interview','review'].includes(id)?state.candidate:'',notes:state.notes[id]||'',question:id==='interview'?state.question:'',answer:id==='interview'?state.answer:'',upstream:JSON.stringify(upstream),...(id==='interview'?{action:'feedback',round:state.practiceRound}:{}),...(id==='review'?{round:state.reviewRound,interviewDate:state.interviewDate,recollection:state.recollection,reflection:state.reflection}:{}) };
  }
  const fingerprint = id => {const input=inputFor(id);if(input.jdImage)input.jdImage=imageStamp(input.jdImage);return JSON.stringify({...input,...(id==='position-map'?{referenceVersion:REFERENCE_VERSION}:{})});};
  function cleanReferenceRecord(record) {
    if (!record || record.version !== REFERENCE_VERSION || !Array.isArray(record.ids) || record.ids.length > 2 || typeof record.status !== 'string') return null;
    if (record.ids.some(id => typeof id !== 'string') || resolveReferenceIds(referenceCorpus, record).length !== record.ids.length) return null;
    return { version: record.version, ids: [...record.ids], status: record.status };
  }
  const selection = () => selectReferences(referenceCorpus, { module:'position-map', company:state.company, role:state.role, jd:state.jd });
  function referenceCard(source, reason='') {
    return `<details class="reference-card"><summary><span class="reference-type">${source.kind==='official_job_description'?'官方岗位':'官方人才理念 · 非岗位要求'}</span><strong>${escape(source.company)} · ${escape(source.title)}</strong>${reason?`<span class="reference-match">${escape(reason)}</span>`:''}</summary><p class="reference-stage">${escape(source.stage)}</p><p>${escape(source.facts_summary)}</p><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">查看官方原文 ↗</a></details>`;
  }
  function refreshReferences() {
    const panel=$('#official-references'); if(!panel)return;
    const picked=selection();
    const found=findOfficialJobs(state);
    const roleHint=$('#role-search-hint');
    if(roleHint)roleHint.textContent=found.roleTerms.length>1?'关联英文：'+found.roleTerms.filter(x=>/[a-z]/i.test(x)).join(' · '):'';
    const rows=found.jobs.length?found.jobs.map(j=>`<li><a href="${escape(j.url)}" target="_blank" rel="noopener noreferrer"><strong>${escape(j.company)} · ${escape(j.zh)}</strong> ↗</a><div>${escape(j.title)}</div><p>${escape(j.location)} · ${j.local?'同地区参考':'其他地区参考'} · ${escape(j.summary)}</p></li>`).join(''):picked.sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer"><strong>${escape(s.company)} · ${escape(s.title)}</strong> ↗</a><p>${escape(s.match_reason)}</p></li>`).join('');
    const keywordText=[found.companyTerms.join(' / '),found.roleTerms.join(' / ')].filter(Boolean).join(' · ');
    panel.innerHTML=`<div class="reference-heading"><h2>官方岗位参考</h2></div>${keywordText?`<p class="hint">关联关键词：${escape(keywordText)}</p>`:''}<p class="reference-intro">${rows?`参考地区：${escape(found.market)} · 同地区优先，其他地区供对照`:'已整理资料中暂未匹配到，不代表官网没有这个岗位'}</p><ul class="official-job-list">${rows}</ul><p class="reference-boundary">已核验链接，非实时全网搜索 · 招聘状态以官网为准${found.jobs.length?' · 核验于 '+found.checkedOn:''}</p>`;
  }
  function refreshResultReferences(output) {
    const box=$('#result-references');if(!box)return;
    box.hidden=!output;
    if(!output?.references){box.textContent=output?'这份旧结果没有官方参考记录，不补标来源':'';return;}
    const used=resolveReferenceIds(referenceCorpus,output.references);
    box.innerHTML=`<h3>本次生成时提供的参考</h3><p class="hint">${used.length?'这些资料随 JD 一起提供给模型，不表示模型的每个判断都已获官方验证':'本次未加入官方参考，只依据你提供的 JD'}</p><ul>${used.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.company)} · ${escape(s.title)} ↗</a></li>`).join('')}</ul><p class="hint">资料核验于 ${escape(referenceCorpus?.verified_on||'未知')} · 参考岗位不等于本次招聘要求</p>`;
  }
  function stopTimer() {clearInterval(timer);timer=null;}
  function cleanSources(sources) {
    return researchSources(sources);
  }
  function refreshResearch() {
    const out=state.outputs.research;
    const titles=['行业','公司','业务','岗位'];
    document.querySelectorAll('.dimension-empty').forEach((el,i)=>{
      const part=out?.text?.split('【'+titles[i]+'】')[1]?.split(/【(?:行业|公司|业务|岗位)】/)[0]?.trim();
      el.innerHTML=researchHTML(part||'暂无调研结果');el.classList.toggle('has-result',Boolean(part));
    });
    if($('#research-stale'))$('#research-stale').hidden=!out||out.input===fingerprint('research');
    let sources=$('#research-sources');
    if(!sources&&$('.research-dimensions')){sources=document.createElement('section');sources.id='research-sources';sources.className='panel';$('.research-dimensions').after(sources);}
    if(sources){sources.replaceChildren();sources.hidden=!out;if(out){const title=document.createElement('h3');title.textContent='资料与来源';sources.append(title);const list=document.createElement('ul');for(const s of cleanSources(out.sources)){const li=document.createElement('li'),a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=(s.id?'['+s.id+'] ':'')+s.title+' ↗';li.append(a);const meta=document.createElement('small');meta.textContent=[s.sourceType==='media'?'媒体采访 / 报道':s.sourceType==='research'?'第三方研究':s.sourceType==='official'?'官方资料':'',s.publishedAt?'发布 / 更新 '+s.publishedAt:'',s.reviewedAt?'核验 '+s.reviewedAt:''].filter(Boolean).join(' · ');li.append(meta);list.append(li);}sources.append(list);const note=document.createElement('p');note.className='hint';note.textContent='依据所列公开资料整理，非实时全网搜索 · 历史数据保留原期间，分析判断与事实分开';sources.append(note);}}
  }
  function serviceMessage() {
    $('#service').hidden = publicPreview;
    $('#service').textContent = !session.ready ? '生成服务暂不可用，材料仍保留在本页' : !session.authenticated ? '请先登录后再生成，草稿只保留在当前浏览器标签页' : '生成结果由 AI 提供，请核对事实与数字；不要上传身份证件或雇主机密';
    if(session.mode==='local-acceptance') $('#service').textContent = session.ready ? '本机真实模型测试 · 最多 3 次调用，每次最多 2,048 输出 token · 消耗现有积分，不代表已公开上线' : '本机测试尚未授权、已到调用上限或会话已过期，不会继续调用模型';
    if(publicPreview) {
      $('#service').textContent = '';
      if($('#run-status')&&!running) $('#run-status').textContent = 'AI 生成尚未开放，可先整理材料';
    }
    if(cloud) {
      $('#service').hidden=true;
      let gate=$('#cloud-access');
      if(!gate){gate=document.createElement('div');gate.id='cloud-access';gate.className='cloud-access';$('#service').after(gate);}
      gate.replaceChildren();
      gate.hidden=session.authenticated&&session.remaining==null;
      const label=document.createElement('span');label.textContent=session.authenticated&&session.remaining!=null?`剩余 ${session.remaining} 次生成`:'准备好了吗？从你的目标岗位开始';gate.append(label);
    }
    const button=$('#generate'); if(button) button.disabled=Boolean(running)||!session.ready||!session.authenticated||!session.modules.includes(active()?.[0])||(active()?.[0]==='position-map'&&!referenceCorpus);
    if(button&&cloud&&session.authenticated&&session.remaining===0)button.disabled=true;
    if(button)button.disabled=button.disabled||(!state.jd.trim()&&!state.jdImage);
    if(button&&active()?.[0]!=='position-map'&&!state.jd.trim())button.disabled=true;
    if(button&&active()?.[0]==='resume')button.disabled=button.disabled||Boolean(fileWorker)||!state.candidate.trim();
    if(button&&active()?.[0]==='interview')button.disabled=button.disabled||!state.question.trim()||!state.answer.trim()||state.practiceTarget!==targetStamp();
    if(button&&active()?.[0]==='review')button.disabled=button.disabled||!state.recollection.trim();
    if($('#generate-bank'))$('#generate-bank').disabled=Boolean(running)||!session.ready||!session.authenticated||!session.modules.includes('interview')||!state.jd.trim()||session.remaining===0;
    if(button)$('#run-status').textContent=running?'生成中…':!session.ready?'生成服务暂不可用，材料仍保留':!session.authenticated?'暂时无法连接生成服务':session.remaining===0?'本轮生成额度已用完，已有结果仍可查看和导出':!session.modules.includes(active()?.[0])?'这个功能暂不可用':(active()?.[0]==='position-map'&&!referenceCorpus)?'参考资料加载失败，请刷新页面':(!state.jd.trim()&&!state.jdImage)?'请放入 JD（粘贴文本或上传截图）':active()?.[0]!=='position-map'&&!state.jd.trim()?'先完成岗位地图，截图中的 JD 会自动带入':state.outputs[active()?.[0]]?.input===fingerprint(active()?.[0])?'':'';
  }
  const field=(label,id,value,rows=4,placeholder='')=>`<label for="${id}">${label}</label><textarea id="${id}" rows="${rows}" maxlength="${id==='jd'?20000:id==='candidate'?18000:id==='answer'?8000:4000}" placeholder="${escape(placeholder)}">${escape(value)}</textarea>`;
  function workflowForm(id) {
    const parents=id==='interview'?['position-map','research','resume']:['position-map','research'];
    const cards=parents.map(p=>{
      const out=state.outputs[p],fresh=out&&out.input===fingerprint(p),name=modules.find(m=>m[0]===p);
      return `<div class="context-choice"><label><input type="checkbox" data-context="${p}" ${fresh?'':'disabled'} ${fresh&&state.contextChoices?.[id]?.[p]!==false?'checked':''}><span><strong>${name[1]} ${name[2]}</strong><small>${fresh?'已生成 · 将沿用这份结果':out?'岗位资料已改变，请先更新结果':'还没有结果，可先使用当前 JD'}</small></span></label>${out?`<details><summary>查看${fresh?'内容':'旧结果'}</summary><div class="context-preview">${escape(out.text)}</div></details>`:''}<a href="#${p}">${fresh?'去查看':'去准备'} ↗</a></div>`;
    }).join('');
    return `<div class="workflow-stack"><section class="panel context-panel"><div class="step-heading"><span>01</span><h2>继续准备这个岗位</h2><a href="#position-map">更换岗位 ↗</a></div><div class="current-role"><strong>${escape([state.company,state.role].filter(Boolean).join(' · ')||'还没有选择岗位')}</strong><span>${state.jd?'JD 已带入，不用再粘贴':'先到岗位地图放入 JD'}</span></div><div class="context-grid">${cards}</div><label class="confirm-row"><input type="checkbox" id="context-confirm" ${state.jd?'':'disabled'}><span>就是这个岗位，带入已选资料</span></label></section>
    <section class="panel cv-panel"><div class="step-heading"><span>02</span><h2>${state.candidate?'当前简历':'上传简历'}</h2></div><div class="cv-upload"><div><strong id="cv-name">${escape(state.cvName||(state.candidate?'已保存的简历':'上传 PDF 或 Word 简历'))}</strong><p id="cv-status" role="status">${state.candidate?'已读入 '+state.candidate.length+' 字':'支持 PDF、DOC、DOCX · 最大 5 MB'}</p></div><label class="file-pick" for="cv-file">${state.candidate?'更换简历':'选择简历'}<input id="cv-file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label></div><details class="cv-preview"><summary>${state.candidate?'查看原文':'粘贴简历'}</summary>${field('简历正文','candidate',state.candidate,8,'检查读取是否完整，可先删去电话、地址等隐私')}</details></section>
    <section class="panel workflow-action">${id==='interview'?`<h2>准备好了，就开口练</h2>${field('当前面试题','question',state.question,3,'首次练习可以留空，让 AI 根据岗位出题')}${field('你的回答','answer',state.answer,5,'先生成一道题，再在这里回答')}`:'<h2>让简历更贴近这个岗位</h2>'}<details><summary>补充要求（选填）</summary>${field('补充要求','notes',state.notes[id]||'',3,'比如：突出跨团队协作，不夸大个人成果')}</details><div class="actions"><button class="primary" id="generate" disabled>${id==='resume'?'生成岗位版简历':'开始 / 继续面试'} →</button></div><p class="hint" id="run-status" role="status">确认岗位和简历，就可以开始</p></section></div>`;
  }
  function bindWorkflow(id) {
    $('.context-panel').outerHTML=projectBar(id);
    const step=$('.cv-panel .step-heading span');if(step)step.textContent='01';
    const zone=$('.cv-upload');
    zone.id='cv-dropzone';
    const hint=document.createElement('p');hint.className='cv-drop-hint';hint.textContent='把简历拖到这里，或点击选择 · PDF / DOC / DOCX';
    zone.firstElementChild.prepend(hint);
    const cancel=document.createElement('button');cancel.type='button';cancel.id='cv-cancel';cancel.textContent='取消读取';cancel.hidden=!fileWorker;
    zone.after(cancel);
    const setBusy=busy=>{
      $('#cv-dropzone')?.setAttribute('aria-busy',String(busy));
      if($('#cv-cancel'))$('#cv-cancel').hidden=!busy;
      if($('#candidate'))$('#candidate').readOnly=busy;
      serviceMessage();
    };
    setBusy(Boolean(fileWorker));
    cancel.onclick=()=>fileWorker?.terminate();
    const importFile=async file=>{
      if(!file)return;
      if(!/\.(pdf|docx?)$/i.test(file.name)||file.size>5*1024*1024){notify('请选择不超过 5 MB 的 PDF、DOC 或 DOCX 简历');return;}
      // Choosing/dropping a replacement is explicit intent. Keep the old CV
      // until parsing succeeds; do not add a second blocking confirmation.
      fileWorker?.terminate();fileWorker=null;const request=++fileReadId;
      const task=readResume(file,{onProgress:message=>{
        if(request===fileReadId&&$('#cv-status'))$('#cv-status').textContent=message;
      }});
      fileWorker=task;setBusy(true);
      try {
        const parsed=await task.promise;
        if(request!==fileReadId)return;
        state.candidate=parsed;state.cvName=file.name;save();
        if($('#cv-name')){const text=$('#candidate');if(text)text.value=parsed;$('#cv-name').textContent=file.name;$('#cv-status').textContent='已读入 '+parsed.length+' 字';$('.cv-preview').open=true;refreshResult(active()[0]);}
        notify('简历已读入，岗位资料也已准备好');
      }catch(error){if(request===fileReadId){notify(error.message);if($('#cv-status'))$('#cv-status').textContent=error.message;}}
      finally{if(request===fileReadId){fileWorker=null;setBusy(false);}}
    };
    $('#cv-file').onchange=event=>{const file=event.target.files[0];event.target.value='';return importFile(file);};
    for(const type of ['dragenter','dragover'])zone.addEventListener(type,event=>{
      event.preventDefault();zone.classList.add('is-dragging');
      if(event.dataTransfer)event.dataTransfer.dropEffect='copy';
    });
    zone.addEventListener('dragleave',event=>{if(!zone.contains(event.relatedTarget))zone.classList.remove('is-dragging');});
    zone.addEventListener('drop',event=>{
      event.preventDefault();event.stopPropagation();zone.classList.remove('is-dragging');
      const files=event.dataTransfer?.files;
      if(files?.length!==1){notify('请一次放入一份简历');return;}
      void importFile(files[0]);
    });
  }
  function projectBar(id) {
    const sources=JSON.parse(inputFor(id).upstream).map(p=>modules.find(m=>m[0]===p.module)?.[2]).filter(Boolean);
    return `<section class="project-strip"><div><strong>${escape([state.company,state.role].filter(Boolean).join(' · ')||'先选择一个目标岗位')}</strong><p>${state.jd?'JD 已同步'+(id!=='resume'&&sources.length?' · 已带入'+sources.join('、'):''):'先在岗位地图放入 JD，后面会自动沿用'}</p></div><a href="#position-map">${state.jd?'更换岗位':'放入 JD'} ↗</a></section>`;
  }
  function validQuestions(q){return Array.isArray(q)&&q.length>=3&&q.length<=5&&q.every(x=>x&&typeof x.question==='string'&&x.question.trim()&&x.question.length<=1200&&typeof x.focus==='string'&&x.focus.length<=300);}
  function cleanStructured(result,id){
    const out={};
    if(result.questions!==undefined){if(!validQuestions(result.questions))throw Error('题库格式不完整，原题库仍保留');out.questions=result.questions.map(x=>({question:x.question,focus:x.focus}));}
    if(result.scores!==undefined){const entries=['relevance','structure','evidence','roleFit'].map(k=>[k,result.scores[k]]);if(entries.some(([,x])=>!x||!(x.score===null||Number.isInteger(x.score)&&x.score>=0&&x.score<=25)||typeof x.reason!=='string'||x.reason.length>600))throw Error('评分格式不完整，原结果仍保留');out.scores=Object.fromEntries(entries);const scores=entries.map(([,x])=>x.score);out.total=scores.every(Number.isInteger)?scores.reduce((a,b)=>a+b,0):null;}
    if(id==='review'){const list=x=>Array.isArray(x)&&x.length>=1&&x.length<=3&&x.every(s=>typeof s==='string'&&s.trim()&&s.length<=800);if(!result.kiss||!['keep','improve','start','stop'].every(k=>list(result.kiss[k]))||!list(result.actions))throw Error('复盘内容不完整，原记录仍保留');out.kiss=result.kiss;out.actions=result.actions;}
    if(typeof result.nextQuestion==='string'&&result.nextQuestion.length<=2000)out.nextQuestion=result.nextQuestion;
    return out;
  }
  const bankStamp=()=>JSON.stringify({...inputFor('interview'),question:'',answer:'',notes:'',action:'question-bank'});
  const currentBank=()=>state.banks[state.practiceRound]?.input===bankStamp()?state.banks[state.practiceRound]:null;
  function voiceField(label,id,value,placeholder,rows=8){return `<div class="voice-field">${field(label,id,value,rows,placeholder)}<div class="voice-tools"><button type="button" data-voice="${id}" aria-pressed="false">🎙️ 语音输入</button><label>语言 <select data-voice-lang="${id}" aria-label="${label}的语音语言"><option value="zh-CN">中文</option><option value="en-US">English</option></select></label><span data-voice-status="${id}" role="status"></span></div></div>`;}
  function stopSpeech(){speechStop?.();}
  function bindVoice(){
    document.querySelectorAll('[data-voice]').forEach(button=>button.onclick=()=>{
      const id=button.dataset.voice,box=$('#'+id),status=$(`[data-voice-status="${id}"]`),Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(speech){stopSpeech();return;}
      if(!Recognition){status.textContent='当前浏览器不支持网页听写，可用系统语音输入或直接打字';box.focus();return;}
      if(!voiceConsent){if(!confirm('语音将由浏览器的语音服务处理（可能联网），转成文字供你检查；不会自动交给 AI。请不要口述他人隐私或公司机密。开始语音输入？'))return;voiceConsent=true;}
      const rec=new Recognition();speech=rec;let committed=box.value,interim='',ended=false,limitTimer;
      rec.lang=$(`[data-voice-lang="${id}"]`).value;rec.continuous=true;rec.interimResults=true;
      const write=()=>{const value=(committed+interim).slice(0,box.maxLength);box.value=value;state[id]=value;save();serviceMessage();};
      const finish=()=>{if(ended)return;ended=true;clearTimeout(limitTimer);write();speech=null;speechStop=null;box.readOnly=false;button.textContent='🎙️ 语音输入';button.setAttribute('aria-pressed','false');if(!status.dataset.error)status.textContent='文字已保留，可以检查和修改';};
      speechStop=()=>{rec.stop();finish();};
      rec.onstart=()=>{if(ended)return;box.readOnly=true;button.textContent='■ 停止听写';button.setAttribute('aria-pressed','true');status.textContent='正在听，请说…';limitTimer=setTimeout(stopSpeech,180000);};
      rec.onresult=event=>{if(ended)return;interim='';for(let i=event.resultIndex;i<event.results.length;i++){const text=event.results[i][0].transcript;if(event.results[i].isFinal)committed+=(committed?'\n':'')+text;else interim+=text;}write();if(box.value.length>=box.maxLength){status.textContent='达到输入长度上限，已有文字已保留';status.dataset.error='1';stopSpeech();}};
      rec.onerror=event=>{status.dataset.error='1';status.textContent=event.error==='not-allowed'?'麦克风未获授权，可在浏览器设置中允许，或直接打字':event.error==='no-speech'?'没有听清，可重试或直接打字':'语音服务暂不可用，已有文字保留，可用系统听写';finish();};
      rec.onend=finish;delete status.dataset.error;
      try{rec.start();}catch{status.dataset.error='1';status.textContent='无法启动语音，可用系统听写或直接打字';finish();}
    });
  }
  function practicePage(id){
    const isReview=id==='review',title=isReview?'面试复盘':'面试陪练',bank=currentBank();
    $('#page').innerHTML=`<div class="crumbs"><a href="#home">工作台</a> / ${title}</div><header class="page-head"><div class="eyebrow">STEP ${isReview?'05':'04'}</div><h1>${isReview?'📝':'🎤'} ${title}</h1></header>${projectBar(id)}
    ${isReview?`<section class="panel review-entry"><div class="round-row"><label>面试轮次（选填）<input id="reviewRound" maxlength="40" value="${escape(state.reviewRound)}" placeholder="例如：HR 面 / 业务一面"></label><label>日期（选填）<input id="interviewDate" type="date" value="${escape(state.interviewDate)}"></label></div><div class="review-input-grid">${voiceField('面试官问了什么，你怎么答的？','recollection',state.recollection,'按记忆说出来就好，也可以补充对方的追问',10)}${voiceField('面完之后，你有什么感觉？','reflection',state.reflection,'哪段比较顺、哪里卡住了、对岗位有什么新认识',10)}</div></section>`:
    `<section class="panel question-picker"><div class="section-heading"><div><div class="question-heading"><h2>选择题目</h2><span class="simulation-tag">模拟题</span></div></div><label class="round-control"><span>轮次</span><select id="practiceRound" aria-label="面试轮次"><option${state.practiceRound==='HR 面'?' selected':''}>HR 面</option><option${state.practiceRound==='业务面'?' selected':''}>业务面</option></select></label></div><details id="question-library" ${state.question?'':'open'}><summary>${state.question?'换题':'选择一道题'}</summary><div class="question-grid">${bank?bank.questions.map((q,i)=>`<button class="question-card" data-question="${i}" aria-pressed="${state.question===q.question}"><small>${String(i+1).padStart(2,'0')}</small><strong>${escape(q.question)}</strong><span>${escape(q.focus)}</span></button>`).join(''):state.banks[state.practiceRound]?'<p class="hint">岗位资料已更新，请重新出题</p>':''}</div></details><div class="actions bank-actions"><button id="generate-bank">${bank?'换一组':'生成题目'}</button></div></section><section class="panel answer-panel" ${state.question?'':'hidden'}><h2>你的回答</h2><div class="selected-question">${escape(state.question)}</div>${voiceField('回答内容','answer',state.answer,'输入回答，或使用语音输入',7)}</section>`}
    <section class="practice-submit"><button id="generate" class="primary" disabled>${isReview?'🪄 一键复盘':'查看反馈'} →</button><p id="run-status" class="hint" role="status"></p></section>
    <section class="panel result"><h2>${isReview?'面试复盘':'面试反馈'}</h2><p id="stale" class="stale" hidden>材料已改动，下面保留的是上一版结果</p><p id="result-meta" class="hint"></p><div id="structured-result"></div><div id="result-body" class="result-body"></div><p id="empty" class="empty"></p><div id="result-actions" class="actions" hidden><button id="retry-answer">${isReview?'去练习':'修改回答'}</button>${isReview?'':'<button id="follow-up">练习追问 →</button>'}<details class="result-more"><summary>导出</summary><button id="export-practice">导出${isReview?'复盘':'练习记录'}</button></details></div></section>${!isReview?'<details class="panel practice-history-panel"><summary>练习记录</summary><div id="practice-history"></div></details>':''}`;
    for(const name of isReview?['reviewRound','interviewDate','recollection','reflection']:['answer']){const el=$('#'+name);if(name==='recollection')el.maxLength=10000;if(name==='reflection')el.maxLength=6000;el.oninput=()=>{state[name]=el.value;save();refreshPractice(id);serviceMessage();};}
    if(!isReview){$('#practiceRound').onchange=e=>{if(state.answer&&!confirm('切换轮次会清空当前回答，已生成的反馈仍保留在练习记录中，继续？')){e.target.value=state.practiceRound;return;}stopSpeech();state.practiceRound=e.target.value;state.question='';state.answer='';save();practicePage(id);};$('#generate-bank').onclick=()=>generate('interview',false,'question-bank');document.querySelectorAll('[data-question]').forEach(el=>el.onclick=()=>chooseQuestion(bank.questions[Number(el.dataset.question)].question));if(state.question&&state.practiceTarget!==targetStamp())$('.selected-question').textContent='这是之前岗位的题目，请为当前岗位重新选题；旧回答仍保留';}
    if(!isReview){
      const library=$('#question-library'),actions=$('.bank-actions');
      $('#generate-bank').classList.toggle('primary',!bank&&!state.question);
      if(bank){library.append(actions);}else{library.hidden=true;}
      $('#generate').hidden=!state.question;
      if(!state.question)$('.question-picker').append($('#run-status'));
    }
    const skillCredit=document.createElement('p');skillCredit.className='skill-credit';
    skillCredit.innerHTML='powered by 雨雨小天才面试 Skills<small>网页适配版</small>';
    (isReview?$('.practice-submit'):$('.page-head')).append(skillCredit);
    $('#generate').onclick=()=>generate(id,false);bindVoice();refreshPractice(id);serviceMessage();
    $('#retry-answer').onclick=()=>{const question=isReview?state.outputs.review?.nextQuestion:state.question;if(!question)return;if(isReview){if(state.answer&&!confirm('返回陪练会替换当前回答，已有反馈仍在练习记录中，继续？'))return;state.question=question;state.practiceTarget=targetStamp();state.answer='';save();location.hash='#interview';}else{$('#answer').focus();$('#answer').scrollIntoView({block:'center',behavior:'smooth'});}};
    if($('#follow-up'))$('#follow-up').onclick=()=>chooseQuestion(state.outputs.interview?.nextQuestion);
    $('#export-practice').onclick=()=>{const out=state.outputs[id];const text=practiceExport(id,out);const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=title+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  }
  function chooseQuestion(question){if(!question)return;const changed=question!==state.question||state.practiceTarget!==targetStamp();if(state.answer&&changed&&!confirm('换题会清空当前回答，已生成的反馈仍在练习记录中，继续？'))return;stopSpeech();if(changed)state.answer='';state.question=question;state.practiceTarget=targetStamp();save();practicePage('interview');$('#answer').focus();}
  function practiceExport(id,out){if(!out)return '';let source=state;try{source=JSON.parse(out.input);}catch{}return (id==='review'?`面试记录\n${source.recollection||''}\n感受与收获\n${source.reflection||''}`:`问题\n${source.question||''}\n回答\n${source.answer||''}`)+'\n\n'+out.text+(out.scores?'\n\n评分\n'+Object.entries(out.scores).map(([k,v])=>`${k}: ${v.score??'暂不评分'}/25 · ${v.reason}`).join('\n'):'')+(out.kiss?'\n\n'+Object.entries(out.kiss).map(([k,v])=>k+'\n'+v.join('\n')).join('\n\n')+'\n\n下轮前行动\n'+out.actions.join('\n'):'');}
  function refreshPractice(id){
    const out=state.outputs[id];$('.result').hidden=!out;$('#empty').hidden=Boolean(out);$('#result-actions').hidden=!out;$('#result-body').textContent=out?.text||'';$('#stale').hidden=!out||out.input===fingerprint(id);$('#result-meta').textContent=out?`AI 生成 · ${out.at?new Date(out.at).toLocaleString('zh-CN'):''}`:'';
    let html='';if(out?.scores){const names={relevance:'切题程度',structure:'逻辑结构',evidence:'具体证据',roleFit:'岗位相关性'};html=`<div class="score-summary"><strong>${out.total===null?'暂不计算总分':out.total+' / 100'}</strong><span>回答质量练习分，不代表录用概率</span></div><div class="score-grid">${Object.entries(names).map(([k,name])=>`<section><h3>${name} <span>${out.scores[k].score??'—'} / 25</span></h3><p>${escape(out.scores[k].reason)}</p></section>`).join('')}</div>`;}
    if(out?.kiss){html=`<div class="kiss-grid">${[['keep','Keep','继续保持'],['improve','Improve','做得更好'],['start','Start','开始做'],['stop','Stop','停止做']].map(([k,en,cn])=>`<section><small>${en}</small><h3>${cn}</h3><ul>${out.kiss[k].map(x=>`<li>${escape(x)}</li>`).join('')}</ul></section>`).join('')}</div><section class="next-actions"><h3>下轮面试前，先做这几件事</h3><ol>${out.actions.map(x=>`<li>${escape(x)}</li>`).join('')}</ol></section>`;}
    $('#structured-result').innerHTML=html;
    if($('#retry-answer'))$('#retry-answer').hidden=id==='review'&&(!out?.nextQuestion||out.input!==fingerprint(id));
    if($('#follow-up'))$('#follow-up').hidden=!out?.nextQuestion||out.input!==fingerprint(id);
    if($('.practice-history-panel'))$('.practice-history-panel').hidden=!state.practiceHistory.some(x=>x.target===targetStamp());
    if($('#practice-history'))$('#practice-history').innerHTML=state.practiceHistory.filter(x=>x.target===targetStamp()).slice().reverse().map(x=>`<details><summary>${escape(x.round+' · '+x.question)}</summary><p class="context-preview">${escape(x.answer)}</p><p class="context-preview">${escape(x.text)}</p></details>`).join('')||'<p class="hint">每次完成模拟结果后，会在这里保留记录</p>';
  }
  function researchPage() {
    const dimensions = [
      ['01','行业','先看大环境','这个行业正在发生什么变化？','需求与趋势','竞争格局','机会与风险','行业报告、监管机构与公开统计'],
      ['02','公司','再看它的位置','公司的核心竞争力是什么？','公司定位','主要产品','差异与挑战','公司官网、财报与官方公告'],
      ['03','业务','接着看怎么运作','目标业务服务谁，又怎样创造价值？','用户与场景','业务流程','关键指标','产品文档、业务介绍与公开案例'],
      ['04','岗位','最后落到你','这份工作要在业务里解决什么问题？','承担的任务','合作的团队','需要证明的能力','当前 JD 与可核验的团队资料']
    ];
    $('#page').innerHTML=`<div class="crumbs"><a href="#home">工作台</a> / 公司调研</div><header class="page-head"><div class="eyebrow">STEP 02</div><h1>🔎 公司调研</h1></header>
    <section class="research-brief" aria-label="调研目标"><div class="brief-top"><div><h2 id="brief-title"></h2><p id="brief-summary"></p></div><button id="edit-brief" aria-controls="brief-editor">修改资料</button></div><div id="brief-editor"><div class="brief-fields"><div><label for="company">公司</label><input id="company" maxlength="160" value="${escape(state.company)}" placeholder="想了解哪家公司？"></div><div><label for="role">岗位</label><input id="role" maxlength="200" value="${escape(state.role)}" placeholder="目标岗位是什么？"></div><div><label for="market">地区 / 输出语言</label><input id="market" maxlength="80" value="${escape(state.market)}" placeholder="例如：中国内地，中文"></div></div>${field('贴上 JD，或者沿用岗位地图里的资料','jd',state.jd,3,'把岗位描述放在这里，让四个维度都围绕同一个目标展开')}<div class="brief-bottom"><span>已与岗位地图同步</span><button class="primary" id="confirm-brief">收好资料，往下看 ↓</button></div></div></section>
    <section class="research-overview"><div><h2>调研结果</h2></div><button id="generate" disabled>生成四维调研 →</button></section><p class="research-notice" id="run-status" role="status">读取官方资料，按四个维度整理</p><p id="research-stale" class="stale" hidden>材料已改变，下面是上一版结果</p>
    <div class="research-dimensions">${dimensions.map(([number,title,lead,question,...items])=>`<section class="dimension-card" aria-labelledby="dimension-${number}"><div class="dimension-top"><span>${number}</span></div><h2 id="dimension-${number}">${title}</h2><p class="dimension-question">${question}</p><div class="dimension-empty"><p>暂无调研结果</p></div></section>`).join('')}</div>
    <details class="research-takeaway"><summary>补充问题（选填）</summary><label for="research-notes">问题</label><textarea id="research-notes" rows="2" maxlength="4000" placeholder="比如：这项业务为什么现在需要招这个岗位？">${escape(state.notes.research||'')}</textarea></details>${state.outputs.research?'<details class="panel result"><summary>查看此前保留的调研结果</summary><p class="hint">历史内容尚未拆分为四维资料，不代表本次重新调研</p><div id="research-history" class="result-body"></div></details>':''}`;
    const sync=()=>{
      $('#brief-title').textContent=[state.company,state.role].filter(Boolean).join(' · ')||'这次，想了解哪家公司？';
      $('#brief-summary').textContent=state.jd.trim()?state.jd.trim().replace(/\s+/g,' ').slice(0,95)+(state.jd.trim().length>95?'…':''):'贴一份 JD，让调研更有方向';
    };
    const toggle=open=>{$('#brief-editor').hidden=!open;$('#edit-brief').textContent=open?'收起资料':'修改资料';$('#edit-brief').setAttribute('aria-expanded',String(open));};
    for(const name of ['company','role','market','jd']) $('#'+name).addEventListener('input',e=>{state[name]=e.target.value;save();sync();});
    $('#research-notes').oninput=e=>{state.notes.research=e.target.value;save();};
    $('#edit-brief').onclick=()=>toggle($('#brief-editor').hidden);
    $('#confirm-brief').onclick=()=>{if(!state.jd.trim()&&!state.jdImage){notify('先贴上岗位 JD 或上传截图，再收好资料');$('#jd').focus();return;}toggle(false);$('#edit-brief').focus();};
    if($('#research-history')) $('#research-history').textContent=state.outputs.research.text;
    $('#generate').onclick=()=>generate('research',false);
    sync();toggle(!state.jd.trim()&&!state.jdImage);refreshResearch();serviceMessage();
    // The JD has one editing home: step 1. Research only displays its shared brief.
    $('#brief-editor').remove();$('#edit-brief').textContent='更换岗位 ↗';$('#edit-brief').onclick=()=>{location.hash='#position-map';};
    $('#brief-summary').textContent=state.jd?'已沿用岗位地图的 JD':'先在岗位地图放入 JD，调研会自动读取';
  }
  function render() {
    stopSpeech();stopTimer(); seconds=60;
    if(location.hash==='#archives'||location.hash.startsWith('#archive/')){archivePage();return;}
    document.querySelectorAll('#nav a').forEach(a=>{if(a.hash===(location.hash||'#home'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const m=active();
    if(!m) {
      $('#page').innerHTML=`<header class="hero cream-window"><div class="window-chrome" aria-hidden="true"><i></i><i></i><i></i></div><div class="window-content"><h1 aria-label="AI 秋招工作台"><span class="hero-ai">AI</span><span class="hero-title">秋招工作台</span></h1><span class="credit">雨雨小天才制作 💧</span><span class="window-pane" aria-hidden="true"></span></div></header><h2 class="section-title">求职流程</h2><div class="grid">${modules.slice(0,4).map((m,i)=>`<a class="card" href="#${m[0]}"><small>STEP 0${i+1}</small><h2>${m[1]} ${m[2]}</h2><strong>${['解读 JD','了解公司','修改简历','开始练习'][i]} →</strong></a>`).join('')}</div><a class="draw-link" href="#draw"><strong>🎲 面试抽题</strong><p>准备好了吗？用 60 秒练一道 →</p></a>`;
      const reviewLink=$('.draw-link');reviewLink.href='#review';reviewLink.innerHTML='<strong>📝 面试复盘</strong><span>开始复盘 →</span>';serviceMessage(); return;
    }
    const [id,icon,title,desc,cta]=m;
    if(id==='research'){researchPage();return;}
    if(['interview','review'].includes(id)){practicePage(id);return;}
    const practice=['interview','draw'].includes(id);
    $('#page').innerHTML=`<div class="crumbs"><a href="#home">工作台</a> / ${title}</div><header class="page-head"><div class="eyebrow">STEP 0${modules.indexOf(m)+1}</div><h1>${icon} ${title}</h1></header>${['resume','interview'].includes(id)?workflowForm(id):`<div class="work-grid"><section class="panel"><h2>目标岗位</h2><label for="company">公司</label><input id="company" maxlength="160" value="${escape(state.company)}" placeholder="例如：字节跳动"><label for="role">岗位</label><input id="role" maxlength="200" value="${escape(state.role)}" placeholder="填写岗位名称"><label for="market">求职地区 / 输出语言</label><input id="market" maxlength="80" value="${escape(state.market)}" placeholder="例如：中国内地，中文 / 新加坡，英文">${id==='resume'||practice?field('你的简历或真实经历','candidate',state.candidate,7,'可以先去掉姓名和联系方式，不要填入雇主机密'):''}${id==='resume'?'<label for="cv-text">读入 TXT / MD 简历</label><input type="file" id="cv-text" accept=".txt,.md"><p class="file-hint">支持 TXT / MD，暂不支持 PDF / DOCX</p>':''}${field(id==='research'?'你想了解的公司问题':'补充问题（选填）','notes',state.notes[id]||'',4)}</section><section class="input-panel">${id==='position-map'?`<h2>上传岗位 JD</h2><div class="jd-upload"><div class="jd-dropzone" id="jd-dropzone" tabindex="0" role="button" aria-label="上传 JD 截图"><p class="jd-dropzone-title">把 JD 截图拖到这里，或<button type="button" class="jd-pick" id="jd-pick">选择图片</button></p><p class="file-hint">支持 PNG / JPG / WEBP · 最大 4 MB</p></div><input type="file" id="jd-file" accept="image/*" hidden><div class="jd-preview" id="jd-preview" ${state.jdImage?'':'hidden'}><img id="jd-image" alt="JD 截图预览" src="${escape(state.jdImage)}"><div class="jd-preview-meta"><span id="jd-image-name">${escape(state.jdImageName||'')}</span><button type="button" class="jd-remove" id="jd-remove">移除图片</button></div></div><details class="jd-paste"><summary>粘贴 JD 文本</summary>${field('岗位 JD 文本','jd',state.jd,8,'直接粘贴岗位要求，或补充截图未覆盖的细节')}</details></div>`:`<h2>${practice?'把你的回答放在这里':'粘贴岗位 JD'}</h2>${field('岗位 JD','jd',state.jd,practice?4:8,'直接粘贴岗位要求，不需要跳转到其他应用')}`}${practice?`${id==='draw'?'<div class="actions"><button id="draw">随机抽一道题 ↻</button><span class="timer" id="timer">01:00</span><button id="start-timer">开始计时</button></div>':''}${field('当前问题（首次面试可留空）','question',state.question,3)}${field('你的回答','answer',state.answer,6,'按照自己的经历回答；首次面试留空，先让 AI 提问')}`:''}<div class="actions"><button class="primary" id="generate" disabled>${cta} →</button></div><p class="hint" id="run-status" role="status"></p></section></div>`}<section class="panel result" aria-labelledby="result-heading"><h2 id="result-heading">${practice?'面试问题与反馈':id==='resume'?'你的岗位版简历':'你的'+title+'结果'}</h2><div id="stale" class="stale" hidden>材料已有改动，下面保留的是上一版结果，请重新生成后再使用</div><p class="result-meta" id="result-meta"></p><div class="result-body" id="result-body"></div><textarea id="result-edit" class="result-edit" aria-label="编辑结果" hidden></textarea><p class="empty" id="empty">等待生成结果</p><div class="actions" id="result-actions" hidden><button id="edit">编辑结果</button><button id="export">导出文本</button>${id==='resume'?'<button id="print">打印 / 另存 PDF</button>':''}<button id="iterate">结合补充要求再改一版</button></div></section>`;
    if(id==='position-map') {
      $('.work-grid').classList.add('position-layout');
      const panel=$('.input-panel');panel.classList.add('position-input');
      const dropzone=$('#jd-dropzone');
      const fileInput=$('#jd-file');
      const pickBtn=$('#jd-pick');
      const preview=$('#jd-preview');
      const previewImg=$('#jd-image');
      const previewName=$('#jd-image-name');
      const removeBtn=$('#jd-remove');
      const setImage=(dataUrl,name)=>{
        if(dataUrl){
          previewImg.src=dataUrl;
          previewName.textContent=name||'';
          preview.hidden=false;
        } else {
          previewImg.src='';
          previewName.textContent='';
          preview.hidden=true;
        }
      };
      const handleFile=file=>{
        if(!file){return;}
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)){notify('请选择图片文件（PNG / JPG / WEBP）');return;}
        if(running){notify('请等当前生成完成后再更换图片');return;}
        if(file.size>4*1024*1024){notify('图片超过 4 MB，请压缩后再上传');return;}
        const reader=new FileReader();
        reader.onload=e=>{
          state.jdImage=String(e.target.result||'');
            state.jdImageName=file.name||'';
            setImage(state.jdImage,state.jdImageName);
            try{save();}catch(err){notify('浏览器无法保存草稿，请稍后再试');}
            serviceMessage();refreshResult(id);
          };
        reader.onerror=()=>notify('图片读取失败，请重试');
        reader.readAsDataURL(file);
      };
      pickBtn?.addEventListener('click',e=>{e.stopPropagation();fileInput.click();});
      dropzone?.addEventListener('click',()=>fileInput.click());
      dropzone?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
      dropzone?.addEventListener('dragover',e=>{e.preventDefault();dropzone.classList.add('is-dragover');});
      dropzone?.addEventListener('dragleave',e=>{if(e.target===dropzone)dropzone.classList.remove('is-dragover');});
      dropzone?.addEventListener('drop',e=>{
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        const file=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
        handleFile(file);
      });
      fileInput?.addEventListener('change',e=>{
        const file=e.target.files&&e.target.files[0];
        handleFile(file);
        e.target.value='';
      });
      removeBtn?.addEventListener('click',()=>{
        state.jdImage='';
        state.jdImageName='';
        setImage('','');
        try{save();}catch(err){notify('浏览器无法保存草稿，请稍后再试');}
        serviceMessage();refreshResult(id);
      });
      if(state.jdImage){setImage(state.jdImage,state.jdImageName);}
    }
    for(const name of ['company','role','market','jd','candidate','notes','question','answer']) {
      const el=$('#'+name); if(!el)continue;
      el.addEventListener('input',()=>{if(name==='notes')state.notes[id]=el.value;else state[name]=el.value;save();refreshResult(id);if(['company','role','market','jd'].includes(name))refreshReferences();serviceMessage();});
    }
    if(id==='position-map') {
      const roleHint=document.createElement('p');roleHint.id='role-search-hint';roleHint.className='hint';$('#role').after(roleHint);
      const references=document.createElement('section');references.id='official-references';references.className='panel official-references';references.setAttribute('aria-label','官方岗位参考');$('.work-grid').after(references);refreshReferences();
      const provenance=document.createElement('section');provenance.id='result-references';provenance.className='result-references';$('#result-actions').before(provenance);
    }
    $('#generate').onclick=()=>generate(id,false);
    if(['resume','interview'].includes(id))bindWorkflow(id);
    if(id==='resume'){
      $('.workflow-action h2').textContent='优化要求';
      $('.workflow-action h2').classList.add('resume-action-title');
      $('#generate').textContent='🪄 一键增强';
      const credit=document.createElement('span');credit.className='skill-credit';credit.innerHTML='powered by 雨雨小天才简历 Skills<small>网页适配版</small>';
      $('#generate').after(credit);
      $('#result-heading').textContent='简历优化建议';
      $('#empty').textContent='值得保留的亮点、优先修改的地方，会整理在这里';
      $('#print')?.remove();
    }
    $('#iterate').onclick=()=>generate(id,true);
    if(id==='interview') {
      const nextQuestion=document.createElement('p');nextQuestion.id='next-question';nextQuestion.className='result-body';
      $('#result-actions').before(nextQuestion);
      const next=document.createElement('button');next.id='use-question';next.textContent='回答这道题 →';$('#result-actions').append(next);
      next.onclick=()=>{const question=state.outputs[id]?.nextQuestion;if(!question)return;if(state.answer&&!confirm('开始回答下一题？当前回答将被替换，请先保存需要保留的内容'))return;state.question=question;state.answer='';save();render();$('#answer').focus();};
    }
    $('#result-edit').oninput=e=>{if(state.outputs[id]){state.outputs[id].text=e.target.value;state.outputs[id].edited=true;save();}};
    $('#edit').onclick=()=>{const edit=$('#result-edit');if(edit.hidden){edit.value=state.outputs[id].text;edit.hidden=false;$('#result-body').hidden=true;$('#edit').textContent='保存修改';edit.focus();}else{state.outputs[id].text=edit.value;state.outputs[id].edited=true;save();edit.hidden=true;$('#result-body').hidden=false;$('#edit').textContent='编辑结果';refreshResult(id);}};
    $('#export').onclick=()=>{const out=state.outputs[id];const refs=resolveReferenceIds(referenceCorpus,out?.references);const sourceText=refs.length?'\n\n本次提供的官方参考（不等于本次招聘要求）\n'+refs.map(s=>s.company+' · '+s.title+'\n'+s.url).join('\n')+'\n核验日期：'+referenceCorpus.verified_on:'';const blob=new Blob([(out?.text||'')+sourceText],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=id==='resume'?'我的岗位版简历.txt':title+'.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    if($('#print'))$('#print').onclick=()=>window.print();
    if($('#cv-text'))$('#cv-text').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!/\.(txt|md)$/i.test(file.name)||file.size>60000){notify('请选择不超过 60 KB 的 TXT / MD 文件');return;}const text=await file.text();if(text.length>18000){notify('简历过长，请先精简');return;}if(state.candidate&&!confirm('用这个文件替换当前简历草稿？'))return;state.candidate=text;save();if(active()?.[0]===id){$('#candidate').value=text;refreshResult(id);}};
    if($('#draw'))$('#draw').onclick=()=>{if(state.answer&&!confirm('换题会清空这次回答，确定继续？'))return;const pool=questions.filter(q=>q!==state.question);state.question=pool[Math.floor(Math.random()*pool.length)];state.answer='';stopTimer();seconds=60;$('#timer').textContent='01:00';$('#start-timer').textContent='开始计时';$('#question').value=state.question;$('#answer').value='';save();refreshResult(id);};
    if($('#start-timer'))$('#start-timer').onclick=()=>{if(timer){seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));stopTimer();$('#start-timer').textContent='继续';return;}if(seconds===0)seconds=60;deadline=Date.now()+seconds*1000;$('#start-timer').textContent='暂停';timer=setInterval(()=>{seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('#timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;if(seconds===0){stopTimer();$('#start-timer').textContent='重新计时';}},200);};
    refreshResult(id);serviceMessage();
    if(running)$('#run-status').textContent='有一项任务正在生成，可继续整理材料，请勿重复提交';
  }
  function refreshResult(id) {
    if(id==='research'&&active()?.[0]===id){refreshResearch();return;}
    if(['interview','review'].includes(id)&&active()?.[0]===id){refreshPractice(id);return;}
    if(active()?.[0]!==id||!$('#result-body'))return;
    const output=state.outputs[id];$('.result').hidden=!output;$('#empty').hidden=Boolean(output);$('#result-actions').hidden=!output;
    $('#result-body').classList.toggle('resume-notes',id==='resume');
    if(id==='resume')$('#result-body').innerHTML=resumeHTML(output?.text||'');
    else $('#result-body').textContent=output?.text||'';
    $('#stale').hidden=!output||output.input===fingerprint(id);
    $('#result-meta').textContent=output?`AI 生成${output.edited?' · 已手动编辑':''} · ${output.at?new Date(output.at).toLocaleString('zh-CN'):''} · ${output.model}`:'';
    refreshResultReferences(output);
    if($('#use-question')) {$('#use-question').hidden=!output?.nextQuestion;$('#next-question').textContent=output?.nextQuestion?'下一题：'+output.nextQuestion:'';}
  }
  async function generate(id,iterate,action='') {
    if(id==='position-map'&&!referenceCorpus){notify('参考资料暂时加载失败，请刷新后再生成；原材料仍在');return;}
    if(running){notify('任务正在处理，请勿重复提交');return;}
    if(!session.ready||!session.authenticated||!session.modules.includes(id)){notify('这个功能的生成服务还未开放');return;}
    // An explicit generation click submits the current materials; disclosure is in the sidebar.
    if(fileWorker){notify('请等简历读取完成');return;}
    stopSpeech();
    if(!state.jd.trim()&&!state.jdImage){notify('请先到岗位地图放入 JD（粘贴文本或上传截图）');$('#jd')?.focus();return;}
    if(id==='resume'&&!state.candidate.trim()){notify('请先提供自己的简历或经历');return;}
    if(id==='interview'&&action!=='question-bank'&&(!state.question||!state.answer.trim()||state.practiceTarget!==targetStamp())){notify('先为当前岗位选择题目并完成回答');return;}
    if(id==='review'&&!state.recollection.trim()){notify('先记录面试官问了什么、你怎么回答');return;}
    const input=inputFor(id);if(action==='question-bank')Object.assign(input,{action,question:'',answer:'',notes:''});let stamp=fingerprint(id);const bankInput=bankStamp(),runTarget=targetStamp();
    const payload={...input,previousResult:iterate?(state.outputs[id]?.text||''):'',consent:true};
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
    if(running){notify('任务正在处理，请勿重复提交');return;}
    const signature=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
    const prior=attempts[id];
    const requestId=prior?.signature===signature && prior?.status==='uncertain' && typeof prior.id==='string' ? prior.id : crypto.randomUUID();
    attempts[id]={signature,id:requestId,status:'uncertain'};
    try {sessionStorage.setItem(key+'-requests',JSON.stringify(attempts));} catch { /* in-memory idempotency still applies */ }
    runMessages.delete(id);running={id,requestId};serviceMessage();if(active()?.[0]===id)$('#run-status').textContent='正在生成，结果会出现在下方；无需重复点击';
    try {
      const response=await fetch(apiBase+'/api/generate',{method:'POST',credentials:cloud?'omit':'same-origin',signal:AbortSignal.timeout(125000),headers:{'Content-Type':'application/json',...(!cloud?{'X-CSRF-Token':session.csrfToken}:{}),...apiHeaders(),'Idempotency-Key':requestId},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok){
        // A received terminal failure is not a request still in flight. A new
        // user click may retry it; never silently repeat a paid model call.
        if(result.canRetry===true||![409,502,503,504].includes(response.status))attempts[id].status='failed';
        const error=new Error(result.message||'生成未完成，请稍后重试');error.canRetry=attempts[id].status==='failed';throw error;
      }
      if(typeof result.text!=='string'||result.aiGenerated!==true)throw new Error('服务返回不完整，没有替换你的原有结果');
      if(result.nextQuestion!==undefined&&result.nextQuestion!==null&&(!['interview','review'].includes(id)||typeof result.nextQuestion!=='string'||result.nextQuestion.length>2000))throw new Error('下一题格式无法读取，没有替换你的原有结果');
      const structured=['interview','review'].includes(id)?cleanStructured(result,id):{};
      if(id==='position-map'&&input.jdImage){
        if(typeof result.extractedJD!=='string'||!result.extractedJD.trim()||result.extractedJD.length>20000)throw Error('没有收到截图中的 JD 正文，原材料仍保留');
        // Only adopt extracted text if the user has not changed the target meanwhile.
        if(stamp===fingerprint(id)){state.jd=result.extractedJD.trim();stamp=fingerprint(id);if($('#jd'))$('#jd').value=state.jd;refreshReferences();}
      }
      if(id==='interview'&&action==='question-bank'){if(!structured.questions)throw Error('没有收到完整题库，请保留原材料');state.banks[input.round]={input:bankInput,questions:structured.questions};}
      else{
        if(id==='interview'&&!structured.scores)throw Error('没有收到完整评分，原回答仍保留');
        state.outputs[id]={text:result.text,input:stamp,at:result.generatedAt,model:result.model,edited:false,nextQuestion:result.nextQuestion||null,references:cleanReferenceRecord(result.references),sources:cleanSources(result.sources),...structured};
        if(id==='interview'){state.practiceHistory.push({target:runTarget,round:input.round,question:input.question,answer:input.answer,text:result.text,scores:structured.scores,at:result.generatedAt});state.practiceHistory=state.practiceHistory.slice(-20);}
      }
      if(!Array.isArray(state.milestones))state.milestones=[];
      state.milestones.push({id:crypto.randomUUID(),step:id,kind:action||'generation',at:result.generatedAt||new Date().toISOString(),output:{...result,input:action==='question-bank'?bankInput:stamp}});
      save();
      attempts[id].status='complete';try {sessionStorage.setItem(key+'-requests',JSON.stringify(attempts));} catch { /* no raw data in request journal */ }
      if(active()?.[0]===id){if(action==='question-bank')practicePage(id);else refreshResult(id);$('#run-status').textContent=stamp===fingerprint(id)?(action==='question-bank'?'题目已生成，选择一道开始回答':'已生成，结果在下方'):'已完成上一版材料的分析；你刚才修改的内容尚未包含';}
      notify('结果已生成并留在当前工作台');
      if(id==='review'&&!archiveActive)offerArchive();
    } catch(error) {
      const message=['TimeoutError','AbortError'].includes(error.name)?'等待超时，原材料仍在。再次点击会先检查上次请求，不会直接重复调用。':error.message==='Failed to fetch'?'连接中断，原材料仍在。再次点击会先检查上次请求。':error.message;
      runMessages.set(id,message);notify(message);
      try{sessionStorage.setItem(key+'-requests',JSON.stringify(attempts));}catch{}
    }
    finally {running=null;if(cloud)await loadSession();else serviceMessage();if(active()?.[0]===id&&runMessages.has(id))$('#run-status').textContent=runMessages.get(id);}
  }
  $('#menu').onclick=()=>{const open=$('.side').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));};
  $('#save-archive').onclick=offerArchive;archiveStatus(archiveActive?'当前岗位已存档':'');
  window.addEventListener('pagehide',flushArchive);
  window.addEventListener('storage',e=>{if(!e.key?.startsWith(ARCHIVE_PREFIX))return;if(archiveActive&&e.key===ARCHIVE_PREFIX+archiveActive.id){clearTimeout(archiveTimer);archivePending=null;archiveActive=null;archiveLink();notify('另一标签页更新了档案，当前草稿仍保留，未覆盖新版本');}archiveStatus(archiveActive?'当前岗位已存档':'当前草稿尚未存档');if(location.hash==='#archives')archivePage();});
  window.addEventListener('hashchange',()=>{if(location.hash==='#main')return;render();$('.side').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});});window.addEventListener('pagehide',stopTimer);render();
  window.addEventListener('pagehide',stopSpeech);
  if(!publicPreview) loadSession();
})();
