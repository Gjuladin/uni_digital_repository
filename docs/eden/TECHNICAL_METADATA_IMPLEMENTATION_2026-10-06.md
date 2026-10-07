# Technical metadata implementation — 2026-10-06

Implemented locally in the UIST frontend and backend. EDEN/FIDELIS owns the harvester, which is treated as an external consumer. Publication records have not been edited. These changes are not deployed, committed, or pushed; live production still serves the previously committed version.

## Frontend and backend exports

The existing dirty-tree fixes are retained and validated: full item abstracts in JSON-LD, collection names and public URLs, explicit publication dates, normalized valid dates and languages, canonical Handle URLs, deduplicated DOI/Handle/OpenAlex identities, explicit journal/conference citation tags, and preservation of licence text and rights URLs. Missing publication facts are omitted rather than substituted with repository descriptions or accession dates.

The OAI exporter removes invalid XML 1.0 characters and leaves escaping to the serializer. Identify's earliestDatestamp uses indexed record modification timestamps, and resolver errors cannot silently substitute the current date.

## Completed OAI changes

- Identify now uses configurable `oai.identifier.sample`. This checkout defaults to `${handle.prefix}/93`, verified by a live GetRecord request. A deployment with a different corpus must configure a real public sample.
- The default public OAI context retains `oai_dc` and adds `dim`. DIM preserves schema, element, qualifier, language, value, and available authority information. It keeps accession and publication dates distinct without inventing Dublin Core term mappings.
- DIM excludes internal XOAI bundle, repository, licensing, and auxiliary sections. Registered metadata continues to come from the existing permission-filtered item export.
- The historical external DIM schema URL returned HTTP 404 during review. A local schema for this export's DIM structure is packaged at `/server/oai/static/dim.xsd`. Its configurable URL, `oai.dim.schema`, follows the server URL and OAI deployment path. Both the advertised format and crosswalk use that URL. This schema validates XML structure, not factual or semantic quality.

Offline transformation of the public REST snapshot preserved **all 3,732 values across 165 items**, including qualifiers and languages. Every output validated against the packaged schema. This is fixture validation, not a claim that production serves DIM. See [corpus evidence](evidence/2026-10-06-technical/dim-corpus-validation.json).

## Protocol auditing

The versioned, dependency-free [OAI auditor](../../scripts/eden_oai_protocol.py) fetches all ListIdentifiers and ListRecords pages for every advertised format. It checks totals, duplicate identifiers, continuation-token loops and failures, namespaces, deleted headers, date granularity, agreement between identifier and record lists, the earliestDatestamp lower bound, and GetRecord for the sample actually published in Identify.

```bash
python3 scripts/eden_oai_protocol.py \
  --endpoint https://repository.uist.edu.mk/server/oai/request \
  --out /tmp/uist-oai-protocol.json
python3 -m unittest discover -s scripts -p test_eden_oai_protocol.py -v
```

The live pre-deployment run completed both pages for all 165 records and produced **14 passing checks and two expected failures**: the earliestDatestamp excludes existing records, and the advertised `/1234` sample returns `idDoesNotExist`. See [protocol evidence](evidence/2026-10-06-technical/live-oai-protocol-before-deployment.json) and [verified replacement sample](evidence/2026-10-06-technical/live-verified-sample-93.xml).

The pre-existing `tools/eden-readiness` directory is locally excluded from Git. Its validator now delegates to the versioned auditor; the standalone script and regression tests under `scripts/` are available for upstream review independently of that local tooling.

## Compatibility with the unchanged EDEN harvester

EDEN/FIDELIS owns the harvester. The local API/model/report edits made during
this continuation have been removed from the isolated experiment checkout.
The baseline `/Users/samil/wp2-repo-harvester` remains unchanged. No harvester
changes or deployment are required by this implementation.

UIST serves ordinary HTML discovery metadata alongside its linked and embedded
repository JSON-LD, FAIRiCat service descriptions, and item metadata exports.
The JSON-LD identifies the publisher as an organization with its name and URL,
and exposes the configured services. These representations are the repository
side of compatibility with EDEN and other consumers. A read-only fixture check
against the unchanged baseline consumer retained the publisher name through
DCAT export and extracted seven configured services. See [compatibility
evidence](evidence/2026-10-06-technical/unchanged-harvester-compatibility.json).
This does not establish endpoint reachability or the deployed consumer version.

The EDEN public API's selection of its first metadata source, loss of the
meta-tag publisher during DCAT conversion, repeated discovered services, and
lack of publication-content scoring remain external consumer limitations.
They cannot all be repaired through truthful repository HTML. Repository-side
protocol and content audits therefore remain separate from EDEN's Found
indicators. We do not fabricate fields or suppress valid discovery sources to
make an external indicator appear better.

## Validation

- Frontend: 59 focused HeadTagService tests, lint, and browser/SSR production build passed during the swarm review; that source remains unchanged in this continuation.
- Metadata census and semantic audit: 13 Node tests passed.
- Protocol auditor: 13 offline regression tests passed.
- Backend: 11 focused OAI tests passed, including actual schema validation, qualifier preservation, internal-section exclusion, XML escaping, and deployment-specific schema URLs.
- Public schema delivery: one HTTP integration test passed without authentication, using the isolated H2 fixture environment. Compilation, XML checks, and Maven verification passed. Checkstyle and license gates were explicitly skipped for this integration command.
- Previously completed backend validation: six JSON-LD unit tests and 38 Linkset integration tests passed; see [validation details](evidence/2026-10-06-swarm/backend-validation.md).

Focused backend commands used OpenJDK 21:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
mvn -pl dspace-oai -DskipUnitTests=false \
  -Dtest='DIMXslTest,OaiConfigurationTest,Xml10TextSanitizerTest,DSpaceEarliestDateResolverTest' \
  -DfailIfNoTests=false test
mvn -pl dspace-server-webapp -DskipIntegrationTests=false \
  -Dit.test=OaiSchemaRestControllerIT -DfailIfNoTests=false \
  -Didentifier.doi.prefix=10.5072 -Dcheckstyle.skip=true -Dlicense.skip=true verify
```

Local logs: `/tmp/uist-oai-technical-tests-final.log`, `/tmp/uist-oai-schema-http-it.log`. The OAI module was installed into the local Maven cache before the HTTP integration run so it included the packaged schema.

## Deployment and remaining editorial work

Deploy the backend jar and updated OAI configuration/crosswalks together, then deploy the frontend build. Existing OAI index contents need a controlled full re-export and regenerated response caches so previously double-escaped values do not persist. Verify the hosted DIM schema, full protocol census, replacement sample, and representative parsed values after deployment. No EDEN harvester deployment or modification is part of this work.

Missing abstracts, subjects, access statements, licence decisions, and questionable publisher-policy URLs remain editorial work. The code preserves and audits available facts; it does not create those facts. Existing policy-page edits are retained.
