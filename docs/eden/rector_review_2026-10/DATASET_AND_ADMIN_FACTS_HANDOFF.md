# Handoff for UIST dataset evidence and administrator facts

Updated 6 October 2026 after the user confirmed rector acceptance of the four-page policy pack. The remaining objective is operational and genuine research-data evidence, followed by an accurate re3data submission. Registry acceptance is a separate external review event.

## Task

Establish whether UIST Digital Repository has genuine research-data holdings or a functioning research-data service, identify a representative deposit where possible, and collect administrator facts needed to verify implementation of the accepted policies. Perform the public-site and local-code investigation now. Return specific requests for institutional or administrator facts that cannot be established from those sources. Do not repeat the completed SWISSUbase, Balkan or registry research.

The user has approved development and the Handle.net process. The rector accepted the four-page policy pack, version `2026-10-06-simple`, as reported by the user on 6 October 2026. FAIRsharing record 9313 already exists and is under review; do not create a duplicate. The accepted pack is the current policy text. This evidence handoff does not itself authorise registry submission, production deposits or production data changes.

## Workspace and environment

| Environment | Location | How to use it |
| --- | --- | --- |
| Public production UI | https://repository.uist.edu.mk/ | Authoritative public evidence for holdings, access and currently published information |
| Public production REST | https://repository.uist.edu.mk/server | Read-only public discovery and record/file checks; confirm paths from actual responses |
| Frontend source | /Users/samil/uni_digital_repository | Inspect and preserve the existing dirty changes |
| Backend source | /Users/samil/uni_digital_repository_backend | Inspect DSpace submission, metadata, permissions and operating configuration |
| Backend local configuration | /Users/samil/uni_digital_repository_backend/dspace/config/local.cfg | Private configuration source; do not print secrets |
| Backend Compose | /Users/samil/uni_digital_repository_backend/docker-compose.yml | Local topology; source service names include dspace, dspacedb and dspacesolr |
| Backend CLI Compose | /Users/samil/uni_digital_repository_backend/docker-compose-cli.yml | Local CLI service definition; not a production access route |
| Previously used local backend | http://localhost:8080/server | Historical test endpoint; verify whether available now |
| Previously used local UI | http://localhost:4000 and http://localhost:4001 | Historical Docker and host SSR endpoints; verify before use |

The user identifies the local database as a test environment and refers to a local `.env`. On 4 October, no `.env` file was found in either repository, and the host Docker inventory showed no running DSpace containers. A PostgreSQL container for an unrelated project was running; do not use it. Do not assume an old localhost endpoint is still active or that a similarly named database belongs to DSpace.

Resolve the actual local environment file or existing Compose/configuration arrangement privately before a database connection. Inspect variable names and target classification without exposing values. If the `.env` cannot be located, complete independent public-site and source checks and report the missing exact path as a narrow setup question. Do not invent an environment path or replace existing credentials. Source defaults, test fixtures and local databases do not prove production settings.

Local DSpace services may be started only after confirming the setup is local and that no initialisation, import, reset or migration will run implicitly. Keep volumes and existing data. If a startup may change the database, use read-only public/source checks first and resolve that specific operation before proceeding.

## Read first

Read applicable `AGENTS.md` files for both checkouts, and record each checkout's current Git status before changes. Preserve other work.

Use these existing documents as the task context:

- `/Users/samil/uni_digital_repository/docs/eden/rector_review_2026-10/README.md`
- `/Users/samil/uni_digital_repository/docs/eden/rector_review_2026-10/research/registry_requirements.md`
- `/Users/samil/uni_digital_repository/docs/eden/rector_review_2026-10/re3data_submission_draft.md`
- `/Users/samil/uni_digital_repository/docs/eden/rector_review_2026-10/technical_implementation.md`
- `/Users/samil/uni_digital_repository/docs/eden/HANDLE_ACTIVATION.md`
- `/Users/samil/uni_digital_repository/docs/eden/METADATA_QUALITY_ADMIN_HANDOFF.md`
- `/Users/samil/uni_digital_repository/docs/eden/METADATA_QUALITY_FIXES.md`

