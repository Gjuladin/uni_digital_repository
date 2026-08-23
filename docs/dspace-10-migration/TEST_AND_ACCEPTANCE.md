# Test and Acceptance Plan

This document defines the evidence required to move from code completion to
staging, from staging to production, and from maintenance mode to go-live.

## Severity and gate definitions

| Severity | Meaning | Gate behavior |
| --- | --- | --- |
| P0 | Data loss/corruption, migration failure, service inaccessible, auth broken, restricted data exposed, restore/rollback failure | Automatic no-go or immediate rollback |
| P1 | Critical repository workflow, index/interface, scheduled task, or major UI path broken | Blocks production until fixed and retested |
| P2 | Non-critical defect with documented workaround | Requires owner and explicit acceptance |
| P3 | Cosmetic or low-impact follow-up | May be backlogged with owner/date |

## Evidence metadata

Every test report must record:

- Date/time and environment
- Backend/UI commit and image digest
- Database snapshot identifier
- Test operator
- Command or journey
- Expected and actual result
- Logs/screenshots/report link
- Defect ID and severity when failed

Do not attach secrets, production dumps, tokens, or unredacted credential-bearing
configuration.

## T1: source and build acceptance

### Frontend

- Branch starts at official `dspace-10.0`.
- Target `package.json`, lockfile, Dockerfiles, and workflows are preserved except
  for documented site changes.
- No wholesale copy of the hybrid source/theme remains.
- UIST core overrides have owner, reason, and test.

Required commands:

```sh
npm clean-install
npm run build:lint
npm run test:lint:nobuild
npm run lint
npm run check-circ-deps
npm run test:headless
npm run build:prod
```

Current source-review evidence (2026-08-20): focused frontend tests
121/121 and agent-focused tests 69/69 pass; `npm run build:lint` and
`npm run test:lint:nobuild` pass all 169 specs; full lint reports 0 errors and
1,506 warnings; circular-dependency checking covers 3,310 files with no
cycles; the final full headless suite passes 5,950 tests with 2 skipped; and the
production browser plus SSR build succeeds with warnings.

### Backend

- Branch starts at official `dspace-10.0`.
- Build and runtime use Java 21.
- Official DSpace 10 Docker/Compose baseline is retained.
- Custom browse port preserves DSpace 10 date behavior.

Required commands:

```sh
mvn -U clean package

mvn -pl dspace-server-webapp clean verify \
  -DskipUnitTests=true \
  -DskipIntegrationTests=false \
  -Dit.test=BrowsesResourceControllerIT

mvn install -DskipUnitTests=false
```

Gate T1: all required builds and automated tests pass.

Current backend evidence (2026-08-20): Java 21 checkstyle is green, focused
logical-capability unit tests pass 5/5, and the 15-module package succeeds in
18.919 seconds. The full unit reactor passes 1,663 invocations with 11 skips
and zero failures/errors, and the clean targeted browse integration suite
passes 30/30. This validates the Title-only contract; D-011 remains open.
The same integration suite asserts REST `supportsContains` values and HTTP 400
for unsupported Author, Subject, and date `contains` requests. Frontend focused
serialization and browse-consumer coverage passes 19/19.

## T2: logical-capability browse contract

Required backend/API cases:

- Title item non-prefix substring search using the explicit bounded `contains`
  capability
- Author entries retain `startsWith`; Author entry `contains` is unavailable
  until D-011 is resolved
- Partial author item filtering
- Query-parameter preservation in self/next links
- Case behavior
- Empty and encoded input behavior
- Both `startsWith` and `contains`, using the recorded precedence decision
- DSpace 10 `dateStartsWith` regression
- Unsupported Subject/custom metadata browses retain `startsWith` and do not
  emit `contains`

Required frontend cases:

- Input generates the expected REST query
- Query survives pagination
- Query survives reload and browser back/forward navigation
- Title browse renders expected bounded `contains` results
- Author, Subject, and custom metadata browse retain `startsWith`
- Empty input returns intended default behavior
- Error response produces a safe, understandable UI state

Performance and indexing acceptance:

- Exact Author-entry substring matching is not accepted in the current source
  contract. Before enabling it, approve an entry-level Solr schema/config/
  deployment design (dedicated normalized substring/ngram field or proven
  nested-child index), require a full reindex, and prove the request is bounded.
- Required evidence includes exact totals/pages, ascending/descending order,
  community/collection scope, frequencies, authority keys, empty/whitespace/
  special-character input, Unicode/case normalization, and deletion behavior.
- Measure response time, memory/CPU, and result counts against production-scale
  staging data. D-011 remains OPEN; an arbitrary cap or fake pagination is P1.

Gate T2: frontend and backend express the same contract and all cases pass.

## T3: configuration, SSR, and deployment

- Frontend `ui.baseUrl` equals backend `dspace.ui.url` when explicitly
  configured for staging/production; tracked defaults remain localhost-only.
- Public HTML contains only intended public HTTPS URLs. Canonical, `og:url`,
  and JSON-LD URL fields are emitted only for an explicit non-local HTTPS
  `ui.baseUrl`; no hardcoded production fallback is allowed.
- SSR reaches the intended backend route and does not leak internal hostnames.
- Reverse proxy supplies correct `X-Forwarded-*` values.
- TLS chain and redirects are valid.
- CORS allowlist is exact.
- Cookies and CSRF behavior pass login and write flows.
- Secrets are absent from Git, image layers, logs, and rendered configuration.
- PostgreSQL, Solr, debug, and admin ports are not publicly exposed.
- All seven required Solr cores exist and are healthy, including `audit`.
- Images are pinned to approved versions/digests, not `latest`.

