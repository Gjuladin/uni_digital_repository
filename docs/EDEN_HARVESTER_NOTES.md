# EDEN harvester compatibility notes

The categorized implementation, institutional, policy, registry, deployment, and validation work lists are indexed in [eden/README.md](eden/README.md).

The reference harvester is checked out read-only at `/Users/samil/wp2-repo-harvester`. The compatibility baseline was tested against commit `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380` in an isolated `.venv`. Product regression artifacts are produced by `scripts/eden-regression.mjs`; the harvester checkout itself remains unchanged.

## Discovery behavior at the tested commit

The landing-page report checks embedded JSON-LD, exact HTML meta names, linked JSON-LD, `rel="api-catalog"`, Atom/RSS links, sitemap discovery through `robots.txt`, an OpenSearch description link, and schema.org `SearchAction`. The repository target should be `/`; `/home/robots.txt` is also served because this harvester resolves `robots.txt` relative to `/home` when `/home` is submitted.

The HTML link collector deduplicates links by URL rather than by the complete `(URL, rel, type)` tuple. Therefore the FAIRiCat OpenSearch `service-meta` URL includes the harmless query parameter `?source=fairicat`, while the canonical HTML `rel="search"` link remains `/server/opensearch/service`. This prevents the service-catalog link from replacing the OpenSearch discovery relation.

The tested Signposting JSON parser reads each JSON object in property order and assumes `anchor` has already been encountered. JSON object order is not significant under RFC 8259 or RFC 9264, but an `anchor` serialized after relation properties causes an `UnboundLocalError`. DSpace therefore declares deterministic `anchor`-first serialization for its otherwise unchanged RFC 9264 linkset representation.

## Metadata behavior

Repository JSON-LD must place the repository `DataCatalog` first in the graph. The university is a separate `CollegeOrUniversity` node referenced as publisher/provider. Item JSON-LD prefers detailed `dc.type` and falls back to broad `dspace.entity.type`; see `EDEN_METADATA_MAPPING.md` for the shared mapping contract.

The harvester combines records from embedded metadata, linked metadata, and registries. A mechanism marked `Not found` means the corresponding discovery/extraction step ran but found nothing. A registry panel marked `No record` cannot be fixed by HTML alone: re3data and FAIRsharing must publish a matching public record before that status can become `Found`.

## Actuator health is separate from OpenSearch

The live and local `/server/actuator/health` endpoint may return aggregate `DOWN` even while OpenSearch is operating normally. OpenSearch must be checked directly through `/server/opensearch/service` and an Atom/RSS search request.

In the local Compose stack, DSpace's built-in `SEOHealthIndicator` runs inside the backend container while `dspace.ui.url` is the deliberately browser-facing `http://localhost:4000`. The container therefore cannot reach the UI at that loopback address; if it could, the indicator would intentionally reject localhost URLs in `robots.txt`. This explains the SEO-only `DOWN` result without suppressing it. Database, Solr, and SSL are `UP`; direct OpenSearch description and Atom/RSS queries succeed. In production, verify the public UI URL and forwarded host/protocol headers so generated robots and sitemap URLs use the public HTTPS origin.

## Local regression operation

Local-only harvesting requires `EDEN_ALLOW_PRIVATE_TARGETS=1` and binding the harvester to `127.0.0.1`; never expose that mode publicly. Fuseki can be left disabled for deterministic mechanism checks. Registry queries may be disabled or limited during local iteration, but the final post-deployment run must enable both registries.

For each score-affecting checkpoint, run the checker against both `http://localhost:4000/` and `http://localhost:4000/home`, preserve its raw HTML/API/linked-document artifacts, and compare the summarized mechanism statuses with the preceding checkpoint.

## Recorded local result (2026-09-14)

The unchanged baseline checkout reported `Found` for embedded JSON-LD, exact meta tags, linked JSON-LD, FAIRiCat, Atom/RSS, sitemap, OpenSearch, and SearchAction for both local target URLs. The linked repository resource type was `DataCatalog`. Normalized results and raw artifacts are stored under [eden/evidence/2026-09-14](eden/evidence/2026-09-14/); a repeat run using `--baseline` reported no regressions. An independent Luna run preserved a separate raw set under [eden/evidence/2026-09-14-independent-luna](eden/evidence/2026-09-14-independent-luna/) and reproduced both passes with no baseline regressions.

re3data, FAIRsharing, and Fuseki were disabled for this deterministic local mechanism run. That is optional registry/Fuseki degradation, not a product regression and not evidence of a registry record. At the time of that local run, registry publication was pending. Update 6 October 2026: the rector has accepted the four-page policy pack and FAIRsharing record 9313 exists under review. Public policy verification, final submission authorisation, curator outcomes and external propagation remain separate checks; use [the registry handoff](eden/REGISTRIES.md).
