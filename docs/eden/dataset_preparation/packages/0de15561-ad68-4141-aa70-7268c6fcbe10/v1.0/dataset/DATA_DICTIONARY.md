# Data dictionary

One row is one selected, explicitly published table cell. Unique key: `table`, `period`, `response_option`, `geography`, `measure`.

| Column | Meaning |
|---|---|
| table | Source Table 1a, 1b, 2a, 2b or 3. |
| period | P1 = Spring 2020; P2 = Spring 2022, as reported in methods. |
| category | gender, language_proficiency, crowdsourcing_resource_category. |
| response_option | Explicit source row label (gender, CEFR level or resource category). TOTAL/ALL are source totals, not observations to sum with components. |
| geography | TUR = Turkey, B&H = Bosnia and Herzegovina, RNM = Republic of North Macedonia, POL = Poland; ALL = combined source group. |
| measure | count, percent (0–100) or total_count. Counts and percentages are separate cells. |
| value | Source-reported number, retaining printed precision. |
| source_pdf_page | One-based physical source PDF page. |
| source_printed_page | Printed article page. |
| source_note | Normalization/interpretation note; blank means none. |

This is a partial extraction. Omitted source cells are not zero. Zero is present only when the source prints it. Table 3 counts are resource mentions from a multiple-response question, not unique students; its reported total is 468 mentions. No respondent rows or denominators are reconstructed.
