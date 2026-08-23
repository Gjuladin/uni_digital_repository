# DSpace 10 Operations Runbook

This runbook covers backup validation, staging rehearsal, production cutover,
and rollback for the UIST DSpace 9.2 to 10.0 migration.

It is not executable until Phase 0 replaces placeholders with validated
production-specific values. Never run a command containing an unresolved
placeholder such as `<volume>`, `<host>`, or `[dspace]`.

## Operating principles

- Use a maintenance window. This is a database-migrating major upgrade, not a
  rolling or zero-downtime deployment.
- Keep frontend and backend versions matched exactly at `dspace-10.0`.
- Keep all public write paths disabled until the production go-live decision.
- Back up and restore database and assetstore as a consistent pair.
- Use an explicit DSpace 10 CLI migration. Do not allow the old Compose
  entrypoint to invoke automatic plain `database migrate`.
- Never use `docker compose down -v` against production or a backup source.
- Never run `docker-compose.import.yml` as part of migration or cutover.
- Never record secrets or production data in Git or this runbook.

## O0: production preflight inventory

Record and approve:

- Deployment model: Compose, Tomcat, runnable JAR, PM2/systemd, Kubernetes, or
  other
- Hosts, runtime users, permissions, networks, ports, volumes, and mounts
- Reverse proxy, TLS, DNS, firewall, WAF, and CDN behavior
- PostgreSQL, Solr, Java, Node, Maven, Ant, and container-runtime versions
- Current backend/UI image names and immutable digests
- Database, assetstore, and Solr sizes
- Current item, bitstream, user, community, and collection counts
- Longest known search reindex, OAI import, and restore duration
- Scheduled tasks and external writers
- Authentication, DOI, Handle, OAI, SWORD, storage, mail, analytics, antivirus,
  authority, and external-provider integrations
- Monitoring dashboards, log paths, alerts, and on-call contacts
- RTO, RPO, acceptable downtime, and rollback timebox

URL/configuration contract:

- Backend `dspace.server.url`
- Backend `dspace.ui.url`
- Frontend `ui.baseUrl`
- Frontend external and SSR/internal REST URLs
- `rest.cors.allowed-origins`
- Trusted proxy/X-Forwarded settings

Required invariant:

```text
frontend ui.baseUrl == backend dspace.ui.url
```

## O1: prerequisites and staging isolation

Target runtime prerequisites:

- JDK 21
- Maven 3.9+
- Ant 1.10+
- PostgreSQL 14-17; current planned version is 15
- Solr 9; current planned version is 9.8
- Node 20.19+; use a target-supported Node 20/22 line
- Tomcat 10.1+ if Tomcat remains the deployment model

For Solr 9.8+, include the DSpace-documented configuration-library startup
option when required by the target deployment.

Staging must use:

- Separate host, or non-colliding container names, networks, ports, and volumes
- Access-restricted production-cloned data
- Non-production external integration endpoints or approved test credentials
- Production-equivalent proxy, TLS, SSR, filesystem permissions, and monitoring

The current development Compose files do not validate production TLS, DNS,
WAF, SSO callbacks, backup throughput, operational permissions, or secret
management by themselves.

## O2: backup-set creation

Create a labelled backup directory outside the Git repositories and record its
owner, retention policy, permissions, and creation time.

The backup set must contain:

- PostgreSQL logical dump and database version/extension manifest
- Every configured assetstore
- Secure copy of `local.cfg` and other non-versioned configuration
- Deployment manifests and environment-value inventory, with secrets stored
  separately
- Reverse-proxy, TLS reference, systemd/PM2/cron, and worker definitions
- Current backend/frontend artifacts and image digests
- Solr configuration and recoverable core data, especially `statistics` and
  `authority`
- Checksums for every material artifact

### Example database backup pattern

Validate project, service, database, and destination names before running:

