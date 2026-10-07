# UIST Repository Registry Readiness and Technical Action Plan

> Historical source draft, superseded by the [four-page policy pack](../dabar_simple_2026-10-06/README.md) accepted by the rector (user confirmation received 6 October 2026). Approval placeholders, proposed review steps and decisions below describe the earlier draft, not current requirements.

Working submission checklist | Prepared 3 October 2026 | Handle status updated 6 October 2026

UIST should prepare its re3data suggestion around the current minimum inclusion requirements and complete the existing FAIRsharing record 9313. This plan separates those requirements from optional metadata, technical improvements and institutional policy decisions. It identifies the evidence needed to submit accurate claims and the work that can proceed under the existing development approval.

## re3data minimum inclusion requirements

The current registration policy in the official metadata schema version 4.0 lists four minimum requirements. Meeting these permits editorial consideration; inclusion remains subject to re3data review. Older guidance mentioning an English interface should not be substituted for the current four criteria. See the registration policy on page 6 of the official schema documentation.

| Criterion | Evidence required for UIST | Current position and owner |
| --- | --- | --- |
| Focus on research data | Public mission and collection or service evidence showing that research data are collected or supported | Not established by the publication-focused homepage alone; service owner and depositor must supply authentic evidence |
| Legal entity and sustainable organisational framework | UIST institutional responsibility, service ownership and organisational arrangements | University identity exists; repository accountability and commitments need confirmation |
| Explain repository and data access | Public deposit eligibility, file access, embargo and restriction information | Existing terms exist; approve clear repository-specific rules and publish them |
| Provide terms of use | Stable public terms covering use and rights that correspond to actual practice | Existing agreement contains conflicts requiring institutional review and replacement or reconciliation |

A real, authorised dataset record with documentation is strong evidence of research-data scope, but the official criteria do not prescribe a minimum count of datasets. A genuinely operating research-data service may be explained on its own merits. Do not create a synthetic dataset, relabel an article or advertise an unimplemented service to satisfy the criterion.

## Suggestion form and record metadata

The inspected public suggestion form marks repository name, repository URL, description and the suggester's email as required and includes CAPTCHA. Repository name and description language selectors default to English. The page also presents data licence information within its required-information area. The v4.0 metadata schema requires at least one dataLicense entry with its name and URL. These observations describe the form and schema; no server-side submission validation was performed.

The submission should therefore include the repository identity, an accurate research-data description, contact information, applicable data use or licence terms and institutional responsibility. Use a clear public licence or rights policy describing item-specific conditions rather than applying a single licence to all files. Uncertainty or mixed licensing must be represented according to the registry's available choices, with an explanatory policy URL where appropriate.

Prepare subjects, content types, languages, institutions, access conditions, software, interfaces, metadata standards, PID systems, preservation and certification entries from evidence. These are record characteristics; their appearance in the schema does not make every feature an admission requirement. Certification, DOI minting, operational Handles, OAI-PMH, APIs and a particular open licence are not among the four minimum inclusion criteria. Do not delay solely for Handle activation if the other criteria and form information are satisfied; represent the current PID position accurately.

## Technical work that can proceed now

| Action | Implementation or verification | Completion evidence |
| --- | --- | --- |
| Preserve discovery and quality work | Deploy the existing local fixes using the administrator handoff; keep public origins and access controls correct | SSR and endpoint evidence; repeat EDEN discovery check after deployment |
| Prepare policy publication | Provide stable HTTPS pages or document routes and a policy index; expose only approved versions | Working page, owner, version, effective date and matching configured links |
| Maintain structured links | Use existing gated contact, licence, access, deposit, preservation and curation settings; add confirmed registry URLs when suitable | HTML and linked JSON-LD contain accurate, reachable values |
| Review real dataset metadata | Verify record type, documentation, creators, rights, access and related outputs against source material | Representative authorised dataset or service evidence |
| Check public interfaces | Probe REST, OAI-PMH, sitemap, feeds, Signposting and JSON-LD actually enabled | URLs, response status, media type and representative responses |
| Verify restrictions | Confirm embargoed or restricted files and sensitive metadata are not exposed through HTML, APIs, feeds or harvesters | Read-only checks with representative authorised test cases |
| Prepare evidence and record | Assemble a dated checklist and form values without secrets or unsupported claims | Reviewable payload and evidence register |

Some technical work is already implemented locally. It should be verified and deployed, not rewritten merely because registry fields remain incomplete. Repository policy drafts and suggested operational measures do not count as deployed evidence.

## Rector and institutional decisions

Approve the policy drafts through the competent institutional route; name the repository owner, reviewers, privacy and complaint contacts; confirm deposit scope and research-data service capacity; settle metadata and content licensing; and fund retention and preservation arrangements. Confirm the description, subject coverage, eligible depositors, supported languages, any fees and the office responsible for registry maintenance.

For early re3data submission, a sufficient coherent approved statement of research-data scope, institutional responsibility, access, service use and data rights can be published first. The fuller curation, preservation, privacy and continuity programme should progress alongside it. Any current processing and deposit activity must still meet applicable duties; re3data does not require completion of every proposed policy document or optional preservation feature as an admission gate.

