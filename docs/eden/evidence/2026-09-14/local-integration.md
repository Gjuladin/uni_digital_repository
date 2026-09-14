# Local EDEN integration evidence — 2026-09-14

This report records checks against the isolated `dspace10test` Compose project. The UI was served at `http://localhost:4000` and REST at `http://localhost:8080/server`. Localhost identifiers and the synthetic `123456789/*` Handles below are test fixtures, not UIST production PID claims.

## Repository services

| Check | Result |
| --- | --- |
| REST Discovery root | HTTP 200, `application/hal+json` |
| OAI-PMH `Identify` | HTTP 200, `text/xml`, protocol 2.0 |
| OAI-PMH `ListMetadataFormats` | HTTP 200; `oai_dc` enabled in this local configuration |
| OpenSearch description | HTTP 200, `application/opensearchdescription+xml` |
| OpenSearch Atom search | HTTP 200, `application/atom+xml` |
| OpenSearch RSS search | HTTP 200, `application/rss+xml` |
| `/robots.txt` | HTTP 200, `text/plain`, sitemap advertised |
| `/home/robots.txt` | HTTP 200, `text/plain`, sitemap advertised |
| `/sitemap_index.xml` | HTTP 200, `application/xml`, after running DSpace `generate-sitemaps` |
| `/.well-known/repository.jsonld` | HTTP 200, `application/ld+json`; first graph entity is `DataCatalog` |
| `/.well-known/api-catalog` | HTTP 200, `application/linkset+json`; only enabled REST, OAI-PMH, OpenSearch, Atom, RSS, sitemap, and Signposting services |
| SSR `/` and `/home` | HTTP 200; each contains one repository `DataCatalog`, exact EDEN meta fields, SearchAction, separate Atom/RSS links, linked JSON-LD, and FAIRiCat links |
| Invalid OpenSearch URL | `/server/opensearch/search/service` absent from both local SSR responses |
| Optional institutional claims | address, country code, repository licence, policy, contact, subjects, and registry IDs omitted because they are not approved/enabled |

The raw landing pages, EDEN reports, API response, linked JSON-LD, FAIRiCat response, robots aliases, OpenSearch description, sitemap, and response headers/statuses are retained in this directory with `root.*` and `home.*` prefixes.

## Item JSON-LD fixtures

Every endpoint returned HTTP 200 with `application/ld+json`; the all-zero missing UUID returned 404 through both REST and the UI proxy.

| Synthetic fixture | UUID | schema.org type |
| --- | --- | --- |
| Article | `655ccbfb-49b4-4193-8fef-cc5ac2314891` | `ScholarlyArticle` |
| Technical Report | `65c33953-a470-45d0-8610-ef3740bbab3e` | `Report` |
| Dataset | `757bf83c-0774-4569-8b79-5e9aa142ef60` | `Dataset` |
| Software | `c04e0523-5153-4727-b5cd-6c1a18366e7e` | `SoftwareSourceCode` |
| Thesis | `c0a56d5e-e666-4d99-b17d-c4178d7d4c76` | `Thesis` |
| Other | `ed40439e-877f-4b89-93d7-296e9a957dd1` | `CreativeWork` |
| Book | `eff71d3d-7e78-4fb9-8155-e6172e0bcf25` | `Book` |
| Book chapter | `9c83cb00-ff3e-49f8-87c6-0a8f0d3c6ea5` | `Chapter` |

The RFC 9264 JSON linkset returned HTTP 200 with `application/linkset+json`, serialized `anchor` first, and retained both DataCite XML and schema.org JSON-LD `describedby` relations. The legacy JSON link-list and `application/linkset` endpoints also remained available through REST and the UI proxy. The 37-test backend integration suite separately proves non-disclosure for private, withdrawn, workspace, unarchived, non-discoverable, and missing items.

## Health diagnosis

`/server/actuator/health` returned HTTP 200 with aggregate `DOWN`. Database, all four Solr cores, and SSL were `UP`; GeoIP was `UP_WITH_ISSUES` because the optional local GeoIP database is not configured. Only SEO was `DOWN`.

The SEO indicator runs inside the backend container while `dspace.ui.url` deliberately remains the browser-facing `http://localhost:4000`. In that network namespace, `localhost:4000` is not the UI container, so its sitemap, robots, and SSR probes are inaccessible. If reachable, the same indicator intentionally rejects localhost URLs in robots. This is a local topology/origin warning, not an OpenSearch failure: the OpenSearch description and both live feed queries independently returned HTTP 200 with the correct media types. The indicator was not disabled or suppressed.

## EDEN baseline result

The unchanged harvester checkout at `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380`, bound only to `127.0.0.1` with private targets enabled for local QA, reported all eight mechanisms `Found` for both target URLs. Linked repository JSON-LD was `DataCatalog`. Registry and Fuseki integrations were disabled for this deterministic local mechanism run; they are not counted as product passes.