```sh
docker compose -p <project> exec -T dspacedb \
  pg_dump -U <db-user> -Fc <db-name> > <secure-backup-dir>/dspace.dump

shasum -a 256 <secure-backup-dir>/dspace.dump
```

Use an equivalent DBA-approved snapshot plus logical dump if production is not
Compose-based.

### Example assetstore archive pattern

Resolve and verify the exact volume first:

```sh
docker volume ls

docker run --rm \
  -v <validated-assetstore-volume>:/assetstore:ro \
  -v <secure-backup-dir>:/backup \
  alpine sh -c 'tar czf /backup/assetstore.tgz -C /assetstore .'

shasum -a 256 <secure-backup-dir>/assetstore.tgz
```

Do not use an unresolved environment variable, broad path, or guessed volume.

## O3: backup restore-validation gate

A backup is not accepted until it has been restored successfully.

1. Create isolated empty database and assetstore targets.
2. Restore the paired database and assetstore.
3. Start the known-good matching DSpace 9.2 backend and frontend against them.
4. Verify:
   - Baseline object counts
   - Sampled bitstream checksums/downloads
   - REST health
   - Admin login
   - Search and browse
   - One write-safe workflow action in isolated staging
5. Record restore duration and resource use.

Never validate a database restore against a mismatched assetstore snapshot.

Gate O3: restore and validation complete inside the agreed RTO.

## O4: staging upgrade rehearsal

Perform at least one complete rehearsal; two are preferred because custom Java
and a significant frontend theme are involved.

### O4.1 Prepare data and services

1. Restore a recent production backup into isolated staging.
2. Confirm database and assetstore baseline counts/checksums.
3. Stop all DSpace write paths and background jobs.
4. If the sequence check is needed, run the optional sequence update using the
   old DSpace 9.2 CLI before replacing that release:

   ```sh
   [dspace-9.2]/bin/dspace database update-sequences
   ```

5. Deploy the approved DSpace 10 backend artifact/configuration, but do not
   start an entrypoint that runs an uncontrolled migration.
6. Start PostgreSQL and Solr only.

### O4.2 Run the controlled database migration

Using the DSpace 10 CLI:

```sh
[dspace-10]/bin/dspace database info
[dspace-10]/bin/dspace database migrate ignored
```

Capture `database info`, migration output, DSpace logs, duration, and resulting
Flyway history. Stop and investigate any unexpected error; do not skip or edit
Flyway records without a documented, tested recovery decision.

### O4.3 Upgrade Solr

1. Install the DSpace 10 Solr configsets.
2. Create/verify all required cores, including `audit`.
3. Because the DSpace 10 `search` schema is incompatible with the old index:

   ```sh
   [dspace-10]/bin/dspace index-discovery -d
   # Restart Solr using the target deployment mechanism
   [dspace-10]/bin/dspace index-discovery -b
   [dspace-10]/bin/dspace oai import
   ```

4. Record reindex progress, completion time, document counts, errors, CPU,
   memory, disk, and Solr heap behavior.

If using `discovery.autoReindex=false` to prevent an overlapping automatic
reindex, record the temporary change and explicitly restore the intended final
setting.

Do not copy the old `solr_data` volume wholesale as the DSpace 10 search index.
Preserve data that is not safely regenerable, especially authority/statistics,
according to the approved Solr data plan.

### O4.4 Start the matching application pair

1. Start backend 10.0.
2. Validate REST health, logs, database connectivity, and Solr connectivity.
3. Start frontend 10.0.
4. Validate SSR, public/internal URLs, TLS, proxy, CORS, cookies, CSRF, and UI
   access.
5. Execute [TEST_AND_ACCEPTANCE.md](TEST_AND_ACCEPTANCE.md).

### O4.5 Rehearse rollback

After collecting successful-upgrade evidence, deliberately execute the rollback
procedure below using the rehearsal backup. Record duration and corrections.

Gate O4:

