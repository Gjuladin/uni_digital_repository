# Backend and Data Migration Workstream

Repository: `/Users/samil/uni_digital_repository_backend`

Target: official `DSpace/DSpace` tag `dspace-10.0`, paired with the exact
frontend `dspace-10.0` release.

## Core strategy

The effective backend delta from official 9.2 is small, but its Git history
contains an old merge/reset detour. Start at official 10.0 and manually port the
effective final behavior. Do not rebase `main` or cherry-pick its complete
post-9.2 range.

## B0: preserve current state and create target worktree

Estimated effort: 0.5 day.

```sh
cd /Users/samil/uni_digital_repository_backend
git branch backup/pre-dspace-10-backend main
git remote add official https://github.com/DSpace/DSpace.git
git fetch official --tags
git worktree add ../uni_digital_repository_backend_v10 \
  -b codex/dspace-10-port dspace-10.0
```

Use the old tree only as a reference:

```sh
git diff b3cae7bf30..252bfffa77 --stat
```

Gate B0: official 10.0 worktree exists and current `main` remains unchanged.

## B1: prove the untouched backend baseline

Estimated effort: 0.5 day.

Use Java 21 and Maven 3.9+:

```sh
java -version
mvn -version
mvn -U clean package
```

Record versions, command output, duration, and commit.

Gate B1: official 10.0 packages before any UIST change is added.

## B2: port custom browse behavior

Estimated effort: 2.5-4 days including review.

Port intent into the DSpace 10 versions of:

- `dspace-api/src/main/java/org/dspace/browse/BrowseDAO.java`
- `dspace-api/src/main/java/org/dspace/browse/BrowseEngine.java`
- `dspace-api/src/main/java/org/dspace/browse/BrowserScope.java`
- `dspace-api/src/main/java/org/dspace/browse/BrowseIndex.java`
- `dspace-api/src/main/java/org/dspace/browse/BrowseContainsCapability.java`
- `dspace-api/src/main/java/org/dspace/browse/SolrBrowseDAO.java`
- `dspace-server-webapp/src/main/java/org/dspace/app/rest/repository/BrowseEntryLinkRepository.java`
- `dspace-server-webapp/src/main/java/org/dspace/app/rest/repository/BrowseItemLinkRepository.java`
- `dspace/config/dspace.cfg` (logical Title capability configuration)

Required semantic rules:

- Retain DSpace 10 `dateStartsWith` support and partial Author `filterValue`.
- Expose `contains` only through an explicit logical browse capability. The
  current source-review configuration is
  `webui.browse.index.title.contains = title`, independent of generated
  `bi_*` names or the selected output sort.
- Title item `contains` is bounded and case-insensitive after safe escaping.
  Author entry, Subject, and custom metadata browses retain `startsWith`.
- Preserve DSpace 10's `Strings.CS.equals()` and other target API changes.
- When both `contains` and `startsWith` are manually supplied, preserve the
  documented precedence: `contains` wins only for a supported capability;
  unsupported definitions continue ordinary `startsWith` behavior.
- Retain query parameters in generated REST pagination links.

Author design gate:

The unsafe implementation that requested all Author facets (`limit=-1`) and
filtered the complete vocabulary in Java has been removed. Do not replace it
with an arbitrary cap or fake in-memory pagination. Exact bounded Author-entry
substring matching remains D-011 OPEN and requires an approved entry-level
Solr design (dedicated normalized substring/ngram field or proven nested-child
index), schema/config/deployment changes, mandatory reindex, and staging
validation. Until then Author `contains` is deliberately unavailable.

Recommended commit boundary:

```text
feat(browse): port contains filtering to DSpace 10
```

Gate B2: source review confirms that target date behavior remains intact, the
Title-only REST capability is documented for the frontend, and no unbounded
Author facet query remains. D-011 stays open for any future Author-entry
substring capability.

## B3: add backend regression tests

Estimated effort: 1-1.5 days.

Add integration cases to the DSpace 10
`BrowsesResourceControllerIT.java` test suite.

Minimum cases:

1. `GET /api/discover/browses/title/items?contains=Runner`:
   - case-insensitive, non-prefix match
   - correct item and total
   - `contains` preserved in links
2. `GET /api/discover/browses/author/items?filterValue=Smith`:
   - partial author matching remains functional
3. Request containing both `startsWith` and `contains`:
   - asserts the decision recorded in `DECISIONS.md`
4. Author, Subject, and custom metadata entry requests:
   - `contains` is unavailable and ordinary `startsWith` remains intact
5. DSpace 10 date-browse regression:
   - proves the custom port did not break `dateStartsWith`
6. If D-011 is reopened, add bounded Author-entry coverage for multiple pages,
   totals, ordering, scope, frequencies, authority keys, special characters,
   empty/whitespace input, Unicode/case normalization, deletions, and a test
   proving the Solr request is bounded.