Gate T3: platform and security owners approve configuration evidence.

## T4: data integrity and migration

Before and after migration compare:

- Communities
- Collections
- Items
- Bitstreams
- EPeople/users
- Groups
- Workspace/workflow items
- Representative metadata/relationships
- Representative restricted/embargoed resource policies

Validate:

- Backup checksums
- Successful database restore
- Paired assetstore restore
- Sampled bitstream checksums and downloads
- `database info` before/after
- Flyway migration log without unexplained errors
- Search index completion and known-record retrieval
- Solr document/core counts accepted by the repository owner
- OAI import and representative OAI records

Gate T4: no unexplained count, checksum, metadata, permission, or index mismatch.

## T5: functional acceptance matrix

| Area | Required checks |
| --- | --- |
| Public UI/API | `/server/api`, SSR homepage, search, browse, item, community, collection, downloads |
| Authentication | Anonymous, admin login/logout, and every enabled LDAP/OIDC/SAML/Shibboleth/password path |
| Authorization | Restricted/embargoed files, admin boundaries, submitter/workflow permissions, anonymous denial |
| Submission | New submission, metadata, upload, license, save, workflow, approve/reject, edit |
| Administration | User/group management, metadata/admin pages, withdraw/reinstate in staging, process pages |
| DSpace 10 features | Target-only bitstream/custom URL/audit/related routes used by the installation remain reachable |
| Integrations | DOI, Handle, OAI-PMH, SWORD, authority/external providers, mail, antivirus, analytics as enabled |
| Background work | `subscription-send`, media filter, checksum, sitemap, harvesters, reporting, all configured cron/jobs |
| Upgrade-specific | Restricted bundle policy, content disposition, entity relationship mode, DOI migration decision, Open Policy Finder |

Gate T5: every enabled critical function passes or has an approved P2/P3 waiver.

## T6: frontend visual, accessibility, and SEO acceptance

Required viewport matrix:

- Desktop
- Tablet
- Mobile

Required pages:

- Homepage/category cards
- Search and browse
- Community/collection
- Item and bitstream/download
- Login
- Submission
- Admin frame
- End-user agreement
- Mobile navigation

Validate:

- UIST logo, colors, typography, header, navbar, search, footer, and homepage
- No missing images or 404 assets
- Keyboard navigation and visible focus on critical journeys
- Basic screen-reader/semantic heading/landmark check
- No obvious color-contrast regression
- SSR title and description
- HTTPS canonical and OpenGraph URLs only when an explicit non-local HTTPS
  public UI base URL is configured
- Valid JSON-LD
- No hardcoded production fallback or internal REST hostname in SSR metadata
- Correct `robots.txt`, sitemap, and redirects
- Private/non-discoverable pages retain correct no-index behavior

Gate T6: repository administrator approves screenshots and critical journeys;
SEO/SSR automated assertions pass.

## T7: performance and stability

Compare DSpace 10 staging to the captured 9.2 baseline:

- Homepage SSR latency
- Representative item page
- Search and facet query
- Author `startsWith` and bounded Title `contains`
- Bitstream download
- Admin login/page
- Submission save
- Database connections/CPU/locks
- Backend heap and error rate
- Solr heap/query latency
- Reindex throughput and duration

Run representative traffic for an agreed duration and verify no memory leak,
connection leak, escalating error rate, or disk exhaustion.

Gate T7: performance thresholds agreed in Phase 0 are met or explicitly
accepted with capacity/optimization action.

## T8: backup, restore, and rollback

- Final-style backup procedure creates a complete checksummed set.
- Database and paired assetstore restore successfully.
- Known-good 9.2 backend/UI start against the restore.
- Rollback rehearsal completes within RTO.
- Logs and evidence are preserved before restoration.
- Scheduled task state is known and safely resumed.

Gate T8: release lead and platform/DBA approve the measured rollback procedure.

## Production P0 smoke set

Run before reopening public writes:

1. Backend REST root and health.
2. Frontend SSR homepage over public HTTPS.
3. Anonymous search and item page.
4. Public bitstream download and checksum/size sanity.
5. Restricted bitstream denied anonymously.
6. Administrator login/logout.
7. Search/browse returns known records.
8. Author `startsWith` and bounded Title `contains` return expected records;
   Author entry `contains` is not enabled until D-011 approval.
9. Submission/upload/save using an approved production smoke account and
   disposable/clearly managed object, if production policy allows.
10. Solr cores healthy and search rebuild completed or at the approved threshold.
11. No P0 errors in logs, monitoring, TLS, CORS, CSRF, or proxy behavior.
12. Repository administrator signs off.

## Automatic no-go or rollback triggers

- Flyway/database migration error or unexplained schema state
- Database/assetstore mismatch, missing object, or checksum failure
- REST, UI, SSR, admin login, upload, or download P0 failure
- Restricted data visible to an unauthorized/anonymous user
- Solr fails to initialize or rebuild, or indexing stops progressing
- Severe CORS, CSRF, TLS, redirect, or internal-hostname exposure
- Resource exhaustion threatens data integrity or recovery objectives
- Backup restore or rollback procedure cannot meet the agreed RTO
