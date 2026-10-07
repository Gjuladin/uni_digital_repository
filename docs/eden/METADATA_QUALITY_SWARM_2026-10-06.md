# Metadata quality review — 6 October 2026

A Luna swarm reviewed frontend exports, backend exports, and the EDEN harvester
independently, with a final review of the changes. Findings below distinguish the
live service from code added to the already dirty working trees. No production
records, policies, deployment, or harvester code were changed.

## Live findings

The anonymous REST census contains **165 unique public items**. Discovery returns
181 objects including communities/collections; the audit counts only items.
The complete OAI census also contains 165 records, across two pages.

| Finding | Affected items | Meaning/action |
| --- | ---: | --- |
| No rights/licence statement in the supported source fields | 116 | Obtain evidence for the deposited version; absence does not establish its legal status. |
| No subjects | 109 | Add evidenced keywords to improve discovery. |
| No abstract or description | 46 | Obtain a summary from the work/author; repository copy is not an item description. |
| STM publisher sharing-policy links in rights metadata | 20 | Verify conditional permissions and applicability; URL presence does not establish unrestricted reuse. |
| Textual licence with no licence URI | 7 | Preserve the existing text; verify the version before adding a URL. |
| No explicit access-rights statement | 165 | Access and reuse are separate. Do not infer that all records are closed or open. |
| Malformed issued dates | 2 | Source values `2021/06/30` and `2023/12/15`; export normalizes this unambiguous calendar form, but source curation remains. |
| Non-code language label | 1 | `English` in `dc.language.iso`; exporters can emit `en` without changing stored metadata. |
| Literal entity-looking text in REST | 7 | Review eight values against the source, field by field. |

These are overlapping curation findings, not a score or a list of mandatory
protocol fields. Rights statements are present on 49 items, including textual
`dc.rights.license` values. The previous audit missed that field and incorrectly
reported 123 missing rights statements; the corrected count is 116.

All 165 records have titles, creators, resource types, issued dates, language
values, and identifier values. This establishes presence, not their substantive
accuracy. Types are 120 Articles, 29 Book chapters, 8 Books, 5 Conference papers,
2 Conference abstracts and 1 Technical Report. Missing publisher/source/format
and relationship metadata are also recorded in the independent OAI report.

The current source uses `20.500.15029` Handle URLs. Historical documentation of
`123456789` placeholders is not the current census. This review does not claim
that every Handle or DOI resolves or that UIST mints publisher DOIs. Two sampled
Handle URLs (`/93` and `/260`) returned HTTP 302 to the corresponding public
repository Handle routes; [sample evidence](evidence/2026-10-06-swarm/handle-resolution-sample.json)
records their exact responses.

## OAI defects hidden by discovery checks

1. Live Identify advertises `2026-10-06T17:40:35Z` as its earliest datestamp while
   returned identifiers include `2026-09-02` records. A harvester using that
   lower bound can miss records. The pre-existing dirty indexed-date fix must
   be deployed and the cached Identify response refreshed.
2. Identify's sample `oai:repository.uist.edu.mk:20.500.15029/1234` returns
   `idDoesNotExist`. Replace the deployed sample with a real public identifier.
3. In 30 values across 29 records, REST has ordinary `&` while OAI returns
   double-escaped XML that parses to literal `&amp;`. The backend producer calls
   `escapeXml10()` before the XOAI writer escapes the field again. The new local
   fix removes invalid XML code points without pre-escaping valid text. Existing
   literal source entities are preserved by this backend fix.
4. Simple Dublin Core flattens all qualified dates into `dc:date`. Multiple
   dates are allowed, but accession and issued dates become indistinguishable.
   Keep source lifecycle information; consider a qualified OAI format rather
   than deleting legitimate dates to make a score look better.

Raw Identify, ListIdentifiers, ListRecords, format discovery and failed sample
responses are retained in the [evidence directory](evidence/2026-10-06-swarm/).
The [independent report](evidence/2026-10-06-swarm/harvester-audit.md) describes
both pages and REST/OAI differences.

## Local code changes from this review

Frontend `HeadTagService` now preserves textual licence values and generic rights
URL fallbacks, keeps separate copyright notices, emits explicit journal/conference
citation metadata, normalizes valid slash-form issued dates, and uses only issued
dates for publication metadata. Canonical Handle paths must belong to the
configured repository origin; external publisher paths cannot impersonate a
repository canonical URL. Its text rendering handles stored entities and
keeps JSON-LD script content escaped safely. Existing full-abstract, DOI
and real owning-collection fixes are retained.

