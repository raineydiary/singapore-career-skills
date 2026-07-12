# Singapore Career Skills · 新加坡求职 Claude Skills

> 基于 NUS、NTU、SMU 三所高校就业指导中心的官方规范，以及 TAFEP 公平雇佣准则提炼而成的 Claude Skills。
>
> Claude Skills for job hunting in Singapore, distilled from the official career-office standards of NUS, NTU, SMU, and Singapore's TAFEP fair employment guidelines.

Developed by **Rain 雨雨小天才**

---

## 为什么做这个 / Why this exists

我是一名新加坡大厂面试官，过去这些年经手过 1000+ 份简历，面过 200+ 位候选人，也帮身边不少朋友和 mentee 一路改简历、模拟面试到拿下 offer。看得多了，有几件事越来越清楚。

**1️⃣ 大家对高校求职官方资源的利用远远不足**
网上的新加坡求职攻略很多，但大多是"我觉得"。可事实上，NUS、NTU、SMU 三所高校的就业指导中心，早就白纸黑字写好了给自己学生的简历与面试标准——什么该放、什么绝对不能放、面试官到底在测什么。只是这些规范散落在几十份英文 PDF 和校内材料里，绝大多数人根本不知道它们存在。这两个 Skills 里的每一条规则都能指回一份这样的官方文件；我今天就把这些分散、英文、藏在海量文件里面的宝贵规则，直接逐条提炼成 AI 可以直接执行的规则集。

**2️⃣ 大家开始用 AI 求职，但 AI 也许不懂新加坡**
用 AI 改简历、做模拟面试，方向是对的。但通用 AI 并不了解本地规范：它会给你一份通用简历，让你写 objective、堆形容词，却不会提醒你这里的简历不放照片、不写种族和出生日期，也不知道面试官问起婚育计划时你可以怎么合规应对。它给的是"全球平均答案"，不是"新加坡正确答案"。

**3️⃣ 信息差在 non-local 身上被成倍放大**
本地学生多少能从学长学姐、就业中心口耳相传捡到一些潜规则；但对华语求职者、尤其是刚来新加坡的人，没有人会主动告诉你——GPA 要不要写、Work Authorization 怎么标、thank-you email 该多久内发出、哪些 terms 是面试大忌。这些差一步就出局的细节，偏偏最没人讲给你听。

从 NUS、NTU、SMU 三所高校就业中心的简历与面试规范，到新加坡政府的 TAFEP 公平雇佣准则。**20份官方材料**、上万字规范里最专业、最精华的部分，全部提炼成 AI 可以一次性直接调用的规则集。让每个用上这些 Skills 的人，都能马上拥有一位既懂新加坡、又真的读过所有高校与政府官方文件的 SG Career Coach。

Most Singapore job-hunting advice online is anecdotal. Every rule in these skills traces back to an official source: the resume and interview standards that Singapore's universities publish for their own students, plus the national fair employment guidelines. The work here is distillation — turning scattered PDFs and annotated templates into rule sets an AI can execute.

Built by a hiring manager in Singapore tech, for Chinese-speaking job seekers navigating a market whose unwritten rules nobody explains to them.

---

## 两个 Skills / The Skills

### 📄 `sg-resume-writing`

写、改、评新加坡求职简历。

- **两档规则**：(1)应届本科档，(2)硕士与有经验档，按身份自动切换
- **中文简历也收**：负责转写成规范英文版，输出诊断报告 + 改好的 docx
- **ATS 关键词对齐**：提供目标岗位 JD，简历向 JD 的 KSA 与行业关键词对齐
- **本地合规**：照片、种族、出生日期、Work Authorization、GPA 门槛等新加坡特有规则
- **300+ 动词库**：按 9 大能力维度分类，配弱动词黑名单
- **数据诚实红线**：绝不编造数字，缺数据会追问或用占位符标注

### 🎤 `sg-interview-prep`

准备新加坡的求职面试。

- **模拟面试**：Claude 扮演面试官，一题一答，结束后出反馈报告
- **面试冲刺包**：按 JD 预测题目 + S.T.O.R.Y. 五故事备题 + 反问清单
- **三维评估模型**：Can you do the job / Do you love the job / Can you fit in —— 每道题先定位面试官在测什么
- **题型→框架映射**：STAR、C-STAR、3-Point、Past-Present-Future 按题型选用，不是万物皆 STAR
- **本地礼仪与合规**：Singlish 禁令、24 小时 thank-you email、panel/视频/电话/case 面试战术
- **违规提问应对**：面试官问了年龄、婚育、种族怎么办 —— 附 TAFEP 依据与英文话术

---

## 安装 / Installation

1. 到 [Releases](../../releases) 下载 `.skill` 文件
2. 打开 claude.ai → Settings → Capabilities → 确认 **Code execution and file creation** 已开启
3. 在 Skills 区域点击 **Upload skill**，选择下载的 `.skill` 文件
4. 确认开关打开，新开一个对话即可使用

