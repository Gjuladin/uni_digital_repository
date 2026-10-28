# UIST metadata consumed by the existing EDEN and DANS services

The EDEN harvester and DANS Lab are external, fixed consumers. Changes in this
repository are limited to UIST's own metadata, discovery documents and endpoints.
No upstream patches or changes to those services are part of the implementation.

## Source metadata and interfaces

Public repository JSON-LD and the FAIRiCAT catalog are generated from
`config/config.yml` by `src/config/harvesting-metadata.util.ts`. The graph is
embedded in rendered pages and served at `/.well-known/repository.jsonld`.

The owner confirmed a **2025** launch and the funding description
**University-funded**. These are published as Schema.org `dateCreated`,
`creditText` and `funder`. Year precision is preserved; no launch day or grant
award is invented. The institution's address contains country code `MK`.
The publisher reference precedes the shared provider/funder references because
the unchanged graph expander fully expands only the first reference to a node.
This preserves the publisher name and country in its repository extraction.

The repository description includes the institution's full name, location, launch
year, funding and collection scope. Eight subject keywords describe the public
research areas and deposited datasets. These can support DANS's title/description/
keyword search and keyword facets. No certification or project membership is
inferred from participation or from SWISSUbase.

The verified re3data entry is
[r3d100014963](https://www.re3data.org/repository/r3d100014963), whose canonical
repository URL matches UIST. It is exported as an identifier and `sameAs` link.
The public administrator name, email and contact page are also published.
The registry record's citation DOI is
[10.17616/R31NJO1F](https://doi.org/10.17616/R31NJO1F). It identifies the re3data
record describing UIST and is attached to a `subjectOf` WebPage, rather than
assigned to the catalog or any deposited item. The record's editing date,
14 October 2026, is separate from the repository's 2025 launch year. The fixed
harvester does not export `subjectOf`; this reference adds provenance for other
metadata consumers without populating a new DANS field.
Contact information is useful to harvesters but is not displayed by the inspected
DANS record component.

The catalog's CC0 licence applies to public descriptive metadata. Item files
retain their own rights. Deposit, access, curation and retention point to the
actual section IDs in the approved policy document. Each policy has its own
identifier and is explicitly typed `CreativeWork`, which the existing extractor
recognizes. The separate public privacy document is a fifth policy. Their titles
can become DANS's `_policy` labels during normal harvesting and indexing.

OpenSearch advertises its actual description endpoint, `/server/opensearch/service`,
with `application/opensearchdescription+xml`; the document supplies the real query
templates. REST has an explicit `dct:type` of `REST` alongside the DSpace REST
contract. The graph uses DCAT service/endpoint terms and endpoint IRIs. Atom and
RSS use identical URLs in JSON-LD, HTML discovery and the API catalog, avoiding
duplicates caused by query variations. Per-item Signposting remains available; a literal `{uuid}`
placeholder is not advertised as a working repository service endpoint.
Feed wildcards use `%2A` consistently because the consumer encodes literal `*`
in JSON-LD URLs before merging them with HTML and FAIRiCAT discoveries.

One shared builder supplies HTML links and HTTP `Link` headers on the repository
landing pages and discovery documents. HTTP HEAD requests work too. Public base
paths are preserved; incoming Host/proxy headers cannot change canonical URLs.
The generated documents support ETags and five-minute public caching. Private REST
addresses and disabled discovery declarations remain absent.

The API catalog is advertised at `/api-catalog`, a clean alias for the same
`application/linkset+json` document available at `/.well-known/api-catalog`.
The observed DANS detail route containing the encoded well-known path returned
nginx 403 even though UIST's original endpoint returned 200. The alias avoids
that path form without requiring a DANS change. Its effect on the public record
must be checked after normal harvesting/indexing; no live fix is claimed here.

The SearchAction retains its parameterized `target` and query input. The unchanged
validator substitutes a real query for the encoded placeholder. A bare `url`
would take priority during extraction and discard that useful template.

Item JSON-LD, citation keywords and Dublin Core tags include qualified
`dc.subject.*` fields as well as unqualified subjects. Structured keyword and
citation lists deduplicate identical terms. Existing record metadata and rights
remain authoritative.

## What the existing consumers do not expose

Reverse engineering found that all 23 SWISSUbase `trsp:att.*` values in the
captured DANS record exactly match the public exporter's curated
`repository-attribute-fallback.ts` entry. UIST has no corresponding entry at the
inspected revision. This enrichment is separate from metadata exposed on the
repository website.

| DANS row | Existing behavior for UIST |
|---|---|
| Country | Publisher country `MK` is harvested, but the row reads repository attribute `trsp:att.4570870110`. |
| Year established | Source `dateCreated` is correct, but the existing extractor does not export it to `trsp:att.48BF7E1522`. |
| Repository type | The description identifies an institutional repository; the TRSP classification row is not derived from that text. |
| Funding | Source funding metadata says University-funded; the TRSP funding row is not derived from it. |
| Purpose | The repository description is displayed under About; the separate TRSP Purpose row is not populated from it. |
| Policies | Named, separately identified policy nodes are supported by the existing extraction/indexing pipeline. |

No direct TRSP attributes are added solely to target these rows: the unchanged
harvester drops them, so publishing them would not populate the current display.
A perfect-looking set of rows cannot be guaranteed through UIST source changes
alone under this constraint. Valid source metadata and working discovery
interfaces remain the acceptance criteria for changes we control.

Swiss's `profile.3C2D6C1C37` is the shared FIDELIS description profile, not a
Swiss-specific identifier or certificate. Profile applicability, membership,
certification and funding are separate assertions. None is inferred or copied
from the Swiss record.

## Item rights serialization

Frontend and backend serializers preserve textual licences and rights notices.
Only a complete HTTP(S) URI can become a Signposting `rel=license` target.
The frontend requires an explicit authority before using the browser URL parser,
which would otherwise repair malformed forms such as `https:/example.org/license`.
Both serializers reject missing/extra authority slashes and credential-bearing
authorities, preserve rejected URI text as a notice, and retain an independently
supplied textual licence.
Malformed prose in `dc.rights.uri` is preserved in `copyrightNotice`, including
when `dc.rights` contains a different notice. No licence is guessed from prose.

The record with Handle `20.500.15029/280` still needs a curator to verify its
conflicting source rights and repair its stored URI field. Serialization guards
prevent a malformed link; they do not determine the record's correct licence.

## Deployment and verification

The DANS site source is
[DANS-KNAW/dans-frontend-framework, apps/eden](https://github.com/DANS-KNAW/dans-frontend-framework/tree/main/apps/eden).
The local read-only checkout is `/Users/samil/dans-frontend-framework`, inspected
at `eceefb6b05aaaa07e01adbe5e7298e6ddf7e9890`. Its search configuration and record
component confirm the field behavior described above; this does not establish
the revision deployed by DANS.

Run `npm run test:repository-discovery` for actual Express HTTP checks of GET,
HEAD, cache validation, aliases, base paths, publication switches and public URL
isolation. The focused Angular metadata suites exercise graph generation and
head tags. For an offline extraction/export/harmonization regression using a
local unchanged harvester and its installed Python environment, run:

```sh
npm run test:eden-compatibility -- --harvester-path /path/to/wp2-repo-harvester
```

This generates fresh fixtures from the real configuration. It checks both
embedded and linked JSON-LD, publisher country, identifiers, keywords, contact,
five policies, service types and exact feed URL agreement. FUSEKI and HTTP are
in-memory stand-ins; endpoint validation and external writes are disabled.
An alternative Python executable can be supplied with `--python /path/to/python`.

The unchanged installed EDEN validator accepted the live OpenSearch
description endpoint at 10/10 on 28 October 2026; this is a local validation
result, not a new public DANS score. It also accepted REST and the SearchAction
template. The fixed consumer loses `dct:format` during its second extraction;
UIST cannot repair that export mapping.

Deploy the UIST frontend/backend changes, then inspect the results after the
existing services' normal harvesting, validation and indexing. Confirm actual
`_source` values and validation timestamps; local extraction checks do not change
the public DANS record or generate new public service scores.
