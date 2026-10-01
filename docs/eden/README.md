# EDEN compatibility work index

This directory separates EDEN work by technical area, owner, and approval boundary. It is the index for remaining work; the detailed harvester behavior and metadata mapping remain in the existing reference documents one directory above.

## Current position

- On 2026-09-14, the unchanged baseline harvester at `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380` reported all eight technical discovery mechanisms as `Found` for both local `/` and `/home` targets. The normalized results and separate raw responses are under [evidence/2026-09-14](evidence/2026-09-14/). An independent Luna run reproduced the result with no baseline regressions under [evidence/2026-09-14-independent-luna](evidence/2026-09-14-independent-luna/), and the [final Terra audit](evidence/2026-09-14-final-terra/final-audit.md) found no actionable product defect.
- The linked primary repository entity is `DataCatalog`, all eight synthetic item types map correctly, and restricted-item non-disclosure is covered by the backend integration suite.
- Frontend and backend changes are implemented and tested locally but are not deployed to the production UIST service. Read-only public checks still show the previous discovery behavior.
- re3data and FAIRsharing were deliberately disabled during the deterministic local mechanism run. No public UIST record has been evidenced; account creation, approved claims, submission, publication, and propagation remain external authorization-dependent work.
- On 2026-10-01, the user supplied UIST prefix `20.500.15029` (reference `HNRT-185049`). Its registry record is present, and the backend source now uses this prefix and `https://hdl.handle.net/`. Server activation, existing-record migration, and end-to-end resolution remain pending; see [HANDLE_ACTIVATION.md](HANDLE_ACTIVATION.md). Existing `123456789/*` identifiers remain example-prefix identifiers until migrated.

## Categories

| File | Category | Primary owner |
| --- | --- | --- |
| [FRONTEND_DISCOVERY.md](FRONTEND_DISCOVERY.md) | Repository landing-page metadata and service discovery | Development team |
| [BACKEND_ITEM_METADATA.md](BACKEND_ITEM_METADATA.md) | DSpace item JSON-LD, Signposting, types, and visibility | Development team |
| [HARVESTER_UPSTREAM.md](HARVESTER_UPSTREAM.md) | Confirmed EDEN harvester limitations and possible upstream fixes | Development team and EDEN maintainers |
| [UIST_DECISIONS.md](UIST_DECISIONS.md) | Institutional facts, approvals, PID choices, contacts, and ownership | UIST |
| [POLICIES_AND_GOVERNANCE.md](POLICIES_AND_GOVERNANCE.md) | Policies that UIST must define and approve | UIST |
| [REGISTRIES.md](REGISTRIES.md) | re3data and FAIRsharing accounts, submissions, and publication | UIST with development support |
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Hosting, deployment, DNS/proxy, reindexing, and rollback | UIST hosting administrator with development support |
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
