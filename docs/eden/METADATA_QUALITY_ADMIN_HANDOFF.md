# Metadata quality: administrator handoff

Also include the [6 October swarm changes](METADATA_QUALITY_SWARM_2026-10-06.md) when preparing the release. The OAI escaping repair requires existing records to be re-exported into the OAI index before response-cache refresh; deploying code and clearing only the response cache leaves old indexed XML unchanged.

## Scope and deployment

These changes are local, not deployed. Deploy the rebuilt backend (including
`dspace-api` and `dspace-oai`) and then the rebuilt frontend through the normal
approved release process. Existing configuration mounts may override packaged
defaults. Preserve database, assetstore, credentials and current configuration;
do not recreate volumes or change existing Handle identifiers.

Code fixes include full item abstracts in embedded JSON-LD, omission of missing
item descriptions, deduplicated DOI identifiers, real owning-collection URLs and
names, aligned language/access-right/type mapping, a readable sitewide feed
description, and OAI earliest dates derived from indexed record datestamps.

## Backend settings to review in deployed local.cfg

```properties
# Keep the existing public HTTPS origins:
dspace.ui.url = https://repository.uist.edu.mk
dspace.server.url = https://repository.uist.edu.mk/server

# Human-readable feed metadata; no new governance claims:
webui.feed.description = Recent submissions to UIST Digital Repository
websvc.opensearch.shortname = UIST Repository
websvc.opensearch.longname = UIST Digital Repository
websvc.opensearch.description = Search publications and research outputs in UIST Digital Repository

# Optional structured Dublin Core feed fields, using existing source metadata:
webui.feed.item.dc.creator = dc.contributor.author
webui.feed.item.dc.date = dc.date.issued
webui.feed.item.dc.description = dc.description.abstract
```

Replace or remove the old external HTTP DSpace favicon using
`websvc.opensearch.faviconurl` (an explicitly empty value omits the image;
deleting only a local override can restore the packaged HTTP default).
Use an existing verified public HTTPS repository
icon of the dimensions required by the OpenSearch generator; do not guess an
asset path. Choose `websvc.opensearch.samplequery` from a term that demonstrably
returns public results. Check configured feed cache validity and clear/expire
only the relevant cache after deployment if the old description remains.

## OAI-PMH correctness

- `Identify` must advertise an earliestDatestamp no later than any returned
  `ListIdentifiers`/`ListRecords` datestamp. The code now queries the OAI Solr
  index instead of `dc.date.available`. It fails rather than inventing a current
  date when Solr is unavailable. Confirm the deployed `oai.solr.url`, core health
  and normal incremental indexing job. Run the standard site's OAI import/reindex
  procedure only if needed; no destructive index reset is requested.
- Refresh the OAI response cache after deploying this fix or changing the OAI
  description. A backend restart alone does **not** invalidate cached Identify
  responses. The standard installed command is `bin/dspace oai clean-cache`;
  this purges regenerated OAI responses/item caches, not repository records or
  the OAI index. Use the site's deployment user and backup procedure. Locally,
  moving just the stale Identify response aside made the corrected date visible.
- The deployed `config/crosswalks/oai/description.xml` currently uses the generic
  `${handle.prefix}/1234` sample. Replace its sampleIdentifier with an actual
  **public identifier returned by this site's ListIdentifiers**, and verify
  GetRecord succeeds for it. A newly configured Handle prefix does not rewrite
  historical item handles. Do not copy a different repository's prefix or mint
  a fabricated example. The local code does not change this deployment-specific
  sample or migrate existing records.

## Frontend and proxy

Retain the harvesting configuration that already gives 8/8 live discovery.
Keep public base URLs HTTPS and SSR-only origins private. Preserve routing and
content types for both well-known endpoints, robots aliases, sitemap and
Signposting. Confirm full abstracts and owning-collection names in the *server
rendered* item HTML, not only browser DOM. JSON-LD may temporarily omit a
collection until its real relation resolves; it must never substitute a journal.

## Post-deployment checks

1. Run EDEN on `/` and `/home`: expect all eight technical mechanisms Found.
2. Check one item with a long abstract, one without an abstract, and one with a
   DOI: compare embedded JSON-LD to linked JSON-LD and REST source metadata.
3. Compare a linked collection URL/name against the actual owning collection.
4. Fetch Atom and RSS: no `general-feed.description` literal should remain.
5. Check OAI Identify earliestDatestamp against ListIdentifiers; test the sample
   identifier with GetRecord. Check logs for OAI Solr errors.

## Not administrator-only software fixes

Missing authors, subjects, dates or abstracts on existing records require a
repository content steward to supply accurate values. Stored literal HTML
entities require a reviewed source-data cleanup, not blind decoding across all
crosswalks. Contact details, policies, licences, certifications, re3data and
FAIRsharing still require the separate UIST decisions. Handle prefix
`20.500.15029` is live and matches the local declaration; sample `/261` resolved
globally on 2026-10-06. See [current Handle status](HANDLE_ACTIVATION.md).
Complete migration/redirect coverage and continuity checks remain separate
administrator responsibilities.
Search-result robots exclusions, optional sitemap lastmod and differing
repository graph scope are not automatically defects; do not change them just
to inflate a metadata rating.
