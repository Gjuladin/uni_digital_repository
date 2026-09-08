# UIST repository footer

Research date: 8 September 2026. Research was split across Luna (official UIST information and repository audit) and Terra (institutional repository design examples).

## Sources and findings

- [Cambridge Apollo](https://www.repository.cam.ac.uk/home): concise repository information, contact and policy links with university/library identity and a separate utility row.
- [White Rose Research Online](https://eprints.whiterose.ac.uk/): task-oriented groups for repository information and search/browse tools.
- [Edinburgh ERA](https://era.ed.ac.uk/home): institutional identity, contact, accessibility and policy links. Its extensive legal list would be excessive for this footer.
- [University of Minnesota Digital Conservancy](https://conservancy.umn.edu/home): clearly grouped repository services and related library services.
- [UIST](https://uist.edu.mk/), [About UIST](https://uist.edu.mk/about/uist/) and [Contact](https://uist.edu.mk/info-center/public-procurement/contact-page/): official institution name, Partizanska bb, 6000 Ohrid, contact@uist.edu.mk, +389 46 511 000.
- [UIST E-library](https://uist.edu.mk/e-library/): verified institutional resource for the university links group.

## Implemented design

A navy footer aligned with the existing page container, white university logo, serif repository title matching the home hero, short repository scope description, sky-blue section headings and a thin top border. Four desktop columns separate identity, repository navigation, university resources and contact. On tablet the brand spans the full width; on mobile every section stacks in a single full-width column. Legal/settings links wrap below a divider.

Repository links use existing Angular routes: `/search`, `/community-list`, `/browse/author`. The author index was also verified against the local DSpace discovery API. University links use the official URLs above. No invented support, submission or policy destinations were added. Contact is labelled “Contact UIST” because the verified address is a general university mailbox.

Cookie settings retain the inherited dialog action. Privacy, user agreement and feedback retain their configuration/authorization conditions. Native links and buttons keep visible keyboard focus, with 44px minimum mobile targets. The UIST-specific copyright key uses the current year; the inherited generic DSpace 2002 start date is not reused. The default DSpace translation and other themes are untouched.

Implementation: `src/themes/uist/app/footer/footer.component.html`, its adjacent SCSS file and the `footer.uist.*` keys in `src/assets/i18n/en.json5`. English is the only active language in the local configuration.

## Verification

- Development browser and server builds passed, with existing project warnings.
- Targeted footer HTML/TypeScript lint and `git diff --check` passed; all 22 translation references resolve.
- Browser layouts checked at 320, 390, 768, 1024 and 1440px without horizontal overflow. At 390px all four sections have the same full-width track and all footer targets are at least 44px tall.
- Axe checks of the footer at mobile and desktop sizes: 20 passing checks, no violations or incomplete checks (WCAG 2 A/AA, WCAG 2.1 AA and best practices).
- Keyboard activation opens cookie settings. Search, communities and author links navigate to their working repository pages.
