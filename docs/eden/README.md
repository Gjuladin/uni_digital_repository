# EDEN compatibility work index

This directory separates EDEN work by technical area, owner, and approval boundary. It is the index for remaining work; the detailed harvester behavior and metadata mapping remain in the existing reference documents one directory above.

## Current position

- The [6 October Luna swarm review](METADATA_QUALITY_SWARM_2026-10-06.md) compares all 165 live public records across REST/OAI, documents EDEN's score limitations, and adds local export/escaping fixes plus a repeatable curation audit. These code changes are not deployed; raw evidence and the item-level backlog are under [evidence/2026-10-06-swarm](evidence/2026-10-06-swarm/).
- On 2026-09-14, the unchanged baseline harvester at `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380` reported all eight technical discovery mechanisms as `Found` for both local `/` and `/home` targets. The normalized results and separate raw responses are under [evidence/2026-09-14](evidence/2026-09-14/). An independent Luna run reproduced the result with no baseline regressions under [evidence/2026-09-14-independent-luna](evidence/2026-09-14-independent-luna/), and the [final Terra audit](evidence/2026-09-14-final-terra/final-audit.md) found no actionable product defect.
- The linked primary repository entity is `DataCatalog`, all eight synthetic item types map correctly, and restricted-item non-disclosure is covered by the backend integration suite.
- On 2026-10-02, live `/` and `/home` passed all eight technical discovery checks after the production configuration update. Discovery completeness does not guarantee metadata quality. The subsequent quality fixes are local and still require deployment; see [METADATA_QUALITY_ADMIN_HANDOFF.md](METADATA_QUALITY_ADMIN_HANDOFF.md).
- re3data and FAIRsharing were deliberately disabled during the deterministic local mechanism run. No registry record was evidenced by that historical run. Current status: FAIRsharing 9313 exists under review; rector acceptance of the policy pack is recorded. Registry submission/update, editorial publication and propagation remain separate work; see [REGISTRIES.md](REGISTRIES.md).
- On 2026-10-01, the user supplied UIST prefix `20.500.15029` (reference `HNRT-185049`). The production Handle service is live with this prefix, matching the local backend declaration and `https://hdl.handle.net/`. On 2026-10-06, `20.500.15029/261` resolved globally to the correct public item; see [HANDLE_ACTIVATION.md](HANDLE_ACTIVATION.md) and its dated evidence. Complete legacy-migration/redirect coverage and operational resilience remain separate checks. Historical `123456789/*` values are example-prefix identifiers, not the current verified UIST namespace.

## Categories

The [current DABAR-based policy pack](rector_review_2026-10/dabar_simple_2026-10-06/README.md) was accepted by the rector, as reported by the user on 6 October 2026, and supplies the four implemented footer pages. The [dataset backlog](dataset_preparation/README.md) retains validated packages, the complete inventory and unsent requests. The original six Word drafts remain historical background; superseded generated packets and raw research clutter were removed. FAIRsharing record [9313](https://fairsharing.org/9313) now exists and is awaiting curator review with hidden detail fields; update that record rather than creating a duplicate. Development and the Handle.net process are already approved according to the user's current instructions. The full policy suite and Handle activation are not separate re3data admission prerequisites.

| File | Category | Primary owner |
| --- | --- | --- |
| [FRONTEND_DISCOVERY.md](FRONTEND_DISCOVERY.md) | Repository landing-page metadata and service discovery | Development team |
| [BACKEND_ITEM_METADATA.md](BACKEND_ITEM_METADATA.md) | DSpace item JSON-LD, Signposting, types, and visibility | Development team |
| [HARVESTER_UPSTREAM.md](HARVESTER_UPSTREAM.md) | Confirmed EDEN harvester limitations and possible upstream fixes | Development team and EDEN maintainers |
| [UIST_DECISIONS.md](UIST_DECISIONS.md) | Institutional facts, approvals, PID choices, contacts, and ownership | UIST |
| [POLICIES_AND_GOVERNANCE.md](POLICIES_AND_GOVERNANCE.md) | Policies that UIST must define and approve | UIST |
| [REGISTRIES.md](REGISTRIES.md) | re3data and FAIRsharing accounts, submissions, and publication | UIST with development support |
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Hosting, deployment, DNS/proxy, reindexing, and rollback | UIST hosting administrator with development support |
| [METADATA_QUALITY_ADMIN_HANDOFF.md](METADATA_QUALITY_ADMIN_HANDOFF.md) | Quality fixes, feed/OpenSearch settings, OAI datestamps and sample identifier | Development team and hosting administrator |
| [METADATA_QUALITY_FIXES.md](METADATA_QUALITY_FIXES.md) | Implemented quality fixes, targeted verification and local runtime | Development team |
| [VALIDATION_AND_RELEASE.md](VALIDATION_AND_RELEASE.md) | Local, post-deployment, and EDEN acceptance checks | Development team |

## Status language

- **Implemented locally**: code and tests exist in the local repositories but production deployment is still required.
- **Needs verification**: no policy decision is needed, but the deployed environment or representative production data must be checked.
- **UIST decision required**: publishing the value or taking the action requires institutional authority.
- **External publication required**: completion depends on re3data, FAIRsharing, Handle.Net, or another external service.

## Supporting references

- [../EDEN_HARVESTER_NOTES.md](../EDEN_HARVESTER_NOTES.md)
- [../EDEN_METADATA_MAPPING.md](../EDEN_METADATA_MAPPING.md)
- [../EDEN_REGISTRY_SUBMISSION.md](../EDEN_REGISTRY_SUBMISSION.md)

## Technical metadata implementation

[Technical implementation and validation — 2026-10-06](TECHNICAL_METADATA_IMPLEMENTATION_2026-10-06.md) records the completed local OAI and structured metadata changes, and compatibility with the unchanged EDEN harvester, with deployment steps and the remaining publication-editing boundary.
