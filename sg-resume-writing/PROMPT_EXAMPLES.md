# Prompt examples

The skill already decides the correct undergraduate/postgraduate route. Users only need to specify the task, evidence and preferred output mode.

## Recommended prompts

| Goal | Copy-paste prompt |
|---|---|
| Full Singapore resume | `请按新加坡求职标准诊断并重写我的完整简历。目标岗位是 [role]，JD 如下：[paste JD]。只使用我提供的事实；不确定的关系先列为 open questions。默认输出 ATS-safe 单栏 DOCX，并给我一份中文诊断报告。` |
| NUS-aligned format | `请用 NUS-aligned 的一页单栏格式重写，但不要声称这是官方模板。正文用英文，解释用中文；完成前检查 CAR、ATS keywords、source fidelity 和敏感个人信息。` |
| Stick to an uploaded template | `Stick to the supplied template. Preserve its margins, fonts, font sizes, section order, date alignment, spacing and bullet indentation. Only replace or shorten content; if it cannot fit, show me the trade-off instead of silently changing the layout.` |
| NTU undergraduate | `我是 NTU 本科生，申请 [internship/graduate role]。请按 NTU undergraduate structure 保留 project 和 CCA，输出一页 ATS-safe DOCX。以下是我的真实素材和 JD：[paste]。` |
| SMU postgraduate | `我是 SMU [programme] 学生，有 [N] 年经验。请按 SMU postgraduate four-block structure 输出；只在标准化 resume-book 场景使用严格一页规则。以下是素材和 JD：[paste]。` |
| LaTeX | `请输出 ATS-safe 单栏 LaTeX，交付 .tex 和编译后的 PDF。不要使用双栏、图标、skill bars 或把关键信息放进 header/footer；完成后验证 PDF 的文字抽取顺序。` |
| Bullet-only rewrite | `只改下面这 [N] 条经历 bullet，不要启动完整简历流程，也不要生成附件。正文英文、解释中文；保留所有近似词和真实 ownership，不得补造数字或把 JD 技能写成我的经历。` |
| Convention Q&A | `只回答这个新加坡简历规范问题并说明理由，不要让我填写完整 intake：[question]` |

## Evidence block

For better source fidelity, users can paste evidence in this lightweight structure:

```text
Target role / JD:
Organisation + role + dates:
What I personally did:
Tools I definitely used:
Who I worked with:
Verified scale / numbers:
Verified result or purpose:
Anything confidential or approximate:
Preferred format: DOCX / NUS-aligned / supplied template / LaTeX / content-only
```

Do not paste unredacted NRIC/FIN, date of birth, home address, private contact details, patient/client information or confidential employer data into public examples or GitHub issues.
