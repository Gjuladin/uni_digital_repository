# Dataset submission audit and local validation

Completed locally on 6 October 2026. Policy: **2026-10-06-simple**. Frontend: `/Users/samil/uni_digital_repository`; backend: `/Users/samil/uni_digital_repository_backend`. Both had ongoing staged and unstaged work. Applicable `/Users/samil/AGENTS.md` was read; no repository-specific AGENTS.md was found. Existing work was preserved, including prior policy, Handle, export and JSON-LD changes. No real prepared package was read into a submission or published. No production mutation or deployment was performed.

## Existing capability and missing pieces

| Area | Existing capability | Implemented / remaining action |
| --- | --- | --- |
| Submission | Dataset entity mapping already existed, with publication-style metadata and shared generic second page | Dedicated native Describe steps for dataset facts; Dataset-only output choice; language N/A stored as `zxx`; methods, limitations, rights and access required |
| Upload | Native multiple-file upload, file metadata, resource-policy access controls and normal deposit licence | Dedicated required native UploadStep, data/documentation descriptions and optional file-specific rights; fix editor attempting to patch unconfigured audiovisual fields |
| Metadata | Standard title/creator/date/description/subject/relations/rights and `dcterms.accessRights` available | Added `local.dataset.version`, `local.dataset.methods`, `local.creator.affiliation`; registered locally |
| Collections | Local nine publication collections; public production inventory eleven publication/thesis collections, no Dataset collection | Created local Research Data fixture with Dataset entity; production setup instructions supplied |
| Entity registry | Dataset XML definitions existed but were not loaded locally | Initialised standard entity definitions locally; documented prerequisite |
| Permissions/workflow | Collection Submitters and standard optional reviewer/editor/finaleditor workflow | Non-admin synthetic submitter; no review groups; direct archiving proven. Production groups/private workflows remain administrator actions |
| Landing page | Dataset component and native file/download controls existed | Display type, version, named affiliations, methods, limitations, rights/access, sources/publication links, documentation and assigned Handle |
| Discovery | Homepage categories emphasised publications | Include research-data wording and dynamic Research Data/Dataset collection route; no environment UUID hardcoded |
| Exports | REST and discovery supported standard fields; default OAI filter excluded Dataset entities | Default OAI public-output filter includes Dataset and Publication, preserves public/withdrawn rules; local facts mapped into DC and retained exactly in DIM; JSON-LD facts added |

The approved policy requires basic metadata, files, rights and dataset documentation. The form requires title, creator/compiler, Dataset, release year/date, language or explicit N/A, description, methods, scope/limitations, dataset/file rights and file-access summary. At least one file is required. It supports optional release version, affiliations, creation date, subjects and related/source/licence URLs; unknown information is not fabricated. A separate file licence chooser or custom uploader was unnecessary. No DOI work was introduced and existing Handle configuration was reused.

`dc.description.version` has an existing peer-review-status meaning; `dcterms.hasVersion` describes a related resource. Neither was repurposed for a release label. Plain named creators/affiliations and explicit links allow compilation deposits without creating fictional Person/publication entities.

## Local end-to-end results

The technical test record is **SYNTHETIC TEST DATASET — UIST submission validation (not research)**, item `3c221b31-c047-4cdd-a45c-4a124b9e3845`, assigned local Handle `20.500.15029/31`. The local Research Data collection is `640760c1-a696-496e-bb81-928c06ede4a0`, Handle `20.500.15029/30`. These identifiers identify local fixtures, not genuine public research holdings.