Replace or reconcile the current repository user agreement and privacy notice. The live terms include US-law or hosting claims, limit reuse to personal, non-commercial purposes, restrict systematic retrieval, and contain service-preservation disclaimers. The University and administrator should verify the real hosting and legal circumstances. Open licences and metadata harvesting must remain consistent with the adopted terms. Existing grants of rights should be reviewed before changing the terms applicable to older deposits.

## Server administrator work

Handle prefix 20.500.15029 is live and matches the local declaration; [20.500.15029/261](https://hdl.handle.net/20.500.15029/261) resolved globally on 6 October 2026. Maintain the service and preserve and back up keys and configuration. Audit complete legacy 123456789 migration and redirect coverage; perform further migration only if needed under a reviewed plan that protects existing links. Deploy the existing metadata fixes, refresh relevant caches and indexes as required, and verify the configured sample identifiers against actual public records.

Supply evidence of hosting and service recipients, storage, backup and restore arrangements, integrity checks, monitoring and incident responsibility. This evidence enables accurate policy wording; an application code change cannot establish that backups are performed or that a retention promise is funded.

## FAIRsharing record 9313

The public record confirms that it is awaiting curator review and hides its detail fields. The developer reported warnings for organisation links, licences, publications, citations, data curation and record associations. Organisation links appear twice in that warning and should be treated as one affected field category. Detailed current values require access by the record maintainer; do not create a duplicate.

| Affected field | Proposed action | Evidence and approval needed |
| --- | --- | --- |
| Organisation links | Link UIST as the responsible organisation using the appropriate relation | Confirm legal identity and existing FAIRsharing organisation entry |
| Licences | Record applicable resource or data licensing accurately and link the adopted policy | Rector-approved distinction between metadata and deposited content |
| Publications | Add a genuine publication describing the repository if one exists | Bibliographic evidence; hosted research papers alone do not qualify |
| Citations | Mark a genuine resource publication as the preferred citation when one exists | FAIRsharing uses a citation toggle on publications; a website citation string does not fill that field |
| Data curation | Describe the review actually operated and select accurate conditions | Named reviewers, workflow and public curation policy |
| Record associations | Link standards, formats, terminology or identifiers actually implemented | Confirm both the FAIRsharing target record and the relationship |

The recommended-field warning is a quality prompt, not evidence of rejection and not a requirement to fabricate every missing value. FAIRsharing also has minimum record information distinct from recommendations. Its database-condition selections and identifier declaration must be completed accurately, including the assigned Handle scheme under 20.500.15029, with dated evidence of live sample resolution. A full account-side review should check the name, homepage, description, contact, precise object types and those database-specific conditions even if they were not listed in the warning. A suggested citation on the website remains useful, but does not replace FAIRsharing's publication-based citation field.

Use the organisation relation that reflects UIST's responsibility. The guidance recommends at least one maintaining and one funding organisation; UIST may have both roles if its support is factual. The repeated warning does not require two different organisations. For record associations, use implements for an identifier scheme UIST actually mints or creates for its content, and outputs for standards actually exported. Publisher DOIs held in metadata do not establish UIST minting. Exporting DataCite XML does not establish DOI minting.

## Order of work and submission gate

1. Complete safe technical publication support and the evidence checklist now. Confirm research-data scope using real collections or a functioning service.
2. Obtain approval of sufficient research-data scope, institutional responsibility, access, use and data-rights terms and confirmed contact information. Continue review of the fuller policy suite in parallel.
3. Publish those approved terms; reconcile conflicting existing legal text; check the final public links, metadata and access controls. Complete administrator deployment work needed for the claims being submitted.
4. Prepare the re3data suggestion using the verified minimum-criteria evidence and form fields. Anyone may suggest a repository; a registry account is not a stated admission prerequisite. UIST should still assign an authorised submitter and curator-response contact. State identifiers and preservation as actually operated. Keep a copy of the exact submitted values.
5. Update FAIRsharing 9313 through its maintainer account; resolve minimum-field gaps and recommended fields that have honest evidence. Respond to curator questions without inventing missing publications or certifications.
6. After registry publication, verify the public records and update the corresponding discovery settings and EDEN assessment. Record maintenance remains an ongoing institutional task.

No registry application was submitted and no institutional policy was published in preparing this package. Registrar review, policy enactment and production deployment of other changes remain distinct completion events. Global Handle sample resolution was verified on 6 October 2026.

## Primary references

[re3data schema version 4.0 and registration policy](https://doi.org/10.48440/re3.014)

[re3data suggest a repository](https://www.re3data.org/suggest)

[FAIRsharing record 9313](https://fairsharing.org/9313)

[FAIRsharing organisations and grants](https://fairsharing.gitbook.io/fairsharing/record-sections-and-fields/organisations-and-grants)

[FAIRsharing licences](https://fairsharing.gitbook.io/fairsharing/record-sections-and-fields/licences-and-support-links/licences)

[FAIRsharing publications and citations](https://fairsharing.gitbook.io/fairsharing/record-sections-and-fields/publications)

[FAIRsharing database conditions and curation](https://fairsharing.gitbook.io/fairsharing/additional-information/database-conditions)

[FAIRsharing associations from database records](https://fairsharing.gitbook.io/fairsharing/associated-records/from-database-records)
