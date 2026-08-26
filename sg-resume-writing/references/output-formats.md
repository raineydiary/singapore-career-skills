# Output formats and template lock

## Recommended mode matrix

| User need | Output mode | Primary file | Rules |
|---|---|---|---|
| Most Singapore job and internship applications | ATS-safe single-column | `.docx`, then PDF for submission | Black text, one column, standard headings, no icons, skill bars, text boxes or decorative sidebars |
| User says “stick to NUS template” and uploads a template | Supplied-template lock | Same editable format as source | Preserve margins, fonts, heading order, spacing, alignment and page logic; replace content only unless the user requests a layout change |
| User says NUS style but provides no template | NUS-aligned | `.docx` | Follow NUS content guidance and a restrained single-column layout; label it NUS-aligned, not official or exact |
| NTU undergraduate / internship | NTU undergraduate | `.docx` | Use the section order and formatting in `tier-undergrad.md`; keep projects and CCA visible |
| SMU postgraduate / resume-book | SMU postgraduate | `.docx` | Use the four-block structure and strict one-page rule only for the standardised SMU context |
| User explicitly requests LaTeX | ATS-safe LaTeX | `.tex` + PDF | Use a simple one-column class, standard fonts, Unicode text and semantic headings; avoid multi-column packages, icons and visual rating bars |
| User asks only for bullets or diagnosis | Content-only | Chat/Markdown | Do not generate a file or force a full template |

## Template-lock contract

When a user supplies a template and says “stick to” it:

1. Treat the supplied file as the visual source of truth.
2. Preserve page size, margins, header/footer, fonts, font sizes, heading hierarchy, date alignment, spacing, bullet indentation and section order.
3. Change only text and the minimum line wrapping needed for truthful content.
4. If content cannot fit, show the trade-off and ask whether to shorten content or relax the template. Do not silently shrink text below the template's readable minimum.
5. Never claim an independently recreated layout is an official NUS/NTU/SMU template.

## ATS verification

Before calling any PDF application-ready:

- extract its text and confirm the order is name/contact → sections → entries → bullets;
- check that dates, organisation names and bullet text are selectable text rather than images;
- confirm no critical content is placed only in headers, footers, icons, text boxes or two-column reading order;
- visually inspect the final page count, wrapping, alignment and any overflow.

## Visual style

“好看”在求职简历里优先意味着 clean、consistent、easy to scan：

- one-column hierarchy, strong whitespace and restrained bolding;
- black text on white background, one professional font family;
- no portrait, logo wallpaper, infographic chart, skill progress bar or decorative colour block;
- consistent dates, bullets, capitalisation and spacing.

LaTeX is optional, not automatically better. It is useful when the user wants reproducible typography and is comfortable editing source; DOCX remains the default because it is easier to edit and to match supplied university templates.
