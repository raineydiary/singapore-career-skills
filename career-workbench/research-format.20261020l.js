const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Intentionally small Markdown subset: no raw HTML, images, links or scripts.
const inline=text=>escape(text).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
export function researchHTML(text) {
  const lines=String(text??'').slice(0,40000).split(/\r?\n/);
  let html='',list=false;
  for(const raw of lines) {
    const line=raw.trim();if(!line)continue;
    const match=line.match(/^(?:[-•*]|\d+[.、])\s+(.+)$/);
    if(match){if(!list){html+='<ul>';list=true;}html+='<li>'+inline(match[1])+'</li>';}
    else {if(list){html+='</ul>';list=false;}html+='<p>'+inline(line)+'</p>';}
  }
  return html+(list?'</ul>':'');
}
const hosts=['newsroom.tiktok.com','ads.tiktok.com','thelowdown.momentum.asia','www.36kr.com','seller.tiktokglobalshop.com','jobs.bytedance.com','campus-talent.alibaba.com','careers.tencent.com','app.mokahr.com','www.kimi.com'];
export function researchSources(sources) {
  if(!Array.isArray(sources))return [];
  return sources.slice(0,10).filter(s=>{try{const u=new URL(s.url);return typeof s.title==='string'&&s.title.length<300&&u.protocol==='https:'&&!u.username&&!u.password&&hosts.includes(u.hostname);}catch{return false;}})
    .map(s=>({title:s.title,url:s.url,...Object.fromEntries(['id','sourceType','publishedAt','reviewedAt','retrievedAt','retrievalMode'].map(k=>[k,typeof s[k]==='string'?s[k].slice(0,100):'']))}));
}
