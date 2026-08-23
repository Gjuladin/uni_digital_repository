# Migration Status

Last updated: 2026-08-23

## Overall state

- Status: `IN PROGRESS - ISOLATED LOCAL RUNTIME PROOF COMPLETE; STAGING/PRODUCTION BLOCKED`
- Current phase: `Phase 2/3 source implementation and local smoke proof complete; staging acceptance pending`
- Implementation started: Yes (P2/P3 implementation plus isolated local runtime smoke proof)
- Production changes made: No
- Repository files changed for migration: Documentation only in current `main`;
  target worktrees contain unstaged implementation diffs
- Local official guide imported: `OFFICIAL_UPGRADE_GUIDE.md`

## Current repository revisions

| Component | Path | Branch | Commit | Declared version |
| --- | --- | --- | --- | --- |
| Frontend | `/Users/samil/uni_digital_repository` | `main` | `7f6cb862c939373919d7a02a06812a327209d5b9` | `9.2.0`, but source is a 9.2/10 hybrid |
| Backend | `/Users/samil/uni_digital_repository_backend` | `main` | `252bfffa77` | `9.2` |

The recorded `main` source revisions still match exactly and remain untouched.
The target worktrees remain at the exact official baseline HEADs shown below,
with unstaged implementation diffs. No unrelated source changes
were introduced in either current `main` worktree.

P1 preservation and target refs are now established without changing either
current `main` worktree:

| Component | Read-only backup ref | Target worktree | Target branch | Exact target HEAD |
| --- | --- | --- | --- | --- |
| Frontend | `backup/pre-dspace-10-ui` -> `7f6cb862c939373919d7a02a06812a327209d5b9` | `/Users/samil/uni_digital_repository_v10` | `codex/dspace-10-uist` | `7f59f6cf99f0d1fb4b2abe46e9f24a5e1ee01a49` |
| Backend | `backup/pre-dspace-10-backend` -> `252bfffa77de93e7a4280e43e55478c3d2ab4b1f` | `/Users/samil/uni_digital_repository_backend_v10` | `codex/dspace-10-port` | `465195f7593cf812fe16efaa1685a9a58823243c` |

Both target worktrees remain based directly on the verified peeled
`dspace-10.0` tag commits. They now contain unstaged P2/P3 implementation
changes; their HEAD commits are unchanged and no source changes were made in
the current `main` repositories.

## 2026-08-23 UIST behavior correction and isolated local runtime proof

This section supersedes the earlier Title-only/D-011 source status below. The
older entries are retained as review history.

### Frontend

- Public browse navigation now exposes exactly the three UIST 9.2 options:
  Issue Date, Author, and Title. Subject, Subject Category, and all other browse
  definitions are removed from the desktop/mobile Browse dropdown and from
  community/collection browse tabs. The backend definitions and direct URLs
  are not deleted.
- Author and Title use `contains` forms and headings that say `containing`, not
  `starting with`. Submitting either form writes `contains` and clears
  `startsWith`; a legacy URL value can still be read for compatibility. The
  missing English `browse.search-form.placeholder` translation is present.
- Communities & Collections is a responsive hierarchical dropdown. It loads
  up to 100 top-level communities and up to 100 collections for each returned
  community. Desktop shows only communities in the first dropdown and opens
  that community's collections in a right-hand flyout on hover/focus. Mobile
  uses tap-to-expand community groups. A View-all link remains available; the
  request fan-out and limits require acceptance against production scale.
- The async dropdown has a dedicated UIST section renderer selected before its
  child links arrive. Desktop All of UIST and Communities & Collections open
  on hover and close on pointer exit; pointer clicks do not own desktop state.
  Both top-level dropdowns use the same 200ms expand/collapse animation. The
  animated Communities & Collections panel clips its contents to the growing
  white container, then restores visible overflow for desktop flyouts after
  the animation completes. An invisible hover bridge spans the visual gutter
  between each desktop community and its collection flyout, so the flyout
  remains open while the pointer crosses the gap.
  Mobile renders both as single native button triggers and expands them on tap.
  Opening either mobile dropdown closes the other in the same tap; native
  button keyboard activation toggles exactly once, and closing a dropdown
  clears its expanded community state.
  The mobile sidebar has a viewport-bounded vertical scroll container, and the
  hamburger exposes its actual expanded state to assistive technology.
