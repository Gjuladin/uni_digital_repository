# Backend and item metadata fixes

This category covers DSpace item-level machine-readable metadata and Signposting.

## Implemented locally

| Fix | Result |
| --- | --- |
| Linked item JSON-LD | Adds `/server/signposting/describedby-jsonld/{uuid}` and the proxied public `/signposting/describedby-jsonld/{uuid}` endpoint. |
| Signposting relation | Preserves DataCite XML and adds a second `describedby` relation for `application/ld+json`. |
| Shared type contract | Maps Dataset, Article, Book, Chapter, Report, Software, Thesis/academic work, and a `CreativeWork` fallback. |
| Rich item fields | Maps available name, identifier, description, language, access conditions, contact, subjects, licence, dates, creators, DOI/Handle values, publisher/provider, and parent collection. |
| Safe omission | Omits absent fields instead of publishing empty or invented values. |
| Visibility protection | Does not expose private, withdrawn, workspace, or otherwise non-discoverable items through linked JSON-LD. |
| Deterministic linkset | Produces the `anchor` first to remain compatible with the tested EDEN parser while preserving RFC 9264 semantics. |

The detailed type rules are in [../EDEN_METADATA_MAPPING.md](../EDEN_METADATA_MAPPING.md).

## Remaining work without a new UIST policy decision

1. Run the targeted backend Maven integration tests on the final release commit.
2. Deploy the backend before the frontend so public Signposting never advertises an unavailable endpoint.
3. Rebuild Discovery and OAI-PMH indexes after deployment and after any source-metadata normalization.
4. Test one public representative item for every configured UIST submission type.
5. Record inconsistent existing `dc.type`, language, licence, creator, and identifier metadata as a data-cleanup list.
6. Confirm that missing, withdrawn, private, workspace, and non-discoverable test items return the intended non-disclosing responses in production.

## Decisions that cannot be made in code

- Whether UIST owns a registered Handle prefix and how existing local identifiers will be migrated.
- Whether UIST mints DOIs itself or only records publisher-issued DOIs.
- Whether a repository-wide default licence or access statement exists.
- Which submission types and controlled terms UIST officially supports.

Those decisions are tracked in [UIST_DECISIONS.md](UIST_DECISIONS.md).
