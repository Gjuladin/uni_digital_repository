# Audited Current State

This file records the starting point used to create the migration plan. Update
it only when a new audit establishes a different fact; implementation progress
belongs in [STATUS.md](STATUS.md).

## Target release

The approved target is the exact `dspace-10.0` release tag for both components.
DSpace 10.1 documentation was still a work in progress when this plan was
created and is not the migration target.

The official DSpace 10 upgrade guide contains a stale introductory reference to
"DSpace 8.x," but its DSpace 10 release notes, commands, and current release
artifacts establish DSpace 10.0 as the correct target.

## Frontend audit

Repository: `/Users/samil/uni_digital_repository`

- Branch: `main`, tracking `origin/main`
- Commit: `7f6cb862c939373919d7a02a06812a327209d5b9`
- Declared version: `9.2.0`
- Base release tag in history: official frontend `dspace-9.2`
- Current Node: 20.20.2
- Current npm: 10.8.2
- Package requirement: Node `>=20.0.0 <25.0.0`
- Angular: 20.3.x
- Working tree was clean during audit

### Hybrid-tree finding

The frontend is not a conventional customized 9.2 tree. A three-way comparison
of the 9.2 base, current `HEAD`, and official 10.0 found:

- 2,022 files unchanged and already equal to 10.0
- 2,148 files unchanged from 9.2 but needing official 10.0 updates
- 457 target-added files already byte-identical to 10.0
- 333 old 9.2 files retained even though 10.0 deletes them
- 58 required 10.0 files missing from the current tree
- 91 existing files changed locally relative to both releases
- 24 local-only additions

This mixture is the primary reason for requiring a clean 10.0 baseline.

### Frontend customizations to evaluate and selectively port

- `config/config.yml`
- `src/index.html` SEO, icons, canonical URL, and JSON-LD
- Branding under `src/assets/images/`
- Possible unused duplicates under `src/assets/custom/images/`
- `src/themes/custom/app/header/`
- `src/themes/custom/app/navbar/`
- `src/themes/custom/app/search-navbar/`
- `src/themes/custom/app/footer/`, including `footer-v2`
- `src/themes/custom/app/home-page/`
- `src/themes/custom/app/info/end-user-agreement/`
- `src/themes/custom/styles/`
- `src/themes/custom/assets/i18n/en.json5`
- Theme component registration files
- UI support for custom browse `contains`
- UIST-specific portions of `src/app/core/metadata/head-tag.service.ts`

Core files such as `app.config.ts`, browser/server translation loaders,
redirect services, default application configuration, and `angular.json` are
conflict candidates. They must be reviewed semantically and must not be copied
wholesale.

### Frontend configuration hazards

- Current tracked `config.yml` targets localhost REST.
- DSpace 10 requires frontend `ui.baseUrl` to match backend `dspace.ui.url` for
  SSR, redirects, and `robots.txt`.
- Current canonical and OpenGraph repository URLs in `src/index.html` use HTTP
  and must be changed to the real HTTPS production URL.
- The current tree contains both old theme modules and newer component-list
  files. DSpace 10 must use its official theme registration model.
- The current custom theme has no UIST-owned component test suite.

## Backend audit

Repository: `/Users/samil/uni_digital_repository_backend`

- Branch: `main`, tracking `origin/main`
- Commit: `252bfffa77`
- Exact clean baseline: official backend `dspace-9.2` commit `b3cae7bf30`
- Current Java: Temurin 17.0.8
- Current Maven: 3.9.15
- PostgreSQL Compose default: 15
- Solr Compose default: 9.8
- Working tree was clean during audit

The current effective delta from the official 9.2 baseline is small: custom
browse behavior, Compose/tag/branding changes, and optional import tooling.

### Custom browse source files

- `dspace-api/src/main/java/org/dspace/browse/BrowseDAO.java`
- `dspace-api/src/main/java/org/dspace/browse/BrowseEngine.java`
- `dspace-api/src/main/java/org/dspace/browse/BrowserScope.java`
- `dspace-api/src/main/java/org/dspace/browse/SolrBrowseDAO.java`
- `dspace-server-webapp/src/main/java/org/dspace/app/rest/repository/BrowseEntryLinkRepository.java`
- `dspace-server-webapp/src/main/java/org/dspace/app/rest/repository/BrowseItemLinkRepository.java`

DSpace 10 modifies the same browse areas to add/refactor date browsing. The
custom code must therefore be reimplemented against the DSpace 10 source rather
than cherry-picked or copied.

