# Simplified UIST repository policy pack

The rector has accepted this four-page policy pack, as reported by the user on 6 October 2026. Accepted version: `2026-10-06-simple`. This pack replaces the long public-policy structure with DABAR's four footer links. The acceptance is recorded from the user's confirmation; no signed decision, decision number or formal effective date has been supplied. Production publication and re3data acceptance remain separate from this institutional acceptance. The rectorate designation of the repository administrator is treated as confirmed by the user's instruction. Public policies refer to the role; the current person's name and email appear only on the Contact page.

The four English Word documents contain 1,156 words, compared with 4,670 words in the bodies of the four supplied Word drafts, excluding their table. This is a reduction of about 75 percent. The policy document is two pages; each other document is one page. Markdown sources and matching HTML previews are included. Publication languages are Macedonian and English; this task does not supply a Macedonian translation.

## Four public pages

| Footer label | Word document | Implemented website route |
| --- | --- | --- |
| Repository policies | 01_Repository_Policies.docx | /info/repository-policies |
| Accessibility statement | 02_Accessibility_Statement.docx | /info/accessibility-statement |
| Privacy notice | 03_Privacy_Notice.docx | /info/privacy |
| Contact | 04_Contact.docx | /info/contact |

These routes are implemented in the Angular application; production URLs become registry evidence after deployment and verification. `/info/accessibility` retains accessibility settings separately from the statement. The repository-policy directory becomes the consolidated policy page when the bundled pages are enabled. The standalone HTML files remain previews with links to the other three local HTML files.

## How the supplied drafts were reworked

| Supplied draft | Where the essential content now appears |
| --- | --- |
| 02 Repository Governance Deposit and Use | Repository policies: institutional scope, account authorisation, depositor responsibilities, access and file reuse |
| 03 Metadata Curation and Identifiers | Repository policies: CC0 metadata, corrections, versions, stable records and withdrawal notices |
| 04 Preservation and Service Continuity | Repository policies: retention, backup responsibility, original files and closure/export |
| 05 Privacy Takedown and Appeals | Privacy notice: university source, repository supplement, correction/takedown and review route |

Approval placeholders, repeated referral paragraphs, registry-specific instructions, detailed technical procedures and borrowed governance were removed from public copy. The old drafts remain available as historical records. No new mandatory file licence is chosen: each item retains its own rights statement. There is no external partner deposit programme or designated external preservation service. This scope does not imply that UIST has no hosting suppliers.

## Privacy source

The existing [UIST Privacy Policy PDF](https://uist.edu.mk/wp-content/uploads/2022/02/UIST-Privacy-Policy.pdf) is linked from the accepted notice. An unchanged reference copy is retained in `reference/UIST-Privacy-Policy.pdf`. Controller and contact information come from this source. Its main-website-only scope and one-day server-log statement are not presented as verified repository settings. The short supplement covers repository records, accounts and complaints.

The rector accepted the repository notice and its applicability to the repository. During implementation, verify repository-specific account/log handling and retention arrangements against the accepted wording. Those operating checks are separate from the completed policy acceptance. If the institution wants to reproduce the entire main-site text, keep it clearly identified as the original reference and reconcile its scope and log statements with the repository supplement. The original PDF has not been rewritten or presented as a new approved repository policy.

## Implementation handoff

The repository administrator creates or authorises accounts and assigns collection deposit permissions. Authorised UIST users deposit and publish without individual administrator approval. Depositors are responsible for content, metadata, rights and access conditions. The administrator provides technical assistance and implements corrections or restrictions when needed; publication is not scientific peer review. This replaces the earlier mandatory acceptance step.

The superseded custom backend approval action, reviewer group/workflow definitions, activation patch and old permission handoff have been removed. The backlog now uses `prepared_needs_deposit` and depositor confirmation rather than administrator sign-off; its three CSV datasets remain unchanged. Historical draft generators no longer write application content.

Keep collection workflows consistent with this model. Account permissions alone do not remove a configured approval workflow; verify that an authorised depositor can complete publication without an administrator approval task. No production account or collection configuration was changed in this document rework. Describe upload to re3data as restricted to authorised institutional users, and describe curation as depositor-supplied metadata with technical correction on request, rather than routine review of every deposit.

The application footer now uses the four labels above in its bottom section, alongside cookie and accessibility settings. Old metadata and preservation policy routes redirect to `repository-policies#metadata-reuse-and-curation` and `repository-policies#retention-and-service-continuity`. `/info/end-user-agreement` displays the same consolidated repository policy while preserving DSpace's agreement acceptance form and first-login flow. `/info/privacy` displays the UIST notice instead of boilerplate.

The rector's acceptance is confirmed. The institutional effective date remains unset; 6 October 2026 identifies the prepared version and the date acceptance was reported. The website displays an effective date only if configured. Publication is enabled in `config/config.yml` for version `2026-10-06-simple` following the user's request to publish these pages. An external deployment configuration must use the same enabled version. No formal decision number or effective date has been supplied.

Run `node scripts/build-repository-policies.mjs` after editing a page source to regenerate the application content, or use `--check` to verify synchronisation. Deploy the normal Angular browser and SSR build and verify the four public routes before adding registry-facing policy claims. Deployment credentials or a production rollout mechanism are not part of this checkout.

The administrator's role, CC0 metadata and the language pair follow the user's current instructions. Update administrator and university contact details on the Contact page when they change. Other public pages link there instead of repeating names or email addresses. Handle prefix `20.500.15029` is now live and matches the local declaration; [20.500.15029/261](https://hdl.handle.net/20.500.15029/261) resolved globally on 6 October 2026 (see [dated evidence](../../HANDLE_ACTIVATION.md)). The four public policy pages make no broader PID-service promise. DOI minting, certification, measured accessibility conformance, successful restore tests and a funded indefinite retention promise are not asserted. Specific backup schedules and recovery procedures belong in the internal operating record.

See `COMPARISON_AND_RE3DATA.md` for the five-repository comparison and the remaining registry evidence. Research notes preserve exact official URLs. Application pages and footer links are implemented locally. No registry application, production data edit or production deployment was performed. Word pages were rendered and visually checked.
