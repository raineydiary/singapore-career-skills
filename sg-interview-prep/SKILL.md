---
name: sg-interview-prep
metadata:
  author: Rain 雨雨小天才
description: Prepare for job interviews in Singapore following the official standards of NUS, NTU career offices and TAFEP fair employment guidelines. Use this skill whenever the user asks about job interview preparation for Singapore (新加坡面试 / 面试准备 / interview prep / mock interview / 模拟面试), wants to practice or polish answers to interview questions (behavioral, situational, technical, "tell me about yourself", strengths/weaknesses, salary expectations), asks how to handle Singapore interview conventions (etiquette, thank-you email, panel/video/phone interviews, Singlish, dress code), asks what interviewers are allowed to ask (age, race, marital status questions, TAFEP rules), or mentions an upcoming interview with a Singapore employer — even if they don't say "Singapore" but their school (NUS/NTU/SMU/SIM/SUTD/SUSS), target company, or context indicates a Singapore job market. Also trigger when the user has just finished resume work and wants to prepare for the next stage.
---

# Singapore Interview Prep (新加坡面试准备)

> Developed by Rain 雨雨小天才 · 基于 NUS / NTU 官方就业指导规范与 TAFEP 公平雇佣准则整理

| Source | 定位 |
|---|---|
| NUS CFG「Ace Your Job Interview」+ Interview Framework + Pre-Interview Preparation | 五步准备法 + 四大答题框架总表 |
| NUS FASS「Interview Beyond Basics」 | 面试官三维评估模型 + S.T.O.R.Y. 备题法 + 经典题逐题拆解 |
| NTU CAO Career Tracks 2026（面试系列文章） | STAR 官方定义 + 本地礼仪铁律 + 高频六题范例 + case 面试 |
| NTU NBS Job Interview Guide | 面试形式分类战术 + 题型分类 |
| TAFEP 公平雇佣准则 + 非歧视面试题官方题库 | 合法/违规问题边界 + 19 类合规题库 |

## Workflow

**语言规则（先于一切）**：新加坡面试默认英文进行，所有答案练习、模拟面试问答、改写示范一律**英文**输出。对话讲解语言跟随用户：中文用户用中文讲解点评 + 英文示范答案。若用户申请的是明确的中文岗位（如中文教师、面向中国市场岗位），可切换为双语练习。

### 四种进场场景

**A. 面试冲刺（带 JD ± 简历来，即将面试）**：① 从 JD 提取 KSA 关键词 → ② 按三维评估模型预测最可能被问的题（读 `references/question-bank.md`）→ ③ 用 S.T.O.R.Y. 五故事法从用户经历中备好故事素材 → ④ 输出「备战包」：预测题清单 + 五个故事草稿 + 反问清单。若用户装有 sg-resume-writing 或提供了简历：简历上的每条 bullet 都应能展开成一个面试 story，故事中的数字必须与简历一致。

**B. 模拟面试**：Claude 扮演新加坡雇主的面试官。规则：一次只问一题，等用户作答后再点评；题目从 `references/question-bank.md` 按 JD 相关性和三维覆盖度选取；点评按「三维定位 → 框架使用 → 具体改进」结构给；全部结束后输出整场反馈报告。开始前询问用户目标岗位和轮次（HR 筛选/业务面/panel），按轮次调整提问风格。

**C. 答案打磨（用户带着一道题和自己的答案来）**：先判断题型 → 匹配正确框架（读 `references/answer-frameworks.md`）→ 诊断现有答案缺什么（常见：无具体例子、无结果、逻辑无路标）→ 用用户的真实素材改写，不添加虚构内容。

**D. 规范问答**（"面试官能问我婚育吗？""要发 thank-you email 吗？"）：直接引用对应规则回答，注明出处（校方规范/TAFEP）。

## 核心方法论

### 三维评估模型（NUS FASS，一切问题的底层逻辑）

面试官的所有问题都在测三件事，理想候选人落在三圆交集：

1. **Can you do the job?** — 技能与胜任力（自我介绍、岗位理解、strength/weakness、贡献方式）
2. **Do you love the job?** — 兴趣与动机（why this job、还投了哪些公司、职业规划）
3. **Can you fit in?** — 性格、价值观、职业操守（冲突处理、不配合的队友、ethics 题）

点评任何答案时，先定位这道题在测哪一维，再判断答案有没有击中该维度。

### 题型 → 框架映射（NUS 框架总表 + NBS 题型分类）

不是万物皆 STAR。按题型选框架（详解与范例见 `references/answer-frameworks.md`）：

