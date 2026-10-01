# UIST Handle activation

## Recorded configuration — 2026-10-01

- User-supplied prefix: `20.500.15029`.
- User-supplied registration reference: `HNRT-185049`. This is recorded as a reference, not used as a Handle suffix, credential, or DSpace property.
- Backend source: `/Users/samil/uni_digital_repository_backend/dspace/config/dspace.cfg` now sets `handle.prefix = 20.500.15029` and `handle.canonical.prefix = https://hdl.handle.net/`.
- The ignored backend `local.cfg` currently has no Handle overrides. Deployed `local.cfg` and environment variables must also be checked because they can override source defaults.
- No database records have been changed, no keys have been generated, and no production deployment has been performed.

The [public naming-authority record](https://hdl.handle.net/api/handles/0.NA/20.500.15029) returned `responseCode: 1`. Its `HS_SITE` describes **UIST Digital Repository Handle Server**, with server IP `79.125.183.22`, TCP/UDP port `2641`, and HTTP port `8000`. The record timestamps are 2026-09-30. The registration includes server and administrator public keys.

A resolver request for `20.500.15029/261` timed out after 20 seconds, and a direct HTTP request to the registered server timed out after 10 seconds. These results do not prove the prefix or suffix is invalid. They mean end-to-end item resolution has not been verified from this workstation. No DSpace containers were running locally during this check.

References: [DSpace 10 Handle.Net Registry Support](https://wiki.lyrasis.org/spaces/DSDOC10x/pages/408945740/Handle.Net+Registry+Support), [Handle.Net](https://www.handle.net/index.html), and the backend's `make-handle-config`, `start-handle-server`, `HandlePlugin`, and `UpdateHandlePrefix` sources. The DSpace wiki page was blocked by its security challenge during this session; implementation details below were checked against the local DSpace source.

### Submitted bundle and running-container verification

Later on 2026-10-01, the user supplied `/Users/samil/Downloads/sitebndl.zip` and started the local DSpace containers. The bundle contains `siteinfo.bin`, `admpub.bin`, `contactdata.dct`, and `repl_admin`; it contains no private keys or `config.dct`. Decoding with the installed Handle.Net 9.3.2 tools confirmed that the full site information, server public key, and administrator public key match the live registry record. The replication-admin entry still reads `300:0.NA/YOUR_PREFIX`; set the actual prefix in the original server configuration as part of activation. The bundle itself is retained unchanged.

The running backend reports `handle.prefix = 20.500.15029` and `handle.canonical.prefix = https://hdl.handle.net/`. Its `dspace.ui.url` is `http://localhost:4000`, which is appropriate for local development but must be overridden on the production server. `/dspace/handle-server` exists but is empty, and the container has no running Handle process or published TCP/UDP `2641`. Activation remains pending the original server directory with matching private keys and access to the registered public server. See [bundle-validation evidence](evidence/2026-10-01/handle-bundle-validation.json).

## Activate the registered server

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

This command is documented here but has **not been run**. It prompts for confirmation, changes database handles, updates matching metadata, and rebuilds Discovery. It does not install legacy-route redirects.

**Metadata caveat confirmed in the local source:** `UpdateHandlePrefix` finds metadata using the canonical prefix active when the command runs. With `https://hdl.handle.net/` configured, it will not match old `http://hdl.handle.net/123456789/*` or local repository `/handle/123456789/*` URI values. Inventory those forms first and plan their explicit metadata correction; do not assume a successful handle-table migration fixes all identifiers. Reindex OAI after migration and verify old citations still reach the intended records.

## Completion criteria

- The submitted site's matching keys/configuration are installed and backed up.
- The Handle service is reachable on its registered interfaces and survives restart.
- A real public `20.500.15029/*` identifier resolves globally to the correct public landing page.
- Existing-record migration and legacy redirects are complete if migration is selected.
- Metadata and harvester output use the verified identifiers consistently.

Until these checks pass, registry submissions may record that a prefix is registered, but should not claim that operational item-level Handle resolution has been verified.