- Live desktop and 390x844 mobile checks pass. Author form submission produced
  `/browse/author?bbm.page=1&contains=Sefidanoski`, returned A. and M.
  Sefidanoski, and displayed the substring placeholder/heading. Title produced
  a `contains=Journal` URL and results. Desktop/mobile navigation exposes only
  Issue Date, Author, and Title; the nested community/collection groups render
  correctly and no Subject or Subject Category link is present.
- Menu acceptance was repeated at 1440x900, 390x844, and 390x600. Desktop
  first-level C&C showed four communities and zero visible collection panes;
  hovering Books and Chapters displayed only its two-link flyout. Mobile All
  of UIST and C&C opened and switched in one tap, community groups expanded
  independently, and the 540px-high sidebar scrolled through 714px of expanded
  content. At 320px width, deliberately oversized top-level and community
  labels wrapped within their buttons without horizontal overflow and remained
  left-aligned with their child items.
- Final frontend verification passes: focused menu tests 13/13, focused
  browse/navigation tests 24/24, focused Title regression tests 15/15, full
  headless suite 5,968 passed with
  2 skipped, lint 0 errors (1,508 upstream/deprecation warnings), circular
  dependency analysis across 3,318 files, and production browser plus SSR
  build. Existing bundle-size, unused legacy-theme, and CommonJS warnings
  remain non-blocking baseline warnings.

### Backend Author `contains`

- D-011 uses a dedicated
  `browse-author` Solr core. It replaces the unsafe 9.2 `limit=-1` vocabulary
  download and Java filtering with bounded JSON Facet paging and exact bucket
  totals.
- Author entry documents copy scope, lifecycle, version, `read`, and `admin`
  fields. Queries execute the same registered `SolrServiceSearchPlugin`
  authorization pipeline as Discovery, preventing restricted Author names or
  counts from bypassing standard access filters.
- Public query advertisement (`discovery.browse-author.enabled`) is independent
  from index maintenance (`discovery.browse-author.indexing-enabled`). This
  allows the core to be populated and kept current while public Author contains
  remains disabled. Deletes continue during temporary public disablement.
- The generated facet key is passed through to the normal browse result
  contract; no `bi_*` field number is hard-coded. Partial Author `filterValue`,
  DSpace 10 date browsing, and direct legacy `startsWith` compatibility remain
  intact; UIST Author and Title submissions use only `contains`.
- Java 21 focused unit/lifecycle/authorization tests pass, including restricted
  ACL propagation, populate-before-public-enable, and delete-while-disabled.
  The full 15-module `mvn -q -DskipTests package`, `dspace-api` Checkstyle,
  XML/Compose validation, and `git diff --check` pass.
- Isolated local runtime smoke proof used only Compose project `dspace10test`
  and its named containers/volumes from the DSpace 10 backend worktree. Images
  were rebuilt and services restarted. The backend first ran with
  `BROWSE_AUTHOR_INDEXING_ENABLED=true` and `BROWSE_AUTHOR_ENABLED=false`; a
  full `index-discovery -b` and explicit final Solr commit then completed before
  restart with both flags true. The `browse-author` core contains 524 documents
  versus 167 Search-core Item documents. REST advertises
  `author.supportsContains=true`; `contains=Sefidanoski` returns A. Sefidanoski
  (8) and M. Sefidanoski (5).
- The two Compose environment variables map to the indexing and public flags;
  both still default to false for a fresh deployment. The controlled populate,
  commit, then public-enable sequence must be repeated in staging.
- This is functional local smoke evidence, not staging. ACL leakage, all
  scopes, multi-page counts/order/frequency/authority, update/delete, Unicode,
  special/case input, index size, and common/one-character performance remain
  unproved. No database migration, production/staging service, commit, or push
  was performed.

## 2026-08-20 local Phase 0 audit

- Verified both branches, HEAD commits, upstream tracking, remotes, status,
  runtime versions, worktrees, Docker/Compose files, and customization deltas.
