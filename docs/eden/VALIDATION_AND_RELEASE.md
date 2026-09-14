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