> 若文件选择器不接受 `.skill` 后缀，把文件重命名为 `.zip` 再上传，内容完全一致。

**开始使用：**

```
「帮我看看这份简历，我要投新加坡的岗位」+ 上传简历（中文的也可以）
「我是 NTU 大三学生，帮我写一份新加坡实习简历」
「新加坡简历要放照片吗？」

「我下周面试新加坡的 data analyst，这是 JD，帮我准备」
「帮我模拟面试」
「面试官问我打不打算生孩子，我该怎么回答？」
```

---

## 规则来源 / Sources

所有规则均可溯源至以下官方材料。本仓库不再分发原始文件，仅提供链接。

**NUS Centre for Future-ready Graduates**
- [Create an Impressive Resume](https://nus.edu.sg/cfg/students/career-resources/create-an-impressive-resume)
- [Ace Your Job Interview](https://nus.edu.sg/cfg/students/career-resources/interview/ace-your-job-interviews)
- [Interview Framework (PDF)](https://nus.edu.sg/cfg/docs/default-source/students/career-resources/ace-your-job-interview/interview-framework.pdf)
- [Pre-Interview Preparation (PDF)](https://nus.edu.sg/cfg/docs/default-source/students/career-resources/ace-your-job-interview/pre-interview-preparation.pdf)
- [Interview Beyond Basics (PDF, FASS)](https://fass.nus.edu.sg/wp-content/uploads/2025/06/Interview-Beyond-Basics-Abridged.pdf)
- NUS MSc 简历模板（校内材料）

**NTU Career & Attachment Office**
- [Resume Do's and Don'ts](https://www.careertracks.edu.sg/career-skills-and-advice/resume-dos-and-donts/)
- [Tips to Ace Your Job Interviews](https://www.careertracks.edu.sg/career-skills-and-advice/tips-to-ace-your-job-interviews/)
- [How to Answer Common Job Interview Questions](https://www.careertracks.edu.sg/career-skills-and-advice/how-to-answer-common-job-interview-questions/)
- [Tips to Ace Your Online Interviews](https://www.careertracks.edu.sg/career-skills-and-advice/tips-to-ace-your-online-interviews/)
- [Tips to Ace Case Interviews](https://www.careertracks.edu.sg/career-skills-and-advice/tips-to-ace-case-interviews/)
- [NBS Job Interview Guide (PDF)](https://www.ntu.edu.sg/docs/librariesprovider150/default-document-library/job-interview-guide.pdf)
- [NBS: Crafting a Perfect Resume](https://blogs.ntu.edu.sg/nbsgradstudies/2016/05/19/crafting-a-perfect-resume/)
- NTU CAO 样本简历与检查清单（校内材料）

**SMU Dato' Kho Hui Meng Career Centre**
- SMU Postgraduate Standard Résumé Specifications（校内材料）
- SMU List of Action Verbs for Resumes（校内材料）

**TAFEP（新加坡公平与进步雇佣联盟）**
- [Tripartite Guidelines on Fair Employment Practices](https://www.tal.sg/tafep/getting-started/fair/tripartite-guidelines)
- [How to Conduct Fair Job Interviews](https://www.tal.sg/tafep/employment-practices/recruitment/conducting-job-interviews)
- [Fair Job and Employment Application Forms](https://www.tal.sg/tafep/employment-practices/recruitment/preparing-job-application-forms)
- Examples of Non-Discriminatory Interview Questions（TAFEP 官方题库）

---

## 免责声明 / Disclaimer

这些 Skills 是对公开与半公开官方材料的独立提炼与整理，与 NUS、NTU、SMU、TAFEP 均无隶属关系，也未获其背书。规范与政策会随时间变化，重要决定请以官方最新发布为准。

These skills are an independent distillation of official materials. They are not affiliated with or endorsed by NUS, NTU, SMU, or TAFEP. Standards and policies change over time — always verify against the latest official sources for important decisions.

---

## 路线图 / Roadmap

- [x] `sg-resume-writing` — 简历
- [x] `sg-interview-prep` — 面试
- [ ] `sg-offer-navigator` — Offer 解读与薪资谈判（CPF、AWS、EP 门槛）

---

## License

MIT — 自由使用、修改、分发，保留署名即可。

## 关于作者 / About

**Rain 雨雨小天才** · Singapore

新加坡大厂面试官，经手过 1000+ 份简历、面过 200+ 位候选人。做这些 Skills，是想把华语求职者在新加坡最真实的信息差，一次补齐。

| 平台 | 内容 |
|---|---|
| 📕 小红书 | **雨雨小天才** ——  我的职场分享与个人成长旅程 |
| 📣 公众号 | **狮城职场SG Career** —— 日更优质岗位内推，每月举办 SG 本地职场社交活动 |

如果这些 Skills 帮到了你，欢迎回来点个 ⭐ Star。