- Verified the official annotated `dspace-10.0` tags without changing either
  repository. Immutable peeled commits:
  - Frontend: `7f59f6cf99f0d1fb4b2abe46e9f24a5e1ee01a49`
  - Backend: `465195f7593cf812fe16efaa1685a9a58823243c`
- Confirmed the frontend hybrid/custom-theme hazards and the backend 19-file
  effective delta from official 9.2, including the six browse Java files.
- Confirmed that the ignored backend `dspace/config/local.cfg` exists, is mode
  `0600`, and remains ignored. Its contents were not read or printed.
- Node `20.20.2` and npm `10.8.2` satisfy the frontend baseline. Maven `3.9.15`
  satisfies the backend baseline.
- Java 21 is installed and was selected explicitly for the target build as
  Homebrew OpenJDK `21.0.12.1` (`JAVA_HOME=/opt/homebrew/opt/openjdk@21`).
  Maven `3.9.15` and Apache Ant `1.10.17` are available.
- Docker CLI/server `29.4.1` and Compose `5.1.3` are available. The read-only
  inventory found only unrelated `dobi-puck-azurite` and
  `dobi-puck-azurite-data`, with no DSpace containers, networks, or named
  volumes. No filesystem-backed isolated DSpace staging database, assetstore,
  or Solr dataset exists.
- No production service, database, Solr core, assetstore, external service,
  branch, tag, worktree, dependency, or source file was changed during P0.

## 2026-08-20 P1 baseline handoff

### Backend target

- Runtime setup: Java `21.0.12.1`, Maven `3.9.15`, and Ant `1.10.17`; the
  target build commands used the explicit Java 21 `JAVA_HOME` above.
- `mvn -U clean package` completed successfully for all 15 DSpace 10 modules
  in 385.62 seconds. This
  upstream package lifecycle keeps unit tests skipped by its default
  `skipUnitTests=true` setting.
- Explicit unit-test lifecycle `mvn install -DskipUnitTests=false` completed
  successfully in 808.50 seconds: 1,658 reported tests, 0 failures, 0 errors,
  and 11 skips.
- Compose/config validation passed for `docker-compose.yml` and
  `docker-compose-cli.yml`. The DSpace 10 Docker/Solr definitions include the
  `audit` core.
- With Docker Desktop limited to 4,108,554,240 bytes (about 3.83 GiB), the
  untouched DSpace 10 container definitions produced these local ARM64
  baseline images without starting a container or stack:
  - Backend `local/dspace-backend:dspace-10.0-baseline`, image
    `sha256:09d6b0df5c7477537ef3a73343987dec2dbb4b589d4d6ffe70a797f8caaad863`,
    1,009,636,642 bytes; final runtime Temurin Java `21.0.11`.
  - CLI `local/dspace-cli:dspace-10.0-baseline`, image
    `sha256:9c100e9e454ce4de38affe8f2ede223fd0850601ffc42ecded7f65346d6b8e62`,
    732,293,101 bytes; final runtime Temurin Java `21.0.11`; the
    `classpath` entrypoint command exited successfully.
  - Solr `local/dspace-solr:dspace-10.0-baseline`, image
    `sha256:e506291bc3e382abc6b65a3f7c67bb9b032f5eba37e8ff4e62e7ece78c7cce5f`,
    687,072,934 bytes; Solr `9.8.1`; includes the `audit`, `authority`, `oai`,
    `qaevent`, `search`, `statistics`, and `suggestion` configsets.
- The untouched frontend `Dockerfile.dist` image build did not complete. Its
  in-container `npm run build:prod` was killed after 106.2 seconds with
  `ResourceExhausted: cannot allocate memory`. The same production browser/SSR
  build passed natively under supported Node 20, so this is recorded as a
  Docker capacity failure, not a source-build regression. The Dockerfile's
  pre-copy `npm ci` also attempts `build:lint` before `lint/tsconfig.json` is
  present and deliberately converts that error to `Skipped DSpace ESLint
  plugins`; this upstream behavior is not accepted as lint evidence.

### Frontend target (supported Node 20)

