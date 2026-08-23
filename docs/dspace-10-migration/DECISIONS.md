# Migration Decisions and Open Questions

This file prevents important context from being lost between sessions. Add one
entry for every choice that materially affects source, behavior, data,
operations, security, schedule, or rollback.

Never record secrets or sensitive production values here.

## Accepted decisions

### D-001: target DSpace 10.0 exactly

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: Use official `dspace-10.0` tags for both backend and frontend.
- Reason: DSpace 10.0 is the current stable major release; matching versions are
  required by the release documentation.

### D-002: use clean target baselines

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: Create new migration branches/worktrees from official 10.0 tags.
  Do not merge or rebase current `main` branches onto 10.0.
- Reason: Frontend is a hybrid 9.2/10 tree; backend history has a reset/merge
  detour. Clean baselines avoid stale/deleted files and irrelevant conflicts.

### D-003: port UIST behavior selectively

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: Port small, documented concerns in separate commits. Do not bulk
  copy source, theme, configuration, Docker, or lockfile trees.

### D-004: keep backend and UI releases matched

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: Deploy and roll back backend and frontend as a matched pair.

### D-005: control the 9.2 to 10.0 database migration manually

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: With backend stopped, run DSpace 10 `database info` followed by
  `database migrate ignored`. Do not rely on the current Compose entrypoint's
  plain `database migrate`.

### D-006: rebuild DSpace 10 search and add audit core

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: Install DSpace 10 Solr configsets, create/verify `audit`, clear the
  incompatible `search` index, restart Solr, and run a full discovery rebuild.

### D-007: exclude import tooling from upgrade execution

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: `docker-compose.import.yml` and `imports/` may remain as clearly
  documented developer/bootstrap tools but must never run during migration or
  cutover.

### D-008: rollback by paired restore

- Status: ACCEPTED
- Date: 2026-08-18
- Decision: Rollback restores matching 9.2 database, assetstore,
  configuration/Solr state, backend, and frontend. No reverse Flyway migration.

### D-017: migration branch and worktree names

- Status: ACCEPTED
- Date: 2026-08-20
- Decision: Use frontend branch `codex/dspace-10-uist` in sibling worktree
  `/Users/samil/uni_digital_repository_v10` and backend branch
  `codex/dspace-10-port` in sibling worktree
  `/Users/samil/uni_digital_repository_backend_v10`.
- Reason: The frontend name distinguishes the selective UIST theme port from
  the backend semantic port and resolves the older documentation's conflicting
  frontend `codex/dspace-10-port` example.

### D-018: pin baseline provenance to peeled tag commits

- Status: ACCEPTED
- Date: 2026-08-20
- Decision: Verify both annotated `dspace-10.0` tags against their peeled
  commits before creating worktrees: frontend
  `7f59f6cf99f0d1fb4b2abe46e9f24a5e1ee01a49`, backend
  `465195f7593cf812fe16efaa1685a9a58823243c`.
- Reason: A tag name alone is weaker provenance than the immutable target
  commit verified directly from each canonical remote.

### D-019: separate source-only and operational Phase 0 gates

- Status: ACCEPTED
- Date: 2026-08-20
- Decision: Permit isolated source-only Phase 1 baseline work after both source
  revisions and official targets are verified. Keep all Compose startup,
  staging-data, database, Solr, deployment, and production activity blocked
  until staging isolation and the remaining operational Phase 0 inventory are
  approved.
- Reason: Local code acquisition/build work cannot affect repository data or
  production, while the missing topology, backup, owner, URL, integration,
  RTO/RPO, and Docker-volume facts are material to any service/data operation.
- Consequence: A successful source build is not approval to start services or
  migrate data.

### D-020: deterministic frontend locale test fixture

- Status: ACCEPTED/RESOLVED
- Date: 2026-08-20
- Owner: Repository owner/frontend engineer
- Context: The untouched official DSpace 10 frontend passes the supported
  Node 20 install, lint, circular-dependency, and production SSR checks, but
  Chrome Headless 151 reports `en-GB,en-US,en`. Two pristine
  `LocaleService.getLanguageCodeList` assertions therefore fail because the
  observed chain is `en-GB;q=1`, `en-US;q=0.9`, `en;q=0.8` rather than the
  hard-coded `en-US`/`en` sequence. Environment-only attempts to force en-US
  did not change the browser preference chain.
- Options considered: Normalize Chrome externally; change production locale
  behavior; change the test fixture; or accept a known baseline defect.
- Decision: Mock the browser language in the deterministic locale test fixture.
  Production application behavior is unchanged. The earlier focused
  contains/locale tests pass 45/45. The final post-review supported-Node-20
  headless run passes 5,950 tests with 2 skipped, confirming the fixture remains
  deterministic within the complete suite.
