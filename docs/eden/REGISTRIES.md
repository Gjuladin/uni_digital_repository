# re3data and FAIRsharing work

The `No record` panels in EDEN are external-registry gaps. They cannot be resolved by adding more HTML or JSON-LD to the repository. The detailed field drafts are in [../EDEN_REGISTRY_SUBMISSION.md](../EDEN_REGISTRY_SUBMISSION.md).

## UIST account and authority requirements

UIST must:

1. Choose a maintained institutional email address for each registry account.
2. Create or take ownership of the re3data and FAIRsharing accounts.
3. Name the staff member authorized to approve and submit each record.
4. Decide how credentials and account recovery are held when staff change.
5. Approve the exact submission payloads before they are sent.
6. Respond to registry curator questions and approve subsequent corrections.

The development team can prepare evidence, populate draft forms with approved values, and perform the submission using the UIST-provided authenticated session after explicit final approval.

## Shared prerequisites

- Approved repository name, URL, description, institution, country, address, language, and research areas.
- Approved public repository contact.
- Production-verified REST, OAI-PMH, OpenSearch, feeds, sitemap, Signposting, FAIRiCat, and JSON-LD URLs. Local verification alone does not satisfy this prerequisite.
- Verified enabled metadata formats and OAI-PMH crosswalks.
- Approved content types and repository scope.
- A decision on Handle and DOI support.
- Public policy and licence URLs for every claim made.
- Evidence for any certification claim.

## re3data

Remaining actions:

1. Resolve the approval blockers in the draft record.
2. Confirm the production metadata formats and PID systems immediately before submission.
3. Submit using the UIST-owned account.
4. Address curator feedback without adding unsupported claims.
5. Wait for the record to become public and capture its stable re3data identifier.
6. Enable the approved re3data identifier in repository configuration.
7. Confirm EDEN returns the public UIST record instead of `No record`.

## FAIRsharing

Remaining actions:

1. Resolve the approval blockers in the draft record.
2. Confirm whether FAIRsharing classifies the entry as a repository, database, or another supported resource type at submission time.
3. Submit using the UIST-owned account.
4. Address curator feedback and wait for publication.
5. Capture the public FAIRsharing identifier and enable it in repository configuration.
6. Confirm EDEN returns the public UIST record instead of `No record`.

## Completion condition

This category is complete only when both records are public, their facts match the production repository, and EDEN's two registry panels return the UIST records. A submitted or draft record is not yet an acceptance pass.