The pre-port current `main` author `contains` implementation loaded all author
facets and filtered them in Java. The D10 target removed that unsafe behavior;
exact bounded Author-entry substring matching now requires the D-011 indexing
decision and production-scale staging evidence.

### Backend runtime hazards

- DSpace 10 requires Java 21.
- DSpace 10 Dockerfiles and CLI entrypoint behavior differ from the current
  files; use official 10.0 files as the baseline.
- DSpace 10 adds a Solr `audit` core.
- DSpace 10's `search` schema is incompatible with the old search index.
- The existing Compose entrypoint runs plain `database migrate` automatically.
- Compose exposes backend, debugger, PostgreSQL, and Solr ports and uses a
  development database password. Treat it as development/test configuration.
- Fixed container names prevent a second stack on the same host without
  overrides.
- Ignored `dspace/config/local.cfg` contains SMTP configuration and credentials.
- The current custom browse behavior has no added regression tests.

## Unknown production facts to collect in Phase 0

- Whether production uses these Compose files, Tomcat, runnable JAR, PM2,
  systemd, Kubernetes, or another deployment model
- Actual production URLs and proxy layout
- Database, assetstore, and Solr sizes
- Historic reindex duration and restore duration
- Authentication providers and test accounts
- DOI, Handle, OAI, SWORD, S3, antivirus, analytics, and external-provider use
- Cron/background-job inventory
- Recovery time objective, recovery point objective, and acceptable downtime
- Available staging capacity and whether it can run on a separate host

## Implementation-start audit (2026-08-20; superseded by P1 handoff below)

The source baselines were revalidated before implementation:

- Frontend remains on `main` at
  `7f6cb862c939373919d7a02a06812a327209d5b9`, synchronized with `origin/main`.
  Its only current status entry is the intentionally preserved untracked
  `docs/dspace-10-migration/` directory. The existing separate 9.2 worktree is
  `/Users/samil/uni_digital_repository-9.2`; the DSpace 10 target worktree is
  recorded in the P1 handoff below.
- Backend remains on `main` at
  `252bfffa77de93e7a4280e43e55478c3d2ab4b1f`, synchronized with `origin/main`,
  and clean. Official 9.2 commit
  `b3cae7bf301e2a5cdd61e9dcfa9ee6ee595a3872` is an ancestor.
- The backend 9.2-to-current delta contains 19 files: six browse Java files,
  eight Docker/Compose files, `docker-compose.import.yml`, and four import/data
  artifacts. It adds no browse regression tests.
- Official `dspace-10.0` tags were remotely available and their verified peeled
  commits were recorded as frontend
  `7f59f6cf99f0d1fb4b2abe46e9f24a5e1ee01a49` and backend
  `465195f7593cf812fe16efaa1685a9a58823243c`.
- The frontend already had the canonical `official` remote. The backend needed
  the canonical DSpace remote at this audit point; it is now configured for
  Phase 1.
- Current frontend runtime is Node `20.20.2` and npm `10.8.2`. The current
  `main` backend runtime was Java `17.0.8` and Maven `3.9.15`; P1 target builds
  now explicitly select installed Java 21 and Ant.
- At this audit point Docker CLI/Compose were installed but the daemon was
  unavailable. Static source inspection confirmed fixed legacy container
  names, named data volumes, six pre-10 Solr cores, and the unsafe automatic
  plain migration entrypoint. The later live read-only inventory is recorded
  in the P1 handoff below.
- No filesystem-backed isolated staging database, assetstore, or Solr dataset
  was found. P1 live inventory additionally confirms no DSpace Docker
  containers, networks, or named volumes.
- The ignored `dspace/config/local.cfg` exists as a mode-`0600` file and remains
  ignored. Only file metadata was inspected; no value was read or exposed.

## P1 baseline handoff audit (2026-08-20)

The current `main` references remain unchanged and are preserved by these
read-only backup refs:

- Frontend `backup/pre-dspace-10-ui` ->
  `7f6cb862c939373919d7a02a06812a327209d5b9`
- Backend `backup/pre-dspace-10-backend` ->
  `252bfffa77de93e7a4280e43e55478c3d2ab4b1f`

The target worktrees are:

- Frontend `/Users/samil/uni_digital_repository_v10`, branch
  `codex/dspace-10-uist`, HEAD
  `7f59f6cf99f0d1fb4b2abe46e9f24a5e1ee01a49`
- Backend `/Users/samil/uni_digital_repository_backend_v10`, branch
  `codex/dspace-10-port`, HEAD
  `465195f7593cf812fe16efaa1685a9a58823243c`

