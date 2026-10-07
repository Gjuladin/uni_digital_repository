# UIST production administrator facts request

Prepared 4 October 2026; updated 6 October after rector acceptance of the current four-page pack. Use this worksheet to verify repository operating facts at https://repository.uist.edu.mk/. Policy wording no longer awaits rector review. This is a response worksheet; no request was sent by Codex. Use factual answers and mark unknown or planned measures explicitly. Do not include passwords, access tokens, private keys, recovery codes or full environment files.

For each answer provide: **current fact, environment, supporting evidence/date, responsible office or operator, and any limitation**. A redacted configuration excerpt, deployment record, monitoring result or test summary is sufficient where appropriate; sensitive infrastructure details may remain in internal documentation.

## Priority facts

### One service responsibility

Who operates production hosting and each of the frontend, backend, database, search index and asset store? Which office owns the repository service, and what role mailbox receives technical incidents? If the service owner is a university decision rather than an administrator appointment, identify that decision as pending.

Response:

Evidence date and owner:

### Two hosting and processing

In which country or countries are primary storage, databases and backups hosted? Name the hosting provider and relevant service recipients/processors. Are services or support operated outside North Macedonia, and what arrangements document that processing? The existing repository agreement says US hosting; please confirm or correct that assertion. Do not infer geography from DNS, IP registration or a `.mk` address.

Response:

Evidence date and owner:

### Three deployed software and release

What exact frontend/backend versions or commit/image identifiers are deployed? How are production configuration overrides managed? Which local metadata-quality and discovery changes are already deployed? Who can deploy the prepared policy directory and approved documents, and what backup/rollback procedure and release window apply?

Response:

Evidence date and owner:

### Four accounts logs and optional services

What fields are held for depositor accounts, submission audits, security/access logs and support requests? What are the actual retention/expiry settings and access restrictions? Which cookies, analytics, authentication providers and third party services are enabled? Please provide an inventory without individual user data. Retention justification and legal bases need confirmation by the University's competent privacy officer; an administrator setting alone does not settle those decisions.

Response:

Evidence date and owner:

### Five storage backup and recovery

Which assets are backed up: database, asset store, configuration, logs where needed, and Handle configuration/key material? What are the actual frequency, separation, encryption/access controls, retention/expiry and recovery arrangements? When was the last successful restore test, what was restored and what did it establish? Distinguish a configured job from a verified successful backup and restoration. Do not provide key material or complete backup contents.

Response:

Evidence date and owner:

### Six Handle operation

Production Handle prefix `20.500.15029` is live and matches the local declaration. On 2026-10-06, [20.500.15029/261](https://hdl.handle.net/20.500.15029/261) resolved globally to the correct public item; see [dated verification](../HANDLE_ACTIVATION.md). Supply the service configuration summary and further representative resolution checks, including evidence of restart resilience. Who maintains keys/configuration, target updates, monitoring and renewal obligations? What is the status of the legacy `123456789` inventory, migration plan and redirects? Allocation and local routes are not proof of global operation; no migration is requested by this worksheet.

Response:

Evidence date and owner:

## Supporting operating facts

### Seven integrity and file screening

Are checksums recorded at ingest and verified later? Which algorithm, schedule and file coverage are used, and who receives failures? Is malware scanning actually enabled, with what size/format limits and quarantine procedure? Include recent job/test evidence where possible. Do not describe planned jobs as active.

Response:

Evidence date and owner:

### Eight deposit and access controls

Which production collection permissions and workflows are configured? Confirm that authorised institutional depositors can publish without an individual administrator approval task, as the accepted policy requires. Are deposit agreements recorded with their version and acceptance? How are public, embargoed and restricted files enforced across UI, REST, OAI, feeds and downloads? Are sensitive/private metadata fields excluded from public exports? What representative test confirms these controls without exposing protected data? Depositors remain responsible for content, metadata, rights and access choices; the administrator provides technical support and implements authorised corrections or restrictions.

Response:

Evidence date and owner:

### Nine harvesting and interfaces

Which REST/OAI formats, sitemap, feed, OpenSearch, Signposting, JSON-LD and API-catalog interfaces are actually enabled and publicly available? Where are their usage instructions and rate limits? Who operates OAI indexing/cache refresh, and is its sample identifier a real public record? Technical availability and lawful permission to harvest are separate; approved use terms establish the latter.

Response:

Evidence date and owner:

### Ten security incidents and monitoring

Who handles application/storage outages, certificate expiry, unauthorised access, integrity failures and suspected personal data breaches? What operational monitoring and escalation are in place? The competent privacy officer must confirm the applicable incident-notification duties and deadlines in the operating procedure. Provide process/evidence summaries without disclosing defensive secrets.

Response:

Evidence date and owner:

### Eleven retention and continuity

What storage capacity, funding or service arrangement supports retention? What commitments already exist, and which are only proposed? Is there a tested export/recovery process and any approved successor/closure arrangement? Do not select a ten-year or perpetual promise from a comparator policy. The current accepted commitment is retention while the service operates, subject to lawful withdrawal and deposit conditions; verify the actual arrangements without adding a fixed-duration or perpetual promise.

Response:

Evidence date and owner:

### Twelve environment boundary

Confirm the local DSpace database/configuration used for development, the exact local `.env` path if one exists, its configuration precedence and whether it is a copy of any production data. Identify the local endpoint/container/volume names without credentials. State any restrictions on handling copied personal data. Confirm that local testing cannot connect to or alter production accidentally.

Response:

Evidence date and owner:

## Response summary

| Topic | Verified active or unknown or planned | Evidence reference | Owner | Follow-up |
| --- | --- | --- | --- | --- |
| Service responsibility | | | | |
| Hosting and processors | | | | |
| Deployed version and release | | | | |
| Accounts logs and optional services | | | | |
| Backups and restore test | | | | |
| Handle operation | | | | |
| Integrity and screening | | | | |
| Deposit and access controls | | | | |
| Interfaces and harvesting | | | | |
| Monitoring and incidents | | | | |
| Retention and continuity | | | | |
| Local test boundary | | | | |

Name or office confirming these answers:

Confirmation date:

Operational facts or new decisions outside the accepted policy scope that remain unresolved:

These answers verify implementation of the accepted policies; they are not a new policy-approval gate. They do not all represent re3data minimum admission conditions, and Handle activation need not delay an otherwise eligible application.
