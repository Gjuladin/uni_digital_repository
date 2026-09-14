# EDEN registry submission record

This file tracks the approval-gated re3data and FAIRsharing registrations for the UIST Digital Repository. It must never be used to invent policy, certification, identifier, or licensing claims.

The work is separated by category in [eden/README.md](eden/README.md). In particular, institutional approvals and the Handle-prefix decision are tracked in [eden/UIST_DECISIONS.md](eden/UIST_DECISIONS.md), policy drafting in [eden/POLICIES_AND_GOVERNANCE.md](eden/POLICIES_AND_GOVERNANCE.md), and external registry actions in [eden/REGISTRIES.md](eden/REGISTRIES.md).

## Verified repository identity

- Name: UIST Digital Repository
- Institution: University of Information Science and Technology "St. Paul the Apostle"
- Repository URL: https://repository.uist.edu.mk/
- Institution URL: https://uist.edu.mk/
- Country: North Macedonia (`MK`)
- Primary language: English (`en`)
- Software: DSpace 10
- Public contact currently configured in DSpace: `contact@uist.edu.mk` — requires explicit approval before registry submission

## Verified interfaces

- DSpace REST API: `/server/api`
- OAI-PMH: `/server/oai/request`
- OpenSearch description: `/server/opensearch/service`
- Atom and RSS feeds: `/server/opensearch/search`
- Sitemap: `/sitemap_index.xml`
- Signposting: `/signposting/links/{uuid}` and `/signposting/linksets/{uuid}`
- FAIRiCat catalog: `/.well-known/api-catalog`
- Repository JSON-LD: `/.well-known/repository.jsonld`

## Approval blockers

- Confirm the production contact address that may be published by registries.
- Supply approved deposit, access, preservation, curation, privacy, and takedown policy URLs.
- Confirm whether a repository-wide licence exists; item licences remain item-specific by default.
- Confirm an existing UIST-owned Handle prefix or obtain a new registered prefix, then approve the suffix and legacy-identifier migration strategy. The DSpace example prefix `123456789` must not be claimed as UIST PID support.
- Confirm DOI registration and resolution before claiming DOI minting support.
- Supply evidence for any repository certification claim.
- Confirm authoritative research-area/subject classifications.

## re3data draft record

| Field | Draft value | Status |
| --- | --- | --- |
| Repository name | UIST Digital Repository | Verified |
| Repository URL | `https://repository.uist.edu.mk/` | Verified |
| Institution | University of Information Science and Technology "St. Paul the Apostle" | Verified |
| Institution country | North Macedonia (`MK`) | Verified |
| Repository language | English (`en`) | Verified |
| Repository software | DSpace 10 | Verified locally; confirm deployed version before submission |
| Content types | Publications, theses, conference papers, and research outputs | Verified at repository level; refine from approved submission forms |
| API | DSpace REST API | Verified |
| OAI-PMH | `https://repository.uist.edu.mk/server/oai/request` | Verify `Identify` immediately before submission |
| OpenSearch | `https://repository.uist.edu.mk/server/opensearch/service` | Verified live |
| PID systems | Unknown | Blocked on Handle-prefix and DOI audit |
| Repository contact | Unknown | `contact@uist.edu.mk` is configured but not approved for registry publication |
| Subjects | Unknown | Awaiting approved research-area classification |
| Policies | Unknown | No approved policy URLs supplied |
| Repository licence | Unknown | Do not infer from item-level licences |
| Certifications | Unknown | No evidence supplied |

## FAIRsharing draft record

| Field | Draft value | Status |
| --- | --- | --- |
| Resource name | UIST Digital Repository | Verified |
| Resource type | Repository | Verified |
| Homepage | `https://repository.uist.edu.mk/` | Verified |
| Organization | University of Information Science and Technology "St. Paul the Apostle" | Verified |
| Country | North Macedonia (`MK`) | Verified |
| Description | Open access scholarly works, publications, theses, conference papers, and research outputs from UIST "St. Paul the Apostle" in Ohrid. | Verified repository copy |
| Interfaces | REST, OAI-PMH, OpenSearch, Atom, RSS, sitemap, Signposting, FAIRiCat | Technical implementation complete; re-probe production before submission |
| Metadata formats | Dublin Core and DataCite XML; schema.org JSON-LD | Verify enabled OAI crosswalk list before submission |
| Contact | Unknown | Awaiting approval |
| Subject tags | Unknown | Awaiting approved vocabulary terms |
| Persistent identifiers | Unknown | Awaiting Handle/DOI audit |
| Policies/licence/certification | Unknown | Awaiting approved evidence |

These are complete drafts in the sense that every required evidence category is represented; unresolved values are deliberately recorded as `Unknown`. They are not submission-ready until the approval blockers are cleared.

## Submission gate

Prepare both records from the verified values above, present the exact payloads for user approval, then use user-provided registry accounts to submit them. Completion requires the public records to resolve through the EDEN harvester; preparing this file alone does not change either registry's “No record” result.
