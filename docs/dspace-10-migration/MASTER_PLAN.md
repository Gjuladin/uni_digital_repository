# DSpace 10 Migration Master Plan

## Objective

Deliver matching, production-ready UIST backend and frontend artifacts based on
the official `dspace-10.0` tags; migrate production data through a rehearsed and
reversible maintenance-window procedure; and preserve validated UIST behavior.

## High-level dependency chain

```text
P0 inventory and freeze
  -> P1 clean official 10.0 baselines
       -> [F frontend port || B backend port || O staging preparation]
            -> P3 backend/frontend integration
                 -> P4 backup and restore drill
                      -> P5 full staging rehearsal and rollback drill
                           -> P6 production go/no-go
                                -> P7 production cutover
                                     -> P8 hypercare and closeout
```

## Roles

| Role | Accountable work |
| --- | --- |
| Release lead | Schedule, approvals, change freeze, communications, and decision log |
| Frontend engineer | UI baseline, theme/config/SEO port, UI tests, and visual evidence |
| Backend engineer | Browse port, Java/Docker/configuration work, API tests, and migration tooling |
| Platform/DBA | Runtime, database, assetstore, Solr, backup/restore, deployment, and monitoring |
| QA/repository administrator | Functional/data acceptance and production smoke approval |
| Security reviewer | Secrets, TLS, proxy, CORS, authorization, and vulnerability review |

## Phase P0: inventory and change freeze

Estimated effort: 1-2 engineer-days.

Tasks:

- Assign all roles and escalation contacts.
- Record current branches, commits, image digests, runtime versions, and
  deployment topology.
- Measure database, assetstore, Solr, item, bitstream, and user scale.
- Inventory configuration, secrets, integrations, proxy/TLS, and scheduled
  tasks.
- Capture current functional, data-count, security, and performance baselines.
- Define RTO, RPO, downtime tolerance, and production rollback timebox.
- Freeze unrelated changes until clean migration branches exist.
- Resolve the blocking open decisions in [DECISIONS.md](DECISIONS.md).

Exit gate:

- Inventory is approved.
- Backup locations and staging capacity are confirmed.
- Current behavior and critical workflows are documented.
- Production implementation has an accountable release lead.

## Phase P1: clean official 10.0 baselines

Estimated effort: 0.5-1 day. Frontend and backend run in parallel.

### Frontend setup

```sh
cd /Users/samil/uni_digital_repository
git branch backup/pre-dspace-10-ui main
git fetch official --tags
git worktree add ../uni_digital_repository_v10 \
  -b codex/dspace-10-port dspace-10.0
```

Build and test the untouched release before customization.

### Backend setup

```sh
cd /Users/samil/uni_digital_repository_backend
git branch backup/pre-dspace-10-backend main
git remote add official https://github.com/DSpace/DSpace.git
git fetch official --tags
git worktree add ../uni_digital_repository_backend_v10 \
  -b codex/dspace-10-port dspace-10.0
```

Build the untouched backend using Java 21.

Exit gate:

- Both untouched official tags build successfully.
- Baseline test evidence is recorded.
- No UIST changes were introduced before the baseline passed.

## Phase P2: parallel implementation

### Frontend track

Follow [FRONTEND_WORKSTREAM.md](FRONTEND_WORKSTREAM.md).

Primary deliverables:

- Small UIST delta on official frontend 10.0
- DSpace 10-compatible theme and configuration
- UIST branding, homepage, navigation, footer, SEO, and browse behavior
- Automated and visual regression evidence

Estimated effort: 9-16 engineer-days.

### Backend track

Follow [BACKEND_WORKSTREAM.md](BACKEND_WORKSTREAM.md).

Primary deliverables:

- Small UIST delta on official backend 10.0
- DSpace 10-compatible custom browse behavior
- Java 21 and upstream DSpace 10 Docker/runtime configuration
- Browse integration tests

Estimated effort: 5-8 engineer-days including staging-data support.

### Platform/staging track

Can proceed while code is ported:

- Provision isolated Java 21/PostgreSQL 15/Solr 9.8/Node 20.19+ staging.
- Use non-colliding container names, networks, ports, and volumes.
- Reproduce production proxy, TLS, SSR routing, permissions, and monitoring.
- Prepare secure configuration and secret injection.
- Prepare backup, restore, evidence, and rollback tooling.

Exit gate:

- Both artifacts build from exact 10.0 tags.
- UIST changes are small, documented, reviewed, and tested.
- Staging is isolated and production-equivalent for relevant behavior.

## Phase P3: backend/frontend integration

Estimated effort: 1-2 days.

Tasks:

- Finalize the REST contract for custom `contains` browsing.
- Confirm exact backend/UI tag and image pairing.
- Confirm public/internal URL, SSR, proxy, TLS, CORS, and CSRF behavior.
- Run frontend against the upgraded backend.
- Verify target-only DSpace 10 routes/features remain reachable.
- Resolve all P0/P1 defects from [TEST_AND_ACCEPTANCE.md](TEST_AND_ACCEPTANCE.md).

Exit gate:

- UI uses only the matching DSpace 10 REST API.
- SSR does not expose internal URLs.
- Critical functional and authorization checks pass.

## Phase P4: backup and restore drill

Estimated effort: 1-2 days plus data-transfer time.

Follow the backup and restore sections of [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md).

The gate requires a demonstrated restore of a paired database and assetstore,
not only the creation of backup files.

Exit gate:

- Checksummed backup set exists.
- Restored 9.2 application passes login, search, sample download, and data-count
  checks.
- Restore duration is recorded and fits the recovery objective.

## Phase P5: full staging rehearsal

Estimated effort: 1-3 days plus reindex duration.

Run the complete production sequence against a recent production clone:

- Quiesce writes.
- Restore paired data.
- Run controlled Flyway migration with `database migrate ignored`.
- Install DSpace 10 Solr configsets and create `audit`.
- Clear and rebuild `search`.
- Start matching backend and UI artifacts.
- Execute the complete acceptance matrix.
- Execute and time rollback to the known-good 9.2 pair.

Prefer two rehearsals because both custom Java and a significant custom theme
are involved.

Exit gate:

- Migration and rollback complete without unexplained errors.
- P0/P1 tests pass.
- Measured timings and resource use are recorded.
- Production window equals measured duration plus at least 50% contingency.

## Phase P6: production go/no-go

All of the following are required:

- Exact approved backend and UI artifact hashes
- Successful CI and staging test reports
- Successful backup restore and rollback rehearsal
- Repository administrator functional/visual approval
- Security and configuration approval
- Sufficient storage, memory, and monitoring headroom
- Final configuration diff and secret-injection verification
- Approved maintenance communications and rollback owner

Any P0 failure defined in [TEST_AND_ACCEPTANCE.md](TEST_AND_ACCEPTANCE.md) is an
automatic no-go.

## Phase P7: production cutover

Use [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) without improvising the order.

Provisional duration:

- Moderate repository: 2-4 hours
- Large repository or slow reindex: 4-8+ hours

Rehearsal measurements replace these estimates.

## Phase P8: hypercare and closeout

Estimated effort: 1-2 days of elevated monitoring.

Tasks:

- Monitor REST/UI error rate, database load, Solr health, memory, queues, mail,
  scheduled tasks, and index completion.
- Repeat critical data, auth, search, download, submission, and SEO checks.
- Resolve or formally backlog non-critical defects.
- Remove temporary maintenance settings and confirm all intended jobs resumed.
- Archive evidence and update [STATUS.md](STATUS.md).
- Record final operational decisions and deviations in
  [DECISIONS.md](DECISIONS.md).

Closeout gate:

- Stable service throughout the agreed hypercare period
- No unresolved P0/P1 defect
- Backup retention and old-release retirement dates approved
- Runbooks reflect the actual deployed topology

## Overall estimate

With frontend, backend, and platform work running in parallel:

- Engineering effort: approximately 15-24 engineer-days
- Expected elapsed time: approximately 3-4 weeks
- Additional contingency: 5-10 days for undocumented theme behavior,
  integration failures, or production-data anomalies
- Production downtime: determined by rehearsal, provisionally 2-4 hours for a
  moderate repository

