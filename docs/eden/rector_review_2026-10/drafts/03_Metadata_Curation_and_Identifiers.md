# UIST Metadata Curation and Identifier Policy

> Historical source draft, superseded by the [four-page policy pack](../dabar_simple_2026-10-06/README.md) accepted by the rector (user confirmation received 6 October 2026). Approval placeholders, proposed review steps and decisions below describe the earlier draft, not current requirements.

Draft for rector review | Version 0.2 | Prepared 3 October 2026 | Handle status updated 6 October 2026

This policy defines the information required to describe deposited outputs, the review UIST undertakes and how corrections, versions and persistent identifiers are managed. It supports useful discovery and accurate registry statements without presenting repository review as scientific validation.

## Approval and responsibility

Approving authority: [confirm authority and approval reference]. Owner: [repository office]. Public contact: [role mailbox]. Effective date: [after approval]. Next review: [approved review date]. The repository owner shall nominate reviewers and maintain the metadata profile and workflow instructions. The technical administrator shall maintain the interfaces and identifier service under the approved technical arrangements.

## Metadata profile

Every accepted record shall contain a title, creators or responsible organisation, description, content type, relevant publication or collection dates, access conditions, rights or licence information and a stable record URL. Research subjects and language shall be recorded where meaningful. Record identifiers, provenance and relationships shall be maintained when known. Unknown information shall be left unasserted or explicitly described as unknown rather than inferred from other records.

Dataset descriptions shall additionally record documentation, methods or provenance, data structure or variable information, file formats, version and relevant temporal or geographic coverage. Funding and related publications shall be linked when verified. Sensitive locations, identities and confidential relationships shall be excluded from public metadata when necessary.

The repository shall use a documented local metadata profile and controlled terms for content types and access status. Creators' ORCID identifiers, organisation identifiers and external publication identifiers may be recorded when supplied or verified; these shall not be fabricated. The repository may expose metadata through Dublin Core, DataCite crosswalks, schema.org JSON-LD and documented interfaces where implemented and verified. Providing a crosswalk does not by itself establish certification or full conformance with every requirement of that external standard.

## Curation before publication

Reviewers shall confirm scope, essential metadata, documentation, rights and access conditions; check that files can be opened or interpreted using declared software where practicable; and request corrections when a deposit lacks information necessary for responsible reuse. A dataset review shall consider whether methods, variables, provenance and limitations are intelligible to a user and whether obvious confidentiality concerns require escalation.

Technical checks shall record available file format identification, malware screening and integrity information. Checks that are not operated shall not be described as completed. The acceptance record shall identify the reviewer, review date, issues resolved and any remaining limitations disclosed to users. Scientific correctness, exhaustive disclosure review, reproducibility certification and legal clearance are outside routine curation unless separately commissioned and documented.

The proposed initial service is manual review of new deposits and corrections by designated staff. UIST shall confirm staffing and any response target before publishing a service level. FAIRsharing curation fields shall describe the workflow actually operated, rather than a planned or unstaffed automated service.

## Metadata corrections and content versions

Minor metadata corrections may be made by authorised staff, with an audit trail identifying the change and its reason. Material changes to creators, rights, access or identifiers require verification and, where necessary, the depositor's confirmation. Correcting metadata shall not silently substitute a materially different file.

A materially changed dataset or software release shall receive a distinct version record or another documented version treatment supported by the repository. Versions shall state their sequence or version label, change description and relationship to earlier versions. Prior versions shall remain accessible where lawful and operationally feasible. If an earlier version must be restricted, the record shall explain its status without exposing protected information. A superseded output shall not be described as withdrawn solely because a new version exists.

## Persistent identifiers

UIST operates a live Handle service under registered prefix 20.500.15029, matching the local declaration. On 6 October 2026, [20.500.15029/261](https://hdl.handle.net/20.500.15029/261) resolved globally to the correct public item. This verifies representative item resolution. Complete legacy migration and redirect coverage, new-item minting and restart resilience require separate evidence. Historical 123456789 identifiers are legacy example-prefix identifiers and shall not be represented as operational UIST Handle support.

The technical administrator shall retain the dated public resolution evidence, monitor representative records and maintain a record of the configured service, accountable operator and backup arrangements. The repository owner and administrator shall agree the suffix assignment and legacy identifier migration plan, including preservation of existing local links. Migration shall be controlled and reversible with pre-migration backups and post-migration checks; new identifiers shall not be created solely to replace functioning identifiers without a documented reason.

Once issued, an identifier shall continue to point to the record or, where required, a lawful withdrawal notice. Its target may be updated after a hosting change. An identifier shall not be reassigned to an unrelated output. Persistent identifier responsibilities shall include configuration and key custody, renewal obligations, monitoring, incident handling and continuity arrangements.

UIST shall distinguish registration of new DOIs from recording DOIs assigned by publishers or other providers. No UIST DOI minting service is asserted in this policy. DOI support shall be described publicly only in accordance with the verified operational arrangement.

## Citation and relationships

Records should display a suggested citation containing creators, year, title, repository or publisher as appropriate, version and a verified persistent identifier or stable URL. Dataset citations should identify the specific version used. A repository-level citation for UIST Digital Repository may be published separately, using a confirmed institutional name and stable homepage URL until a citation identifier is available.

Related datasets, publications, software and standards shall be linked when the relationship is known. The relationship label shall describe the actual connection. A paper merely hosted by UIST is not evidence that it describes the repository itself and shall not be used as a FAIRsharing resource publication on that basis.

FAIRsharing's recommended citation field is attached to a publication describing the resource. A suggested website citation does not fulfil that publication-based field. If no suitable resource publication exists, the recommendation shall remain honestly unfulfilled.

## Public claims and maintenance

The repository owner shall review registry and website descriptions following material changes to policies, software, curation, identifiers or institutional responsibility. FAIRsharing record 9313 is currently reported by the developer as under review; updates should be made to that record rather than creating a duplicate. Registry identifiers and certification marks shall be published only when the relevant public record and claim can be verified.

## Decisions requested from the approving authority

Nominate the review staff and metadata owner. Approve the initial curation scope and version rules. Assign Handle operations and renewal responsibility and confirm the legacy migration decision. Approve the citation wording and the process for maintaining registry records. The technical implementation shall follow these decisions without changing them through configuration defaults.

## Drafting basis

The proposed workflow draws on SWISSUbase's documented curation and version practices, DABAR's distinction between metadata and digital objects, and FAIRsharing's guidance on curation, citations and record associations. Operational interfaces and Handle status are drawn from the existing UIST project documentation and the developer's current instructions, rather than assumed from comparator services.

[SWISSUbase curation guide](https://info.swissubase.ch/resources/?sr=5269)

[SWISSUbase Data Versioning Policy](https://info.swissubase.ch/resources/?sr=6651)

[DABAR repository policies](https://dabar.srce.hr/en/repository-policies)

[FAIRsharing data curation](https://fairsharing.gitbook.io/fairsharing/additional-information/database-conditions#data-curation)

[FAIRsharing citation publications](https://fairsharing.gitbook.io/fairsharing/record-sections-and-fields/publications#citing-your-resource)