| 题型 | 框架 |
|---|---|
| 行为题（"描述一次你…"） | **S.T.A.R.**（Situation-Task-Action-Result） |
| 复杂行为题（背景对理解决策至关重要） | **C-STAR**（前置 Context） |
| 一答多点（"你的三大技能"） | **3-Point**（Firstly/Secondly/Lastly 路标词） |
| 职业轨迹/规划题 | **Past-Present-Future** |
| 情景假设题（situational，没经历过的场景） | 无标准答案，展示思维过程；可借 STAR 组织 |
| 技术/行业题 | 讲清推理过程 + commercial awareness（你的工作如何帮公司赚钱/省钱） |
| 脑筋急转弯/curveball | 重点是解释推理，不是算出正确答案 |

### S.T.O.R.Y. 备题法（NUS FASS）

面试前备好五个真实故事，覆盖约九成行为题：

- **S**trengths — 强项与价值（能给公司带来什么）
- **T**eam — 团队角色（领导决策 或 配合与冲突管理）
- **O**riginality — 创新（流程优化、新方法）
- **R**esilience — 抗压与挫折（多 deadline、障碍、失败）
- **Y**ahoo moments — 高光成就（动机与热情的证据）

每个故事按 STAR 结构写好，一个故事可应对多道题的不同侧面。

### 诚实红线

故事必须来自用户的真实经历，**绝不虚构经历、头衔或数字**。面试官会追问细节，编造的故事在第二三层追问下必然崩塌，代价远大于简历造假。用户素材不足时：往小事挖真实的例子（课程项目、兼职、社团），而不是把小事夸大成不存在的大事。数字与简历保持一致。

## 新加坡本地铁律

- **语言**：清晰专业的英文，不用 Singlish、俚语、生僻缩写（NTU 明文）
- **话题禁区（候选人侧）**：主动避开年龄、种族、宗教、政治等敏感话题（NTU）
- **Show, don't tell**：泛泛自评（"I am good at multitasking"）必须替换为具体例子 + 可量化结果（NTU 2026）
- **Panel 面试一致性**：同一问题被问两遍时，坚持同一版本的故事，不要自我怀疑改口（NBS）
- **24 小时内发 thank-you email**：感谢 + 重申兴趣；可借此补答没答好的题或补充数据；可在 LinkedIn 上附简短专业留言连接面试官（NTU）
- **语言能力题合法且常见**（TAFEP）："能用华语和中国客户沟通吗"是合规问题——如实展示双语能力，这是华语求职者的优势项
- **雇主违规问题的应对**（TAFEP）：年龄/种族/宗教/婚姻/生育计划/残障不应被问。应对三步：① 礼貌确认与岗位的相关性（"May I ask how this relates to the role?"）② 只回答与工作相关的部分 ③ 情节严重可留证据并向 TAFEP 反映。雇主若必须问敏感问题，有义务向候选人解释理由——知道这一点本身就是底气

## 交付标准

- **模拟面试** → 整场结束后交付「面试反馈报告」：每题的三维定位与得分点、框架使用情况、最需改进的 2–3 处（附改写示范）、下次冲刺重点
- **面试冲刺** → 交付「备战包」：按 JD 预测的题目清单（标注三维归属）、S.T.O.R.Y. 五故事草稿、结尾反问清单（3–5 个体现调研深度的问题）
- 所有反馈遵循：先说做对了什么，再给具体可执行的改法，不空泛点评

## 交付前检查清单

1. ☐ 所有示范答案为英文，具体、含真实素材、无虚构
2. ☐ 每道题的点评都标注了三维定位和适用框架
3. ☐ 行为题答案含完整 STAR 四要素，Result 有量化或明确成果
4. ☐ 无 Singlish、俚语、生僻缩写
5. ☐ 涉及敏感/违规问题时引用了 TAFEP 依据
6. ☐ 与用户简历数字一致（如有简历）
7. ☐ 模拟面试严格一题一答，未连续轰炸
8. ☐ 报告含具体改进示范，非空泛评语

## 待完善（v2 计划）

以下三块官方材料未覆盖，当前按通用安全建议处理，后续将由一线技术面试官视角补充：expected salary 应答策略（当前建议：给出基于调研的区间而非单点数字，模拟面试遇到时提醒用户先查 MyCareersFuture 同岗位当前行情）、面试官红旗清单、技术面试实况战术。

## References

- `references/question-bank.md` — 按三维组织的题库 + NTU 高频六题 + TAFEP 19 类合规题库 + 违规题清单
- `references/answer-frameworks.md` — 四框架详解与完整范例 + elevator pitch 模板 + 经典题逐题拆解
- `references/formats-etiquette.md` — 各面试形式战术（视频/panel/电话/case）+ 面试前中后检查清单 + 违规问题应对细则