The last file explains an executable JAR override used in a former local container. Recreating an old container image may lose that override. Do not assume the source, packaged image, local runtime and production are identical.

## Evidence labels

Every material finding must carry a source, observation date, environment, status and responsible owner where known. Use these statuses:

- **Verified public**: observed on the live public site without special access.
- **Verified local**: observed in the local test runtime or database; insufficient by itself for a registry claim.
- **Source implementation**: found in code/configuration; deployment or operation remains unverified.
- **Administrator confirmed**: supplied by the production operator with dated supporting evidence.
- **Institutional decision required**: a proposed rule or commitment awaiting adoption.
- **Unknown**: evidence is absent or insufficient.

An unreachable URL is not proof that an item does not exist. A public site link is not proof of approval, rights clearance or an implemented retention promise. A `.env` is not evidence of actual backup or restoration activity.

## Workstream one establish research data evidence

### Inventory the public service

Use agent-browser for the live UI, reading its skill and CLI workflow before browser commands. Use read-only REST/OAI requests for structured evidence where appropriate. Search and browse collections; paginate the public Discovery results and record the coverage rather than stopping at the first page. Start from `/server/api` and its returned links. Existing code uses `/server/api/discover/search/objects`; follow actual response links and paging metadata.

Identify records whose `dc.type`, entity type, title, descriptions, file names or documentation suggest datasets, measurements, experiments, surveys, codebooks, tables or research software with associated data. Do not limit the search to the word Dataset: genuine data may be incompletely described, while a Dataset label may be inaccurate. Check related data links in publications, distinguishing externally hosted data from holdings in UIST.

Exclude EDEN QA fixtures, demonstration items and synthetic data created solely for testing. Previous fixtures include the title prefix `EDEN local QA fixture -`; also check provenance rather than relying only on that prefix. Software alone, a thesis PDF or an article labelled Dataset does not establish a data collection without substantive supporting evidence.

### Inspect each credible candidate

Record the following in `dataset_candidates.csv`, using only public information for any publicly shared file:

1. Title, UUID, local Handle string, canonical public landing URL and collection.
2. Stored resource type and entity type, and whether the content actually appears to be research data.
3. Creators, institutional connection, relevant date/version and research context.
4. Public data files, formats and sizes; documentation such as README, codebook, methods, variables or schema.
5. Rights/licence statement and URL, separate from access status. Record any ambiguity or need for depositor confirmation.
6. Whether the actual file is downloadable anonymously, embargoed, restricted, missing or externally hosted. Inspect authentication/errors without bypassing controls.
7. A brief substantive reason for treating it as data, its limitations and any obvious disclosure concern. Do not claim comprehensive privacy or legal clearance.
8. Landing metadata, JSON-LD, public REST and OAI consistency, where available.
9. Public identifier behaviour. A working local `/handle/123456789/...` route is not evidence of global UIST Handle operation.
10. Conclusion: usable public evidence; credible candidate needing rights/documentation review; external-data link only; test fixture; or not data.

Inspect a representative small public data file where necessary to establish its nature. Avoid bulk downloads, personal-data reproduction, account identifiers or copying restricted records into public evidence. If a file appears to contain sensitive material, record the concern minimally and escalate instead of reproducing it.

### Use the local database for diagnosis

After confirming the local target, use read-only connections/transactions and inspect the actual DSpace schema before constructing queries. Set the transaction read-only, use sensible limits/timeouts and roll it back after inspection. Do not export user/account tables, password hashes or private submission metadata.

Inspect type and entity metadata, archived/discoverable/withdrawn state, collection membership, bundles/bitstreams, documentation and rights for candidate items. Explain discrepancies between the local copy and live public discovery. Database existence and a resource-policy row alone do not prove anonymous production access; verify public access separately.

