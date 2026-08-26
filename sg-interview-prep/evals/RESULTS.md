# 测试结果

最近运行：2026-08-26

## 结论

更新后的 `sg-interview-prep` 在 10 名虚拟学生的结构化模拟中通过 69/69 项预设检查。覆盖 9 类热门技术与非技术岗位，以及 HR、hiring manager、technical、case、portfolio、panel 等主要轮次。

## 结果表

| 测试层 | 范围 | 结果 |
|---|---|---|
| JSON 结构 | 10 cases / 69 expectations | PASS |
| 岗位覆盖 | SWE、Data、Consulting、Product、Finance/Risk、Operations、Marketing、UX、Biomedical R&D | PASS |
| 事实边界 | 不编经历、数字、ownership、市场数据或法规 | PASS |
| 模拟机制 | coaching / realistic、一次一题、adaptive probe、minimal hint | PASS |
| 本地规范 | work authorisation、salary、TGFEP 与 WFA 区分 | PASS |
| 结构化模拟 | 10 synthetic profiles | 69/69 PASS |

## 相比原版的关键增强

1. 从以 behavioural / STAR 为主，扩展到 9 类岗位专项 playbook。
2. 增加 coaching mode 与 realistic mode，避免每题都立刻教学。
3. 增加六维评分、技术与 case 附加项，以及整轮 feedback report。
4. 增加 evidence ledger，阻止 JD 关键词、相邻事实或未来目标被写成已有经历。
5. 更新新加坡本地边界，明确当前 TGFEP 与预计 2027 年底生效的 WFA。

## 限制

- 本轮是 synthetic structured simulation，不是真实学生研究，也不是随机多次模型 benchmark。
- 69/69 代表这 10 条审阅轨迹满足当前 assertions，不是 offer 概率，也不能保证任何输入都得到完全相同的表现。
- 公司、薪资、市场和监管事实会变化；正式使用时仍须即时核实官方来源。
