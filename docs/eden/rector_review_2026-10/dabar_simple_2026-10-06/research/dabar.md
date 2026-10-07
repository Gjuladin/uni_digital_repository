# DABAR comparator review for UIST EDEN

> Comparator research retained from policy preparation. UIST use/adaptation suggestions below are historical; the [accepted pack](../README.md) governs current UIST wording and responsibilities (rector acceptance reported 6 October 2026).

**Checked:** 6 October 2026 (Europe/Skopje)  
**Scope:** DABAR’s four footer pages and the official re3data record. DABAR is a Croatian platform operated by the University of Zagreb University Computing Centre (Srce); its platform rules and Croatian legal references are evidence of one service model, not rules for UIST.

## Official sources and verified facts

| Source | Verified points useful for the review |
|---|---|
| [DABAR repository policies](https://dabar.srce.hr/en/repository-policies) | Metadata is CC0 except email addresses and OIB/JMBG/JMBAG; OAI-PMH harvesting is allowed. Digital-object reuse follows the deposited object’s licence. Full-text indexing is allowed, but serving full text/parts requires the licence. Deposits are by accredited organisation members or delegates; items are institution-created; administrators verify eligibility, scope, format and spam. Embargoes are honoured. Items are retained indefinitely as a policy target, with migration where possible, original bitstreams retained, backups, version/change records and withdrawal tombstones. Principal languages are Croatian and English. |
| [DABAR accessibility statement](https://dabar.srce.hr/en/accessibility) | The statement applies to DABAR and all repositories in the system. Srce’s platform accessibility is distinguished from the accessibility of digital-object files, for which the repository-owning institutions are responsible. It reports self-assessment and a June 2026 review. The page is served at `/en` but its current body text is Croatian. |
| [DABAR privacy notice](https://dabar.srce.hr/en/privacy-notice) | The repository owner is the University of Zagreb University Computing Centre; Srce supplies the technical prerequisites and acts as processor under a personal-data processing agreement. Logged-out access and user-login access are both supported. IP address and login time are collected for usage/security purposes; the notice states 24-month retention. Login profile data and “Request a copy” data have separate listed fields and 36-month retention periods. Contacts: `dabar@srce.hr` and DPO `zop@srce.hr`. |
| [DABAR contact](https://dabar.srce.hr/en/contact) | Current repository contact is `dabar@srce.hr`. |
| [DABAR re3data record](https://www.re3data.org/repository/r3d100013510) | DABAR is described as a national, multidisciplinary institutional-repository system/data-layer service for higher-education and science institutions. Record editing status: 21 November 2025. Research-data languages: English and Croatian. Content type: dataset. Repository size shown at review: 325,971 records; 185 repositories. Institution: University of Zagreb University Computing Centre (Srce), non-profit, general and technical responsibility. |
| [re3data Terms tab](https://www.re3data.org/repository/r3d100013510#tab_terms) | Policies: “Upute za autore,” “Dabar System Regulations,” and “Repository policies.” Database access is open. Data access is open or restricted. Data licences are CC0, CC and Copyrights. Upload is restricted by institutional membership. |
| [re3data Standards tab](https://www.re3data.org/repository/r3d100013510#tab_standards) | Persistent identifier: URN. Repository software: Fedora. Enhanced publication: yes. API: OAI-PMH at `https://dabar.srce.hr/oai?verb=Identify`. Metadata standards: DataCite Metadata Schema, Dublin Core, MODS and repository-developed schemas. |

The DABAR policy page has a sentence saying the repository holds “the following types of content,” but no content list is rendered in the current page text. Therefore the only verified re3data content-type classification is **dataset**; do not infer a fuller item-type list from the blank sentence.

## Field summary for a simplified UIST policy

| Area | DABAR evidence | UIST adaptation recommendation |
|---|---|---|
| Governance and responsibility | Srce operates the shared platform; repository-owning institutions remain responsible for their objects. | State clearly that rectorate-appointed repository manager **Pavel Taskov** is UIST’s accountable manager. Separate UIST institutional decisions from any platform/hosting duties. Do not copy DABAR’s Croatian system regulations or governance structure. |
| Deposit eligibility | Accredited organisation members or delegated agents; material created through the institution; institutional-membership restriction in re3data. | Require UIST authors/staff or an authorised delegate to deposit UIST-related publications. Record depositor authority and institutional affiliation. |
| Publication and content | DABAR records version/date, peer-review and publication status; embargo is allowed until publisher/funder period ends. | Keep these fields, using a small status vocabulary (draft, accepted, published, version, embargoed). Apply UIST publisher/funder restrictions after rights review. |
| Languages | Croatian and English on both the policy page and re3data record. | Set principal publication languages to **Macedonian and English**. Allow other language metadata only when useful, but require a Macedonian or English title/abstract where UIST decides this is needed for discovery. |
| Metadata licence | CC0, except email and listed personal identifiers; OAI-PMH harvesting allowed. | Adopt **CC0 for repository metadata**, with a narrow personal-data exception and no publication of unnecessary personal identifiers. Publish a clear OAI-PMH/API statement only for interfaces UIST actually operates. |
| Object/data licence | Reuse follows each deposited object’s licence; re3data records open and restricted access plus CC0, CC and Copyrights. | Require a dataset/publication-level rights and licence field. Distinguish open, embargoed, restricted and metadata-only access. Do not imply that CC0 metadata makes uploaded files CC0. |
| Access and request workflow | Login and no-login access coexist; data can be open or restricted. “Request a copy” is a supported workflow. | Make public full-text access the default for eligible UIST publications, with documented embargo/restriction reasons. If request access is implemented, name Pavel Taskov or a delegated UIST role as decision point and record the decision. |
| Preservation | Indefinite retention stated; readability and migration are best-efforts; original bitstream retained; backups; withdrawal leaves identifier/URL and tombstone; closure transfers content to another archive. | Use an achievable UIST retention target and continuity plan. State original-file retention, backups, fixity/version records, format migration and export/closure procedure. Remove “external partners” from the DABAR wording because UIST has no external partners authorized for this policy. Avoid promising perpetual preservation unless rectorate has approved the resources and commitment. |
| Metadata/technical interoperability | URN, Fedora, OAI-PMH, DataCite/Dublin Core/MODS/repository-developed schemas; enhanced publication yes. | Select only the schemas and identifier service UIST will maintain. Keep metadata crosswalks and a public endpoint in the technical plan; do not claim Fedora, URN or OAI-PMH until deployed and tested. |
| Accessibility | Srce covers the platform; institutions owning files cover object accessibility. | Assign UIST responsibility for deposited files and metadata, including accessible PDFs and alternatives where applicable. Keep the platform accessibility statement separate from author/depositor file obligations. |
| Privacy | DABAR distinguishes repository owner/controller and Srce/processor; publishes IP/login and retention details; also handles account and copy-request data. | Use UIST’s supplied privacy policy as the governing privacy reference. Add only repository-specific processing, fields, retention, public metadata handling and contact routing that UIST has approved. Do not import Croatian authority, regulator or statutory wording. |
| Support | DABAR gives one current contact address on its Contact page and a separate privacy DPO contact. | Publish a UIST repository support address and a privacy contact/route. Keep operational support, rights/takedown requests and privacy requests visibly distinct. |

## Practical drafting points

The most reusable DABAR pattern is the separation of layers: platform policy, institution-owned repository policy, object-level licence/access, and privacy notice. UIST should use the same separation so that the EDEN policy does not accidentally make a hosting or repository manager responsible for an author’s copyright, privacy or file accessibility decisions without a stated process.

For a short policy pack, the DABAR model supports five compact sections:

1. **Metadata:** CC0, required fields, Macedonian/English language rule, version/publication status, identifier and harvesting statement.
2. **Deposit and review:** authorised UIST depositor, UIST relevance, rights/licence declaration, file/format checks, embargo and administrator decision.
3. **Access and reuse:** open default where rights permit; embargoed/restricted/metadata-only alternatives; object-level licence controls reuse.
4. **Preservation and withdrawal:** retention target, original-file and backup practice, migration/fixity/version history, documented withdrawal grounds and tombstone/identifier handling.
5. **Accessibility and privacy:** file accessibility duties, platform boundary, UIST privacy notice link, repository support and privacy contacts.

### Adaptation boundaries

The following are DABAR-specific facts and should not be copied as UIST commitments without a separate rectorate decision: Croatian statutory references and Croatian supervisory bodies; Srce’s controller/processor allocation; Fedora, URN and the specific OAI-PMH endpoint; “indefinite” retention; DABAR’s external-partner preservation clause; Croatian language defaults; and DABAR’s institutional-membership model. They can be cited as comparator evidence only.

The re3data entry is a registry description, not a contract or proof that every advertised capability is live for UIST. Its “dataset” classification is broad and does not replace UIST’s own accepted-content list. The official DABAR policy is the stronger source for deposit, metadata, access, preservation and withdrawal wording; the re3data record is the stronger source for registry fields, standards, identifiers and access/licence categories.