Backend `ItemJsonLdService` canonicalizes/deduplicates Handle identifiers,
preserves explicit OpenAlex and other source identifiers, limits `sameAs` to
recognized identity forms, normalizes language labels,
separates issued/created/modified dates, and retains licence text and notices.
`ItemUtils` now delegates to `Xml10TextSanitizer`, leaving the XOAI serializer
responsible for XML escaping. Focused regression tests cover serialization
round-trips including ordinary ampersands, literal entity text and Unicode.

The audit CLI recognizes licence text, distinguishes missing issued dates from
accession dates, checks calendar validity, and flags description/subject/access
gaps and literal source entities for review. It supports a saved input snapshot,
reports issue counts separately from distinct affected items, checks pagination
and duplicate UUIDs, and performs no data writes.

Policy pages and their existing pending edits are outside these changes.

## What EDEN actually establishes

The live EDEN page marks its discovery mechanisms Found. Its stateless public
demo extracts metadata blocks and advertised links; it does not evaluate these
165 records for content completeness, OAI consistency or rights semantics.
The public API returns the first metadata source, rather than a reconciled
comparison of all sources. Its deployed meta-tag publisher parser drops the
publisher name during DCAT conversion. This is an external EDEN/FIDELIS
consumer limitation; harvester changes are outside the UIST implementation.

See the [EDEN audit](evidence/2026-10-06-swarm/harvester-audit.md) for code paths,
service duplicates and provenance limits. No repository claims were invented
to fill empty EDEN fields.

## Repeatable curation check

From the frontend checkout:

```sh
node --test scripts/eden-metadata-audit.test.mjs scripts/eden-data-quality.test.mjs
node scripts/eden-data-quality.mjs \
  --rest https://repository.uist.edu.mk/server \
  --out /tmp/uist-live-quality.json \
  --markdown /tmp/uist-live-quality.md
```

Reproduce this dated snapshot without querying the server:

```sh
node scripts/eden-data-quality.mjs \
  --input docs/eden/evidence/2026-10-06-swarm/live-items.json \
  --out /tmp/uist-snapshot-quality.json \
  --markdown /tmp/uist-snapshot-quality.md
```

The [machine-readable backlog](evidence/2026-10-06-swarm/live-quality.json)
contains UUIDs, titles, source values and correction guidance.

## Release and verification

Deploy the backend and frontend together with the existing dirty date/feed
fixes. Re-export existing OAI records using the site's controlled full OAI index
refresh, then clear regenerated OAI response caches. An incremental import may
leave unchanged records with their old serialized metadata; a cache refresh
alone cannot repair stored index XML. Preserve source records, deleted-record
semantics and operational backups through that administrator procedure.

After release, verify Identify's lower bound against every returned identifier,
test the corrected sample with GetRecord, and compare parsed OAI values to REST.
Check missing abstracts, textual licences, DOI/Handle duplicates, language labels,
calendar dates and actual owning collections in both server-rendered HTML and
linked JSON-LD. Re-run EDEN discovery separately from the content-quality audit.

## Local validation

- HeadTagService: **59 focused tests passed**, including the final canonical
  origin regression; targeted Angular lint passed.
- Metadata audit: **13 Node tests passed**, covering semantic checks and CLI
  pagination/count safeguards. A fresh online run reproduced the saved census
  and every issue count: 181 discovery objects, 165 unique items, no fixtures.
- Angular SSR Domino entity decoding: three representative cases passed,
  including encoded markup and supplementary Unicode characters.
- Backend on Java 21: **5 OAI tests**, **6 JSON-LD unit tests**, and all **38
  LinksetRestControllerIT integration tests** passed. The integration run used
  isolated H2 and a test-only DOI prefix; unrelated repository-wide Checkstyle
  and licence gates were skipped. The [backend validation record](evidence/2026-10-06-swarm/backend-validation.md)
  gives exact commands and limits. This is not a claim that the complete backend
  suite or unmodified global verification gate passed.

- Final `npm run build:prod`: **browser and SSR production builds passed** after
  the canonical-origin fix. Existing bundle-budget, unused-template-import and
  unused-file warnings remain; no build errors. Log:
  `/tmp/uist-swarm-frontend-build-reviewed.log`.
- `git diff --check` passed in both repositories.

## Technical completion after the audit

The coding continuation is documented in [technical implementation and validation](TECHNICAL_METADATA_IMPLEMENTATION_2026-10-06.md). It completes the configurable real OAI sample, schema-validated qualified DIM export, full protocol auditor, and repository-side validation for compatibility with the unchanged harvester. Production has not been deployed and publication records remain unchanged.