Target package requirement is Node `>=20.0.0 <25.0.0`. With Node `20.20.2`
and npm `10.8.2`, the untouched `dspace-10.0` worktree produced these results
(wall-clock timings from the recorded runs):

| Command | Result | Time |
| --- | --- | ---: |
| `npm clean-install` | PASS | 64.30 s |
| `npm run build:lint` | PASS | 2.57 s |
| `npm run test:lint:nobuild` | PASS; 169 specs | 3.54 s |
| `npm run lint` | PASS; 0 errors, 1,505 warnings | 197.87 s |
| `npm run check-circ-deps` | PASS; no circular dependencies | 18.97 s |
| `npm run build:prod` | PASS; browser and SSR bundles generated | 448.81 s |
| `npm run test:headless` | 5,924 passed, 2 skipped, 2 failed | 293.56 s |

The Node 26 attempt used Node `26.0.0`/npm `11.12.1`, outside the supported
engine range. npm emitted `EBADENGINE`; that run is invalid baseline evidence
and is not used for acceptance.

The two headless failures are the pristine DSpace 10 `LocaleService` tests
`getLanguageCodeList` (with and without a logged-in user). Chrome Headless
151 reports the preference chain `en-GB,en-US,en`, producing
`en-GB;q=1`, `en-US;q=0.9`, `en;q=0.8` where the assertions expect the
`en-US`/`en` chain. The authenticated case also retains the expected
`fr;q=0.5` preference ahead of the browser chain. Attempts to force Chrome to
`en-US` through environment/browser-launch settings still reported the same
`en-GB,en-US,en` chain, so it cannot be normalized externally without changing
the test or application behavior.

### Compose and Docker inventory

`docker compose ... config --quiet` passed for frontend
`docker-compose.yml`, `docker-compose-dist.yml`, `docker-compose-rest.yml`,
and `docker-compose-ci.yml`, and backend `docker-compose.yml` and
`docker-compose-cli.yml`. The backend Angular, IIIF, Matomo, and Shibboleth
Compose fragments also validate when combined with the backend base file (they
are intentionally not standalone projects). No stack was started. Docker
server `29.4.1`
reported only the unrelated Azurite container/volume; no DSpace container,
network, or volume was present, and isolated staging remains absent.
The backend, CLI, and Solr image builds above are artifact-only evidence and
do not satisfy the missing isolated-staging, backup/restore, or topology gates.

## 2026-08-20 source-only P2/P3 implementation

> Historical checkpoint, superseded by the 2026-08-23 behavior correction and
> isolated local runtime proof above. Title-only, Author-disabled, REST-only
> capability, and no-container statements in this section describe that older
> checkpoint and are not the current state.

Implementation was performed only in the isolated DSpace 10 target worktrees.
The current `main` repositories remain untouched; no containers, Compose
stacks, databases, Solr cores, assetstores, or production services were
started.

### Backend target implementation and source-review fix

- The source-review fix touches `BrowseDAO.java`, `BrowseEngine.java`,
  `BrowseIndex.java`, `BrowserScope.java`, `SolrBrowseDAO.java`,
  `BrowseEntryLinkRepository.java`, `BrowseItemLinkRepository.java`,
  `BrowseContainsCapability.java`, `dspace.cfg`, and
  `BrowsesResourceControllerIT` plus `BrowseContainsCapabilityTest`.
- `contains` is now an explicit logical capability. The current configuration
  enables only `webui.browse.index.title.contains = title`; it is independent
  of generated `bi_*` names and output sort selection. Title item `contains`
  remains bounded; Author entry `contains` is deliberately unavailable.
- Author, Subject, and custom metadata browses retain `startsWith`; DSpace 10
  `dateStartsWith` and partial Author `filterValue` behavior remain required.
- All unbounded Author facet retrieval, `limit=-1`, and Java-side full-vocabulary
  filtering were removed. Exact bounded Author entry substring matching now
  requires an approved entry-level Solr index design, mandatory reindex, and
  staging validation; D-011 remains OPEN.
