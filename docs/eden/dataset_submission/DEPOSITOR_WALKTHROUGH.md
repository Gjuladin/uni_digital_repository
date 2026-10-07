# Uploading the first genuine dataset

Use after the Research Data collection has been configured and your UIST account has deposit permission. Authorised users publish directly; there is no mandatory administrator or scientific approval of each deposit. You remain responsible for content, metadata, source rights and access decisions under policy `2026-10-06-simple`.

## Before starting

Choose one prepared package under `docs/eden/dataset_preparation/packages/<package>/v1.0/`. Settle its responsible **human compiler/depositor**, authority to share the source-derived material, file rights/licence and access conditions. Check its `release_checklist.md`, `proposed_metadata.json`, README, data dictionary and licence draft against `release_decisions.json`. Local preparation does not authorise publication. Do not copy pending licence claims from a draft without resolving them.

These packages are **derived compilations of published aggregates**, not original participant-level datasets. Describe them that way. Source-study authors are not automatically the creators of your compilation. Do not invent affiliations, dates, permissions, version relationships or missing observations. Update package documentation and checksums if the release changes.

## Normal DSpace submission

1. Log in with your authorised account. Complete the existing End User Agreement if this is your first login; it uses the accepted repository policy, not another approval process. Open **New → Item** (or start a new submission in MyDSpace), then choose **Research Data**. The chooser only offers collections where you have deposit permission. A differently named collection must have Dataset configured by its administrator.
2. In **Describe**, enter the dataset title and responsible creators/compilers. Add affiliations as `creator name — institution` only when known. Select **Dataset**. Enter the release date for this compilation, optionally its creation date, and its language. English and Macedonian are offered; choose Other if needed, or N/A for content without a language. Add the actual release label (for example `1.0`) when established. This label does not itself create an item-version history.
3. In the dataset details, describe contents/purpose, compilation methods, coverage and limitations. Identify published aggregate sources and processing; do not imply raw measurements or original participant data. Add useful subjects, the related publication URL/Handle/DOI URL and source URLs. Use the actual **dataset/file licence or rights statement**, with a licence URL where available. Explain per-file exceptions. Public descriptive metadata CC0 does **not** assign a licence to your files.
4. State **file access conditions**: open, restricted, embargoed or mixed. Name affected filenames and include the end date for every embargo. This text tells readers what to expect; the next step enforces it.
5. In **Upload**, use the standard chooser/drop area to upload the actual CSV/data files, `README.md`, `DATA_DICTIONARY.md`, settled `LICENSE.md` and other appropriate documentation. Upload multiple files; a record containing only the source paper, preview or review ZIP is not the prepared dataset. Review each file's name, size and description. Label its role, such as data, README, variable definitions or methods. Add file-specific rights/URL when its terms differ.
6. For **each file**, select one intended native access condition:
   - **Open access**: anonymous download after publication.
   - **Embargo**: enter the date when the file becomes public. DSpace calls this the access **start date**; it is the embargo **end date**. Remove an additional Open access condition if present, since either policy can grant access.
   - **Restricted (repository administrators only)**: restricted content; public metadata and documentation may remain open. This does not put publication into an administrator review queue. Requests depend on rights-holder permission and the administrator's ability to provide access.
7. Review all metadata/files and the normal DSpace deposit licence. Accept only if you have the authority stated in it, then use **Deposit** to finish. In the configured direct-deposit collection, the record becomes archived/public immediately; no per-item review follows. If it enters a review queue, contact technical support to correct collection workflow configuration.

## Check the published result

Open the landing page signed out or in a private window. Confirm Dataset type, creators, description, methods, limitations, version if supplied, rights/access summary, related publication/source links and the **assigned Handle**. Download every intended open file, especially README/data dictionary, and compare it with the settled package/checksums. Confirm restricted/embargoed file content is denied anonymously and the stated release date is correct. Public file listings/metadata are not proof that restricted content is downloadable.

Ask technical support to confirm the record appears in REST, default OAI `oai_dc`/DIM after the scheduled import, existing discovery feeds and JSON-LD. The qualified DIM export preserves version/method fields; simple DC describes these facts in labelled text. Use the real assigned Handle for citation. Never cite the local synthetic test's Handle as evidence of a genuine public dataset.

For substantive file changes, identify the new release clearly using the repository's normal versioning/new-record procedure and update documentation. The version text alone does not archive previous files. Keep any source/rights/access changes consistent across metadata, licence files and enforced file policies.
