# EDEN compatibility work index

This directory separates EDEN work by technical area, owner, and approval boundary. It is the index for remaining work; the detailed harvester behavior and metadata mapping remain in the existing reference documents one directory above.

## Current position

- The latest local root and `/home` harvests report all eight technical discovery mechanisms as `Found`.
- Frontend and backend changes are implemented locally but are not yet proven on the production UIST deployment.
- re3data and FAIRsharing still report `No record`; this requires UIST-owned accounts, approved claims, registry submission, publication, and registry propagation.
- The current `123456789` DSpace Handle prefix must not be claimed as UIST PID support. UIST must confirm an existing registered prefix or obtain a new one.

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
