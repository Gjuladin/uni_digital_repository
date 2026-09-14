# Final independent Terra audit — 2026-09-14

No actionable EDEN product defect was found on frontend commit `30451db64e7225d756ab955a5937af667d31bcb6` and backend commit `beb54cd326ca567e467dd2926c66bb9fd46ce77c`.

- The unchanged baseline harvester at `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380` reported all eight technical mechanisms `Found` for both `http://localhost:4000/` and `http://localhost:4000/home`, with no regression against the committed primary results.
- Linked repository JSON-LD has `DataCatalog` first and a separate `CollegeOrUniversity` publisher/provider. Only the seven enabled service entries are present.
- The correct OpenSearch description URL is present and `/server/opensearch/search/service` is absent.
- Public item JSON-LD and proxied Signposting return the expected media types; missing items return 404. Code and integration coverage protect workspace, withdrawn, restricted, unarchived, and non-discoverable items.
- URL safety, SSR JSON-LD escaping, disabled optional claims, absence of EDEN credentials, and backwards-compatible DataCite-plus-JSON-LD relations passed review.
- The focused frontend metadata/discovery test set passed 45/45 during the independent audit.

## Classification

- Product regression: none.
- Pending external registry publication: re3data returned `No record` for both local URLs.
- Optional Fuseki/registry degradation: Fuseki was intentionally disabled; FAIRsharing was not consulted because credentials were not configured. Neither affected the eight technical checks.
- Confirmed harvester limitation: no new limitation; the documented URL-only link deduplication and anchor-order behavior remain accommodated by the product compatibility layer.
- Local health: aggregate `DOWN` is isolated to the SEO component's inability to reach the UI container through the browser-facing `localhost:4000` origin. Database, Solr, and SSL are `UP`, and direct OpenSearch, Atom, and RSS checks return HTTP 200. Production proxy/origin health remains a deployment verification requirement.

The final independent agent could not rerun Maven because its shell exposed Java 17 while the backend requires Java 21. The root run used Java 21 and recorded 2 passing unit tests plus all 37 passing integration tests.
