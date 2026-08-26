# Evaluation results

Last run: **25 Aug 2026**

Core suite: **10 fictional, privacy-safe profiles**

Final assertion set: **64 behavioural expectations**

## Summary

| Round | Result | What it revealed |
|---|---:|---|
| Original Skill | 53/54 original expectations | Core routing and compliance were strong; the PhD case turned target-role language into unsupported past-research claims |
| Adversarial review | Score not accepted as final | Additional claim-joining was found outside the original assertions: tools were tied to unspecified tasks, adjacent facts were merged and plausible business purposes were invented |
| Revised Skill regression | 64/64 final expectations | All 10 core profiles passed after adding source-fidelity, task-scope, work-authorisation, format and source-recency guardrails |

The final score combines the complete revised runs for cases 2–9 with focused regression reruns for case 1 (title, tool-to-task and purpose fidelity) and case 10 (current admissions page versus historical three-page guidance).

## Per-profile final score

| # | Profile | Assertions | Result |
|---:|---|---:|---:|
| 1 | NUS Data Analyst / sensitive information | 9 | 9/9 |
| 2 | NTU Engineering / Chinese source / no JD | 6 | 6/6 |
| 3 | SMU MSc Finance / experienced / EP sponsorship | 7 | 7/7 |
| 4 | NUS PhD / industry transition | 7 | 7/7 |
| 5 | Master's boundary case / no full-time experience | 6 | 6/6 |
| 6 | Local student / National Service | 5 | 5/5 |
| 7 | Foreign career switcher / low GPA | 6 | 6/6 |
| 8 | From-scratch undergraduate intake | 6 | 6/6 |
| 9 | Photo convention Q&A | 5 | 5/5 |
| 10 | Nanyang MBA admissions exception | 7 | 7/7 |
|  | **Total** | **64** | **64/64** |

## Changes driven by failures

- Added a **source-fidelity ledger**: every title, tool, stakeholder, purpose, number, relationship and outcome must trace back to supplied evidence; JD language cannot become candidate history.
- Separated `working draft` from `application-ready`: placeholders are allowed only in a labelled draft, never in a final DOCX/PDF.
- Added purpose and format routing: corporate resume, academic CV and admissions resume are distinct; full files use an explicit ATS-safe / NUS-aligned / NTU / SMU / LaTeX mode.
- Tightened Work Authorization wording, ownership verbs, privacy handling, untrusted attachment handling and discriminatory-JD boundaries.
- Added source-recency handling: the current Nanyang MBA admissions page does not publicly state a page cap; the up-to-three-page reference is identified as 2016 historical NBS guidance and the live portal must be checked.

## Limits

This suite demonstrates repeatable behaviour on defined synthetic cases; it is not proof of performance on every real resume. Visual DOCX/LaTeX rendering, PDF text order and template fidelity require separate file-based QA. The next stage should use only 2–3 fully anonymised real CVs and must never commit identifiable inputs or outputs.
