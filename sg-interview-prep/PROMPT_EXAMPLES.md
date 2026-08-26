# 可直接复制的 Prompt

以下示例均默认：候选人事实只来自你提供的简历与补充说明；JD 只代表岗位要求，不能反向变成你的经历。

## 1. 第一次练习：Coaching mode

```text
请使用 sg-interview-prep。我要申请新加坡的 [岗位]，公司是 [公司]，面试轮次是 [HR / hiring manager / technical / case / panel]。下面是 JD 和我的简历。

请先建立 evidence ledger，再用 coaching mode 一次问我一题。每次等我答完后，只给一个做得好的点、两个最重要的问题和一个追问。不要替我编经历、数字或结果。
```

## 2. 临场压力测试：Realistic mode

```text
请使用 sg-interview-prep，为 [岗位] 做一轮 25 分钟 realistic mock interview，共 6 题。过程中不要教学、不要提示、不要逐题打分，只按真实面试官方式追问。整轮结束后，用六维 rubric 给我反馈报告和下一轮三个训练动作。
```

## 3. Software Engineer / Live Coding

```text
请模拟新加坡 Software Engineer technical screen，一次只出一道题。先让我澄清需求、说思路和复杂度，再让我写代码与测试。不要直接给答案；我卡住时按最小提示阶梯处理。最后分别评估 correctness、complexity、edge cases、testing 和 communication。
```

## 4. Data Analyst / SQL Case

```text
请模拟一个电商转化率下降的 Data Analyst case。先让我定义 metric 和 denominator，再逐步给数据。重点追问 data grain、joins、null、duplicate、segmentation、validation 和 business implication。不要把 JD 中的 SQL 变成我的工作经历。
```

## 5. Consulting Case

```text
请给我一场 candidate-led consulting case。不要一开始就把全部数据给我，也不要替我编市场规模。等我澄清目标、搭结构和提出 hypothesis 后，再按我的分析方向释放信息。最后检查 calculation、unit、synthesis、risk 和 next step。
```

## 6. Product Sense

```text
请模拟 Associate Product Manager 的 product sense interview。重点看 user segment、pain point、business goal、success metric、guardrail、prioritisation、trade-off 和 experiment。不要把我的校园项目包装成正式 PM 工作经验。
```

## 7. Finance / Risk / Ethics

```text
请模拟银行 Risk Analyst 的 technical + ethics panel，覆盖 credit risk、scenario analysis、model limitation 和 control escalation。涉及最新监管、银行动态或市场数字时，请先核实官方来源；无法核实时就标成待验证假设。
```

## 8. Portfolio：Marketing / UX / Design

```text
请模拟 [Growth Marketing / UX Research / Product Design] portfolio interview。只使用我真实提供的项目证据，明确区分 proposal、course project、prototype 和 launched product。不要编预算、conversion、用户数或上线结果。重点追问 problem、method、evidence、decision、limitation 和 learning。
```

## 9. 敏感问题与 Work Authorisation

```text
请陪我练习新加坡 HR screen 中的 work authorisation、expected salary 和敏感问题。不要替我判断准证 eligibility，也不要编市场薪资。请区分当前 TGFEP 与预计 2027 年底生效的 WFA，并提供礼貌、只聚焦 job-related requirement 的英文答法。
```

## 10. 面试后复盘

```text
请根据我回忆的真实面试问题和回答做 debrief。把“我确认发生的事实”“我的推测”和“无法知道的面试官想法”分开。用六维 rubric 指出最强两点、最大三个风险，并只基于我的真实素材给出重答版本。
```
