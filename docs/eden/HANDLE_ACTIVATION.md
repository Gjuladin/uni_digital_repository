# UIST Handle activation

## Current status — verified live on 2026-10-06

**The production Handle service is live under UIST prefix `20.500.15029`, matching the local backend declaration.** The public item “Privacy Risks and Security Threats in Online Social Networks” displays [https://hdl.handle.net/20.500.15029/261](https://hdl.handle.net/20.500.15029/261) as its URI. Global resolver navigation reaches the correct [public item page](https://repository.uist.edu.mk/items/0d5b45cf-5ec7-4e29-8584-35af6a7be586).

An independent HTTP check on 2026-10-06 followed this chain:

1. `https://hdl.handle.net/20.500.15029/261` — HTTP 302 to the repository Handle route.
2. `https://repository.uist.edu.mk/handle/20.500.15029/261` — HTTP 301 to the item UUID page.
3. `https://repository.uist.edu.mk/items/0d5b45cf-5ec7-4e29-8584-35af6a7be586` — HTTP 200 with the expected item title.

The local source still declares `handle.prefix = 20.500.15029` and `handle.canonical.prefix = https://hdl.handle.net/`; the backend `local.cfg` has no Handle overrides. See [live verification evidence](evidence/2026-10-06/handle-live-verification.json).

This supersedes the earlier activation-pending and unverified-resolution status. It verifies one representative public identifier, not an exhaustive identifier census, new-item minting, complete legacy migration, key backups or restart resilience. Those operational checks remain separate from the established live resolver result.

## Historical configuration check — 2026-10-01

- User-supplied prefix: `20.500.15029`.
- User-supplied registration reference: `HNRT-185049`. This is recorded as a reference, not used as a Handle suffix, credential, or DSpace property.
- Backend source: `/Users/samil/uni_digital_repository_backend/dspace/config/dspace.cfg` now sets `handle.prefix = 20.500.15029` and `handle.canonical.prefix = https://hdl.handle.net/`.
- The ignored backend `local.cfg` had no Handle overrides during this check. Deployed `local.cfg` and environment variables can override source defaults.
- That local check changed no database records, generated no keys and performed no production deployment.

The [public naming-authority record](https://hdl.handle.net/api/handles/0.NA/20.500.15029) returned `responseCode: 1`. Its `HS_SITE` describes **UIST Digital Repository Handle Server**, with server IP `79.125.183.22`, TCP/UDP port `2641`, and HTTP port `8000`. The record timestamps are 2026-09-30. The registration includes server and administrator public keys.

On 2026-10-01, a resolver request for `20.500.15029/261` timed out after 20 seconds, and a direct HTTP request to the registered server timed out after 10 seconds. No DSpace containers were running locally during that check. These historical timeouts did not establish an invalid prefix or suffix; successful end-to-end resolution was subsequently verified on 2026-10-06 as recorded above.

References: [DSpace 10 Handle.Net Registry Support](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408945740/Handle.Net+Registry+Support), [Handle.Net](https://www.handle.net/index.html), and the backend's `make-handle-config`, `start-handle-server`, `HandlePlugin`, and `UpdateHandlePrefix` sources. The DSpace wiki page was blocked by its security challenge during this session; implementation details below were checked against the local DSpace source.

### Historical submitted-bundle and local-container verification

Later on 2026-10-01, the user supplied `/Users/samil/Downloads/sitebndl.zip` and started the local DSpace containers. The bundle contains `siteinfo.bin`, `admpub.bin`, `contactdata.dct`, and `repl_admin`; it contains no private keys or `config.dct`. Decoding with the installed Handle.Net 9.3.2 tools confirmed that the full site information, server public key, and administrator public key match the live registry record. The replication-admin entry still reads `300:0.NA/YOUR_PREFIX`; set the actual prefix in the original server configuration as part of activation. The bundle itself is retained unchanged.

The local backend checked on 2026-10-01 reported `handle.prefix = 20.500.15029` and `handle.canonical.prefix = https://hdl.handle.net/`. Its `dspace.ui.url` was `http://localhost:4000`; `/dspace/handle-server` was empty, and the local container had no running Handle process or published TCP/UDP `2641`. This described the development container, not the now-live production service. The bundle-validation artifact from that check was removed during the later evidence cleanup; the current public verification is linked above.

## Operational maintenance and recovery reference

Production resolution is already verified. The following retained setup instructions are a reference for maintaining or recovering the registered service, not a current activation backlog. Actual process supervision, key custody and restart testing require administrator evidence.

1. Compare the submitted `sitebndl.zip` with the public registration, including server IP, interfaces, and public key. Locate the original Handle server directory on the server and retain its matching private keys. The site bundle contains registration information; it is not a replacement for the server's private keys. Do not regenerate keys for the already registered site without arranging a registration update.
2. Confirm that `79.125.183.22` is the intended public server and forwards the registered ports to the Handle process. The existing backend Compose file publishes HTTP `8000` but does not publish TCP/UDP `2641`, persist `/dspace/handle-server`, or start a Handle process. A container deployment must supply all three, or operate the Handle service separately with access to the same DSpace configuration/database. Merely deploying `dspace.cfg` is insufficient.
3. Verify the installed DSpace properties, with the deployment's actual installation path in place of `/dspace`:

   ```sh
   /dspace/bin/dspace dsprop --property handle.prefix
   /dspace/bin/dspace dsprop --property handle.canonical.prefix
   /dspace/bin/dspace dsprop --property handle.dir
   /dspace/bin/dspace dsprop --property dspace.ui.url
   ```

   Expect `20.500.15029` and `https://hdl.handle.net/` for the first two. `dspace.ui.url` must be the public repository URL, because the DSpace plugin uses it to construct resolution destinations.
4. In the existing server's `config.dct`, set `auto_homed_prefixes` to include `20.500.15029`. Confirm the `server_config` section uses the DSpace plugin:

   ```text
   "storage_type" = "CUSTOM"
   "storage_class" = "org.dspace.handle.HandlePlugin"
   "enable_txn_queue" = "no"
   ```

   The plugin serves identifiers from the DSpace database. A standalone Handle server using its own default database will not automatically serve DSpace identifiers. Do not add the example prefix `123456789` as if it were owned by UIST.
5. Start and supervise the Handle process using the installed DSpace runtime. Its supplied `/dspace/bin/start-handle-server` script reads `handle.dir` and writes `/dspace/log/handle-server.log`; inspect that log for startup failures. Keep only one process listening on each configured port. Set service supervision and persistent storage before treating activation as complete.
6. Use a real public record assigned under the new prefix for validation. Confirm its global resolver URL reaches the correct public item page, then confirm its metadata, Signposting, and OAI identifier agree. Test across a process restart.

If the original server directory is unavailable, recover its configuration and keys from the institution's backup or perform a new setup and registration update with Handle.Net. Do not run `make-handle-config` over an existing registered directory as a recovery shortcut.

## Existing identifiers and migration

Changing the configuration affects future assignments. Existing `123456789/*` handles and `dc.identifier.uri` metadata do not change automatically.

The candidate migration retains each suffix, for example `123456789/261` becomes `20.500.15029/261`. Before executing it, back up the database, inventory existing prefixes and URI forms, check for collisions, and implement redirects for old public `/handle/123456789/*` routes. The standard migration command is:

```sh
/dspace/bin/dspace update-handle-prefix 123456789 20.500.15029
```

This agent has **not run** this command. The public sample now uses `20.500.15029/261`, confirming that this record has the registered-prefix identifier. The production migration procedure, full legacy inventory and redirect coverage have not been audited; do not repeat a migration solely because the historical notes described it as pending. The command prompts for confirmation, changes database handles, updates matching metadata, and rebuilds Discovery. It does not install legacy-route redirects.

**Metadata caveat confirmed in the local source:** `UpdateHandlePrefix` finds metadata using the canonical prefix active when the command runs. With `https://hdl.handle.net/` configured, it will not match old `http://hdl.handle.net/123456789/*` or local repository `/handle/123456789/*` URI values. Inventory those forms first and plan their explicit metadata correction; do not assume a successful handle-table migration fixes all identifiers. Reindex OAI after migration and verify old citations still reach the intended records.

## Operational assurance checks

- The submitted site's matching keys/configuration are installed and backed up.
- The Handle service is reachable on its registered interfaces and survives restart.
- **Verified on 2026-10-06:** the public `20.500.15029/261` identifier resolves globally to the correct public landing page.
- Existing-record migration and legacy redirects are complete if migration is selected.
- Metadata and harvester output use the verified identifiers consistently.

Registry drafts may now describe the registered UIST prefix and verified live item-level Handle resolution, citing the dated sample. Keep claims about complete migration, new-item minting, restart resilience, metadata/harvester consistency and backup arrangements limited to their own evidence; their verification does not undo the established live resolver result.
