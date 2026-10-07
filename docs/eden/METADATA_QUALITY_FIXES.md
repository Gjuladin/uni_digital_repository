# Metadata quality fixes — 2026-10-02

This is the historical 2 October checkpoint. The [6 October swarm review](METADATA_QUALITY_SWARM_2026-10-06.md) adds OAI XML serialization, identifier, licence, language, citation and publication-date improvements, with a fresh 165-record census and current validation results.

## Implemented locally

- Embedded item JSON-LD keeps full abstracts; preview tags remain short.
- Items without descriptions no longer borrow repository descriptions.
- Normalized DOI identifiers and sameAs links are deduplicated.
- Owning collections use their real resolved name and public collection URL,
  never a journal/conference name from dc.relation.ispartof. Failed/unresolved
  relations are omitted. Navigation cancels obsolete collection requests.
- Language, access-right and preprint/academic-work type mappings align with
  linked item JSON-LD.
- Atom/RSS sitewide descriptions use webui.feed.description, with a readable
  fallback, rather than an unresolved translation key.
- OAI Identify uses indexed item.lastmodified datestamps, not dc.date.available.
  Index failures are not silently converted to a misleading current date.

## Verified in this checkpoint

- HeadTagService: 45/45 focused tests passed, including full/missing abstracts,
  DOI deduplication, resolved collections and obsolete navigation responses.
- Changed frontend files: ESLint passed.
- Frontend production browser + SSR build: passed (existing bundle-budget and
  unused-file warnings remain).
- Backend OAI: 3/3 focused tests passed, including unavailable-index behavior.
- Backend feed description: 1/1 focused test passed.
- Backend executable JAR packaging: passed.
- Luna's final local EDEN reports: all eight technical mechanisms Found on both
  `/` and `/home` at port 4001, using the localhost-only QA private-target opt-in.
- Running local backend: corrected feed descriptions observed; after moving the
  stale Identify response cache aside, earliestDatestamp was
  2026-08-24T22:15:28Z, matching the oldest indexed record at second granularity.

These are targeted tests, not a claim that either entire repository suite passed.
The unchanged EDEN harvester is independently rerun by Luna; raw evidence and
its report are in [evidence/2026-10-02-quality-fixes](evidence/2026-10-02-quality-fixes/).

## Local runtime and rollback

The updated host SSR frontend runs on http://localhost:4001 against the local
backend on http://localhost:8080/server. Docker's pre-existing frontend remains
on port 4000. The backend is the local dspace10test container with the rebuilt
executable JAR copied in for verification; this is not a published Docker image.
Recreating that container from its old image will discard this executable
override. Build/deploy a new image through the normal release workflow.

The previous executable is recoverable at
`/dspace/webapps/server-boot.jar.pre-quality-20261002` inside that local container.
Only the old cached Identify response was moved to
`/dspace/var/oai/identify-response.pre-quality-20261002`. No repository records,
assetstore files or Solr indexes were removed or rewritten.

## Remaining boundaries

Production has not been changed. Administrator configuration, OAI sample
identifier and cache-refresh instructions are in
[METADATA_QUALITY_ADMIN_HANDOFF.md](METADATA_QUALITY_ADMIN_HANDOFF.md).
Missing source-record content, literal stored HTML entities, institutional
contacts/policies/licences and registry publication still need the appropriate
owner. Handle prefix `20.500.15029` is live and matches the local declaration;
sample `/261` resolved globally on 2026-10-06. See
[current Handle status](HANDLE_ACTIVATION.md). Complete migration/redirect
coverage and continuity checks remain separate administrator responsibilities.
Optional graph parity, search robots exclusions and
sitemap lastmod are not treated as defects without a demonstrated requirement.
