# SWISSUbase policy review for EDEN

> Dated comparative research for the earlier drafting stage. The [current four-page pack](../dabar_simple_2026-10-06/README.md) was accepted by the rector, as reported on 6 October 2026. Earlier UIST approval recommendations below are historical; comparator rules remain source observations and do not impose new UIST requirements.

**Review date:** 3 October 2026 (Europe/Skopje)

This is a primary-source review for drafting University UIST EDEN rules. SWISSUbase documents are comparative models. Their Swiss law, consortium structure, institutional ownership provisions and contractual terms do not automatically bind EDEN or users in North Macedonia.

## What is binding, what is guidance, and what is technical evidence

The Terms of Use, Deposit Contract, Download Contract and any dataset-specific annex or licence are the principal contract-facing documents. The Platform Privacy Notice describes processing and user rights but expressly functions as a notice rather than a contract. The Digital Preservation, Backup, Data Versioning and DSU policies are operational or service policies; they are strong evidence of intended controls and decisions, but they should not be rewritten as absolute guarantees. User guides, release notes, infrastructure and security pages explain operation and technology. The EDEN policy should state which parts are enforceable conditions, which are service commitments, and which are internal procedures.

## Deposit authority, rights and depositor warranties

The Standard Deposit Contract requires a depositor to identify the depositor, institution, project, dataset and principal investigator and to have authority to sign for the relevant institution, project, collaboration or third party. Each DSU can set eligibility, accepted formats and additional requirements. The depositor confirms that collection and processing were lawful, that the depositor has authority to publish/archive under the selected conditions, that personal or sensitive information has been anonymised or has a valid legal basis/consent, and that uploads contain no malware. SWISSUbase may conduct spot checks, ask for evidence and refuse publication or archiving.

Uploading does not assign copyright. Rights stay with the depositor or the relevant third party, while the contract grants SWISSUbase and its partners operational rights to describe, catalogue, document, publish metadata, expose metadata to CLARIN/CESSDA, store, translate, copy and migrate files within the infrastructure for preservation, access, usability and confidentiality. The depositor selects a licence or download contract and remains responsible for third-party rights and unlawful use. These are good EDEN clauses, but EDEN should substitute its own institutional authority, copyright and applicable-law wording.

Recommended EDEN drafting:

* require an authorised depositor and, where applicable, an institutional or project data steward;
* require a rights and permission declaration covering data, documentation, code, images, instruments and third-party material;
* grant EDEN only the non-exclusive operational rights needed for ingest, validation, metadata publication, preservation copies, format migration, access delivery, identifier landing pages and ordinary metrics;
* preserve depositor/third-party ownership and make the selected data licence visible at dataset level;
* allow EDEN to request evidence and refuse, delay, restrict or quarantine material when authority, privacy, security, format or documentation is inadequate.

Avoid adopting the Swiss contract’s jurisdiction, indemnity and liability language without review under North Macedonian law and UIST’s institutional authority.

## Review, curation and publication workflow

SWISSUbase presents a Submitted → In Review workflow. A DSU first reviews project metadata, then the project and dataset title, structure, citation and access rules, files, README/codebook and preservation formats. A Joint Review is used before publication. The SIP is the depositor’s submission, the AIP is curated/preserved, and the DIP is delivered to users. An embargo can leave metadata visible while disabling download. DOIs are issued after publication.

The curation guide says curators may enrich metadata and document changes but do not change data or documentation without depositor consent. The Deposit Contract permits metadata modification without consent where needed for findability, reuse or preservation and permits controlled operational transformations. Versioning classifies changes as major, minor or cosmetic. Major changes create a new AIP/DIP and a new DOI; minor changes create a new version without a new DOI; cosmetic corrections are recorded without a new version.

