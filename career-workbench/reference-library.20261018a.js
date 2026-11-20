// Shared, deterministic selection. No model calls, network access or user logging.
export const REFERENCE_VERSION = 'rain-official-careers-20261011-v1';
const profiles = {
  'bytedance-enterprise-agent-pm': { company: /字节|bytedance|tiktok/i, stage: 'experienced', topics: /财务|人力|采购|法务|集团|内部系统|企业|to\s*b|b端/gi },
  'alibaba-freshippo-agent-campus': { company: /阿里|盒马|alibaba|freshippo/i, stage: 'campus', topics: /员工|办公|效率|企业|自动化|知识管理|saas|低代码/gi },
  'tencent-craft-senior-ai-pm': { company: /腾讯|tencent|craft/i, stage: 'experienced', topics: /游戏|创作|玩家|ugc|game/gi },
  'deepseek-agent-data-pm': { company: /deepseek|深度求索/i, stage: 'mixed', topics: /数据|质量|评测|评估|归因|搜索|eval|search/gi },
  'kimi-global-hiring-philosophy': { company: /kimi|月之暗面|moonshot/i, stage: 'philosophy', topics: /创新|自主|跨领域|探索/gi }
};
const hosts = new Set(['jobs.bytedance.com', 'campus-talent.alibaba.com', 'careers.tencent.com', 'app.mokahr.com', 'www.kimi.com']);
export function safeReference(source) {
  try { return Object.hasOwn(profiles, source.id) && new URL(source.url).protocol === 'https:' && hosts.has(new URL(source.url).hostname); }
  catch { return false; }
}
export function selectReferences(corpus, input, now = Date.now()) {
  const result = { version: REFERENCE_VERSION, verifiedOn: corpus?.verified_on || '', sources: [], status: 'no-match' };
  if (input?.module !== 'position-map') return { ...result, status: 'not-applicable' };
  const checked = Date.parse(result.verifiedOn + 'T00:00:00Z');
  if (!Number.isFinite(checked) || now - checked > 90 * 86400000 || checked - now > 86400000) return { ...result, status: 'needs-review' };
  const role = String(input.role || ''), jd = String(input.jd || '');
  if (!jd.trim()) return { ...result, status: 'awaiting-jd' };
  const text = role + '\n' + jd;
  const ai = /\bai\b|agent|人工智能|智能体|大模型|llm/i.test(text);
  const product = /产品经理|产品策划|产品规划|产品设计|product\s*(manager|management|lead)|\bpm\b/i.test(role || jd);
  if (!ai || !product) return result;
  const explicitStage = /校招|应届|实习|campus|intern|graduate/i.test(role) ? 'early' : /高级|资深|社招|senior/i.test(role) ? 'experienced' : /校招|应届|实习|campus|intern|graduate/i.test(jd) ? 'early' : /社招|senior|工作经验|年.*经验/i.test(jd) ? 'experienced' : 'unknown';
  const company = String(input.company || '').trim();
  const ranked = (corpus?.sources || []).filter(s => safeReference(s)).flatMap(source => {
    const p = profiles[source.id];
    if (explicitStage === 'early' && p.stage === 'experienced' || explicitStage === 'experienced' && p.stage === 'campus') return [];
    const companyMatch = p.company.test(company);
    const topicCount = Math.min(4, new Set(text.match(p.topics) || []).size);
    if (p.stage === 'philosophy' && !companyMatch) return [];
    // A game role is not a generic AI PM reference just because Tencent matches.
    if (source.id === 'tencent-craft-senior-ai-pm' && !topicCount) return [];
    if (!companyMatch && !topicCount) return [];
    return [{ ...source, verified_on: result.verifiedOn, match_reason: companyMatch ? '同公司参考，未必是同一团队或岗位' : '工作方向相近，仅作跨公司参考', score: (companyMatch ? 10 : 0) + topicCount + (explicitStage === 'early' && p.stage === 'campus' ? 3 : 0) }];
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  result.sources = ranked.slice(0, 2).map(({ score, ...source }) => source);
  result.status = result.sources.length ? 'matched' : 'no-match';
  return result;
}

// Only reviewed facts enter the model context; editorial interpretations stay out.
export function modelReferenceContext(selection) {
  return {
    version: selection.version, status: selection.status,
    boundary: '历史核验摘要，不是实时招聘检索；仅供对照，不替代用户JD，不是候选人事实或招聘方隐藏标准',
    sources: selection.sources.map(s => ({ id: s.id, company: s.company, title: s.title, url: s.url,
      kind: s.kind, verifiedOn: s.verified_on, stage: s.stage, matchReason: s.match_reason,
      factsSummary: s.facts_summary, requirementsSummary: s.explicit_requirements_summary,
      preferredSummary: s.preferred_summary || '' }))
  };
}

// Resolve IDs against the reviewed catalogue; never turn model/user URLs into links.
export function resolveReferenceIds(corpus, record) {
  if (!record || record.version !== REFERENCE_VERSION || !Array.isArray(record.ids) || record.ids.length > 2) return [];
  return [...new Set(record.ids)].map(id => corpus?.sources?.find(s => s.id === id)).filter(s => s && safeReference(s));
}