Run targeted and complete tests:

```sh
mvn -pl dspace-server-webapp clean verify \
  -DskipUnitTests=true \
  -DskipIntegrationTests=false \
  -Dit.test=BrowsesResourceControllerIT

mvn install -DskipUnitTests=false
```

Gate B3: all tests pass under Java 21 and no target browse regression remains.
The post-fix focused capability unit suite is 5/5; the full 15-module unit
reactor passes 1,663 invocations with 11 skips and zero failures/errors; and a
clean targeted `BrowsesResourceControllerIT` run passes 30/30. D-011 remains a
separate staging gate even though the current Title-only contract is green.
The REST browse representation exposes `supportsContains` from backend
configuration, and both item and entry links reject unsupported nonblank
`contains` parameters with HTTP 400.

## B4: Docker, Compose, and configuration migration

Estimated effort: 0.5-1 day, excluding environment deployment.

Use the official DSpace 10 versions of:

- `Dockerfile`
- `Dockerfile.cli`
- `Dockerfile.test`
- `docker-compose.yml`
- `docker-compose-cli.yml`
- Compose fragments under `dspace/src/main/docker-compose/`

Do not copy the current files over them. Retain DSpace 10's:

- Java 21 base/build images
- Ant/install flow
- Docker/CLI entrypoint behavior
- Environment conventions
- Solr core initialization, including `audit`
- DSpace 10 deployment/config defaults

Reapply only:

- UIST repository name and short name, preferably through deployment
  environment configuration
- Required URL/proxy settings
- Optional `docker-compose.import.yml` and `imports/`, clearly separated as
  non-production bootstrap tools

Do not automatically run the import Compose file. It creates items.

Pin the tested backend, dependency, Solr, and UI artifacts to exact compatible
versions/digests. Do not leave production on `latest`.

Configuration checklist:

- Securely preserve ignored `dspace/config/local.cfg`.
- Start from DSpace 10 configuration examples/defaults.
- Merge only required overrides and renamed settings.
- Keep credentials in approved secret storage.
- Confirm backend `dspace.ui.url` matches frontend `ui.baseUrl`.
- Review content-disposition, entity relationship mode, restricted bundle,
  Open Policy Finder, DOI, mail, auth, OAI, SWORD, proxy, CORS, and scheduler
  settings.

Staging warning:

Current Compose uses fixed container names. Use a separate host or remove/
override fixed names before attempting parallel 9.2 and 10.0 stacks.

Recommended commit boundaries:

```text
chore(runtime): adopt DSpace 10 Docker and Java 21 baseline
chore(config): apply UIST non-secret runtime settings
docs(dev): retain optional sample import tooling
```

Gate B4:

- Fresh DSpace 10 backend and CLI images build.
- CLI accepts DSpace commands.
- All seven required Solr cores exist, including `audit`.
- No secret is added to Git or an image layer.

## B5: code-stage acceptance

Before production-cloned data is introduced:

- Build fresh images from the target commit.
- Run complete unit and integration suites.
- Start disposable PostgreSQL/Solr and initialize a clean repository.
- Verify REST health, admin creation/login, sample submit/download, date browse,
  bounded Title `contains`, and ordinary Author `startsWith` browse behavior.
- Record image hashes and dependency evidence.

Gate B5: immutable backend artifact is approved for the staging data rehearsal.

## B6: staging and production data migration

Data migration is operator-controlled and follows
[OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md). Do not mutate production volumes
while code validation is in progress.

For 9.2 to 10.0 use:

```sh
[dspace]/bin/dspace database info
[dspace]/bin/dspace database migrate ignored
```

Do not substitute plain `database migrate`; that command is for an earlier 10.x
to a later 10.x upgrade in the official guide.

After migration, install DSpace 10 Solr configsets, create `audit`, clear the
incompatible search index, restart Solr, and rebuild discovery.

Gate B6: production-cloned staging migration, reindex, data validation, and
rollback rehearsal all pass before production approval.

## Backend risk register

| Risk | Mitigation |
| --- | --- |
| Custom browse overwrites v10 date behavior | Semantic manual port and date regression test |
| Author entry contains lacks a bounded index | Approve entry-level Solr design, reindex, and staging evidence before enabling |
| Java 17 remains in part of build/runtime | Version checks in CI and container inspection |
| Old Compose auto-runs wrong migration | Operator-controlled CLI migration with backend stopped |
| `audit` Solr core omitted | Explicit core inventory and health assertion |
| SMTP/config lost | Secure preflight inventory and config mapping |
| Import tooling creates duplicate items | Exclude it from upgrade/cutover commands |
| Same-host staging collides with production | Separate host or non-colliding names/networks/volumes |
