# EDEN metadata mapping

The categorized EDEN work lists are indexed in [eden/README.md](eden/README.md); this file remains the shared item-type mapping contract.

This project exposes two complementary type layers. Keep `dspace.entity.type` broad so DSpace entity pages, relationships, discovery configuration, and Angular decorators continue to work. Store the detailed scholarly/resource class in `dc.type`; EDEN and schema.org output should prefer `dc.type` and use `dspace.entity.type` only as a fallback.

| DSpace metadata value | schema.org type |
| --- | --- |
| Dataset | `Dataset` |
| Article, Conference paper, Conference abstract, Preprint | `ScholarlyArticle` |
| Book | `Book` |
| Book chapter, Chapter | `Chapter` |
| Report, Technical Report, Working Paper | `Report` |
| Software, Source Code | `SoftwareSourceCode` |
| Thesis, Dissertation, Academic work | `Thesis` |
| Unknown or unsupported value | `CreativeWork` |

For ordinary publications, use `dspace.entity.type=Publication`; use `Dataset` for dataset entities where the configured DSpace entity model requires it. Do not replace those broad values with `ScholarlyArticle`, `Book`, `Chapter`, or `Report` merely to influence JSON-LD.

The repository submission vocabulary currently includes Article, Book, Book chapter, Dataset, Software, Technical Report, Thesis, and Other. When adding another submission type, update the submission vocabulary, the backend `ItemJsonLdService`, the Signposting schema.org URI converter, the frontend embedded JSON-LD mapper, and their tests together.

After changing stored metadata or mappings, rebuild the relevant application and reindex both Discovery and OAI-PMH before evaluating the EDEN result. A configuration-only mapping change does not rewrite existing item metadata.

Handle prefix `20.500.15029` matches the local declaration and is live in production: [20.500.15029/261](https://hdl.handle.net/20.500.15029/261) resolved to the correct item on 2026-10-06. Registry and repository descriptions may use this verified sample-level result; see [Handle status and evidence](eden/HANDLE_ACTIVATION.md). New-item minting and complete migration coverage were not tested. UIST DOI minting requires separate evidence; recording publisher DOIs is a different capability. Development placeholder prefixes are not evidence of production PID support.

## Local mapping evidence (2026-09-14)

Synthetic fixtures in the isolated `dspace10test` volume exercised every configured submission type. The linked item JSON-LD returned `ScholarlyArticle` for Article, `Book`, `Chapter`, `Dataset`, `SoftwareSourceCode`, `Report`, `Thesis`, and the `CreativeWork` fallback for Other. Additional unit coverage confirms Preprint and Academic work. These fixtures are test data only and do not establish an official UIST content-type vocabulary.

The historical September audit recorded `123456789/*` as unregistered example-prefix identifiers; its raw data-quality artifacts were removed during evidence cleanup. This is not the current Handle status: the production sample above uses the registered UIST prefix and resolves globally.