Do not update metadata, relabel records, import fixtures, grant permissions, alter embargoes, migrate identifiers or reindex as an evidence-gathering shortcut. Local test records remain test evidence. A genuine local copy can identify a candidate, but its live publication, provenance and rights still need confirmation.

### If no suitable public dataset is found

State exactly what was searched and the coverage limits. Do not conclude the University has no data. Produce a short content request for the repository steward: an actual UIST research dataset, creator/depositor permission, appropriate data files, README/codebook/method information, title/authors/date/version, access decision and accurate rights/licence. Offer a lawful deposit plan using the established workflow; do not publish it in this task.

If UIST genuinely operates a research-data metadata portal instead, document the live harvested data sources and working service. Do not invent that role from generic software capability. Report whether the re3data research-data criterion is evidenced, potentially supportable pending work, or still unresolved. The official criteria do not specify a numerical minimum of one dataset.

## Workstream two establish administrator facts

Complete the companion `ADMINISTRATOR_FACTS_REQUEST.md`. Inspect local configuration and source to identify the relevant settings, but mark production values unknown until publicly verified or confirmed by the operator. Do not treat every item in the request as a re3data admission prerequisite.

The highest priorities for 5 October are:

1. Actual production service owner and technical contact.
2. Production hosting country/provider and recipients/processors, because existing legal text contains unverified US-hosting assertions.
3. Deployed backend/frontend version and deployment method, including whether local fixes are deployed.
4. Actual account, access-log, analytics/cookie and restricted-file practices needed for an accurate privacy notice.
5. Actual storage, backups and last successful restore-test evidence, with clear limits to preservation claims.
6. Handle activation status and accountable operator, keeping prefix allocation distinct from global item resolution.

Keep a configuration-to-runtime matrix. For each claim, list the local source setting, available public observation, production confirmation needed and consistency with accepted wording. Where no evidence exists, propose restrained wording or leave the decision field pending; never manufacture an implemented control.

For Handle work, prefix `20.500.15029` (reference `HNRT-185049`) is live and matches the local declaration. On 2026-10-06, `20.500.15029/261` resolved globally to the correct public item; use [current status and evidence](../HANDLE_ACTIVATION.md). Confirm complete legacy migration/redirect coverage, operator responsibility, backups and restart resilience as separate checks. Do not generate replacement keys, rotate credentials, operate the public server or migrate legacy identifiers in this evidence task. Handle completion does not independently block a re3data suggestion if the other minimum criteria and required information are accurate.

## Deliverables

Write under `/Users/samil/uni_digital_repository/docs/eden/evidence/2026-10-04-dataset-admin/`, using the actual observation date if the work occurs later:

- `dataset_evidence.md`: public search coverage, strongest candidate(s), missing evidence and a clear research-data scope conclusion.
- `dataset_candidates.csv`: concise comparable candidate inventory, with environment/status labels.
- `administrator_facts.md`: publicly verified/local facts, administrator confirmations received, unanswered questions and source-to-runtime matrix.
- `rector_brief.md`: one-page plain-language result reflecting the accepted pack: what is implemented, what operational facts remain unverified and what public evidence is needed.
- `submission_readiness.md`: minimum-criteria evidence and exact remaining blockers, separated from optional enhancements and Handle work.
- Minimal dated public response excerpts or headers supporting findings, without secrets, authentication tokens or private personal data.

If waiting for administrator answers, complete the public/local reports and the specific question list. Clearly identify any incomplete work. Do not declare that hosting, retention or privacy facts are verified simply because the request was drafted.

## Completion and scope

The handoff is complete when the public data criterion has an evidence-based outcome, representative records are assessed, administrator facts are classified with specific gaps, and remaining operational checks are distinguished from the completed policy acceptance. Preserve all existing drafts and code changes. Evidence gathering and local diagnosis are authorised; external communications, production writes and registration submission are outside this evidence handoff. Policy acceptance is already recorded from the user's confirmation. Return the strongest public dataset URL if available and the shortest actionable list of remaining blockers.