- No unexplained Flyway, database, Solr, assetstore, or application error
- All P0/P1 checks pass
- Full index completes and counts are accepted
- Rollback succeeds within RTO
- Production window is based on measured duration plus at least 50% contingency

## O5: production preparation

### T-7 to T-1 days

- Enforce change freeze.
- Approve exact backend/UI commits, image digests, and configuration diff.
- Approve backup location, retention, restoration owner, and rollback timebox.
- Resolve all P0/P1 defects.
- Approve maintenance message and stakeholder communications.
- Confirm monitoring, on-call coverage, access, storage, and headroom.
- Confirm external integration owners and test contacts.
- Verify the previous matching 9.2 artifacts remain deployable.

### T-60 minutes

- Confirm current system health.
- Confirm no critical batch, import, DOI, OAI, or workflow process is active.
- Confirm maintenance page/proxy controls.
- Confirm disk, database, and Solr capacity.
- Confirm release and rollback operators are present.
- Record current logs, counts, and health snapshots.

## O6: production cutover sequence

Do not reorder these steps without a recorded decision and rehearsal.

1. Enable maintenance mode and block public writes at the proxy.
2. Stop frontend, backend, ingestion/SWORD write paths, scheduled tasks, and
   external workers.
3. Wait for in-flight work to finish or record its safe handling.
4. Take the final paired database and assetstore backup plus configuration and
   Solr snapshot; validate checksums/manifests.
5. Optionally run the rehearsed 9.2 sequence update before removing the old CLI.
6. Deploy the approved DSpace 10 backend artifact and configuration without
   starting the uncontrolled old migration entrypoint.
7. Run:

   ```sh
   [dspace-10]/bin/dspace database info
   [dspace-10]/bin/dspace database migrate ignored
   ```

8. Tail and save migration logs. Invoke rollback on unexpected Flyway failure.
9. Deploy DSpace 10 Solr configsets, create/verify `audit`, clear the old search
   index, restart Solr, and run the full discovery rebuild.
10. Start backend 10.0 and validate REST, logs, database, and Solr.
11. Start frontend 10.0 and validate SSR, TLS, proxy, URLs, CORS, and cookies.
12. Execute production P0 smoke tests with the repository administrator.
13. Make the go-live or rollback decision before reopening writes.
14. Reopen traffic and then restart scheduled tasks/workers in the approved
    order.
15. Announce status and begin hypercare.

## O7: production rollback

Rollback is a restore, not a reverse Flyway migration.

Rollback triggers are defined in [TEST_AND_ACCEPTANCE.md](TEST_AND_ACCEPTANCE.md).

1. Keep maintenance mode and all writes enabled as blocked.
2. Stop DSpace 10 UI, backend, CLI work, and background workers.
3. Preserve DSpace 10 logs, migration output, image hashes, and diagnostics.
4. Restore the final paired 9.2 database and assetstore.
5. Restore the 9.2 configuration, deployment artifacts, and Solr state. If a
   usable Solr restore is unavailable, rebuild a 9.2-compatible index only after
   the 9.2 backend is restored.
6. Deploy/start the known-good matching 9.2 backend and frontend.
7. Validate REST, admin login, search, sampled downloads, and data counts.
8. Restart scheduled work only after validation.
9. Announce rollback and open an incident/change follow-up.

All writes made after a 10.0 go-live would be lost on rollback. This is why
writes remain blocked until the acceptance decision.

## O8: hypercare

Monitor for at least the agreed 24-48 hour elevated-observation period:

- UI/REST error rates and latency
- Database connections, CPU, locks, and storage
- Solr core health, heap, errors, and index counts
- Authentication and authorization failures
- Downloads, submissions, workflows, and background queues
- Mail, subscriptions, DOI/Handle, OAI, harvesters, and scheduled jobs
- SSR logs, canonical URLs, redirects, robots, and sitemap
- Security alerts, CORS/CSRF, and proxy/TLS behavior

Archive the final evidence set and update `STATUS.md` and `DECISIONS.md`.