- Verification for the conservative Title-only contract is green: Java 21
  checkstyle reports zero violations; focused capability unit tests pass 5/5;
  the post-fix 15-module package succeeds in 18.919 seconds; the full
  `mvn install -DskipUnitTests=false` reactor succeeds in 6:48 with 1,663 test
  invocations, 11 skips, and zero failures/errors; and the clean targeted
  `BrowsesResourceControllerIT` run passes 30/30 in 50.57 seconds (1:34 Maven
  total). This does not resolve D-011 or validate an Author substring design.
- Two earlier targeted-IT launches are retained as non-evidence: one stopped
  before tests on a stale generated `qaevent` lock, and the first clean reactor
  attempt assembled an incomplete test fixture before the distribution module
  repopulated it. A normal 15-module package rebuilt/installed the complete
  test-environment archive; the subsequent clean targeted run is the 30/30
  result reported above. No external Solr service or core was changed.
- A post-implementation backend image build was attempted after Docker was
  relaunched, but BuildKit remained at Docker Hub metadata resolution for
  `dspace/dspace-dependencies:latest` and was cancelled without producing an
  image. No container or stack was started. The already-recorded clean
  baseline images remain the available container-build evidence.

### Frontend target implementation (Node 20)

- The locale test is deterministic by mocking the browser language in the test
  fixture; production locale behavior was not changed. The pristine browser
  preference chain remains documented as historical baseline evidence.
- The source-review fix updates `browse-definition-capabilities.ts` and its
  spec, the browse service and metadata/title browse components/tests,
  starts-with abstract/loader/text components/tests, `config/config.yml`,
  `HeadTagService` and its tests, `src/index.html`, and the theme registration
  arrays.
- The minimal `uist` DSpace 10 theme is implemented with HomePage, Header,
  Navbar, Footer-v2-as-Footer, and HomeNews. Eager registration includes
  HomePage; legacy listable overrides are intentionally empty.
- UIST assets, safe local config, explicit public-HTTPS SEO, i18n, and the
  logical-capability browse UI/service/routes/tests are present in the target.
  Only Title uses `contains`; Author, Subject, and custom text browses retain
  `startsWith`.
- Verification: focused frontend tests pass 121/121 and the agent
  focused set passes 69/69; `npm run build:lint` and
  `npm run test:lint:nobuild` pass all 169 specs; `npm run lint` has 0 errors
  and 1,506 warnings; circular-dependency checking covers 3,310 files with no
  cycles; the final supported-Node-20 headless suite passes 5,950 tests with 2
  skipped; and the production browser plus SSR build succeeds with warnings.

### Agent three-way findings and implementation gate

| Review finding | Resolution status | Current result |
| --- | --- | --- |
| 1 — unsupported browse types emit `contains` | PARTIALLY RESOLVED / SAFE | Title alone exposes `contains`; Author, Subject, and custom definitions retain `startsWith`. Author substring remains unavailable with finding 2. |
| 2 — unbounded Author facet retrieval | UNSAFE PATH REMOVED; FEATURE OPEN | No full-vocabulary request or Java pagination remains. Exact bounded Author entry substring awaits D-011's entry-level index decision and reindex. |
| 3 — tracked frontend defaults contact production | RESOLVED | Defaults are localhost-only; public SEO URLs require explicit non-local HTTPS `ui.baseUrl`; internal REST names and hardcoded production fallbacks are excluded. |
| 4 — generated field names control behavior | RESOLVED FOR ACTIVE CAPABILITY | Logical browse-name configuration selects Title capability; its configured Title field remains the filter when output ordering changes. |
| Follow-up P2 — frontend/backend capability drift | RESOLVED | REST browse definitions advertise `supportsContains`; Angular deserializes and uses that server-owned flag. Unsupported nonblank `contains` requests return HTTP 400. |
| Follow-up P3 — untracked SCSS whitespace | RESOLVED | Trailing whitespace was removed and an explicit whitespace scan over `src/themes/uist` is clean. |
| Follow-up UI — desktop navbar missing | RESOLVED | The UIST header now renders its themed navbar as the full-width desktop row beneath the header. Mobile still delegates the collapsible navbar to the DSpace 10 header wrapper. |

