# UIST policy implementation and deployment handoff

The rector accepted the four-page policy pack, version `2026-10-06-simple`, as reported by the user on 6 October 2026. This handoff replaces the earlier description of a gated policy-link directory. Current policies are the [DABAR-based pack](dabar_simple_2026-10-06/README.md); the original six long drafts are historical.

## Implemented locally

The Angular application contains four complete pages: `/info/repository-policies`, `/info/accessibility-statement`, `/info/privacy` and `/info/contact`. The footer links to them alongside cookie and accessibility settings. `/info/accessibility` remains the settings page. The repository-policies route contains the consolidated policy text and can be used as its public policy destination.

`/info/end-user-agreement` displays the consolidated policy while preserving DSpace's acceptance form and first-login flow. Older metadata and preservation routes redirect to the relevant consolidated-policy sections. The current administrator's name and email appear only on Contact; other pages refer to the role.

Page sources are in `dabar_simple_2026-10-06/pages/`. Run `node scripts/build-repository-policies.mjs` after editing a source, or `node scripts/build-repository-policies.mjs --check` to check synchronisation. `info.repositoryPolicyPublication` in `config/config.yml` enables version `2026-10-06-simple`. The effective date is optional and remains unset. The publication setting does not configure collection permissions or workflows.

The old custom administrator-approval action and workflow definitions have been removed. Authorised UIST depositors publish directly; the administrator manages accounts, collection permissions, technical operation and corrections. Production collection configuration still needs verification against that model.

## Deployment and public evidence

1. Deploy the accepted pages with the normal browser and SSR build, using the same enabled policy version in any external configuration.
2. Verify all four routes, their footer links and agreement content without login. Verify the public wording against the accepted sources.
3. Confirm authorised users can complete collection deposit without an administrator approval task; account permissions alone do not remove an existing workflow.
4. Verify account/log handling, backup/recovery and access controls through operating evidence. Policy acceptance does not prove those controls are active.
5. Enable relevant `harvesting.repository` policy URL claims only after destinations are publicly verified. Access, deposit, curation and preservation claims may refer to the applicable sections of the consolidated policy. Leave unsupported optional claims disabled.
6. Use the verified public pages and genuine research-data evidence in the re3data submission and the existing FAIRsharing record 9313. Do not create a duplicate FAIRsharing entry.

CC0 applies to public descriptive metadata. The repository DataCatalog's `licenseUrl` must accurately describe that scope; it must not imply that all deposited files have the same licence. File rights remain item-specific.

## Verification already recorded

The four-page implementation passed 31 focused tests, production browser and SSR builds, and desktop/mobile footer checks. The subsequent configuration cleanup passed six focused publication tests, TypeScript and changed-file lint checks. These are local results; no production rollout is evidenced by this policy work. The earlier directory-only checks are superseded by this implementation.

Handle prefix `20.500.15029` is live, with [sample resolution evidence](../HANDLE_ACTIVATION.md). Full migration coverage and operational resilience are separate checks. Genuine dataset publication, production policy verification and registry editorial outcomes remain distinct from rector acceptance. Certification, DOI minting and measured accessibility conformance are not asserted by the accepted pages.
