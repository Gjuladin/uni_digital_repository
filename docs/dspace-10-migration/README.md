# DSpace 10 Migration Reference Pack

This directory is the durable source of truth for upgrading the UIST Digital
Repository from its current DSpace 9.2-derived state to the matching DSpace
10.0 backend and frontend releases.

The documents cover both repositories:

- Frontend: `/Users/samil/uni_digital_repository`
- Backend: `/Users/samil/uni_digital_repository_backend`

Planning was completed on 2026-08-18. Implementation has not started.

## How to use this pack

An engineer or agent resuming this work should always read:

1. [STATUS.md](STATUS.md) for the current phase, completed work, and immediate
   next action.
2. [CURRENT_STATE.md](CURRENT_STATE.md) for audited versions, commits,
   customizations, and known hazards.
3. The relevant workstream document for the task being performed.

Before running any backend installation, Flyway, Solr, frontend deployment, or
troubleshooting step, also read the matching section of
[OFFICIAL_UPGRADE_GUIDE.md](OFFICIAL_UPGRADE_GUIDE.md). The local operational
runbook remains the authority for how those generic instructions map to these
repositories.

Use the remaining documents as follows:

| Document | Purpose |
| --- | --- |
| [MASTER_PLAN.md](MASTER_PLAN.md) | Ordered phases, dependencies, roles, estimates, and gates |
| [FRONTEND_WORKSTREAM.md](FRONTEND_WORKSTREAM.md) | Clean DSpace Angular 10 baseline and selective UIST UI port |
| [BACKEND_WORKSTREAM.md](BACKEND_WORKSTREAM.md) | Clean DSpace 10 backend baseline, browse port, Java/Docker work, and tests |
| [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md) | Backup, restore, staging rehearsal, production cutover, and rollback |
| [TEST_AND_ACCEPTANCE.md](TEST_AND_ACCEPTANCE.md) | Automated, functional, security, data, performance, and go/no-go checks |
| [DECISIONS.md](DECISIONS.md) | Accepted decisions, pending choices, and decision-log template |
| [OFFICIAL_UPGRADE_GUIDE.md](OFFICIAL_UPGRADE_GUIDE.md) | Local copy of the user-provided official LYRASIS DSpace 10 upgrade guide |

## Non-negotiable migration rules

1. Target exactly `dspace-10.0` for both backend and frontend. Do not mix
   backend and UI versions.
2. Start both migration branches from clean official DSpace 10.0 tags. Do not
   merge or rebase the current branches onto 10.0.
3. Port UIST behavior intentionally and in small commits. Do not bulk-copy old
   source, theme, configuration, Docker, or lockfile trees.
4. Keep code migration separate from production data migration. Production
   data must first be restored and upgraded in an isolated staging environment.
5. For the 9.2 to 10.0 database upgrade, run:

   ```sh
   [dspace]/bin/dspace database migrate ignored
   ```

   Do not let the existing Docker entrypoint automatically run plain
   `database migrate` before this controlled migration.
6. DSpace 10 changes the Solr `search` schema. Clear and fully rebuild the
   search index, and create the new `audit` core.
7. Never run `docker-compose.import.yml` during an upgrade. It creates new
   repository objects and is bootstrap tooling, not migration tooling.
8. Rollback after Flyway migration is a paired restore of the 9.2 database,
   assetstore, configuration, and matching application releases. It is not a
   Git checkout or reverse migration.
9. Never place credentials, SMTP secrets, production dumps, auth state, or
   unredacted production configuration in these documents or in Git.

The local official guide is reference material. Where its generic deployment
steps differ from the repository-specific plan, follow the stricter procedure
in [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md), especially the controlled
9.2-to-10.0 Flyway and Solr steps.

## Authoritative external references

- [DSpace 10 upgrade guide](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944710/Upgrading+DSpace)
- [DSpace 10 installation requirements](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944708/Installing+DSpace)
- [DSpace 10 release notes](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944700/Release+Notes)
- [DSpace 10 theme migration](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408944957/User+Interface+Customization#UserInterfaceCustomization-Upgradingfrom9.xto10.x)
- [Backend release `dspace-10.0`](https://github.com/DSpace/DSpace/releases/tag/dspace-10.0)
- [Frontend release `dspace-10.0`](https://github.com/DSpace/dspace-angular/releases/tag/dspace-10.0)

## Context handoff protocol

At the end of every migration work session:

1. Update [STATUS.md](STATUS.md) with the exact branch, commit, completed task,
   verification evidence, blockers, and next command/action.
2. Record any material choice in [DECISIONS.md](DECISIONS.md).
3. Link test logs or deployment evidence without committing secrets or large
   production artifacts.
4. Keep at most one task marked `IN PROGRESS` in `STATUS.md`.