EDEN should publish a review checklist and decision record. At minimum it should cover authority, personal/sensitive data, rights/licence, required metadata, citation, file integrity, virus screening, documentation, access tier, embargo, persistent identifier, version relation and withdrawal/retention status. It should define what the reviewer can fix, what needs depositor consent and how a refusal or request for remediation is recorded.

## Personal and sensitive data

The Platform Privacy Notice separates platform-account and operational processing from personal data inside research uploads. For the latter, the Data Depositor or affiliated organisation is generally controller and SWISSUbase is processor. The Deposit Contract identifies authors, researchers, participants and interview partners as possible data-subject categories, requires processing only within scope/instructions, includes subprocessors and an objection process, and requires assistance with data-subject rights. The depositor remains responsible for data-subject rights.

The deposit contract’s practical baseline is no personal or sensitive data unless properly anonymised or supported by a valid legal basis/consent. DSU policies add risk-based restrictions: DaSCH says personal/sensitive data are prohibited unless effectively anonymised and requires informed consent; UniNE permits sensitive material only with anonymisation or controlled access/direct author approval; FORS uses de-identification and case-by-case controls, including for raw audio/video. These rules are not identical across DSUs.

EDEN should require a data-protection assessment at deposit and distinguish:

* no personal data reasonably expected;
* anonymised/pseudonymised data with documented residual-risk review;
* restricted data where a named access authority, purpose and agreement are needed;
* material that must not be deposited until consent, legal basis, ethics approval or a transfer arrangement is resolved.

The policy should identify UIST’s controller/processor roles by activity, define approved processors and incident notice, and route data-subject requests to the responsible controller. It should not copy “Swissubase is processor” as a universal conclusion for EDEN datasets without a UIST legal/privacy determination.

## Access tiers, licences and downstream use

SWISSUbase supports open access, restricted access and embargo; its public principles also refer to closed access for sensitive material, while DSU documentation uses more specific account, contract and author-approval workflows. Metadata remains open and searchable. Login is used when a licence or restricted workflow requires it; open CC content can be downloaded without authentication. Data are accompanied by a download contract/licence, citation and metadata file.

The Standard Download Contract is between depositor and consumer; SWISSUbase and its partners are expressly not parties. A consumer selects the permitted purpose, must cite, avoid re-identification and inferences, use the data conscientiously and for the documented purpose, and cannot pass original or edited data to third parties. For personal data, the consumer acts as controller, follows applicable law, prevents re-identification, uses security controls and reports a breach. The consumer deletes downloads when no longer needed or when the contract ends.

The March 2026 Annex adds a specific copyright/AI condition: a consumer cannot process copyright-protected downloads with AI tools unless the depositor grants permission or the use is non-infringing; no third-party AI processor may be used; where AI is allowed, the consumer must sufficiently anonymise before prompting and check the tool’s terms. This is a useful optional dataset-specific clause, not a general EDEN prohibition unless UIST adopts it after legal and research-governance review.

EDEN should make the access decision explicit and reviewable: open, embargoed until a date, restricted by approved request, or closed/metadata-only for a documented reason. Each dataset should state who approves access, what purpose is allowed, whether onward sharing is allowed, how re-identification is prohibited, whether a contract is required, whether the access decision expires, and how a breach affects access. Use dataset-level licences; a generic repository Creative Commons URL is not an adequate substitute.

## Withdrawal, deletion, tombstones and versions

The Deposit Contract allows the depositor to request deletion for a valid reason, with DSU/formal approval and documentation. It also permits DSU-initiated deletion without consent for violations, legal or misconduct concerns, sensitive/personal-data risk, publication error, an unreachable depositor, a maximum preservation period or Terms of Use reasons. The policy language does not create an unrestricted depositor right to erase every public record.

When data are deleted or made inaccessible, SWISSUbase preserves citation metadata and a tombstone placeholder. The Versioning Policy describes rare deletion with a tombstone and, where available, a link to the latest version. The curation and DSU policies list legal, ethical, consent, copyright, misconduct, risk, error and maximum-duration grounds. Dataset history remains discoverable through linked versions.