Both target HEADs are the verified peeled commits for the official
`dspace-10.0` tags. Source-only P2/P3 implementation now exists as unstaged
diffs in those worktrees; the HEAD commits themselves remain unchanged.

### P1 runtime and build evidence

- DSpace 10 backend prerequisites are installed: Homebrew OpenJDK
  `21.0.12.1`, Maven `3.9.15`, and Apache Ant `1.10.17`. Target build commands
  selected Java 21 explicitly with
  `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`.
- The untouched backend `mvn -U clean package` completed for all 15 modules in
  385.62 seconds. The explicit unit-test lifecycle completed in 808.50 seconds:
  1,658 tests with 11 skips and zero failures or errors. The default package
  lifecycle's `skipUnitTests=true` was not treated as test evidence.
- The untouched frontend meets its Node engine requirement with Node
  `20.20.2` and npm `10.8.2`. `npm clean-install`, `npm run build:lint`,
  `npm run test:lint:nobuild`, `npm run lint`,
  `npm run check-circ-deps`, and `npm run build:prod` passed. Recorded wall
  times were 64.30 s, 2.57 s, 3.54 s, 197.87 s, 18.97 s, and 448.81 s,
  respectively. The lint test ran 169 specs; lint emitted warnings but no
  errors; circular-dependency checking reported none.
- `npm run test:headless` took 293.56 seconds, completed 5,924 tests
  successfully, skipped 2, and failed 2 locale assertions. Chrome Headless 151 reports
  `navigator.languages = en-GB,en-US,en`, yielding
  `en-GB;q=1`, `en-US;q=0.9`, `en;q=0.8` instead of the test's expected
  `en-US`/`en` sequence. Both environment-only attempts to force en-US still
  reported the en-GB chain, so it cannot be normalized without changing test
  or application behavior. The Node `26.0.0`/npm `11.12.1` attempt is outside
  the `>=20.0.0 <25.0.0` engine range and is invalid baseline evidence.
- Compose config validation passed for the four frontend Compose files
  (`docker-compose.yml`, `docker-compose-dist.yml`, `docker-compose-rest.yml`,
  `docker-compose-ci.yml`) and the two backend files (`docker-compose.yml`,
  `docker-compose-cli.yml`).

### P1 topology and three-way findings

Docker server `29.4.1` is available. A read-only inventory found only the
unrelated Azurite container `dobi-puck-azurite` and volume
`dobi-puck-azurite-data` (plus default Docker networks); there are no DSpace
containers, networks, or named volumes. No isolated filesystem-backed
staging database, assetstore, or Solr dataset exists.

Artifact-only Docker builds, with no containers started, produced clean ARM64
baseline images for the backend, CLI, and Solr definitions:

- Backend: `sha256:09d6b0df5c7477537ef3a73343987dec2dbb4b589d4d6ffe70a797f8caaad863`
  (1,009,636,642 bytes; Temurin Java `21.0.11`).
- CLI: `sha256:9c100e9e454ce4de38affe8f2ede223fd0850601ffc42ecded7f65346d6b8e62`
  (732,293,101 bytes; Temurin Java `21.0.11`; `classpath` command verified).
- Solr: `sha256:e506291bc3e382abc6b65a3f7c67bb9b032f5eba37e8ff4e62e7ece78c7cce5f`
  (687,072,934 bytes; Solr `9.8.1`; all seven DSpace configsets including
  `audit` present).

The untouched frontend `Dockerfile.dist` did not produce an image. Docker
Desktop exposed 4,108,554,240 bytes of memory, and its in-container production
compile was killed after 106.2 seconds with `cannot allocate memory`. The same
production browser/SSR build passes natively with supported Node 20, so the
container result is an environment-capacity failure. The Dockerfile also
swallows an early `build:lint` error caused by running the package postinstall
before `lint/tsconfig.json` is copied; the separate native lint baseline is the
valid lint evidence.

The agent three-way reviews establish these high-level facts:

- The hybrid frontend's browse behavior now uses an explicit logical
  capability: only Title emits `contains`; Author, Subject, and custom text
  browses retain `startsWith`.
- The backend source-review fix uses the logical capability configured by
  `webui.browse.index.title.contains = title`, independent of generated
  `bi_*` names and output sort. DSpace 10 `dateStartsWith` and partial Author
  `filterValue` remain preserved.
- The previous unbounded Author facet implementation (`limit=-1` plus Java
  filtering) was removed. Exact bounded Author entry substring matching is
  not implemented and remains a D-011 design/staging gate.

