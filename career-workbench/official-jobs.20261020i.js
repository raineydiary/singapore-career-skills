// Reviewed official links, not a live-search API. Never invent vacancies or locations.
export const JOBS_CHECKED_ON = '2026-10-20';
export const officialJobs = [
  {id:'tiktok-shop-consumer-strategy',company:'TikTok Shop',family:'bytedance',title:'Product Strategy Analyst, Consumer Strategy',zh:'消费者产品策略分析师',location:'Seattle · 西雅图',region:['西雅图','seattle','美国','usa'],stage:'experienced',focus:'commerce',url:'https://lifeattiktok.com/search/7680451178930833669',summary:'行业研究、产品战略、业务诊断与跨团队落地'},
  {id:'tiktok-shop-smb-strategy',company:'TikTok Shop by Tokopedia',family:'bytedance',title:'SMB Product Strategy Specialist, Scalable Solutions',zh:'中小商家产品策略专员',location:'Jakarta · 雅加达',region:['雅加达','jakarta','印尼','印度尼西亚','indonesia'],stage:'experienced',focus:'commerce',url:'https://lifeattiktok.com/search/7689045666946124085',summary:'商家体验、内容到 GMV 的链路分析与策略执行'},
  {id:'tiktok-ads-strategy-sg',company:'TikTok',family:'bytedance',title:'Ads Product Strategy & Operations Manager, Leads & Service',zh:'广告产品策略与运营经理',location:'Singapore · 新加坡',region:['新加坡','singapore'],stage:'experienced',focus:'ads',url:'https://lifeattiktok.com/search/7655594610210769205',summary:'广告产品策略、市场研究与 GTM；非电商团队'},
  {id:'tiktok-product-strategy-intern',company:'TikTok',family:'bytedance',title:'Product Strategy Analyst Project Intern (TikTok-Product-Business Analytics) - 2026 Start (BS/MS)',zh:'产品策略分析项目实习生',location:'San Jose · 圣何塞',region:['圣何塞','san jose','美国','usa'],stage:'early',focus:'consumer',url:'https://lifeattiktok.com/search/7662640766689134853',summary:'消费产品研究、竞品分析与产品机会识别'}
];
export function jobSearchTerms(input={}) {
  const company=String(input.company||'').trim(),role=String(input.role||'').trim();
  const related=/tik\s*tok|字节|bytedance/i.test(company);
  const strategy=/产品策[略划]|产品战略|product\s*strateg|strategy\s*(?:&|and)\s*operations/i.test(role);
  const product=/产品|product|\bpm\b/i.test(role);
  const roleTerms=strategy?['产品策略','Product Strategy','Strategy & Operations']:product?[role,'Product Manager']:role?[role]:[];
  return {family:related?'bytedance':'',companyTerms:related?['TikTok','TikTok Shop','字节跳动','ByteDance']:company?[company]:[],roleTerms:[...new Set(roleTerms)],market:String(input.market||'').trim()||'地区不限 / 中文',strategy,product};
}
export function findOfficialJobs(input={},now=Date.now()) {
  const terms=jobSearchTerms(input);
  const fresh=now-Date.parse(JOBS_CHECKED_ON+'T00:00:00Z')<=90*86400000;
  if(!fresh||!terms.family||!terms.strategy)return {...terms,jobs:[],checkedOn:JOBS_CHECKED_ON};
  const text=String(input.role||'')+'\n'+String(input.jd||'');
  const early=/实习|应届|校招|intern|graduate|campus/i.test(text);
  const commerce=/电商|商家|e.?commerce|merchant|tiktok\s*shop/i.test(text+' '+input.company);
  const market=terms.market.toLowerCase();
  const jobs=officialJobs.filter(j=>j.family===terms.family&&(!early||j.stage==='early')).map(j=>{
    const local=j.region.some(r=>market.includes(r.toLowerCase()));
    return {...j,local,score:(local?100:0)+(commerce&&j.focus==='commerce'?30:0)+(j.stage==='experienced'&&!early?10:0)};
  }).sort((a,b)=>b.score-a.score).slice(0,3).map(({score,...job})=>job);
  return {...terms,jobs,checkedOn:JOBS_CHECKED_ON};
}
