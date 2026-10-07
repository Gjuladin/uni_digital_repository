# Research-data deposit: administrator handoff

Implemented and validated locally on 6 October 2026 against DSpace 10 and accepted policy `2026-10-06-simple`. No production deployment, permission change, real dataset deposit, registry submission, DOI work or certification was performed.

## What is ready

The existing Dataset collection/entity mapping selects a dataset-specific metadata form and DSpace's native upload and deposit-licence steps. Required metadata: title, responsible creator/compiler, Dataset output type, release date (at least year), language or explicit N/A, description, methods, scope/limitations, dataset/file rights and file-access summary. At least one actual file is required. Version, named creator affiliations, creation date, subjects, related publication/source URLs and licence URLs are supported without requiring unknown information.

The native file editor now saves only configured audiovisual fields and displays readable access choices. The Dataset page displays these facts, assigned Handle, data/documentation files, descriptions, file-specific rights and native download/request-copy links. Homepage wording includes research datasets; a Research Data collection or a collection with `dspace.entity.type=Dataset` appears alongside publication categories. No UUID is hardcoded in the frontend.

Public Dataset entities are included in default OAI-PMH `oai_dc` and DIM exports. Qualified local fields are preserved in DIM and mapped to labelled descriptions in simple DC; access summaries map to DC rights. REST, frontend and backend JSON-LD expose the dataset facts available to each format. Existing RSS/Atom feeds include the record and description; they are summaries, not full metadata exports. The registered Handle configuration is unchanged.

## Repeatable production setup — administrator actions, not yet executed

1. Back up deployed configuration/database and review the existing workspace changes with the operator. Build matching DSpace 10 backend and Angular frontend releases. Deploy the backend forms/steps, upload configuration, local registry, OAI filter/crosswalk, deposit terms and JSON-LD change together. Deploy the frontend dataset page, file display, homepage and translations together. Preserve environment-specific URLs, secrets, collection settings and the existing `20.500.15029` identifier configuration. Do not copy synthetic users, collection UUIDs, records or assetstore files into production.
2. Register new metadata before restarting the submission service:
   ```sh
   [dspace]/bin/dspace registry-loader -m [dspace]/config/registries/local-types.xml
   ```
   This importer skips existing fields. If the Dataset entity type is absent from `/api/core/entitytypes`, initialise the bundled entity definitions once (review existing custom relationships first):
   ```sh
   [dspace]/bin/dspace initialize-entities -f [dspace]/config/entities/relationship-types.xml
   ```
   The local installation needed this initialisation for the entity-specific collection chooser. The additions are `local.dataset.version`, `local.dataset.methods` and `local.creator.affiliation`. Keep the existing local schema and any other registered local fields. No standard metadata field is repurposed.
3. Inventory collections as administrator. The public production inventory on 6 October 2026 returned eleven publication/thesis collections and no Research Data/Dataset collection; protected permissions and workflow assignments were not inspected remotely. If none suitable exists, create **Research Data** under a community suitable for research outputs. Set collection metadata `dspace.entity.type` to **Dataset**. Its actual Handle selects the existing Dataset entity mapping automatically; no Handle-prefix or DOI change is needed. Record the resulting UUID/Handle in deployment notes. If an explicit handle mapping already overrides entity selection, map that actual collection Handle to `submission-name="Dataset"` in `item-submission.xml`.
4. Keep the collection and its default **item READ** policy public/Anonymous. Configure its default **bitstream READ** policy intentionally; open is the normal case where rights permit. Create/use its **Submitters** group and add only authorised UIST researchers, staff and students (or a maintained institutional group). Do not use Anonymous or all Registered users as blanket depositors; do not make depositors administrators.
5. For direct deposit, inspect the collection's assigned workflow and all role groups. With the standard DSpace workflow, leave **reviewer, editor and finaleditor** groups unassigned. They are not required for technical administration. Remove/reconfigure approval roles only after checking existing pending tasks, because DSpace rejects deleting a role with pending work. A custom collection-handle workflow/curation mapping must also be inspected; submitter membership alone does not remove an approval gate. Use the locally verified standard workflow with no approval role groups for this collection. No scientific review or per-item administrator acceptance is required.
6. The Dataset process uses `collection → datasetStep → datasetDetails → datasetUpload → license`. `datasetUpload` is the standard UploadStep, not a custom uploader. It offers **Open access**, **Embargo** and **Restricted (repository administrators only)** access. For embargo, the Anonymous READ policy's **start date is the embargo end/release date** (currently limited to 36 months by the existing access option). Restricted means administrator-only file access, not approval of publication. Apply exactly one intended condition per file; an additional Open access policy defeats restriction. Keep public item metadata open; do not add item-level access restrictions to hide the catalogue record.
7. Verify the collection's normal deposit terms use the accepted policy and respect recorded access conditions. The bundled default terms now explicitly distinguish public descriptive metadata CC0 from file rights. Check any pre-existing custom collection terms separately; they override the default. No file licence is preselected or imposed by the dataset form. Do not put CC0 in an item/file template by default.
8. Restart matching services. Refresh OAI indexing and remove cached responses:
   ```sh
   [dspace]/bin/dspace oai import
   [dspace]/bin/dspace oai clean-cache
   ```
   Retain the normal OAI update schedule. Use the existing discovery reindex procedure if deploying into a stale search index. Verify a synthetic deposit with a non-administrator account before authorising the first genuine package. Verify public landing page, anonymous open downloads and denial of restricted/embargoed file content, then test REST, OAI DC/DIM and JSON-LD. Handle assignment is local evidence; verify actual public resolution for genuine production records.

## Limits and operations

Native upload validation requires at least one file; it cannot determine that a README/data dictionary is scientifically adequate. Depositors must provide actual data **and** supporting documentation. The free-text access summary is descriptive: per-file resource policies enforce access. Keep both consistent after edits; public summaries must name affected files and every embargo end date. File-specific rights are exposed in REST and the file list; item-level export statements must explain file exceptions. Simple DC and RSS/Atom cannot retain every file-level detail or qualified field.

Affiliations are named descriptive statements, not linked Person entities. Related publications/sources are explicit URLs rather than automatically imported ORCID/PubMed relationships. Version is a depositor-supplied release label; it does not create DSpace item-version history. Standard CSV and text uploads worked; Markdown was accepted as an Unknown format. An administrator may register `text/markdown` if desired; download usability does not depend on that registration.

Local frontend and backend containers were restarted with current builds for validation. The previously stopped backend had an older binary incompatible with current configuration; this local binary/config mismatch was resolved. Existing workspace changes and staged work were retained. The local Research Data test collection remains under the existing Books and Chapters community only as a technical fixture; choose an appropriate research-output parent on production.

The three prepared real packages remain unpublished. Their actual compiler/depositor, source/third-party rights and file licence/access decisions remain package-specific, as recorded in `../dataset_preparation/release_decisions.json`. Policy acceptance is not a substitute for those decisions.

See [depositor walkthrough](DEPOSITOR_WALKTHROUGH.md), [audit and validation](AUDIT_AND_VALIDATION.md) and the [DSpace submission contract](https://github.com/DSpace/RestContract/blob/main/submission.md).
