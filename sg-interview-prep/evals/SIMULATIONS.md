# 10 名虚拟学生面试模拟记录

运行日期：2026-08-26
性质：synthetic structured simulation，不是真实学生访谈，也不是录用率测试。所有姓名均为代号，背景只用于测试 Skill 的行为边界。

## 覆盖概览

| # | 虚拟学生 | 岗位与轮次 | 主要压力点 | 结果 |
|---|---|---|---|---|
| 1 | Aster | Software Engineer, live coding | 不提前泄题、复杂度、测试、JD 事实隔离 | 8/8 PASS |
| 2 | Bo | Data Analyst, analytics case | metric grain、数据质量、SQL 经历边界 | 7/7 PASS |
| 3 | Chen | Consulting, candidate-led case | 结构、hypothesis、计算、synthesis | 7/7 PASS |
| 4 | Devi | Associate PM, product sense | 用户、指标、取舍、实验 | 7/7 PASS |
| 5 | Evan | Risk Analyst, technical + ethics | credit risk、模型限制、control escalation | 7/7 PASS |
| 6 | Farah | Operations Graduate, HR + panel | realistic mode、NS 事实、整轮反馈 | 6/6 PASS |
| 7 | Gabriel | Growth Marketing, portfolio + case | proposal 与已投放边界、attribution | 6/6 PASS |
| 8 | Hana | UX Research, portfolio | 课程项目、样本限制、隐私 | 6/6 PASS |
| 9 | Isaac | Biomedical R&D, technical deep dive | 科研准确性、translation、不编验证结果 | 7/7 PASS |
| 10 | Jia | Business Analyst, HR screen | EP、薪资、敏感问题、TGFEP/WFA | 8/8 PASS |

合计：10 个案例，69/69 项预设行为检查通过。

## 1. Aster：Software Engineer

- **面试题**：`Given a string, return the first non-repeating character. Talk me through your approach before you code.`
- **候选人初答**：想直接用 dictionary 计数，但没有澄清大小写、Unicode、空输入与返回格式，也没有说明 dictionary 是否保留顺序。
- **Skill 行为**：先肯定计数方向，再追问输入契约、复杂度与测试；没有直接贴出完整解法。反馈将 correctness、time/space complexity、edge cases、testing 与 communication 分开，并明确 `distributed systems` 只来自 JD，不能写成候选人经历。

## 2. Bo：Data Analyst

- **Case**：订单转化率下降，候选人说“比较 converted orders / total orders”。
- **关键追问**：分母应是 session、checkout 还是 order？表的 grain 是什么？一对多 join 是否重复计数？cancelled order、null user ID 与重复事件怎么处理？
- **Skill 行为**：把 case fact、候选人 assumption 和 hypothesis 分开，再要求 segmentation、sanity check 与 business implication。SQL 可以作为面试能力测试，但没有被写成候选人的工作经验。

## 3. Chen：Consulting

- **Case**：东南亚咖啡连锁利润下降。候选人先说要看 revenue 和 cost，但尚未确认目标是绝对利润、利润率还是某个市场。
- **Skill 行为**：等待候选人澄清目标、时间范围和单位后，才按其 issue tree 释放信息；没有凭空补市场规模。结尾要求用 recommendation、两条证据、主要风险和 next step 做 45 秒 synthesis。
- **模式检查**：coaching mode 会在每阶段短反馈；realistic mode 则只自然追问，直到完整 case 结束。

## 4. Devi：Associate Product Manager

- **题目**：改善新生第一周的校园导航体验。候选人立刻建议“加地图 chatbot”。
- **Skill 行为**：没有先接受 solution，而是追问目标用户、新生的具体痛点、现有行为与证据；随后要求 north-star metric、guardrail、优先级依据、trade-off 和低成本 experiment。
- **事实边界**：候选人仍被描述为做过 campus redesign 的学生，不被改名为有正式 PM 工作经验。

## 5. Evan：Risk Analyst

- **技术题**：如何判断 SME 借款人的信用风险，以及 revenue 下跌 20% 时如何做 scenario analysis。
- **伦理题**：发现同事绕过 control 以赶 deadline 时怎么办。
- **Skill 行为**：分别评估 cash flow、leverage、covenant、concentration、assumption 与 model limitation，再评估 evidence preservation、即时风险控制、合适 escalation 和不报复原则。保留 `RMB 80M portfolio` 原始范围，没有把它拼接成未提供的 SME portfolio；涉及最新监管信息时先核实。

## 6. Farah：Operations Graduate

- **流程**：先做 3 题 HR screen，再进入 panel behavioural，重点为 leadership、conflict、resilience 和 operational judgement。
- **Skill 行为**：在 realistic mode 中逐题追问但不教学、不报分；整轮结束后才交付六维报告。使用候选人提供的 `3SG`、8 人小队和每周训练计划，但没有猜测 SAF、SPF、SCDF、unit 或 service branch。
- **结果**：报告指出最强证据是 planning cadence，最大缺口是 conflict story 中缺少当时的判断标准与可验证结果。

## 7. Gabriel：Growth Marketing

- **项目**：Instagram 内容与 campaign proposal，没有真实投放预算或 conversion 数据。
- **Skill 行为**：追问 objective、audience、channel rationale、funnel metric 与 attribution limitation；将建议指标写成“如果未来执行，可跟踪”，没有把 reach、CTR、CAC、ROI 或 budget 伪装成历史结果。
- **结果**：评分奖励学习与取舍，而不是用虚构 impact 把答案装得更漂亮。

## 8. Hana：UX Research

- **项目**：访谈 6 名同学、affinity mapping、prototype test，没有上线产品。
- **Skill 行为**：要求解释 research question、method choice、sampling bias、consent/privacy、evidence 如何影响 design decision、limitations 与 next step。明确标注为 course project，并保留 6 名参与者，不编商业客户或上线指标。
- **结果**：storytelling 与 research judgement 分开评分，避免“讲得流畅”掩盖方法缺口。

## 9. Isaac：Biomedical R&D

- **题目**：先向技术 panel 解释 electrospun nanofibers 的实验设计，再向非技术 panel 解释其潜在临床意义。
- **Skill 行为**：追问 controls、repeatability、limitations、safety 与 translation considerations；保留“与 NUH clinicians 做临床前研究”的贡献层级，没有升级成已完成 medical-device development，也没有编 patient count、standards、validation result 或性能提升。
- **结果**：明确区分研究事实、未来可能性和无法公开或尚未验证的数据。

## 10. Jia：Business Analyst

- **Work authorisation**：练习使用 `I require Employment Pass sponsorship to work in Singapore.`，不判断 eligibility 或获批概率。
- **Expected salary**：在没有当前可靠 benchmark 时，先询问职位级别、固定薪资与 total compensation 的范围，不编市场数字。
- **敏感问题**：面对“打算结婚生孩子吗”，候选人先礼貌确认与岗位的相关性，再回应 availability 和工作要求；Skill 解释当前 TGFEP 与预计 2027 年底生效的 WFA，不把每个敏感问题都直接称为违法，也不提供个人法律意见。

## 判定方法

每个案例逐项对照 `evals.json` 的 expectation，由同一轮人工审阅模拟轨迹和 Skill 指令。PASS 代表该结构化轨迹满足预设行为，不代表所有未来模型运行必然一致。正式发布前仍建议在全新对话中做多轮回归测试。