The live OAI-PMH Identify response reviewed on 3 October 2026 reports `deletedRecord=no`. This means the public harvester endpoint does not advertise OAI deletion support even though the preservation/versioning documents describe tombstones in the catalogue. EDEN should not promise OAI tombstone propagation until its own implementation is tested and documented. EDEN should define whether a withdrawn record remains a landing-page tombstone, what metadata is retained, when files are removed, how identifiers resolve, and what happens to citations and earlier versions.

## Preservation period, backup and service cessation

The Digital Preservation Policy says datasets are preserved for a minimum of 10 years, while each DSU defines the specific period. A footnote in the Deposit Contract says the DSU maximum period is defined per DSU and uploads are retained at least 10 years unless deleted earlier. DaSCH and UniNE policies also state at least 10 years, with additional DSU rules. This is a minimum/policy target with conditions, not proof of perpetual preservation.

The linked five-page Preservation Policy appendices PDF (created/modified 9 July 2025) adds a simplified OAIS summary: producer negotiation, control, designated community, independent understandability, documented loss prevention and authentic access; SIP/AIP/DIP/PDI definitions; and the six OAIS functional areas (ingest, archival storage, data management, administration, preservation planning and access). It lists CC BY, BY-SA, BY-NC, BY-NC-SA, BY-ND, BY-NC-ND and CC0 and says DSUs may define restricted terms through depositor-user download contracts. Its legal appendix lists Swiss federal and cantonal data-protection/research frameworks and links to FAIR, OAIS and CoreTrustSeal references. These descriptions are a useful structure for EDEN’s preservation policy, but the Swiss legal list must be replaced with UIST/North Macedonian sources and OAIS terminology must not be presented as certification.

The preservation policy describes SIP/AIP/DIP custody, preservation events, controlled migration, original-file retention, format monitoring, automated availability checks, backup in a second location and best-efforts renderability. It marks integrity monitoring, vulnerability scans, fixity/checksum procedures and encryption at rest as planned or evolving. The Backup Policy states that production data, databases and metadata are backed up daily in another datacentre; unchanged-file backups remain, while modified/deleted backup copies are retained for one year before permanent deletion. Backup access is an IT recovery function, not a user archive.

The FORS Preservation Policy identifies funding risk and says continuity planning includes discussions with the funder and revision of deposit contracts/transfer clauses. DaSCH and UniNE policies contain continuity language for a DSU ending or cooperation changing. These are useful planning models, but they do not establish a guaranteed successor for EDEN. EDEN should instead state an operational retention target, review it against funding and capacity, define export/transfer and successor decision responsibilities, and describe the notice and tombstone procedure if the service ends. Do not state “long-term guarantee” without an approved institutional commitment, funding model and tested transfer path.

## Persistent identifiers and citation

SWISSUbase uses DOI/DataCite for datasets. The Versioning Policy distinguishes a canonical dataset DOI pointing to the latest version from version DOIs for initial/major versions; minor versions retain the DOI; cosmetic metadata corrections do not create a new DOI. Its citation guidance includes author, year, title, version, data set designation, publisher and DOI. The curation page says DOIs are assigned after publication.

EDEN should define the identifier authority and lifecycle separately from the Handle process described by UIST. A policy can require a persistent identifier, landing page, version relation, citation export and DOI/Handle resolution checks without claiming that a Handle is live. State who registers it, when it is minted, how a draft differs from a published version, what happens on withdrawal, and which identifier remains stable across updates.

## Privacy, logs and transparency

The Platform Privacy Notice lists IP addresses, server/event logs including who uploaded/downloaded and when, authentication-provider information, account name/email/institution/language/preferences, contracts, support/newsletter data, project metadata and personal data inside uploads. It explains operational, security, stability, troubleshooting, development and statistics purposes; says it does not use profiling or solely automated decisions; describes retention as necessary for legal or legitimate purposes; and says uploader names in catalogue metadata are not automatically erased. Project/dataset metadata may be shared with online catalogues, while the public catalogue is worldwide.