- Reason: The browser preference chain is environment-dependent, while the
  test requires a stable fixture. The change isolates test setup without
  weakening production behavior.
- Consequences/risks: The pristine failure remains historical baseline
  evidence, but it is no longer an implementation gate. Full staging and
  production approval still require the independent operational gates.
- Required implementation/tests: Keep the fixture explicit and rerun the
  supported Node 20 headless suite when the test environment changes.
- Supersedes/superseded by: None.

## Decisions and operational questions

### D-009: create a minimal `uist` frontend theme

- Status: ACCEPTED
- Date: 2026-08-20
- Owner: Frontend/repository owner
- Decision: Create `src/themes/uist` and port only actual UIST overrides instead
  of continuing with the complete stock `custom` scaffold. The implemented
  eager set is HomePage, Header, Navbar, Footer-v2-as-Footer, and HomeNews;
  legacy listable overrides are intentionally empty.
- Reason: Smaller future upgrade surface and clearer ownership.
- Consequence: The source-only P3 theme implementation is complete in the
  isolated target worktree; visual, staging, and production acceptance remain
  separate gates.

### D-010: custom browse precedence

- Status: ACCEPTED
- Date: 2026-08-20
- Owner: Repository owner/backend/frontend engineers
- Decision: Preserve `contains` precedence when both parameters are supplied.
  UIST Author and Title are contains-only interactions; Subject and custom
  metadata browses retain `startsWith`. DSpace 10 `dateStartsWith` and partial
  Author `filterValue` remain preserved. Legacy `startsWith` input may be read
  for compatibility, but submitting Author or Title clears it and writes only
  `contains`.
- Implementation: The backend uses explicit
  `webui.browse.index.title.contains = title` and
  `webui.browse.index.author.contains = author`, independent of generated
  `bi_*` names and output sort. `BrowseIndexRest` publishes the derived
  `supportsContains` flag. The UIST frontend also has an explicit Author/Title
  product contract, so it must be deployed only with a populated and publicly
  enabled Author core. Other definitions follow the REST capability.
- Consequence: A fresh backend defaults Author indexing and public access off;
  enabling the UIST frontend without completing the D-011 activation sequence
  can expose a form whose request receives HTTP 400. Frontend/backend rollout
  must therefore be coordinated.

### D-011: author contains performance strategy

- Status: SOURCE IMPLEMENTED; LOCAL ISOLATED RUNTIME SMOKE PROVED; STAGING ACCEPTANCE OPEN
- Owner: Backend engineer/repository owner
- Current status: The unbounded implementation has been removed. No
  `limit=-1`, full Author facet vocabulary retrieval, or Java-side full-list
  filtering is permitted. The dedicated core was populated and public Author
  `contains` was enabled only in the isolated local `dspace10test` runtime;
  fresh deployment defaults remain disabled.
- Decision: Use a dedicated `browse-author` Solr core with one Author-entry
  document per Item entry, normalized substring/ngram indexing, bounded JSON
  Facet paging, exact bucket totals, copied Discovery ACL/scope fields, and the
  registered Discovery search-plugin authorization pipeline.
- Required design/approval: Define schema/configuration/deployment changes,
  normalization and escaping, mandatory full reindex, and exact behavior for
  totals/pages, ascending/descending ordering, community/collection scope,
  frequencies, authority keys, empty/whitespace/special/Unicode input,
  case-folding, and deleted values. Add proof that the Solr request is bounded
  and test all cases before reopening the capability.
- Consequence: D-011 runtime acceptance remains OPEN; isolated staging and
  production approval are blocked. A result cap or fake pagination is not an
  acceptable fix.

#### D-011 implementation candidate: dedicated `browse-author` core

The source target contains the dedicated-core implementation. It does **not**
re-enable Author contains by default:

- `browse-author` reuses the Search core configset and stores one document per
  distinct Author browse entry per Item. Each document includes the exact
  existing facet payload (display value, normalized sort value, and authority),
  collection/community locations, visibility/version fields, and the standard
  Discovery `read`/`admin` access fields. Its query runs the same registered
  Discovery search-plugin pipeline as the Search core.
- Its `*_ngram` field indexes normalized sort and display values separately, so
  a substring cannot accidentally cross a synthetic field boundary or match an
  authority key. JSON Facet supplies a bounded page and `numBuckets` supplies
  the exact total; frequency is the number of matching Item-entry documents.
- Item index writes delete/recreate that Item's entry documents with a bounded
  `commitWithin`; Item unindex deletes them. This means the core must be
  available before enabling it and a complete reindex is mandatory.
- Keep `discovery.browse-author.enabled = false` while the core is initialized
  and reindexed. Set `discovery.browse-author.indexing-enabled = true` first,
  run the full reindex and an explicit final commit/health check, then enable
  the public flag. Keep the indexing flag true after public enablement (and
  during a temporary public rollback) so item updates and unindexes cannot
  leave stale Author entries. The REST `supportsContains` contract follows
  only the public flag, preventing a UI from advertising a partially populated
  index.

