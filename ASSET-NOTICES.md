# Asset and brand notices

This file records the provenance and redistribution conditions for non-code
assets shipped in this repository. It must be reviewed before each public
release.

## UIST brand assets

The following files are UIST-branded assets. They must not be reused, changed,
or redistributed outside this repository without permission from the University
of Information Science and Technology "St. Paul the Apostle" (UIST), including
permission for any trademark use:

- `src/assets/images/uist-cover.jpg`
- `src/assets/images/uist-logo-full-color.png`
- `src/assets/images/uist-logo-full-white.png`
- `src/assets/images/uist-logo-mini-color.png`
- `src/assets/images/apple-touch-icon.png`
- `src/assets/images/favicon.ico`
- `src/assets/images/favicon-16x16.png`
- `src/assets/images/favicon-32x32.png`

Release owner: UIST. Before publishing a release, the release owner must retain
the written UIST approval or brand-policy reference that authorizes each asset.
If that record is unavailable, replace the asset with one whose provenance and
licence are documented before distribution.

## Third-party assets

- DSpace assets remain subject to the BSD-3-Clause licence and notices in
  `LICENSE`, `NOTICE`, and `LICENSES_THIRD_PARTY`.
- Leaflet marker images (`marker-icon-2x.png` and `marker-shadow.png`) are
  distributed under the Leaflet BSD-2-Clause licence. Their upstream notice
  must be included with release notices.
- Font Awesome assets are used through the `@fortawesome/fontawesome-free`
  dependency. Its icons are CC BY 4.0, fonts are SIL OFL 1.1, and code is MIT;
  preserve the dependency's notices when distributing bundled assets.
- EB Garamond is loaded from Google Fonts by the UIST theme and is licensed
  under SIL OFL 1.1. If it is self-hosted in the future, include its OFL text
  and the supplied copyright notice with the font files.

No asset may be added to `src/assets` or a theme until its source, licence, and
required attribution have been recorded here or in a nearby asset-specific
notice.
