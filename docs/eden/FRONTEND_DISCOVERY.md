# Frontend and repository discovery fixes

These changes are controlled by the development team and do not require UIST to write policies or create registry accounts. Production deployment still requires the hosting actions in [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md).

## Implemented locally

| Fix | Result |
| --- | --- |
| Correct OpenSearch discovery | Advertises `/server/opensearch/service` with `rel="search"` and `application/opensearchdescription+xml`; the invalid `/server/opensearch/search/service` relation is removed. |
| Separate feed discovery | Atom and RSS remain distinct `rel="alternate"` links with their correct media types. |
| Link lifecycle | Generated discovery links are deduplicated and removed correctly during navigation and component destruction. |
| Repository JSON-LD | A `DataCatalog` is the primary graph node, with the university represented separately as its publisher/provider. |
| EDEN meta tags | Emits exact repository `title`, `description`, `publisher`, `language`, and `type` meta names. |
| Repository identity | Emits the stable repository URL/identifier, `MK`, configured languages, configured subjects, and enabled verified services. |
| Linked repository metadata | Serves `/.well-known/repository.jsonld` as `application/ld+json` and advertises it with `rel="describedby"`. |
| FAIRiCat | Serves `/.well-known/api-catalog` as RFC 9264 linkset JSON and advertises it with `rel="api-catalog"`. |
| Verified service catalog | Lists REST, OAI-PMH, OpenSearch, Atom, RSS, sitemap, and Signposting; disabled IIIF, LDN, and SWORD services are not claimed. |
| Sitemap compatibility | Keeps `/robots.txt` and adds `/home/robots.txt` so the tested harvester discovers the sitemap from either submitted URL. |
| SearchAction | Keeps the repository search template in embedded schema.org JSON-LD. |
| Governance gating | Contact, licences, policies, registry identifiers, and similar optional claims are emitted only when enabled and non-empty. |

## Remaining work without a new UIST policy decision

1. Run the full frontend lint, unit-test, and SSR production-build gates on the release commit.
2. Verify the rendered source, response media types, and discovery links through the production reverse proxy after deployment.
3. Confirm that both `/` and `/home` produce the same repository `DataCatalog` and service set in production.
4. Re-run EDEN against both public URLs and preserve the raw reports.

Values such as an approved contact, research-area vocabulary, policy URLs, or a registry identifier are not frontend defects. They remain disabled until the corresponding UIST decision is recorded.