- Native submission returned `datasetStep`, `datasetDetails`, `datasetUpload` and licence sections. Incomplete submission and completion without files were rejected with HTTP 422.
- A non-administrator account belonging to the collection Submitters group uploaded five actual synthetic files and completed the ordinary deposit licence. Submission immediately archived the record with no reviewer/editor/finaleditor groups. This installation returned empty HTTP 201 on completion; archived state, public visibility and absence of a waiting review were independently verified.
- All supplied dataset facts persisted through anonymous REST, including Dataset type/entity, version, methods, limitations, source/publication links, rights/access and assigned Handle. No CC0 file licence was inserted.
- Anonymous CSV, README and data dictionary downloads returned 200 and matched uploaded bytes (SHA-256). Restricted file content returned 401. Future-embargoed file content returned 401 with native embargo date **2026-11-05**.
- On only the synthetic embargo file, moving the Anonymous READ start date into the past made content downloadable (200). Restoring its original future date denied content again (401). This tested native release behaviour without changing any production or genuine-file policy.
- Anonymous submission was denied (401); the synthetic depositor could not submit in another collection (403).
- After normal OAI import and cache clearing, `oai_dc` and DIM GetRecord included the dataset. Version, methods, affiliation, limitations, access, rights, sources/relations and Handle survived; DIM retained qualified fields. Default filter continued to exclude administrative entities and non-public items.
- Backend signposting JSON-LD and frontend JSON-LD retained available dataset version/methods/source/publication facts. Discovery search indexed the record. Existing collection RSS and Atom endpoints (`/server/opensearch/search?format=rss|atom&scope=<UUID>&query=*`) included it as a summary.
- Rendered browser record and homepage showed the Dataset fields, Research Data collection route, three open documentation/data links, two protected file links and correct access summary. File roles/rights were visible. A second record, **SYNTHETIC UI TEST — data deposit (not research)** (`8f918807-9b35-4f6a-89c6-55d98d118fd3`, local Handle `20.500.15029/32`), was created, described, uploaded and directly published through the normal browser UI by the non-administrator. Its CSV, README and dictionary downloaded anonymously and matched bytes. File descriptions/rights saved through the native editor. No unconfigured audiovisual metadata was patched. See [machine validation evidence](validation/dataset-validation.json).

## Checks and repeatable validation

Backend server-boot package succeeded against the current workspace. Eight focused OAI/crosswalk/configuration tests passed (`DatasetXslTest`, `DIMXslTest`, `OaiConfigurationTest`). Frontend application TypeScript compilation and production browser/SSR build passed. All 76 focused homepage, JSON-LD and native file-editor tests passed. Browser walkthrough verifies the normal collection chooser, metadata fields, multiple-file upload, file editor, native terms and direct completion.

Re-run the local synthetic smoke script with Python 3, `requests` and optionally `lxml`:

```sh
python3 scripts/dataset-submission-smoke.py \
  --credentials /private/path/synthetic-local-credentials.json \
  --work-dir work/dataset-submission-smoke \
  --parent-community <local-community-uuid>
```

Credentials JSON contains `admin_email`, `admin_password`, `depositor_email`, `depositor_password`; the depositor must use `@uist.invalid`. Keep it private and out of Git. The script refuses remote hosts, redirects and adoption of an existing Research Data collection without its own state. Preserve its work directory to rerun checks on the same synthetic record. Do not point it at prepared real packages. After running normal `oai import` and `oai clean-cache`, rerun with `--check-exports`. Review/test credentials are not included in deliverables.

## Limits and remaining production actions

Deployment, production metadata/entity registration, Research Data creation/selection, institutional Submitters membership and removal of approval role groups remain unexecuted. The public production inventory cannot establish private administrator settings. A custom workflow/curation mapping or custom collection licence can override defaults and must be checked by the operator.

Native validation cannot assess the scientific adequacy of a README/data dictionary or infer licence authority. The depositor supplies actual data and documentation and ensures the free-text access summary matches enforced file policies. The native embargo option currently limits start dates to 36 months. Administrator-only restriction is supported; arbitrary named-reader groups are not exposed as an extra dataset option. Public file metadata/listing does not reveal protected content. File-level rights are in REST and the file list; simple DC/feeds are not lossless exports of per-file policies.

Affiliations are plain descriptive metadata. A version label does not create item-version history. No source-derived metadata, file rights or dates are invented. Local Handle assignment does not demonstrate production Handle resolution. Markdown downloads work but the local format registry labels Markdown Unknown; optional MIME registration is an administrator choice.

The broad workspace TypeScript command encounters existing unrelated test/Cypress typings; the app compile and production build pass. Full submission-forms DTD validation reports pre-existing ordering problems outside dataset forms; native dataset runtime and focused tests pass. Local optional ORCID/GeoIP configuration also emits diagnostics and was not configured as part of dataset deposit. No broad cleanup of ongoing work was performed.

The local backend was initially stopped with an older executable incompatible with its current configuration. A current server-boot build was installed in the local container, new registry fields loaded and local services restarted. The old local executable is retained privately in task scratch space. Synthetic records/users remain local technical fixtures. Use [administrator handoff](ADMINISTRATOR_HANDOFF.md) and [depositor walkthrough](DEPOSITOR_WALKTHROUGH.md) for production operation and first genuine deposit. The three real packages remain on their compiler, source-rights and access-decision holds.
