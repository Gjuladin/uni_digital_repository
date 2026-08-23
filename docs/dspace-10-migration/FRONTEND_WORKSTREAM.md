# Frontend Migration Workstream

Repository: `/Users/samil/uni_digital_repository`

Target: official `DSpace/dspace-angular` tag `dspace-10.0`, paired with the
official DSpace backend 10.0 REST API.

## Core strategy

The current frontend is a 9.2/10 hybrid. Do not merge, rebase, or bulk-copy it
onto DSpace 10. Use a clean official 10.0 worktree and port documented UIST
behavior one concern at a time.

Never copy the current complete versions of:

- `src/app/`
- `src/themes/custom/`
- `config/config.example.yml`
- `package.json` or `package-lock.json`
- Dockerfiles or Compose files
- GitHub workflows

## F0: preserve current state and create target worktree

Estimated effort: 0.5 day.

```sh
cd /Users/samil/uni_digital_repository
git branch backup/pre-dspace-10-ui main
git fetch official --tags
git worktree add ../uni_digital_repository_v10 \
  -b codex/dspace-10-port dspace-10.0
```

Record the old `HEAD` (`7f6cb862c939373919d7a02a06812a327209d5b9`)
in the implementation handoff and create a feature-to-file port inventory.

Gate F0:

- Current `main` is preserved and remains unchanged.
- New worktree begins exactly at official `dspace-10.0`.

## F1: prove the untouched 10.0 baseline

Estimated effort: 0.5-1 day.

Use the target package manifest, lockfile, configuration template, Dockerfiles,
and workflows without modification.

```sh
npm clean-install
npm run build:lint
npm run lint
npm run check-circ-deps
npm run test:headless
npm run build:prod
```

Deliverable: a baseline-build evidence record with Node/npm versions, commit,
commands, duration, and results.

Gate F1: no UIST code is introduced until the official baseline passes.

## F2: configuration, URLs, SSR, and deployment contract

Estimated effort: 1-2 days. Coordinate with the backend and platform owners.

Start from the DSpace 10 `config/config.example.yml`. Recreate only site-owned
settings from the current `config/config.yml`, with tracked defaults safe for
local development:

- UI bind host/port and proxy behavior
- External and SSR/internal REST URLs
- `ui.baseUrl`
- Global UIST theme selection
- Favicon/head tags
- COAR Notify decision
- AddToAny decision
- Cache, SSR, rate-limit, and proxy settings
- `fallbackLanguage`

Required URL invariant:

```text
frontend ui.baseUrl == backend dspace.ui.url
```

Tracked defaults must use localhost endpoints only. Document and inject
environment-specific UI, browser REST, and internal SSR REST endpoints through
the supported DSPACE_* interface (or an equivalent mounted deployment config).
The documented variables include `DSPACE_UI_BASEURL`,
`DSPACE_REST_SSL`, `DSPACE_REST_HOST`, `DSPACE_REST_PORT`,
`DSPACE_REST_NAMESPACE`, and `DSPACE_REST_SSRBASEURL`; keep
`ssr.replaceRestUrl=true` when the SSR endpoint is internal.
Use an explicitly configured non-local HTTPS URL for canonical, OpenGraph, and
JSON-LD behavior. If no valid public HTTPS `ui.baseUrl` is configured, omit
those public URL fields or fail clearly; never use a hardcoded production
fallback or expose an internal Docker/REST hostname in SSR HTML.

Prefer an environment-specific untracked/mounted production configuration or
the supported DSpace 10 environment-variable mechanism. Do not commit secrets
or a production credential-bearing config.

Review these current files semantically; do not copy them wholesale:

- `src/config/default-app-config.ts`
- `src/config/ssr-config.interface.ts`
- `src/app/app.config.ts`
- `src/modules/app/browser-app.config.ts`
- `src/ngx-translate-loaders/translate-browser.loader.ts`
- `src/ngx-translate-loaders/translate-server.loader.ts`
- `src/app/core/metadata/head-tag.service.ts`
- `server.ts`
- `angular.json`

Deliverables:

- Redacted configuration mapping: old key, target key, source/owner, environment
- Documented public/internal URL contract
- Staging deployment configuration

Gate F2: production SSR can reach the backend, public pages contain only public
HTTPS URLs, and `/server/api/core/sites` is reachable through the intended path.

## F3: assets and global branding

Estimated effort: 0.5-1 day. Can run in parallel with backend work.

Create an asset manifest listing file, source, consuming component, and whether
it is still needed.

Likely assets to port:

- `src/assets/images/uist-*`
- Favicon files
- Apple/Android icon files
- Homepage/banner imagery actually referenced by retained components

Audit `src/assets/custom/images/`; current references primarily use
`assets/images`, so duplicated custom assets may be unused.

Port only intentional values from:

- `_global-styles.scss`
- `_theme_css_variable_overrides.scss`
- `_theme_sass_variable_overrides.scss`

Do not overwrite complete DSpace 10 style files. Reapply individual UIST rules
against the target files.

Gate F3:

- No referenced asset returns 404.
- No unexplained duplicate logo/banner sources remain.
- Branding asset licensing/ownership is recorded.

## F4: build a minimal DSpace 10-compatible UIST theme

Estimated effort: 4-7 days.

Recommended target: `src/themes/uist/`, containing only components UIST actually
overrides. Use the official DSpace 10 theme files as templates.

### F4.1 Theme bootstrap and registration

- Do not retain `eager-theme.module.ts` or `lazy-theme.module.ts`.
- Create/use `eager-theme-components.ts`.
- Create/use `lazy-listable-components.ts`.
- Register UIST component arrays in the DSpace 10 global eager/listable files.
- Do not register moved, deleted, unused, or default-identical components.

