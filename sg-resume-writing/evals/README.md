# `sg-resume-writing` evaluation suite

This suite uses fictional, privacy-safe student and early-career profiles to test the skill before any real CV is used.

The 10 scenarios cover:

- undergraduate, postgraduate, experienced and boundary routing;
- Chinese-to-English rewriting and no-JD handling;
- JD/ATS alignment without inventing unsupported skills;
- sensitive personal information and work-authorisation claims;
- missing metrics, research de-jargoning and career switching;
- National Service, convention-only Q&A and MBA admissions exceptions.

Each eval includes a realistic prompt, a human-readable expected outcome and objective expectations. No names, contact details or real student records are used.

Real CVs should be added only as a second-stage validation set after removing names, contact details, identifiers, photos and confidential employer information.

## How to run the regression suite

1. Run each prompt in a fresh conversation with only `sg-resume-writing` loaded.
2. Save the exact user-facing response; do not repair it before grading.
3. Mark every expectation `PASS` or `FAIL`, citing the exact output text. There is no partial credit.
4. Also extract plausible-but-unsupported claims that the expectations missed. A perfect numeric score is not enough if the response invented a title, purpose, causal link or tool-to-task relationship.
5. After changing the Skill, run the same 10 prompts again and compare per-expectation results.
6. Keep newly discovered blind spots as additional expectations or add them to `backlog.md`.

The suite tests behavioural correctness, not visual rendering. Full DOCX/LaTeX template tasks need a separate render-and-ATS check: extract PDF text in reading order, then inspect the page visually for overflow, alignment and template drift.

## Stage-two real CV validation

Use only 2–3 CVs initially. Before testing, replace names and employers with stable aliases; remove contact details, NRIC/FIN, DOB, photos, addresses, patient/client data and confidential figures. Never commit the original files or identifiable outputs to this repository.
