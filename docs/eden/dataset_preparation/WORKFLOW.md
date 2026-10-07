# Workflow: prepare research-data deposits from UIST publications

## Purpose and limits

Rector-accepted deposit model (acceptance reported 6 October 2026): the repository administrator authorises institutional accounts and collection permissions and provides technical support. Authorised depositors publish directly and are responsible for their content, metadata, rights and access choices. There is no mandatory administrator review, assigned reviewer or special approval queue. Use the [simplified repository policies](../rector_review_2026-10/dabar_simple_2026-10-06/pages/01_Repository_Policies.md). Historical source-review evidence is retained; it does not impose a release approval step.

Work through **every publicly discoverable item** at https://repository.uist.edu.mk/, including new records found on refresh. Record an outcome for each. Prepare actual research-data files where supported by the evidence; otherwise record exactly what is missing. The target is a maintained, usable data service and truthful registry evidence, not a Dataset label on every publication.

This preparation stage is local. Production requests are anonymous/read-only. Do not deploy, publish policies or deposits, change live records, permissions, embargoes or identifiers, submit registrations, generate keys or contact researchers without separate explicit authorisation. Treat the approved Handle project as an existing workstream; no new DOI project is required. Continue FAIRsharing record 9313 when authorised; never create a duplicate.

Read applicable AGENTS.md and Git status in frontend `/Users/samil/uni_digital_repository` and backend `/Users/samil/uni_digital_repository_backend`; preserve other work. The public investigation does not need a local database or running DSpace services. If a later diagnosis requires them, privately verify the actual test target/configuration and initialisation behaviour first; use read-only bounded transactions and never infer production settings from the test environment.

## 1. Refresh the complete queue

Use agent-browser according to its installed skill for public UI checks, and public REST/OAI for structured coverage. Start from actual API/catalog links. Follow discovery → search → objects and **all returned next links**, including the links inside `_embedded.searchResult`; deduplicate items by UUID. Reconcile with OAI `ListRecords` pagination when available. Record dates, totals, collections, types, interface errors and omissions.

The initial 4 October census had 165 public publication records. This is a dated starting point, not a hardcoded target count. Local QA fixtures and synthetic/demo records, including titles beginning `EDEN local QA fixture -`, are excluded from dataset evidence. Retain an exclusion outcome if encountered. Do not read private submissions, accounts or submitter endpoints.

Update `inventory/publications.json` and regenerate `publication_index.md`. Preserve earlier completed investigations and packages; revalidate changed source files rather than overwrite history. Track content fingerprints, observation dates and the last inspected source. Search hints may prioritize work, but every item must eventually have a substantive disposition.

## 2. Investigate one publication at a time

For each item, record title, UUID, Handle string, landing URL, collection, type, creators, affiliations/ORCIDs if verified, dates, source DOI and research context. Follow actual bundle/bitstream and related-source links, including pagination. Separate public metadata from file access and licence.

Inspect a representative accessible source file when needed; avoid bulk downloads. Confirm that its title/authors/year/DOI match the record. A mismatch is a hold, not a source for silently enriching that record. Inspect methods, tables, figures, data-availability statements, supplemental files, README, codebooks, units, sample descriptions and external dataset links. Do not bypass access controls. A missing anonymous file can mean missing or concealed content; do not guess.

Compare the UI, REST, JSON-LD and OAI where available. Record differences and proposed metadata corrections separately from data compilation. A working local `/handle/...` route does not itself establish global resolution; the source chapter DOI must never become the new dataset DOI.

Prefer existing authorised original research data or an author-supplied documented release. Check whether claimed supplementary material contains actual observations, experimental/simulation outputs or reusable analysis data. Software alone, a narrative article, a thesis without associated data, and a label are not sufficient.

## 3. Choose an honest outcome

| Outcome | Use when |
|---|---|
| `not_reviewed` | No substantive inspection yet. |
| `metadata_screened` | Public metadata inspected; contents still need review. |
| `prepared_needs_deposit` | Genuine local files and documentation validated; the responsible depositor, permissions, rights/access or normal deposit steps remain. |
| `data_request_needed` | Research data are discussed but actual reusable data/documentation must be supplied. |
| `rights_review_needed` | Data may be usable but rights, depositor authority, consent or licence scope remains unresolved. |
| `file_missing_or_access_unknown` | No accessible source or file availability cannot be established. |
| `metadata_file_mismatch` | Attached content conflicts with the record; reconcile before using it. |
| `external_data_link_verified` | A real external dataset and relationship were checked; no UIST-hosted file claim is made. |
| `no_suitable_data_found` | Inspected available content did not support a data release; state search limits. |
| `excluded_fixture` | Synthetic/demo/EDEN QA material. |
| `ready_for_authorised_deposit` | Responsible authorised depositor, rights/access decisions, normal deposit terms and necessary package documentation are evidenced. |
| `published_verified` | Authorised deposit completed; real landing page, anonymous access condition and exported metadata tested. |

Do not count `prepared_needs_deposit` as a live dataset. A rights-review outcome is not proof that reuse is legally forbidden; it records an unresolved assessment. Do not claim that the University has no data because public evidence is unavailable.

## 4. Prepare a genuine package where possible

For original data, retain provenance and document any authorised cleaning, aggregation or de-identification. Never claim original/raw data were supplied when they were not.

