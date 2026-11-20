// Small, text-only Markdown subset. Model output never becomes executable HTML.
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const inline=s=>escape(s).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');
export function resumeHTML(text=''){
  const sections=[];let current={title:'',lines:[]};
  for(const line of String(text).split(/\r?\n/)){
    const heading=line.match(/^#{1,3}\s+(.+)$/);
    if(heading){if(current.title||current.lines.some(x=>x.trim()))sections.push(current);current={title:heading[1],lines:[]};}
    else current.lines.push(line);
  }
  if(current.title||current.lines.some(x=>x.trim()))sections.push(current);
  return sections.map(section=>{
    const kind=/先核实|风险|不能这样写/.test(section.title)?'caution':/值得保留|优势/.test(section.title)?'keep':/优先修改|优化建议/.test(section.title)?'improve':'draft';
    let list=false,body='';
    for(const line of section.lines){
      const item=line.match(/^\s*(?:[-*•]|\d+[.)、])\s+(.+)$/);
      if(item){if(!list){body+='<ul>';list=true;}body+=`<li>${inline(item[1])}</li>`;}
      else {if(list){body+='</ul>';list=false;}if(line.trim())body+=`<p>${inline(line)}</p>`;}
    }
    if(list)body+='</ul>';
    return `<section class="resume-note resume-note--${kind}">${section.title?`<h3>${inline(section.title)}</h3>`:''}${body}</section>`;
  }).join('');
}
