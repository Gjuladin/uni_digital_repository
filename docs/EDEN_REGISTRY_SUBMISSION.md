# EDEN registry submission record

This file tracks the approval-gated re3data and FAIRsharing registrations for the UIST Digital Repository. It must never be used to invent policy, certification, identifier, or licensing claims.

The work is separated by category in [eden/README.md](eden/README.md). In particular, institutional approvals and the Handle-prefix decision are tracked in [eden/UIST_DECISIONS.md](eden/UIST_DECISIONS.md), policy drafting in [eden/POLICIES_AND_GOVERNANCE.md](eden/POLICIES_AND_GOVERNANCE.md), and external registry actions in [eden/REGISTRIES.md](eden/REGISTRIES.md).

## Publicly observed technical identity (not publication approval)

- The public repository URL is `https://repository.uist.edu.mk/` and the public institution URL is `https://uist.edu.mk/`.
- The current UI displays the candidate names “UIST Digital Repository” and “University of Information Science and Technology St. Paul the Apostle”. UIST must approve the official registry wording.
- The REST API identifies the deployed software as DSpace. Reconfirm the exact deployed version before submission.
- Country/address, contact, official language, description, subjects/content classifications, policies, licences, certifications, and PID capabilities are not approved for external publication by this document.

## Interface status observed on 2026-09-14

- Public and responding: DSpace REST API (`/server/api`), OAI-PMH Identify (`/server/oai/request`), OpenSearch description (`/server/opensearch/service`), Atom/RSS searches (`/server/opensearch/search`), and sitemap (`/sitemap_index.xml`).
- Implemented and verified only in the local stack: linked item JSON-LD, repository JSON-LD (`/.well-known/repository.jsonld`), FAIRiCat (`/.well-known/api-catalog`), and `/home/robots.txt`.
- The public well-known documents and `/home/robots.txt` currently return 404. The public landing HTML still advertises the invalid `/server/opensearch/search/service` URL. These are deployment blockers, not registry-ready facts.

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
| Repository name | Candidate: UIST Digital Repository | UIST approval required |
| Repository URL | `https://repository.uist.edu.mk/` | Publicly observed; approve for registry publication |
| Institution | Candidate wording from current UI | UIST approval required |
| Institution country/address | Unknown for publication purposes | UIST approval required |
| Repository language | Unknown for registry publication purposes | UIST approval required |
| Repository software | DSpace; exact production version to recheck | Publicly observed technical fact; verify before submission |
| Content types | Unknown | Awaiting approved submission vocabulary/classification |
| API | DSpace REST API | Publicly responding; recheck after deployment |
| OAI-PMH | `https://repository.uist.edu.mk/server/oai/request` | Publicly responding; recheck enabled formats before submission |
| OpenSearch | `https://repository.uist.edu.mk/server/opensearch/service` | Publicly responding, but current landing-page discovery is wrong until deployment |
| PID systems | Unknown | Blocked on Handle-prefix and DOI audit |
| Repository contact | Unknown | `contact@uist.edu.mk` is configured but not approved for registry publication |
| Subjects | Unknown | Awaiting approved research-area classification |
| Policies | Unknown | No approved policy URLs supplied |
| Repository licence | Unknown | Do not infer from item-level licences |
| Certifications | Unknown | No evidence supplied |

## FAIRsharing draft record

| Field | Draft value | Status |
| --- | --- | --- |
| Resource name | Candidate: UIST Digital Repository | UIST approval required |
| Resource type | Candidate: Repository | UIST approval and FAIRsharing classification required |
| Homepage | `https://repository.uist.edu.mk/` | Publicly observed; approve for registry publication |
| Organization | Candidate wording from current UI | UIST approval required |
| Country/address | Unknown for publication purposes | UIST approval required |
| Description | Unknown | Awaiting approved institutional wording; do not reuse inferred content classifications |
| Interfaces | REST, OAI-PMH, OpenSearch, Atom, RSS, sitemap; local Signposting/FAIRiCat implementation | Deploy and re-probe before submission |
| Metadata formats | Dublin Core and DataCite XML; schema.org JSON-LD | Verify enabled OAI crosswalk list before submission |
| Contact | Unknown | Awaiting approval |
| Subject tags | Unknown | Awaiting approved vocabulary terms |
| Persistent identifiers | Unknown | Awaiting Handle/DOI audit |
| Policies/licence/certification | Unknown | Awaiting approved evidence |

These are evidence checklists, not complete registry drafts. Unresolved values are deliberately recorded as `Unknown`; no record is submission-ready until the approval and deployment blockers are cleared.

## Submission gate

Prepare both records from the verified values above, present the exact payloads for user approval, then use user-provided registry accounts to submit them. Completion requires the public records to resolve through the EDEN harvester; preparing this file alone does not change either registry's “No record” result.