### F4.2 Frame and navigation

Port UIST intent from:

- `app/header/`
- `app/navbar/`
- `app/search-navbar/`
- `app/footer/`

Decide whether `footer-v2` is the one retained footer implementation. Do not
register two competing footer components.

### F4.3 Homepage

Port:

- Homepage layout
- Home news
- Category buttons and routing
- Referenced cover imagery

Validate data loading and routes against DSpace 10 rather than preserving old
component APIs mechanically.

### F4.4 Supporting overrides

Review and port only documented differences from:

- End-user agreement
- Theme `en.json5`
- Search/browse starts-with UI
- Any additional theme component with a verified UIST requirement

For every component use a three-way review:

```text
official 9.2 base | current UIST behavior | official 10.0 target
```

Reapply the UIST intent to the 10.0 target. Never apply the old file-level diff
mechanically.

Gate F4:

- No wholesale copy of the old 378-file custom theme survives.
- DSpace 10-only routes and features still compile and load.
- Component-port checklist records `PORTED`, `REPLACED`, or `DROPPED` for every
  reviewed override.
- Desktop and mobile screenshot set is approved.

## F5: SEO and remaining core overrides

Estimated effort: 1-2 days.

Port SEO intent from `src/index.html`:

- Page title and description
- University and repository structured data
- Icons
- Canonical URL
- OpenGraph and social metadata

Use only the explicitly configured non-local HTTPS public URL. Preserve DSpace
10's dynamic per-object metadata and security behavior in
`head-tag.service.ts`; port only demonstrably UIST-specific logic. Missing,
malformed, localhost, or HTTP `ui.baseUrl` values must not trigger a production
fallback; omit URL-bearing canonical/OG/JSON-LD fields or fail clearly.

Review before retaining any current changes in:

- Browse services/models/components
- Redirect/referrer services
- `init.service.ts`
- Browse menu and starts-with components
- Default `src/assets/i18n/en.json5`
- `config/config.example.yml`

Each retained core override requires an owner, reason, test, and decision-log
entry. Default to the official 10.0 implementation when intent is unclear.

Gate F5: SEO/SSR tests pass and no current core override remains without an
explicit decision.

## F6: logical-capability browse UI integration

Estimated effort: 0.5-1.5 days after the backend REST contract is stable.

Port the UI request/query behavior for the explicit browse capability,
preserving:

- Encoding and empty-value handling
- Browser navigation and query-parameter restoration
- Pagination links
- Title item `contains` use case
- Author, Subject, and custom metadata `startsWith` behavior
- Author partial `filterValue` behavior without emitting unsupported entry
  `contains`
- Decided precedence relative to `startsWith`

The UI and backend tests must express the same precedence and parameter names.
The capability must come from a stable logical browse definition, not a
translated label or generated field number. Title is the only current
`contains` capability; unsupported definitions retain ordinary `startsWith`
behavior, including manual URLs containing both parameters.

Gate F6: capability-focused scenarios pass against the upgraded backend,
including pagination and browser back/forward navigation. Exact bounded Author
entry substring matching is not a frontend completion condition; it remains
blocked on D-011's entry-level indexing design and staging evidence.

## F7: frontend quality and release readiness

Estimated effort: 1.5-3 days plus integration defect resolution.

Run:

```sh
npm clean-install
npm run build:lint
npm run test:lint:nobuild
npm run lint
npm run check-circ-deps
npm run test:headless
npm run build:prod
npm run test:rest
npm run cypress:run
```

Add UIST-owned automated coverage for:

- Homepage/category navigation
- Header/navbar/search/footer
- Branding assets
- End-user agreement
- Logical-capability browse behavior (Title `contains`; Author/Subject/custom
  `startsWith`; date browsing; manual precedence)
- SSR title/description/canonical/JSON-LD
- No internal hostname leakage

Create a documented visual matrix for desktop and mobile:

- Homepage
- Search/browse
- Item page
- Submission
- Admin frame
- Mobile navigation

Build an immutable, versioned frontend image and deploy it to staging behind the
production-equivalent proxy/TLS topology.

Exit gate:

- All required automated tests pass.
- Repository administrator approves visual and functional behavior.
- UI is confirmed compatible only with the matching backend 10.0 artifact.
- Deployment and rollback steps are included in the shared runbook.

Current source-review verification (2026-08-20): focused frontend tests pass
121/121 and the agent-focused set passes 69/69; `npm run build:lint` and
`npm run test:lint:nobuild` pass all 169 specs; `npm run lint` reports 0 errors
and 1,506 warnings; `npm run check-circ-deps` covers 3,310 files with no
cycles; the final supported-Node-20 headless suite passes 5,950 tests with 2
skipped; and the production browser plus SSR build succeeds with warnings.
This source evidence is not a staging or release gate.

The frontend no longer hardcodes logical capability names. The REST
`BrowseDefinition.supportsContains` field is deserialized into the Angular
model and drives the browse control and request options. Focused
serialization/UI tests pass 19/19. A direct scan of untracked UIST theme files
also reports no trailing whitespace.

## Frontend risk register

| Risk | Mitigation |
| --- | --- |
| Hybrid source retained accidentally | Clean official worktree; prohibit merges and bulk copies |
| Huge custom-theme carryover | Minimal `uist` theme; component port checklist |
| Old core override masks a v10 fix | Explicit owner/reason/test for every core override |
| SSR leaks internal URLs | Public/internal URL contract and SSR response tests |
| HTTP canonical data persists | HTTPS configuration and SEO assertions |
| Untested custom UI | Add UIST unit/Cypress/SSR/visual evidence |
| UI/backend mismatch | Pin exact `dspace-10.0` pair and test together |