Before acceptance, staging must initialize `browse-author`, enable its
index-maintenance flag while its public flag remains false, run a full
Discovery reindex, issue a final Solr commit, and prove
multi-page totals/order/frequency/authority output for site, collection, and
community scopes. It must also benchmark one-character and common substring
queries against production-scale Author data: the current schema deliberately
uses `minGramSize=1` for 9.2-compatible single-character behavior, which may
increase index size and query cost. Do not enable it in production without that
evidence and an approved rollback that disables the flag and retains the core
for diagnosis.

On 2026-08-23, the controlled sequence was smoke-tested in local Compose
project `dspace10test`: indexing was enabled while public access was disabled,
full `index-discovery -b` and an explicit Solr commit completed, and the backend
was restarted with both flags enabled. The core contained 524 documents; REST
advertised `supportsContains=true`; `contains=Sefidanoski` returned A.
Sefidanoski (8) and M. Sefidanoski (5). Compose maps
`BROWSE_AUTHOR_INDEXING_ENABLED` and `BROWSE_AUTHOR_ENABLED` to these flags,
both defaulting to false. This proves local function only and does not replace
the staging acceptance matrix above.

### D-021: UIST public browse and hierarchy

- Status: ACCEPTED
- Date: 2026-08-23
- Owner: Repository owner/frontend engineer
- Decision: Public UIST browse navigation exposes only Issue Date, Author, and
  Title. Author and Title use contains-only forms. Subject and Subject Category
  are absent from the navbar and community/collection browse tabs. Communities
  & Collections is an in-place responsive dropdown: desktop uses a hover/focus
  community list with right-hand collection flyouts, while mobile uses
  click-to-expand nested groups. The desktop hierarchy uses the same slide
  animation as All of UIST, clips content to its white panel during that
  animation, and uses a hover bridge across the community/flyout gutter. All
  of UIST follows the same desktop-hover and mobile-click
  interaction. Mobile labels wrap and align left. Mobile top-level dropdowns
  are mutually exclusive,
  close/open in a single tap, clear nested expansion state on close, and retain
  native button keyboard activation. The mobile sidebar is viewport-bounded
  and vertically scrollable. A View-all hierarchy link remains available.
- Consequence: Backend browse definitions and direct Subject URLs remain
  available, but are intentionally not public navigation choices. The dropdown
  makes one bounded collection request per displayed top-level community, so
  latency and the 100-community/100-collection limits require staging review.

### D-012: production deployment model

- Status: OPEN
- Owner: Platform/release lead
- Required decision: Identify whether production uses Compose, Tomcat, runnable
  JAR, PM2/systemd, Kubernetes, or another topology. Adapt the runbook only
  after the real topology is documented.

### D-013: staging location and isolation

- Status: OPEN
- Owner: Platform/DBA
- Required decision: Separate host versus non-colliding same-host environment.
  Current fixed Compose container names make same-host parallel stacks unsafe
  without overrides.

### D-014: production URLs and SSR routing

- Status: OPEN
- Owner: Platform/frontend/backend
- Required decision: Record the public UI URL, public REST URL, internal SSR
  REST route, proxy paths, CORS origin, and TLS termination. The current
  target defaults are localhost-only and expose documented DSPACE_* overrides
  for UI, browser REST, and internal SSR REST endpoints. SEO emits canonical,
  `og:url`, and JSON-LD URL fields only when an explicit non-local HTTPS
  `ui.baseUrl` is configured; no production fallback is allowed. Production
  and staging URLs remain deployment decisions, not tracked defaults. Store
  secrets elsewhere.

### D-015: data protection objectives and maintenance window

- Status: OPEN
- Owner: Release lead/DBA/repository owner
- Required decision: RTO, RPO, acceptable downtime, rollback timebox, backup
  retention, and required approvals. Final window must use rehearsal timings
  plus at least 50% contingency.

### D-016: enabled integrations and upgrade-specific settings

- Status: OPEN
- Owner: Repository owner/security/platform
- Required decisions:
  - DOI metadata migration
  - Entity relationship mode
  - Restricted TEXT/LICENSE/SWORD behavior
  - Content-disposition allowlist
  - SHERPA/RoMEO to Open Policy Finder migration
  - Authentication providers
  - OAI/SWORD/Handle/DOI/external-provider test scope

## Decision entry template

```markdown
### D-NNN: short title

- Status: PROPOSED | OPEN | ACCEPTED | SUPERSEDED
- Date:
- Owner:
- Context:
- Options considered:
- Decision:
- Reason:
- Consequences/risks:
- Required implementation/tests:
- Supersedes/superseded by:
```