It states Swiss hosting, GÉANT Data Protection Code alignment, TLS/SSL, Matomo with anonymisation and 24-month retention, essential/nonessential cookies and rights to information, correction, objection, erasure subject to legal/public-interest limits, restriction, portability and complaint. EDEN should localise controller details, legal bases, retention schedules, public metadata handling, logs, cookies/analytics, data-subject request route and international transfer safeguards under UIST policy and North Macedonian law.

## Governance and operator obligations

SWISSUbase governance is a consortium/simple society of FORS, University of Neuchâtel and University of Zurich, with an Oversight Board, Steering Committee, Operational Group, Central Teams and local DSUs. It publishes common principles while allowing partner-specific policies. SWITCH supplies KaaS/Ceph S3 and other external providers include DataCite, CESSDA and CLARIN. The ToU says FORS represents the consortium and that Collaborating Partners can be included.

For EDEN, assign an accountable service owner, repository manager, curation/data-protection roles, system administrator, identifier administrator, escalation path and policy approver. Keep operator obligations measurable: publish current policies and contact details, preserve audit/version history, maintain access controls, monitor storage/backups, handle incidents, maintain export capability and review policies on a fixed cycle. Avoid promising uninterrupted, error-free or permanently secure service. SWISSUbase’s own ToU disclaims those warranties and reserves suspension/modification/fee changes.

## Actionable EDEN drafting matrix

| EDEN policy area | Draftable rule informed by SWISSUbase | Evidence/status to retain |
|---|---|---|
| Deposit eligibility | Authorised UIST/partner depositor; project and dataset owner identified; DSU/domain route defined | Deposit form, authority declaration and curator decision |
| Rights | Depositor retains rights; EDEN receives operational licence; dataset-level licence/contract shown | Rights statement, licence field, third-party permission |
| Privacy | No personal/sensitive data without anonymisation, lawful basis/consent and risk decision; restricted path available | Privacy assessment, access decision, controller/processor record |
| Review | Metadata/file/rights/privacy/integrity/format checklist; request evidence; document acceptance/refusal | Review log and versioned decision |
| Access | Open, embargoed, restricted or metadata-only; purpose, approver, expiry and onward-use terms visible | Access record, contract/licence and audit log |
| Curation | Metadata may be corrected/enriched; data/documentation changes need depositor consent except documented preservation transformations | Change log and depositor notice |
| Versions | Major/minor/cosmetic classification; version relation; DOI/Handle lifecycle defined | Version notes, landing pages and citation export |
| Withdrawal | Valid-reason request and institutional review; emergency/legal removal; files removed where required; tombstone/citation retained as allowed | Withdrawal decision, reason category, tombstone record |
| Preservation | State an approved minimum target and conditions; maintain ingest copies, backups, integrity checks, migration and export plan | Preservation events, backup/recovery tests, format register |
| Service cessation | Named decision authority, notice, export/transfer or closure plan, identifier/tombstone behaviour | Continuity plan and periodic test |
| Transparency | Current policy/version dates, contacts, privacy notice, access/licence history and service status | Public policy index and change log |

## Material caveats for the rector review

The live OAI service and the public policies support a credible interoperability and curation case. They do not prove perpetual preservation, complete integrity monitoring, encrypted-at-rest storage, universal open access or a live Handle service. The repository record’s broad “long-term” and “continuity guaranteed” wording should be treated as advertised metadata requiring qualification against the 10-year/DSU-specific language, the planned-controls caveats and FORS continuity-risk discussion. The legal-document index’s 2026 upload paths also point to a Deposit Contract whose PDF body says September 2025; EDEN should require a controlled document register with one unambiguous effective date.
