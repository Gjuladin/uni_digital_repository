# Published aggregate survey results on students' online learning, 2020–2021

Version 1.0 · Compiled 4 October 2026 · Derived research data · Prepared for repository review

## What this contains

`online_learning_published_aggregates_v1.csv` contains **22 observations: 11 published percentage indicators in each of two survey periods**. Nine indicators describe reported difficulties and two describe self-rated computer literacy. These are real numerical results transcribed from a published research chapter, not simulated or reconstructed individual responses.

This release is a **partial extraction of published aggregate results**. It excludes demographic percentages and Figures 1–5, although some figures contain extractable numerical labels. It does not contain the questionnaire, respondent-level data, country-specific results, qualitative responses or a complete replication package.

## Source and attribution

Çiler Hatipoğlu, Elżbieta Gajek, Nihada Delibegović Džanić and Lina Milosevska (2022). *Comparative analysis of students’ views of online learning in the first and second Covid-19 semesters: examples from Türkiye, Poland, Republic of North Macedonia, and Bosnia and Herzegovina.* In *Intelligent CALL, granular systems and learner data: short papers from EUROCALL 2022*, pp. 154–161. Research-publishing.net. [Publication DOI](https://doi.org/10.14705/rpnet.2022.61.1451).

[UIST source record](https://repository.uist.edu.mk/items/f3dfc719-25c6-498f-909f-1d746ac2833c) · [Public source PDF](https://repository.uist.edu.mk/bitstreams/a7204655-13be-4f28-9803-8f7711764d12/download).

The study's authors are the source-data creators. The chapter and Crossref identify Lina Milosevska's affiliation as UIST. This compilation was prepared with AI assistance for the UIST repository project. The responsible human compiler/depositor and authorised submitting account must be recorded before repository release. The original authors have not approved or endorsed this compilation in this investigation.

## Methods and scope

The source reports an English-language web questionnaire used among university students studying English in Türkiye, Poland, North Macedonia and Bosnia and Herzegovina. Questions included checkboxes, Likert scales and open-ended questions. This chapter presents combined-country descriptive comparisons.

| Period code | Reported collection window | Total period participants |
|---|---|---:|
| FP | May–June 2020 | 216 |
| SP | December 2020–January 2021 | 214 |

Collection windows come from printed p. 155 (PDF p. 2); sample sizes and combined-country scope from printed p. 156 (PDF p. 3). Exact dates are not reported. Do not interpret the windows as exact start/end dates or the total sample sizes as known question-specific denominators.

The compiler transcribed the numerical percentages in sections 3.3 and 3.5, paraphrased indicator labels, arranged one indicator-period observation per CSV row, and added source locators. Values were compared with both extracted PDF text and rendered source pages. No values were calculated from graph heights, imputed, rounded anew or converted to respondent counts.

## Interpretation and limitations

- `reported_percent` uses percentage points on a 0–100 scale: `65.3` means 65.3%, not 0.653.
- `period_participants_n` is the total sample for that period. Item-specific valid-response denominators and missing-response treatment are not established by the inspected chapter.
- Multiple difficulty indicators can overlap; their percentages must not be summed as mutually exclusive categories.
- Advanced and intermediate computer-literacy percentages do not exhaust all responses. Do not invent a remaining category.
- The personal-organisation and institutional-organisation indicators are different. Their SP values are 39.7 and 39.2 respectively.
- The inspected material does not establish matched respondents across periods, representative sampling, standard errors or participant-level access. Do not use these aggregates alone for paired tests, causal claims or reconstructing individuals.
- No participant identifiers or open-text responses are included. This is not a comprehensive privacy, legal or ethics clearance of the original study.

## Files and software

- `online_learning_published_aggregates_v1.csv`: UTF-8, comma-delimited, header row, CRLF line endings, 22 data rows, 12 columns.
- `DATA_DICTIONARY.md`: column definitions and allowable codes.
- `LICENSE.md`: attribution, reuse basis and scope.
- `SHA256SUMS.txt`: checksums of the data and documentation for this local release.

Any CSV-capable application can read the data; no special software is required. Preserve decimal points and UTF-8 text. No executable files are included.

## Access, licence and version

The proposed access condition is open download, without registration or embargo. This local package is **not yet a public UIST deposit**; anonymous production access must be tested after normal acceptance.

The source chapter is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), as recorded by the live item and publisher-deposited Crossref metadata. Chapter p. 154 says CC BY; the appended book colophon has different whole-volume terms and explicitly permits different article licences. See `LICENSE.md` for attribution and change disclosure.

Version 1.0 is this local compilation. No dataset DOI or Handle has been assigned. The publication DOI identifies the source chapter, not this dataset. A later corrected data release must state its changes and retain appropriate version links.

Suggested provisional citation: *Published aggregate survey results on students' online learning, 2020–2021: data extracted from Hatipoğlu et al. (2022)*, compilation version 1.0 (2026). Add the accepted compiler name and assigned dataset landing URL when deposited; cite the source chapter alongside it.
