# EDEN compatibility demonstration — 21 September 2026

This is a **local development result**, not a claim that the live UIST repository has been upgraded. The `dspace10test` stack was restarted and the unchanged EDEN harvester at commit `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380` was run against both `http://localhost:4000/` and `http://localhost:4000/home`. Frontend commit: `f3129bd9e`; backend commit: `beb54cd326`.

## What the percentage means

| Scope | Fresh result | Percentage |
| --- | --- | ---: |
| Eight EDEN technical mechanisms on repository `/` | 8 Found / 8 checked | **100%** |
| Eight EDEN technical mechanisms on `/home` | 8 Found / 8 checked | **100%** |
| Ten outcomes visible in the supplied EDEN screenshots (eight mechanisms plus two registry records) | 8 technical outcomes demonstrated locally; re3data and FAIRsharing not yet published or consulted in this isolated run | **80% of those ten outcomes demonstrated locally** |

The 80% figure is **not overall project completion** and is **not a live EDEN score**. The two registry results are excluded from the technical pass rate; both need UIST-owned accounts, institutionally approved information, submission and external publication. Production deployment and UIST-approved contact/address, research areas, policy, licence, Handle/DOI claims and data stewardship are additional work not represented by this ten-outcome denominator.

## Fresh verification

- EDEN regression checks passed for both URLs with no regression against the saved 14 September baseline. Embedded JSON-LD, meta tags, linked JSON-LD, FAIRiCat, Atom/RSS, sitemap, OpenSearch and SearchAction were all `Found`. Linked repository JSON-LD starts with `DataCatalog`.
- Repository, FAIRiCat, OpenSearch description, sitemap and robots compatibility endpoints returned HTTP 200 with the expected media types. The raw HTML report, API output, landing HTML and direct endpoint evidence are in this directory, separately from the normalized [`root.json`](root.json) and [`home.json`](home.json).
- Five EDEN-related frontend spec files completed **100/100** tests in Chrome Headless.
- Java 21 backend checks completed **2/2** `ItemJsonLdServiceTest` unit tests and **37/37** `LinksetRestControllerIT` integration tests, including restricted-item non-disclosure.
- The broader inherited frontend suite is **not green**. A rerun after reducing memory load compiled and launched Chrome, but stopped after 3,833 of 6,008 tests with 26 failures and two skipped tests, following a translation-pipe error in `afterAll` and a browser disconnect. This is an incomplete run, not a final pass percentage. An isolated rerun of `NotificationsBoardComponent` completed normally with 9 tests and 3 failures from a missing `TranslateService` test provider, confirming that at least those failures are deterministic rather than caused by memory pressure. The previously documented 2,288 passes/eight failures is historical, not a new measurement.

## What remains before claiming completion

1. UIST confirms and approves official identity, address/contact, languages/research areas, Handle/DOI model, and governance policy and licence claims. Unknown optional claims stay unpublished.
2. UIST creates/owns the re3data and FAIRsharing accounts, approves the records and authorized submitters, and the records become public and discoverable by EDEN.
3. The hosting owner coordinates backend-first and then frontend deployment, backups, rollback and indexes; the team repeats endpoint and EDEN checks on the **public** `/` and `/home` URLs and representative real UIST records.
4. Metadata stewards review missing or inconsistent source values; the local data-quality audit found 291 issues among 165 non-fixture public items and made no automatic edits.

For the professor: “Locally, the EDEN-specific technical discovery work is 100% passing (8/8 mechanisms on each of two URLs). Across the ten screenshot outcomes, eight are demonstrated locally, or 80%; the remaining two are external registry publications. This does not mean the public repository or the entire institutional project is 80% complete.”
