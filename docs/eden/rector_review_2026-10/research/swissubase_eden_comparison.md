# SWISSUbase and the EDEN harvester record

> Dated comparative research for the earlier drafting stage. The [current four-page pack](../dabar_simple_2026-10-06/README.md) was accepted by the rector, as reported on 6 October 2026. Earlier UIST approval recommendations below are historical; comparator rules remain source observations and do not impose new UIST requirements.

**Review date:** 3 October 2026 (Europe/Skopje)

## Evidence inspected

The supplied read-only EDEN reference is [the SWISSUbase record](https://eden.labs.dansdemo.nl/record/https%3A%2F%2Fwww.swissubase.ch%2Fen%2F). The visible record shell did not show a complete rendered card, so the underlying source object was fetched from the EDEN API endpoint:

`https://eden-es.labs.dansdemo.nl/api/eden/_source/https%3A%2F%2Fwww.swissubase.ch%2Fen%2F`

The object identifies `https://www.swissubase.ch/en/` as a `dcat:Catalog` and `foaf:Project`, names SWISSUbase, lists publishers (FORS, DaSCH, University of Neuchâtel and University of Zurich), gives `support@swissubase.ch`, lists repository and discipline keywords, exposes a search URL and OAI-PMH `ListRecords` service, and includes harvest provenance from FAIRsharing, embedded JSON-LD, re3data and meta tags. Its policy list is only `Policies`, `Versioning Policy`, and `Privacy Notice`.

The object also carries the following advertised attributes: established 2021; DOI as the persistent identifier type; CESSDA/CLARIN/DDI/DataCite/Dublin Core standards; open and restricted access with possible closed access for sensitive data; “Long-term” preservation on SWITCH servers; CoreTrustSeal and CLARIN B-Centre assertions; Swiss location; and “continuity guaranteed by consortium agreement.” These are harvester assertions, not a substitute for the linked current source documents.

## Live verification against primary sources

The SWISSUbase OAI-PMH endpoint was opened directly on the review date:

* [Identify](https://www.swissubase.ch/oai-pmh/v1/oai?verb=Identify) returned repository name, protocol 2.0, earliest datestamp 2022-01-01, seconds granularity and `deletedRecord=no`.
* [ListMetadataFormats](https://www.swissubase.ch/oai-pmh/v1/oai?verb=ListMetadataFormats) returned `oai_dc`, `oai_ddi25` and `oai_cmdi12`.

This supports EDEN’s OAI service field and standards assertions. It also qualifies the EDEN preservation/tombstone picture: SWISSUbase’s policies describe tombstones for withdrawn/deleted records, while the public OAI Identify response does not advertise deletion support. EDEN should not infer that OAI harvesters receive tombstone/deletion events.

## Field-by-field assessment

| EDEN field or assertion | Assessment | Reason and recommended EDEN treatment |
|---|---|---|
| `@id`, title, repository category/type | **Pass** | The landing page and catalogue identity are clear; the object is typed as catalogue/project and `_category` is repository. EDEN can use this for discovery. |
| `dct:contactPoint` | **Pass, with scope check** | `support@swissubase.ch` is present and matches the public Terms/Privacy contact path. EDEN should identify service support, privacy and rights contacts separately where they differ. |
| `dct:publisher` | **Pass for discovery; governance needs qualification** | Current governance names the consortium/simple society of FORS, University of Neuchâtel and University of Zurich, with DaSCH as collaborating partner. The EDEN object includes those entities, which is useful. Another harvester attribute mentions University of Lausanne, swissuniversities and SNSF; that is not a complete current governance statement and should be dated or sourced. |
| `dct:identifier` | **Pass, but not all identifiers are equivalent** | Repository URL, re3data ID/URL and FAIRsharing identifier are useful discovery identifiers. They do not make a dataset DOI or prove Handle. EDEN should label repository identifiers, registry identifiers and dataset PID types distinctly. |
| `dct:license` | **Weak / misleading at repository level** | The value is a generic Creative Commons licence chooser URL. SWISSUbase deposit and download sources make licences dataset-specific and can impose restricted contracts. EDEN should not present this as a universal repository licence; expose the Terms of Use and dataset-level rights instead. |
| `dct:conformsTo` | **Partial** | Links include policy menu `sr=2308`, versioning anchor `sr=3146`, and privacy `sr=5046`. `sr=3146` is an older/alias route; the current direct Data Versioning Policy is `sr=6651`. The array omits preservation, backup, security, Terms, Deposit and Download Contract links. EDEN should retain provenance and add current direct links. |
| `_policy` | **Partial** | Only “Policies”, “Versioning Policy” and “Privacy Notice” are named. This understates the public source set: Terms of Use, Deposit Contract, Download Contract/Annex, Digital Preservation, Backup, Security, DSU policies and governance are material to repository assessment. |
| `dcat:service` search | **Pass as advertised service** | The search URL template is present. Test/record its availability separately from policy status. |
| `dcat:service` OAI-PMH | **Pass, live verified** | The object advertises OAI `ListRecords` with `oai_ddi25`; direct Identify/ListMetadataFormats calls worked on 3 October 2026 and showed OAI-DC, DDI 2.5 and CMDI 1.2. The OAI Identify response uses an HTTP baseURL and `deletedRecord=no`, which should be captured as technical qualification. |
| `trsp:att.6AF56A372D` standards | **Pass with source/date** | CESSDA Controlled Vocabulary, CLARIN CMDI, DDI, DataCite and Dublin Core are consistent with the principles/API pages. The live OAI formats provide direct evidence for DDI 2.5/CMDI 1.2. |
| `trsp:att.2F993B25AD` DOI | **Pass** | SWISSUbase versioning/citation policies describe DataCite DOI lifecycle. This is dataset-level evidence; do not replace it with Handle claims. |
| `trsp:att.6B7CED5897` access | **Mostly pass, wording needs precision** | Open and restricted access, edu-ID login and DSU access requests match the public documentation. “Closed access possible” is broader than the consistently documented open/restricted/metadata-only workflows; EDEN should use the exact local tier names and explain metadata visibility. |
| `trsp:att.54317F78CB` subject/data scope | **Pass as discovery summary** | Social science, linguistics, humanities, project metadata and sensitive/restricted datasets match DSU and principles pages. It is not a complete eligibility or sensitive-data rule. |
| `trsp:att.768DAFA0DB` long-term/continuity | **Partial / overclaimed** | Public preservation policy says at least 10 years with DSU-specific periods and best-efforts/evolving controls. FORS continuity text describes funding risk and planning; the policies do not prove perpetual preservation. “Continuity guaranteed by consortium agreement” should be flagged as an advertised harvester claim requiring a current agreement and tested transfer evidence. |
| `trsp:att.1D00720769` “Long-term” | **Partial** | Suitable as a broad discovery descriptor only. For an assessment, record the documented minimum (at least 10 years, DSU-specific) and conditions. |
| `trsp:att.27C898E8A0` certifications | **Pass as reported, verify current certificates** | Principles page reports CoreTrustSeal for FORS/LaRS and CLARIN B-Centre status for LaRS+LiRI. Record certificate scope and dates, and do not treat certification as proof of each individual control. |
| `trsp:att.4570870110` Switzerland | **Pass** | Current infrastructure/security pages describe Swiss hosting/datacentres. This is relevant to location, not a conclusion about North Macedonian compliance. |
| `trsp:att.521A4A9E17` audience | **Pass with DSU nuance** | Swiss higher-education researchers and DSU-curated communities match public descriptions. Deposit eligibility varies by DSU and project; EDEN should not flatten it into universal free eligibility. |
| `trsp:att.394BC515E7` and similar yes/no fields | **Unclear without field labels** | The source object exposes hashed `trsp:att.*` keys. Preserve their values only with the EDEN profile/field mapping; do not infer the semantic meaning of an unlabeled yes/no value in a policy decision. |
| `_yearEstablished` | **Pass as catalogue metadata** | The harvester records 2021, consistent with public description. It does not prove the date of each policy or contract. |
| `prov:hadPrimarySource` | **Useful provenance** | FAIRsharing, embedded JSON-LD, re3data and meta-tags are listed. Current SWISSUbase legal/technical pages remain the controlling evidence for drafting. |

## Useful EDEN fields and gaps for an EDEN record

The SWISSUbase object demonstrates useful EDEN fields for a repository record: canonical landing page, repository type/category, title, publisher, support contact, keywords, service URLs, standards, persistent identifier type, access summary, subject scope, country, year established, governance model, preservation descriptor, certification claims and provenance. The live OAI check adds stronger evidence than a static metadata assertion.

For EDEN’s own repository record, the following additions would make the same fields more useful:

* separate repository policy URLs from dataset licences;
* provide policy title, version/effective date, review date and status for each policy;
* expose a source register for Terms, Deposit, Download, Privacy, Preservation, Backup, Security, Versioning, Curation and service cessation;
* distinguish open, embargoed, restricted, metadata-only and emergency-closed states;
* state preservation target and conditions instead of an unqualified “long-term” claim;
* expose OAI formats and deletion/tombstone behaviour explicitly;
* identify PID authority, registration state and version/withdrawal behaviour without claiming a live Handle until tested;
* state current contacts and escalation routes for deposit, privacy, rights and incidents;
* date certifications, infrastructure assertions and service availability evidence;
* keep a controlled policy/document register so landing-page URLs and PDF body dates cannot silently diverge.

## Read-only conclusion for the EDEN assessment

The EDEN harvester record is useful and mostly passes discovery/interoperability fields: identity, contact, publishers, repository type, OAI service, standards, DOI use, subjects, access summary and certifications are supported by live pages or the OAI endpoint. It becomes weaker where a broad harvester value compresses a conditional policy into an absolute claim: the generic Creative Commons URL, “long-term” preservation, “continuity guaranteed,” and “closed access” need qualification. It also omits important legal/operational documents and contains at least one stale/alias policy link.

Use the EDEN object as read-only comparison and provenance evidence. Use the current SWISSUbase legal, preservation, DSU and technical pages for EDEN drafting. No FAIRsharing submission or other external change is implied by this review.

