# Backend and item metadata fixes

This category covers DSpace item-level machine-readable metadata and Signposting.

## Implemented locally

| Fix | Result |
| --- | --- |
| Linked item JSON-LD | Adds `/server/signposting/describedby-jsonld/{uuid}` and the proxied public `/signposting/describedby-jsonld/{uuid}` endpoint. |
| Signposting relation | Preserves DataCite XML and adds a second `describedby` relation for `application/ld+json`. |
| Shared type contract | Maps Dataset, Article, Book, Chapter, Report, Software, Thesis/academic work, and a `CreativeWork` fallback. |
| Rich item fields | Maps available name, identifier, description, ISO-preferred language, `dcterms.accessRights`, subjects, item-level licence, issued-preferred dates, creators, DOI/local Handle values, publisher/provider, and parent collection. A local Handle value is not a claim that its prefix is registered globally. |
| Safe omission | Omits absent fields instead of publishing empty or invented values. |
| Visibility protection | Does not expose private, withdrawn, workspace, or otherwise non-discoverable items through linked JSON-LD. |
| Deterministic linkset | Produces the `anchor` first to remain compatible with the tested EDEN parser while preserving RFC 9264 semantics. |
| Linkset model repair | Corrects lazy initialization of `describedby` so it cannot accidentally initialize or overwrite `describes`. |

The detailed type rules are in [../EDEN_METADATA_MAPPING.md](../EDEN_METADATA_MAPPING.md).

## Local verification (2026-09-14)

- `ItemJsonLdServiceTest`: 2 tests passed on Java 21.
- `LinksetRestControllerIT`: all 37 tests passed, including DataCite plus JSON-LD relations, `anchor` first, omission behavior, missing items, workspace items, withdrawn items, authorization-restricted items, and non-discoverable items.
- The integration JVM used the reserved example DOI prefix `10.5072` only to satisfy the inherited test configuration. This is not evidence that UIST mints DOIs.
- The unmodified top-level `verify` gate is independently blocked before these tests by two inherited SQL migrations without licence headers and an unrelated 124-character line in `EPersonService`. A direct webapp Checkstyle run reports 14 additional inherited violations, all in account-management files; none is in an EDEN-touched file. The focused integration run skipped the repository-wide licence and Checkstyle gates, but did not skip tests.
- Eight synthetic public local fixtures cover Article, Book, Book chapter, Dataset, Software, Technical Report, Thesis, and Other. Their identifiers exist only in the local Compose volume.
- The generated [data-quality summary](evidence/data-quality.md) audited 165 non-fixture public/discoverable local items. Its [JSON evidence](evidence/data-quality.json) records 291 issues, no safe automatic corrections, and never invents missing values.

## Remaining production verification

1. Deploy the backend before the frontend so public Signposting never advertises an unavailable endpoint.
2. Rebuild Discovery and OAI-PMH indexes after deployment and after any approved source-metadata normalization.
3. Test one approved public representative item for every configured UIST submission type.
4. Confirm that missing, withdrawn, private, workspace, and non-discoverable test items return non-disclosing responses through the production proxy.

## Decisions that cannot be made in code

- Whether UIST owns a registered Handle prefix and how existing local identifiers will be migrated.
- Whether UIST mints DOIs itself or only records publisher-issued DOIs.
- Whether a repository-wide default licence or access statement exists.
- Which submission types and controlled terms UIST officially supports.

Those decisions are tracked in [UIST_DECISIONS.md](UIST_DECISIONS.md).
