# `sg-interview-prep` 模拟测试套件

这套测试使用 10 名完全虚构、不会对应真实学生的候选人，覆盖新加坡热门技术与非技术岗位。每个 case 都明确给出候选人背景、面试轮次、已知事实和不能补造的信息。

## 覆盖岗位

1. Software Engineer：live coding、复杂度、测试与 debugging
2. Data Analyst：metric、SQL/数据粒度、data quality 与 business implication
3. Consulting：candidate-led case、结构、计算与 synthesis
4. Product Manager：product sense、metrics、prioritisation 与 experiment
5. Finance / Risk：credit risk、model limitation、ethics 与 control judgement
6. Operations Graduate Programme：HR、panel、leadership 与 resilience
7. Growth Marketing：campaign、funnel、attribution 与 portfolio
8. UX Research：portfolio、method choice、bias 与 limitation
9. Biomedical R&D：technical deep dive、科学准确性与跨职能表达
10. Business Analyst HR Screen：salary、work authorisation 与 TAFEP/WFA 边界

## 运行规则

1. 每个 case 使用全新对话，只加载被测版本的 `sg-interview-prep`。
2. 不把期望答案或评分点提前泄露给被测 Skill。
3. 按 prompt 指定的 coaching mode 或 realistic mode 运行；模拟面试必须一次只问一题。
4. 对每条 expectation 只记 PASS 或 FAIL，不给模糊的半分。
5. 除了评分，还要记录断言没有覆盖的合理化补造、法规时效、角色路由和追问质量问题。
6. 真实学生或真实面试资料只能作为第二阶段测试，并必须删除姓名、联系方式、学校 ID、雇主机密、客户或患者资料。

这套测试衡量的是 Skill 的行为与规则覆盖，不承诺任何面试或录用结果。