The two pristine frontend locale failures were resolved for deterministic test
execution by mocking the browser language in the test fixture, with no
production locale behavior change. D-020 is `ACCEPTED/RESOLVED`; source-review
verification is still in progress. Operational staging, backup/restore, data,
cutover, and production-approval gates remain open.

## Source-only P2/P3 implementation audit (2026-08-20)

The isolated DSpace 10 worktrees remain at the exact official baseline HEADs
listed above and now contain unstaged implementation diffs. The current
frontend and backend `main` repositories remain untouched. No containers,
Compose stacks, databases, Solr cores, assetstores, or production services
were started.

### Backend implementation and review-fix facts

- The review fix changes `BrowseDAO.java`, `BrowseEngine.java`,
  `BrowseIndex.java`, `BrowserScope.java`, `SolrBrowseDAO.java`,
  `BrowseEntryLinkRepository.java`, `BrowseItemLinkRepository.java`,
  `BrowseContainsCapability.java`, `dspace.cfg`, and the browse integration
  and capability-unit tests.
- Only the explicitly configured logical Title capability emits/uses
  `contains`. Author entry, Subject, and custom metadata browses remain
  `startsWith`; DSpace 10 `dateStartsWith` and partial Author `filterValue`
  remain intact.
- Unbounded Author facet retrieval, `limit=-1`, and Java full-vocabulary
  filtering are removed. Exact bounded Author entry substring matching needs
  an approved entry-level Solr index/schema/config/deployment design and a
  mandatory reindex. D-011 remains OPEN and staging is blocked.
- Current verification: Java 21 checkstyle is green, capability unit tests pass
  5/5, and the 15-module package succeeds in 18.919 seconds. The full
  `mvn install -DskipUnitTests=false` reactor succeeds in 6:48 with 1,663 test
  invocations, 11 skips, and zero failures/errors. A clean targeted
  `BrowsesResourceControllerIT` run passes 30/30 in 50.57 seconds (1:34 Maven
  total). These results validate the conservative Title-only contract, not an
  Author substring implementation.
- The follow-up capability contract is server-owned: `BrowseIndexRest` exposes
  `supportsContains`, Angular deserializes that property, and unsupported
  nonblank `contains` requests return HTTP 400 instead of an unfiltered browse.

### Frontend implementation and review-fix facts

- The minimal `uist` theme contains HomePage, Header, Navbar,
  Footer-v2-as-Footer, and HomeNews. HomePage is included in eager
  registration, and legacy listable overrides are intentionally empty.
- UIST assets, safe local configuration, explicit public-HTTPS SEO, i18n, and
  the logical-capability browse UI/service/routes/tests are present. Only
  Title uses `contains`; Author, Subject, and custom text browses retain
  `startsWith`.
- Current verification under Node 20: focused frontend tests pass
  121/121 and the agent focused set passes 69/69; `build:lint` and
  `test:lint:nobuild` pass all 169 specs; full lint has 0 errors and 1,506
  warnings; circular-dependency checking covers 3,310 files with no cycles;
  the final full headless suite passes 5,950 tests with 2 skipped; and the production
  browser plus SSR build succeeds with warnings.
- The reported trailing whitespace in the untracked UIST homepage stylesheet
  is removed; a direct scan covers untracked `src/themes/uist` files because
  `git diff --check` alone does not inspect them.

### Configuration and SEO safety facts

- Tracked target defaults are localhost-only and document the DSPACE_* UI,
  browser REST, and internal SSR REST override interface:
  `DSPACE_UI_BASEURL`, `DSPACE_REST_SSL`, `DSPACE_REST_HOST`,
  `DSPACE_REST_PORT`, `DSPACE_REST_NAMESPACE`, and
  `DSPACE_REST_SSRBASEURL`. Production/staging endpoints are not defaults.
- `HeadTagService` emits canonical, `og:url`, and JSON-LD URL fields only from
  an explicitly configured non-local HTTPS `ui.baseUrl`; it has no hardcoded
  production fallback and must not expose an internal SSR REST hostname.

### Operational boundary

The source-review fixes do not establish staging or production readiness.
Docker/Compose topology, isolated database/assetstore/Solr data, backup/restore
rehearsal, production URLs and proxy routing, integration inventory, RTO/RPO,
and performance validation remain unverified. D-011 requires a bounded
entry-level Author index design, mandatory reindex, and staging validation
before Author `contains` can be reconsidered.
