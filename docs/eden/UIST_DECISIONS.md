# Decisions and information required from UIST

This is the institutional decision register. These items cannot be finalized solely by changing application code. Candidate facts must not be published as approved registry or policy claims until UIST confirms them.

## Priority decisions

| ID | UIST decision or information | Why it is needed | Current position |
| --- | --- | --- | --- |
| UIST-01 | Confirm the official public repository name | Keeps the website, JSON-LD, OAI-PMH, re3data, and FAIRsharing consistent. | Candidate: **UIST Digital Repository**. |
| UIST-02 | Approve the repository description | Required for public structured metadata and registries. | A working description exists but requires institutional approval. |
| UIST-03 | Approve the institution's public legal and postal address | Needed for publisher/organisation metadata and registry records where requested. | Candidate from the UIST website: Partizanska bb, 6000 Ohrid, North Macedonia; verify spelling and preferred postal form. |
| UIST-04 | Nominate a public repository contact | Registries need an accountable maintained contact, preferably a role mailbox. | `contact@uist.edu.mk` and `+389 46 511 000` are public university contacts, not yet approved as repository contacts. |
| UIST-05 | Approve repository research areas and vocabulary | Required for accurate discovery and registry subject classification. | Candidate areas from the assessment: Computer Science, Information Science, Engineering, and Technologies. |
| UIST-06 | Confirm repository and content languages | Distinguishes the English interface from item languages such as Macedonian. | Candidate repository language: English; item languages remain record-specific. |
| UIST-07 | Approve supported content/submission types | Ensures forms, stored `dc.type`, schema.org output, and registry content types agree. | Current mapping covers Dataset, Article, Book, Chapter, Report, Software, Thesis, and fallback work. |
| UIST-08 | Decide and approve repository policies | Required for deposit, access, preservation, curation, privacy, takedown, and registry claims. | Tracked in [POLICIES_AND_GOVERNANCE.md](POLICIES_AND_GOVERNANCE.md). |
| UIST-09 | Decide whether a repository-wide licence exists | An item licence must not be misrepresented as a site-wide licence. | Unknown; item-level licences remain authoritative. |
| UIST-10 | Identify any certification, seal, or formal standard | re3data must not contain unsupported certification claims. | None currently evidenced. |
| UIST-11 | Name the institutional owners of re3data and FAIRsharing accounts | Registry accounts should remain controlled by UIST, not by an individual developer. | Accounts and authorized submitters are not yet supplied. |
| UIST-12 | Authorize and schedule the production deployment | Local implementation cannot affect the public EDEN result until it is deployed. | Hosting access and release window are pending. |

## Handle prefix decision

The live-looking local identifier `123456789/261` uses:

- prefix: `123456789`
- suffix: `261`

`123456789` is the common DSpace example/default namespace and is not evidence that UIST owns a production Handle service. The local URL `/handle/123456789/261` can work while the global URL `https://hdl.handle.net/123456789/261` does not resolve. UIST must not claim Handle PID support in EDEN, re3data, or FAIRsharing on that basis.

UIST must decide one of the following:

1. **Use an existing UIST prefix:** provide the registered prefix, Handle service owner, administrator contact, credentials/site bundle custody, and proof that UIST is authorized to mint under it.
2. **Obtain a new prefix:** authorize registration through Handle.Net or an approved service provider. New prefixes normally use the form `20.500.xxxxx`.
3. **Do not offer Handles yet:** retain local item URLs but describe them as local identifiers, not globally registered PIDs.

Before enabling a real prefix, UIST must also approve:

- the suffix strategy for new items;
- whether existing `123456789/*` records are migrated, aliased, or left as legacy local routes;
- redirects so existing citations and bookmarks continue to work;
- who operates, monitors, renews, and backs up the Handle service;
- whether collections and communities receive Handles in addition to items;
- how withdrawals, replacements, and URL changes are represented.

Examples of real prefixes used elsewhere include legacy prefixes such as MIT `1721.1`, WHO `10665`, World Bank `10986`, NTU `10356`, and University of Pretoria `2263`, and newer prefixes such as OAPEN `20.500.12657`.

A directly relevant North Macedonian example is Ss. Cyril and Methodius University in Skopje (UKIM), which uses the registered prefix `20.500.12188`. Its community Handle [`20.500.12188/1`](https://hdl.handle.net/20.500.12188/1) resolves globally to the UKIM repository. This shows the expected behavior UIST should achieve, but the UKIM prefix belongs to UKIM and must not be reused by UIST.

## DOI decision

UIST must state whether it:

- registers and mints DOIs through a DataCite/Crossref membership or consortium;
- only records DOIs assigned by external publishers; or
- does not currently support DOI workflows.

Recording a publisher's DOI is not the same as UIST providing DOI minting. Registry claims must use the narrower verified statement.

## Required sign-off record

For every approved value, record the approver, decision date, exact public wording/value, source or policy URL, and the systems in which it may be published. Unknown values remain absent rather than inferred.
