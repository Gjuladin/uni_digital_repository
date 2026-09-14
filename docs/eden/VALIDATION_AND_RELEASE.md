# Validation and release acceptance

## Local gates

Run these gates on the exact release commits:

1. Frontend lint, unit tests, and SSR production build.
2. Targeted backend Maven unit/integration tests for linked JSON-LD and Signposting.
3. Direct checks for REST Discovery, OAI-PMH, OpenSearch description/search, Atom, RSS, sitemap, robots aliases, repository JSON-LD, item JSON-LD, and FAIRiCat.
4. Authorization checks for missing, private, withdrawn, workspace, and non-discoverable items.
5. One representative public item for every configured submission type.
6. Deterministic EDEN regression checks for both `http://localhost:4000/` and `http://localhost:4000/home`.

The local EDEN instance must bind to localhost. `EDEN_ALLOW_PRIVATE_TARGETS=1` is permitted only for this isolated local test and must never be enabled on the public harvester.

## Harvester checkpoint rule

After every score-affecting phase, a Luna or Terra subagent runs the recorded local harvester commit against both target URLs, compares with the preceding baseline, and classifies differences as:

- product regression;
- pending registry publication;
- optional Fuseki/registry degradation; or
- confirmed harvester limitation.

Raw outputs must be retained separately from the normalized assertions.

## Completed local run (2026-09-14)

- Frontend: 45 focused discovery/metadata tests passed; focused changed-file lint passed; the final SSR production build succeeded.
- Backend: 2 item JSON-LD unit tests and all 37 Signposting integration tests passed on Java 21.
- Integration: REST, OAI-PMH, OpenSearch description, Atom, RSS, both robots aliases, generated sitemap, repository JSON-LD, FAIRiCat, item JSON-LD, legacy Signposting, RFC 9264 linksets, and proxied routes returned the expected status and media type.
- Fixtures: Article, Book, Book chapter, Dataset, Software, Technical Report, Thesis, and Other returned the expected schema.org types. Preprint and Academic work have unit coverage.
- EDEN: all eight mechanisms were `Found` for both local URLs, linked type was `DataCatalog`, and a repeated run compared to the saved baseline with no regression.
- Evidence: see [evidence/2026-09-14/local-integration.md](evidence/2026-09-14/local-integration.md), [evidence/2026-09-14/root.json](evidence/2026-09-14/root.json), [evidence/2026-09-14/home.json](evidence/2026-09-14/home.json), and the adjacent raw files. The independent Luna rerun preserved a second raw set in [evidence/2026-09-14-independent-luna](evidence/2026-09-14-independent-luna/) and found no regression against either saved result. The final Terra audit preserved a third raw set and its [classification report](evidence/2026-09-14-final-terra/final-audit.md); it also found no regression or actionable product defect.

The inherited full frontend unit/lint suites and top-level backend quality gate remain red for unrelated pre-existing failures documented in the category reports. No EDEN-touched focused test or changed-file lint gate is failing.

The local aggregate actuator status is `DOWN` solely because the SEO component cannot reach the browser-facing localhost UI from the backend container (and would reject localhost robots URLs). Database, Solr, and SSL components are `UP`; GeoIP is `UP_WITH_ISSUES` because its optional local database is absent. OpenSearch description and Atom/RSS responses independently pass. See the health diagnosis in the integration evidence; no health indicator was suppressed.

## Production acceptance

After deployment, verify all of the following:

- Embedded JSON-LD: `Found`.
- Embedded meta tags: `Found`.
- Linked JSON-LD: `Found`.
- FAIRiCat/API catalog: `Found`.
- Atom/RSS: `Found`.
- Sitemap from `/` and `/home`: `Found`.
- OpenSearch: `Found`, with no reference to `/server/opensearch/search/service`.
- SearchAction: `Found`.
- The primary repository record is a `DataCatalog`, not `CollegeOrUniversity` or `dcmitype:Text`.
- Repository name, URL, publisher, country, description, language, subjects, and enabled services contain only approved values.
- Item mappings cover all supported types and do not expose restricted records.
- re3data and FAIRsharing return the public UIST records instead of `No record`.
- Any claimed Handle resolves globally through `hdl.handle.net`; local `/handle/...` routing alone is insufficient.
- Any claimed DOI support matches the actual UIST minting or recording workflow.

The technical deployment may be released before external registry publication if UIST accepts that the two registry panels remain pending. Full EDEN roadmap acceptance requires both public registry records.