- Frontend source review now exposes `contains` only when the REST browse
  definition advertises `supportsContains`. The backend is the single source
  of truth; Author, Subject, and custom metadata retain `startsWith`, while
  unsupported direct API parameters fail with HTTP 400.
- Backend source review removed unbounded Author facet retrieval. A correct
  bounded Author-entry substring feature is not yet implemented; it requires
  an approved entry-level Solr indexing/schema design and mandatory reindex.
- The locale fixture remains deterministic with no production behavior change,
  and the post-fix source suites are green for the conservative Title-only
  contract. Staging and production approval remain blocked by D-011 and the
  independent operational/data gates.
- The desktop-navbar regression caused by dropping the legacy custom wrapper
  without moving its desktop composition into the minimal UIST theme is fixed.
  The focused desktop/mobile header suite passes 2/2, repository lint reports
  0 errors, and the production browser plus SSR build succeeds. Existing
  upstream/theme build warnings remain unchanged.

## Immediate next action

Move the locally proved implementation into genuine isolated staging while
operational/data work stays blocked:

1. Repeat the controlled Author-core initialization and full reindex in
   staging, then test ACL leakage; site/community/collection scope; exact
   multi-page totals, ordering, frequency, and authority; item update/delete;
   blank, whitespace, Unicode, special-character, and case behavior; and
   one-character/common-query performance plus index size at production scale.
2. Inventory production topology, URLs, owners, data scale, integrations,
   RTO/RPO, and backup/restore evidence before any data migration or cutover.

## Workstream status

| Workstream | State | Next task |
| --- | --- | --- |
| Planning/reference pack | COMPLETE | Keep documents current during implementation |
| Frontend code migration | CORRECTED SOURCE VERIFIED | Visual/Cypress acceptance against isolated backend staging |
| Backend code migration | LOCAL ISOLATED RUNTIME SMOKE PROVED; STAGING ACCEPTANCE OPEN | Repeat reindex and validate the complete D-011 matrix in isolated staging |
| Staging/runtime preparation | NOT STARTED | O0: production topology and capacity inventory |
| Backup/restore drill | NOT STARTED | Requires inventory and isolated staging storage |
| Full staging rehearsal | NOT STARTED | Requires tested backend and frontend artifacts |
| Production cutover | NOT APPROVED | Requires all go/no-go gates |

## Known blockers and hazards

- The frontend is an inconsistent 9.2/10 hybrid and must not be upgraded with
  an in-place merge or rebase.
- Title and Author `contains` are bounded and explicitly configured. Author is
  public-enabled only in the local `dspace10test` proof; fresh Compose defaults
  keep both Author flags false. Staging initialization, authorization/
  correctness checks, and production-scale performance acceptance remain open.
- The current `main` backend uses Java 17; DSpace 10 target work is explicitly
  using installed Java 21.
- The existing Compose entrypoint automatically invokes plain
  `database migrate`, which is not the controlled 9.2 to 10.0 procedure.
- Current Compose files use fixed container names and development credentials;
  staging cannot safely run beside production on the same host without
  overrides or a separate host.
- The ignored backend `dspace/config/local.cfg` contains SMTP secrets. Preserve
  it securely, merge it manually, and never commit its contents.
- Production data sizes, historic migration/index timings, backup restore time,
  production deployment model, authentication integrations, and recovery
  objectives are not yet documented in this pack.
- Docker now has an isolated local `dspace10test` development topology, but no
  DSpace staging topology. Backend and Solr images built and the local services
  were restarted without migrating production data. This does not provide
  staging, backup/restore, or production-topology evidence.
- The source-only implementation is not production-ready: staging, backup/
  restore, operational topology, and cutover gates remain open.
- D-011 staging acceptance remains open: repeat the mandatory reindex in
  staging and test ACLs, counts, pages, ordering,
  scope, frequencies, authorities, Unicode/case, special characters, deletion
  behavior, index size, and common/one-character substring performance.

## Session handoff template

Copy and update this block at the end of each work session:

```text
Date/time:
Engineer/agent:
Workstream and task ID:
Repository/worktree:
Branch and HEAD commit:
Completed:
Files changed:
Commands/tests run:
Evidence/result:
Open defects or blockers:
Decision log updates:
Exact next action:
```
