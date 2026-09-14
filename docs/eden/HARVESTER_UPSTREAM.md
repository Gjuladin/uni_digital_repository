# EDEN harvester upstream improvements

The tested harvester is checked out unchanged at `/Users/samil/wp2-repo-harvester`. These potential improvements concern EDEN's extraction behavior, not missing UIST page content. They can be prepared without UIST policy decisions, but any upstream contribution requires review by the EDEN maintainers.

## Confirmed extraction gaps

| Harvester behavior | Proposed upstream improvement | Repository workaround/status |
| --- | --- | --- |
| Does not use `<html lang>` for repository language | Treat a valid HTML language attribute as a language fallback when explicit catalogue metadata is absent. | The frontend now also emits EDEN-compatible language metadata. |
| Does not use `meta name="author"` as organisation | Use `author` only as a cautious fallback, preferably when structured publisher/provider data is absent. | The frontend publishes the university as the `DataCatalog` publisher/provider. |
| Ignores page `<title>` for repository name | Use it as a low-priority fallback after structured data and explicit title meta tags. | The frontend emits an explicit repository title. |
| Ignores Open Graph and Twitter values | Use `og:title`, `og:description`, `og:url`, and `og:site_name` as lower-priority fallbacks. Twitter tags should be last-resort duplicates. | Explicit catalogue metadata is now emitted, so EDEN need not depend on preview tags. |
| Resolves `robots.txt` relative to `/home` | Resolve the robots URL from the origin root as required for ordinary website discovery. | `/home/robots.txt` is served as a compatibility alias. |
| Deduplicates links by URL alone | Deduplicate on the complete relation tuple, including URL, `rel`, media type, and anchor where relevant. | The FAIRiCat OpenSearch metadata link uses a harmless distinguishing query parameter. |
| Assumes RFC 9264 `anchor` appears before relation properties | Parse the complete linkset object before processing relations; JSON object member order is not significant. | DSpace serializes `anchor` first for compatibility. |

## Contribution boundary

1. Reproduce each issue against the recorded harvester commit.
2. Add isolated fixtures and regression tests in a separate branch or fork.
3. Do not modify the local baseline checkout used to score UIST.
4. Submit each behavioral change separately so EDEN maintainers can review precedence and false-positive risk.
5. Keep repository-side explicit metadata even if EDEN later accepts the fallbacks; explicit catalogue metadata is more reliable.

`meta name="generator" content="DSpace 10.0"` should remain informational. It describes software, not the repository resource type, name, or organisation.

## Isolated local patch evidence (2026-09-14)

All seven behaviors above were reproduced against the unchanged scoring checkout at commit `200c7c750501c5cc6cfc4bbcc18b0bfe80d7c380`. A separate worktree was used for the proposed fixes:

- worktree: `/Users/samil/wp2-repo-harvester-eden-parser`;
- branch: `codex/eden-parser-robustness`;
- local commit: `fab4179ffa7070380bbcf662f8baf628e37c9654` (`Harden EDEN landing page and linkset parsing`);
- focused tests: 8 passed;
- suite excluding the pre-existing port-collision test: 125 passed.

The complete suite has two environment failures in `test_server` because TCP port 8000 is already in use; neither failure exercises the parser changes. The patch has not been pushed, submitted, or merged. The scoring checkout remains at the recorded commit with a clean worktree.
