export {researchSources} from './research-format.20261020l.js';
const escape=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const terms=['discovery e-commerce','内容电商','兴趣电商','货架电商','商品交易总额','内容分发','用户行为','跨职能协作','跨团队协作','商家经营','产品策略','实验设计','验证指标','护栏指标','目标人群','作用机制','依赖团队','推荐机制','下单转化率','转化率','复购率','退货率','获客成本','贡献利润','配送时效','商品供给','短期优化','中期能力建设','长期方向','GMV','XFN'];
const keywordRE=new RegExp(terms.sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gi');
function inline(text){
 let remaining=3;const seen=new Set();
 return String(text).split(/(\*\*[^*\n]+\*\*)/g).map(part=>{
  if(part.startsWith('**')&&part.endsWith('**'))return '<strong>'+escape(part.slice(2,-2))+'</strong>';
  let out='',pos=0;for(const match of part.matchAll(keywordRE)){out+=escape(part.slice(pos,match.index));const key=match[0].toLowerCase();if(remaining>0&&!seen.has(key)){out+='<strong class="research-keyword">'+escape(match[0])+'</strong>';seen.add(key);remaining--;}else out+=escape(match[0]);pos=match.index+match[0].length;}return out+escape(part.slice(pos));
 }).join('');
}
function marker(text){
 const heading=text.replace(/\*\*/g,'').split(/[：:]/)[0].slice(0,50);
 for(const [pattern,icon] of [[/风险|挑战|局限/,'⚖️'],[/竞争|对手/,'🏁'],[/购买|购物|交易|订单|模式/,'🛒'],[/需求|增长|变化|趋势/,'📈'],[/核心|优势|能力/,'💡'],[/市场|地区|覆盖/,'🌏'],[/规模|指标|数据/,'📊'],[/决策|判断|研究|分析/,'🔎'],[/落地|协作|推进/,'🤝'],[/入职|岗位|职责|先做/,'🎯'],[/业务|定位|服务/,'🧩']])if(pattern.test(heading))return icon;
 return '📌';
}
export function researchHTML(text){
 let html='',list=false;
 for(const raw of String(text??'').slice(0,40000).split(/\r?\n/)){
  const line=raw.trim();if(!line)continue;
  const match=line.match(/^(?:[-•*]|\d+[.、])\s+(.+)$/);
  if(match){if(!list){html+='<ul class="research-points">';list=true;}const body=match[1];const alreadyEmoji=/^(?:\*\*)?\p{Extended_Pictographic}/u.test(body);html+='<li><span class="research-marker" aria-hidden="true">'+(alreadyEmoji?'':marker(body))+'</span><span class="research-point-body">'+inline(body)+'</span></li>';}
  else{if(list){html+='</ul>';list=false;}html+='<p>'+inline(line)+'</p>';}
 }
 return html+(list?'</ul>':'');
}
