# Data dictionary

One row represents one published percentage for one indicator and survey period. The key is `indicator_id` + `period_code`.

| Column | Type / unit | Meaning |
|---|---|---|
| indicator_id | Text | Stable compilation code for the reported indicator; not an original questionnaire identifier. |
| category | Text | `difficulty` or `computer_literacy`. Compiler grouping. |
| indicator_label | Text | Short paraphrase of the source's indicator; not a verbatim questionnaire item. |
| period_code | Text | `FP` = first collection; `SP` = second collection. |
| reported_percent | Decimal / percent | Source-reported value on the 0–100 scale. No derived respondent count. |
| period_participants_n | Integer / persons | Total period sample (216 FP; 214 SP). NOT a confirmed item denominator. |
| collection_period | Text | Source-reported month range; precision must not be converted to exact dates. |
| geography_scope | Text | Combined results across the four study countries, not North Macedonia-only data. |
| source_pdf_page | Integer / page | One-based page in the nine-page downloaded PDF, including appended colophon. |
| source_printed_page | Integer / page | Printed chapter page: 158, 159 or 160. |
| source_section | Text | Chapter section 3.3 (difficulties) or 3.5 (computer literacy). |
| source_doi | Text | Source publication DOI, not a dataset identifier. |

No missing values occur in this selected extraction. Absence of an indicator from this file means it was not extracted; it never means zero. Unreported categories, individual responses and item denominators are absent, not imputed.

All observed values retain the source's one-decimal numerical precision. Displaying a percentage with `%` in a spreadsheet must not multiply the stored value by 100.
