# Publication-linked dataset preparation — 5 October 2026

**Verified public / Verified local.** The refreshed 4 October public census contains **165 publications**. REST Discovery and OAI ListRecords each returned two pages and exactly the same 165 Handles; all item bundle/bitstream pagination was followed with zero listing errors. All 165 publications have current outcome reports. **89 substantive investigations are complete; 76 remain incomplete** because the intended source or publication identity cannot yet be established. A disposition or attached-file inspection is not automatically a completed intended-publication review.

Files: [complete queue](inventory/publication_index.md), [JSON inventory](inventory/publications.json), [exact incomplete list](inventory/incomplete_publications.md), [counts](inventory/preparation_summary.json), [unsent requests](requests/README.md). **111 request drafts; none sent.** Source-study authors and the accountable compiler/depositor are distinct. The responsible authorised depositor, source authority and normal deposit acceptance remain unconfirmed.

| Outcome | Records |
|---|---:|
| Source file absent, inaccessible or preview-only |59|
| Researcher data/provenance request needed |43|
| No suitable research-data release found within inspected scope |41|
| Source/metadata association conflict |4|
| Rights/access/authority review needed |11|
| Prepared local package, depositor confirmation and deposit needed |3|
| Verified related external data/artefact link |4|
| **Total** |**165**|

The content-completion flag is separate from these outcomes: some request cases lack the intended publication, and association conflicts remain unresolved. Local packages are not public holdings. Public dataset deposits by this work: **0**. Ready-for-authorised-deposit packages: **0**.

## Validated genuine local packages

| Publication | Actual package content | Source reuse basis / remaining limits |
|---|---|---|
| [188](https://repository.uist.edu.mk/items/f3dfc719-25c6-498f-909f-1d746ac2833c) |[22 published learning percentages](packages/f3dfc719-25c6-498f-909f-1d746ac2833c/v1.0/preview.html), README, dictionary, rights, checksums, metadata, comparison, evidence/checklist and ZIP. Existing data bytes preserved. |Article CC BY, live CC BY 4.0; article/whole-volume distinction checked. Combined-country partial extraction;216/214 are period totals, not item denominators. |
| [244](https://repository.uist.edu.mk/items/0de15561-ad68-4141-aa70-7268c6fcbe10) |[166 selected crowdsourcing table cells](packages/0de15561-ad68-4141-aa70-7268c6fcbe10/v1.0/preview.html), including explicit category labels, source locators and documentation/metadata/evidence/checklist/ZIP. |Source **CC BY-SA 4.0**. Share-alike condition retained. Source RNM prose/table inconsistency preserved, malformed TUR percentage typography documented, blank cells omitted, table3 mentions are not unique respondents. |
| [231](https://repository.uist.edu.mk/items/6c5118cb-7261-455c-929d-4ddbd6912728) |[Six country regression rows /42 numeric values](packages/6c5118cb-7261-455c-929d-4ddbd6912728/v1.0/preview.html), Table1 transcription and full documentation/metadata/evidence/checklist/ZIP. |Source CC BY-NC 4.0. Raw World Bank/UNCTAD observations and R code absent; coefficient units unspecified in Table1; source numerical inconsistencies not repaired. |

**Verified local:** all three pass file/manifest SHA-256, nonempty CSV/schema and exact archive-membership/byte checks. The coordinator checked every extracted value against source pages, including visual table/period labels. New package previews were visually inspected and their local links checked. [Structural validation](research/package-structure-validation.json) is separate from source-cell checks saved in each package's evidence folder. This validates transcription/fixity, not scientific correctness, comprehensive rights/privacy clearance or institutional acceptance.

All three remain `prepared_needs_deposit`. No original respondent records, missing categories, counts or denominators were inferred; no publication was relabelled as a dataset. The two new packages' interrupted drafts were corrected locally; earlier work and superseded findings remain in research history and inventory history. Researcher-supplied documented data remain preferred.

## Material holds and corrections

**Verified public / Verified local:** four association holds; item 188 remains valid.  **89** attaches the separate hydrogen-fuel paper, **217** attaches the topology paper, **203** combines a UIST gender-analysis PDF with Paschou et al.'s authors/DOI, and **216** assigns a 2021 chapter DOI to a 2025 monograph. The intended source/identifier associations require correction before dataset use. Details: [association corrections](research/coordinator-association-corrections.json), [Crossref conflict evidence](research/conflicting-identifier-evidence.json).

**Verified local:**223 and224 attach a61-page book preview. Contents/bibliography mentions do not supply the target chapter bodies; earlier full-volume/source-completion claims were corrected. They are explicitly incomplete. Stored author spelling/title variants, DOI absence in source text and translated titles are recorded separately by [file association screening](research/file-association-screening.json); literal text matching alone is not author or DOI verification.

**Verified public:**14 REST/OAI residual entity-escape differences and two alternative-title mappings were recorded; no production change was made. Additional publisher attempts found three accessible full PDFs for150,98 and69; these were inspected. Other HTTP200 responses did not contain accessible PDF bytes. [Availability evidence](research/external-probe-summary.json) and [followed source attempts](research/advertised-source-retrieval.json) retain the limits.

External-data cases remain external. The author-linked RAG repository has fact corpora and experimental JSON files; a representative experiment file was inspected, but GitHub advertises no reuse licence. ARTICONF/Zenodo and GA4/public-source relationships are leads with record-specific inspection limits, not UIST-hosted datasets or permission to redistribute. Requests seek immutable source versions, actual files/documentation and authority.

## Release and 9–10 October target

Updated 6 October 2026 to the [simplified deposit model](../rector_review_2026-10/dabar_simple_2026-10-06/README.md): authorised institutional depositors publish directly. The administrator manages accounts/permissions and technical support; no mandatory administrator approval or assigned reviewer is required. Identify the responsible human compiler/depositor and confirm source authority, collection scope, metadata/documentation, normal DSpace deposit terms and item-specific rights/access. These package matters remain unresolved; appointment of the administrator does not clear them. Track them in [release decisions](release_decisions.json) and each package checklist.

After separate release authorisation, deposit an accepted package as its own described record linked to the publication and verify the real landing page, anonymous files and enabled exports. Continue the existing approved Handle.net workstream; no DOI project was added.

For approximately **9–10 October 2026**, use truthful public research-data service/operator/access/terms evidence for re3data and maintain existing [FAIRsharing 9313](https://fairsharing.org/9313). No registry submission or update was made here. The entire backlog need not finish before an evidenced truthful application. [Shortest next actions](RELEASE_ACTIONS.md).

## Work boundaries

Both repositories' initial Git changes were preserved; this work writes preparation files under this folder. Production use was anonymous/read-only. No deposits, policy/record/permission edits, deployment, identifier migration, registration submission, researcher contact or local database activity occurred. Three independent GPT-5.6 Luna/high batches were used; workers hit the account limit. The coordinator preserved their files, finished deferred accessible-source checks, audited/corrected source associations and completed local package validation. The76 unresolved intended-source investigations remain explicitly listed for continuation rather than being counted complete.
