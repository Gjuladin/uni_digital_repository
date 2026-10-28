# DANS EDEN metadata integration

The repository's public JSON-LD and FAIRiCAT catalog are generated from
`config/config.yml` by `src/config/harvesting-metadata.util.ts`. The same graph
is embedded in rendered pages and served at `/.well-known/repository.jsonld`.

## Published facts and policy metadata

The repository owner confirmed a **2025 launch** on 28 October 2026. Funding is
described as **University-funded**, as requested by the owner. The graph preserves
year precision rather than inventing a launch day. `creditText` carries the
funding statement and `funder` identifies the university; no grant award is
asserted.

The catalog's CC0 licence applies to public descriptive metadata. Each item's
files retain their own rights. Deposit, access, curation and retention link to
the actual section IDs in the approved policy document. Policy definitions are
nested under `publishingPrinciples` and explicitly typed `CreativeWork`, so the
EDEN extractor can retain their names without overwriting nodes that share an ID.

Service metadata distinguishes the OpenSearch endpoint's Atom response from
its description document's OpenSearch media type. The JSON-LD context maps
service and endpoint properties to DCAT and endpoint values to IRIs.

Signposting is advertised on actual item pages. The repository catalog must not
advertise `/signposting/links/{uuid}` as a resolvable service. Standard Schema.org
SearchAction templates remain valid search descriptions; EDEN must instantiate
them before testing them as operational URLs.

## DANS indexing work still required

At inspection time, the DANS interface read these properties instead of the
corresponding Schema.org fields. The existing extractor does not export launch
year or funding statement into these attributes. A supported profile import or
an indexing mapping is required; deploying this frontend alone will not populate
all DANS rows.

| DANS field | Indexed property | UIST value / mapping source |
|---|---|---|
| Country | `trsp:att.4570870110` | North Macedonia; configured publisher country `MK` |
| Year established | `trsp:att.48BF7E1522` | `2025`; catalog `dateCreated` |
| Repository type | `trsp:att.6A715E3A22` | Institutional Repository; confirm the target vocabulary label |
| Purpose | `trsp:att.035ACCB10D` | Configured repository description |
| Funding | `trsp:att.6EF77F35F8` | University-funded; map to the target controlled vocabulary |
| Policies | `_policy` | Names of harvested policy nodes under `dct:conformsTo` |
| Attribute profile | `trsp:hasApplicableProfile` | Create/associate a UIST profile through the supported registry workflow |

Do not reuse SWISSUbase's profile identifier or certification claims. Refresh
harvesting, harmonization and the DANS index after deployment and confirm the
actual indexed `_source`, displayed fields and service validation timestamps.
Country already existed in UIST's publisher metadata when the display showed
“Not specified”; it needs an indexing/UI mapping rather than another address tag.

The DANS route for the API-catalog record returned 403 while UIST's origin
catalog returned 200. Investigate that route on the DANS side. Likewise, inspect
validator diagnostics before changing REST, OAI or sitemap behavior to chase
their stored scores.

## Item rights serialization

Frontend and backend serializers preserve textual licences and rights notices.
Only a complete HTTP(S) URI can become a Signposting `rel=license` target.
Malformed prose in `dc.rights.uri` is preserved in `copyrightNotice`, including
when `dc.rights` contains a different notice. No serializer guesses a Creative
Commons licence from narrative text.

The public record with Handle `20.500.15029/280` still needs a curator to verify
its conflicting source rights and repair its stored URI field. Code validation
prevents the malformed link from being emitted; it does not establish the
correct legal licence for that record.
