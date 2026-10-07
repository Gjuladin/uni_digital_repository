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
| Repository identity | Emits the stable repository URL/identifier, configured languages, configured subjects, and enabled verified services. The accepted Contact/Privacy pages now supply country/address details; optional machine-readable claims still depend on their configured enable switches and verified public evidence. |
| Linked repository metadata | Serves `/.well-known/repository.jsonld` as `application/ld+json` and advertises it with `rel="describedby"`. |
| FAIRiCat | Serves `/.well-known/api-catalog` as RFC 9264 linkset JSON and advertises it with `rel="api-catalog"`. |
| Verified service catalog | Lists REST, OAI-PMH, OpenSearch, Atom, RSS, sitemap, and Signposting; disabled IIIF, LDN, and SWORD services are not claimed. |
| Sitemap compatibility | Keeps `/robots.txt` and adds `/home/robots.txt` so the tested harvester discovers the sitemap from either submitted URL. |
| SearchAction | Keeps the repository search template in embedded schema.org JSON-LD. |
| Governance gating | Contact, licences, policies, registry identifiers, publisher country/address, and similar optional claims are emitted only when enabled and non-empty. Empty claims are omitted. |
| URL safety | Browser-facing UI/REST URLs reject credentials, query/fragment injection, insecure non-local origins, single-label/internal hosts, private networks, special-use ranges, and IPv4-mapped private addresses. Localhost HTTP remains available only for local QA. |
| Container reproducibility | `.angular` is excluded from the Docker context, and `docker/Dockerfile.prebuilt` packages a host-verified SSR build when Docker does not have enough memory to compile Angular. |

## Local verification (2026-09-14)

- 45 focused metadata/discovery tests passed in Chrome Headless.
- The final SSR production build completed successfully.
- Focused lint for every changed Angular/config file passed.
- The full inherited frontend suite reached 2,288 passing tests and eight failures in unrelated language-switch, notification-board, CMS-edit, and submission-form tests.
- Full inherited lint remains red (33 errors and 1,515 warnings) in unrelated account-management/template code; changed Angular/config files are clean. `server.ts` also retains pre-existing lint debt outside the EDEN handlers.

## Remaining production verification

1. Verify the rendered source, response media types, and discovery links through the production reverse proxy after deployment.
2. Confirm that both `/` and `/home` produce the same repository `DataCatalog` and service set in production.
3. Re-run EDEN against both public URLs and preserve the raw reports.

The rector has accepted the policy pack, including its contacts, languages and CC0 metadata rule. Machine-readable claims still require correct configuration and publicly verified destinations. Research-area vocabulary and registry identifiers must reflect the actual service and registry status; see [UIST_DECISIONS.md](UIST_DECISIONS.md).