For **derived published aggregates**, extract only actually reported values with a defensible reuse basis. Check the chapter/article licence separately from the book or publisher policy; resolve conflicts. Do not transfer a publication licence to unpublished source data. Unclear or restricted material goes to rights review; do not presume that a repository-wide policy grants permission.

Exact table values and explicitly labelled figure values can be transcribed and visually checked. Do not estimate from graph heights for the standard preparation route. Keep source precision, missingness, units, denominators and scope. Do not fabricate individual responses, fill unreported categories, infer respondent counts from rounded percentages or invent measurements. Original researcher simulations can be genuine data; QA/demo simulations created to fill the repository are excluded.

Name a derived release explicitly as an extraction/compilation. Document whether partial. Distinguish original study creators from the compiler/depositor; do not imply original-author approval or endorsement. Publication, collection, compilation and actual deposit dates are separate. Specify accurate relation such as `IsDerivedFrom`; use “author-issued supplement” only if evidenced.

Package layout:

```text
packages/<publication-uuid>/v1.0/
  dataset/
    <descriptive-data-name>.csv          # or genuine appropriate research formats
    README.md                           # context, provenance, methods, scope, reuse and limitations
    DATA_DICTIONARY.md                   # variables, types, codes, units, missing values
    LICENSE.md                          # actual source rights and proposed package licence
    SHA256SUMS.txt
  proposed_metadata.json                # truthful fields; null for unassigned creator/identifier/date
  release_checklist.md                   # evidenced gates and unresolved decisions
  package_manifest.json                 # source, type, version, stage and file checksums
  review_package.zip                    # only intended deposit data/documentation
  comparison.md                         # current record versus target
  preview.html                          # useful review view; clearly local/proposed
  evidence/                             # minimal public excerpts/logs/source-page locators
```

Original copyrighted source PDFs need not be duplicated in the package. Link the public source, record its fingerprint and retain minimal necessary evidence. Exclude credentials, private keys, account data and unnecessary personal information. Do not republish participant quotations or identifiers merely because they appear in a paper. Technical inspection is not comprehensive privacy or legal clearance.

The existing item 188 package is the worked example. Preserve it and its limitations: 22 observations, published percentages only, combined four-country scope, unknown item-specific denominators and no original respondent files. It can be reviewed for deposit without pretending to be a complete replication package.

## 5. Validate and record progress

Use the installed PDF/spreadsheet/document skills as applicable. Verify source-file association first, then every transcribed data value against source pages, key uniqueness, encoding, units, row/column counts, missing-value representation and provenance. Preserve checksums and clear version history. Do not turn these focused checks into an unrelated application test suite.

Provide a current/proposed comparison and small readable preview for strong candidates. Do not write “fully compliant” or tick institutional/operational gates solely because files exist. Report unknowns directly.

Every material finding has source, observation date, environment, limitation and one of: **Verified public**, **Verified local**, **Source implementation**, **Administrator confirmed**, **Institutional decision required**, **Unknown**. The operational `stage` is separate from that evidence label.

Maintain concise batch progress: inspected N of current total; prepared packages; data requests; rights holds; mismatches; unavailable sources; no suitable data. Preserve the unreviewed queue across context changes. Finish with a disposition for every item or explicitly list what remains incomplete.

## 6. Release gates and registry use

Before any package is marked `ready_for_authorised_deposit`, record:

1. Genuine UIST scope and an appropriate collection under the current simplified repository policies.
2. Responsible human compiler/depositor and an institutional account authorised for that collection. The administrator's appointment does not make that person the compiler of every package.
3. Depositor confirmation of source authority, third-party/consent restrictions, metadata, documentation, licence and access conditions. Public metadata uses CC0; dataset files retain their own applicable rights.
4. The normal DSpace deposit terms/acceptance for the actual submitting account; do not create a separate bespoke agreement approval gate or assume an old article deposit authorises new files.
5. Dataset type, separate identifier/citation plan, version, checksums and accurate links to the publication.

These checks record the depositor's responsibilities. No administrator sign-off or scientific peer review is required. Local preparation alone does not settle unresolved source rights or authorise this agent to publish a package.

When explicitly authorised to deposit, use the authorised account's normal direct-deposit process. Assign a separate dataset identifier, publish files and metadata, add the actual dataset link to the publication, test anonymous download/embargo/restricted behaviour as selected, and check enabled exports. Record the final UUID/URL/checksums and transition to `published_verified` only after evidence. An existing collection approval workflow must be removed or reconfigured by its administrator to match this model; changing account permissions alone does not change workflow configuration.

Use verified public records and public scope/operator/access/terms pages for the four re3data minimum criteria. A documented research-data service matters; neither a local staging folder nor an arbitrary count of relabelled papers proves that scope. Certification, a DOI service, every optional registry field and finishing this entire backlog are not separate admission prerequisites. Maintain FAIRsharing 9313 consistently with actual holdings and operated capabilities.

Storage after research cleanup: complete publication reviews live in `inventory/publications.json` under each item's `last_integrated_review`; unsent drafts live in `requests/DRAFTS.md` with UUID anchors. Optional incoming batch reviews may use `research/reviews/` and are integrated by `update_queue.py`. Keep unique package source-validation evidence. Raw census snapshots are only generated by `refresh_inventory.py --save-raw` when specifically needed.
