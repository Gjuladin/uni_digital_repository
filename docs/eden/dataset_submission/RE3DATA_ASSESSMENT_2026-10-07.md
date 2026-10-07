# UIST re3data readiness assessment — 7 October 2026

Assessment scope: current local frontend and backend source, the saved dataset validation evidence, and fresh read-only checks against the local running backend. The operator plans a production release today; deployment and production collection setup have not been verified by this assessment.

**The local dataset implementation addresses the earlier upload/workflow gap. Registration readiness still depends on deploying and configuring the service, publishing genuine research-data evidence, and supplying the final suggestion details.** Pushing code alone does not perform those operational steps.

## Registration criteria

The [re3data FAQ](https://www.re3data.org/faq) says editors assess the public website for a research-data focus, explained repository/data access and terms of use. The registration policy in the [current schema documentation](https://www.re3data.org/schema) also requires a sustainable legal operator. These are distinct from additional technical capabilities or certification.

| Criterion | Local assessment | Evidence needed after release |
| --- | --- | --- |
| Research-data focus | Accepted policy includes research data. Native Dataset submission, file upload, dataset landing pages and discovery are implemented. Homepage and footer now explicitly describe datasets and documentation. | An operating Dataset collection/service and representative genuine research-data records. The synthetic fixtures establish functionality, not research holdings. |
| Sustainable legal operator | Accepted policies identify UIST, the rectorate-designated administrator, contact channels, retention and continuity responsibilities. | Public adopted policy and Contact page, plus institutional operation consistent with the statements. |
| Clear repository/data/deposit access | Policy separates anonymous catalogue/open downloads from authorised institutional deposits. Form records file-access summaries; native resource policies enforce open, restricted and embargoed content. | Production collection permissions and direct-deposit workflow; verified anonymous access and file restrictions matching each record's description. |
| Terms of use | Accepted policy and consolidated End User Agreement explain CC0 descriptive metadata and item-specific file rights. Backend deposit terms preserve that distinction. | Published policy/agreement with no conflicting old terms or custom collection licence; actual dataset rights and licence URLs where applicable. |

## Source review and fresh local checks

Backend configuration maps Dataset collections to dedicated Describe steps, a required native UploadStep and the normal deposit licence. The form supports creators/compilers, descriptive affiliations, dates, language, version, description, methods, limitations, subjects, source/publication links, rights and access. New local metadata fields have a registry definition. The frontend renders those facts, data/documentation files and assigned Handles. The default OAI public-output filter includes Dataset entities; simple DC maps available dataset facts and DIM retains qualified metadata.

The saved [audit](AUDIT_AND_VALIDATION.md) and [machine evidence](validation/dataset-validation.json) document non-administrator direct publication, required-field/no-file rejection, multi-file upload, native access enforcement, browser submission and export checks. Saved build evidence records 76 frontend tests, eight backend OAI tests, application compilation and browser/SSR builds passing on 6 October. These historical results are distinguished from the following fresh checks.

Read-only checks on 7 October confirmed:

- Both synthetic local records remain archived and anonymously readable through REST, with Dataset type/entity, methods, version, rights and access statements intact.
- Anonymous downloads of `data.csv`, `README.md` and `DATA_DICTIONARY.md` return HTTP 200 and match the source fixture SHA-256 checksums.
- Restricted and future-embargoed fixture content return HTTP 401 anonymously.
- Local OAI `oai_dc` and `dim` return the fixture record with Dataset type, version and access summary.
- English JSON5 and deployment YAML parse successfully. Human-facing repository description and configured DataCatalog description match. Accepted policy version `2026-10-06-simple` is enabled, and generated policy content is synchronised with the sources.
- All 76 focused homepage, head-metadata and native file-editor tests passed again. The production browser and SSR build passed after the wording edits; it reports bundle-size, CommonJS and unused-compilation-input warnings. `git diff --check` passed.

Fresh checks do not repeat authenticated submission or alter users, records, permissions or file policies. Local Handle assignment does not demonstrate resolution of a new production dataset. No production or registry mutation was performed.

## Release and suggestion checklist

1. Deploy matching backend/frontend releases, accepted policy pages and agreement. Preserve production URLs and existing registered Handle configuration. Confirm external configuration enables policy version `2026-10-06-simple`; update any externally overridden repository description to match the new wording.
2. Follow the [administrator handoff](ADMINISTRATOR_HANDOFF.md): register the new metadata fields, initialise Dataset entity definitions if absent, create/select an appropriate collection with `dspace.entity.type=Dataset`, assign authorised Submitters, inspect custom overrides and leave approval-role groups unassigned for direct deposit. An application push does not create the collection or change database permissions.
3. Refresh OAI indexing/caches as documented, then verify policy/contact routes, Dataset collection discovery, a non-administrator deposit, open/protected files and REST/OAI/JSON-LD against production. Keep synthetic fixtures clearly labelled and separate from research evidence.
4. Publish genuine research data with supporting documentation after the actual depositor settles provenance, source/file rights and access. The three prepared aggregate compilations still have package-specific decisions pending; do not describe them as original participant-level data. An existing genuine supplementary-data deposit could also supply evidence. re3data's reviewed policy specifies no fixed minimum dataset count or mandatory collection name.
5. Complete the [suggestion worksheet](../rector_review_2026-10/re3data_submission_draft.md) with the final description, live policy and representative data URLs, actual data licence/rights information, subjects and maintained suggester contact; obtain the already documented final submission authorisation and use the [Suggest form](https://www.re3data.org/suggest/). Inclusion remains an editorial decision.

The form's access summary is descriptive and must match enforced per-file policies. Requiring one uploaded file does not prove adequate data documentation; the depositor must provide it. A version label does not create version history. Neither limitation prevents registration when accurately described. DOI minting, certification, a particular EDEN score and complete cleanup of historical publication metadata are not the four minimum inclusion criteria.

## Site wording changes

English hero, search prompt, collection heading/description, research/service paragraph, footer and repository metadata now explicitly include research datasets and supporting documentation. The service paragraph explains eligible institutional depositors, anonymous catalogue browsing and record-specific access/reuse. The configured DataCatalog description uses the same repository description. Existing dynamic Dataset collection links are retained. No registration, certification, guaranteed perpetual retention or blanket file licence is claimed.
