# UIST re3data registration readiness review

> Current local assessment, 7 October 2026: the dataset submission implementation now addresses the earlier technical workflow gap. Fresh local REST, file-access and OAI checks passed. Deployment, production Dataset collection setup and genuine public research-data evidence remain to be completed; see [the updated assessment](eden/dataset_submission/RE3DATA_ASSESSMENT_2026-10-07.md). The September findings below are historical observations.

> This review records observations from 30 September 2026. Update 6 October: the rector accepted the [four-page policy pack](eden/rector_review_2026-10/dabar_simple_2026-10-06/README.md), including UIST scope, operator, contacts, languages and CC0 metadata. Earlier calls below to approve those rules describe the pre-acceptance state. Production policy publication and genuine research-data evidence still need verification; use [the current registry record](EDEN_REGISTRY_SUBMISSION.md).

Reviewed: **30 September 2026**. Repository: <https://repository.uist.edu.mk/>.

## Assessment

**Registration readiness is not yet demonstrated.** UIST has a functioning institutional repository, but its publicly visible scope and item metadata currently describe a publication repository. Establishing a genuine research-data service is the main eligibility issue. Public access and reuse rules also need clarification. Acceptance remains a decision for re3data's editors.

This review separates re3data's minimum eligibility rules from useful improvements and UIST's own approval process. It does not authorize a submission or publish new institutional policies.

## Actual minimum requirements

The [current re3data schema page](https://www.re3data.org/schema) lists version 4.0. Its [registration policy, section 1.3, pages 5–6](https://gfzpublic.gfz-potsdam.de/pubman/item/item_5022309_4/component/file_5022681/re3data-schema-documentation-V4-0.pdf) requires a research-data focus, a sustainable legal operator, explained access conditions, and terms of use. The [FAQ](https://www.re3data.org/faq) explains that editors assess the repository website and another editor reviews the record before publication.

| Minimum requirement | Evidence for UIST | Assessment and action |
| --- | --- | --- |
| Focus on research data | Homepage and collections emphasize publications and theses. All 165 public items returned by Discovery have publication types; none is typed Dataset or Software. | **Not demonstrated.** Confirm whether underlying research data are actually deposited or whether the service harvests research-data metadata. Identify real examples and publish the approved data-service scope. |
| Legal operator with sustainable organizational support | University identity, university domain, address, and contact are publicly displayed. | **Strong basis; institutional confirmation remains needed.** State that UIST operates the repository, identify its responsible unit, and describe its maintenance and preservation responsibilities. |
| Clear access to repository and research data | Anonymous browsing works. Public item metadata lacks `dcterms.accessRights`. No dedicated repository access policy is linked in the reviewed footer. | **Partly evidenced.** Explain browsing, file access, restrictions, embargoes, requests for access, and deposit eligibility on a public page. Missing metadata alone does not establish that files are restricted. |
| Terms of use | A public End User Agreement exists. It contains broad personal/non-commercial use and retrieval restrictions. | **Present; clarity needs improvement.** Explain permitted metadata and dataset reuse, applicable item licences, and any exceptions to general site restrictions. |

An institutional repository can qualify when it provides a genuine research-data service alongside publications. A research paper about data, a DOI on a paper, or DSpace's ability to store datasets does not establish that service. Conversely, relevant data can be attached to a publication or described using an imperfect type: this metadata audit did not inspect every file's contents and cannot prove that no research data exist.

## Live findings

Anonymous GET requests to the production website and API on the review date established:

- DSpace API reports **DSpace 10.0** and the name **UIST Digital Repository**.
- Both Discovery pages returned 181 objects, of which **165 were items**. Item types: 120 Articles, 5 Conference papers, 8 Books, 29 Book chapters, 1 Technical Report, and 2 Conference abstracts.
- **116 items** had no value in the checked rights/licence fields: `dc.rights`, `dc.rights.uri`, `dcterms.license`, and `dc.rights.license`. This is a metadata check, not a determination of their legal rights.
- On the 2026-09-30 review date, all 165 lacked `dcterms.accessRights` and used local Handle values beginning `123456789/`. This is a historical snapshot. Update 2026-10-06: production uses registered prefix `20.500.15029` for the verified sample, and [20.500.15029/261](https://hdl.handle.net/20.500.15029/261) resolves globally to the correct public item; see [current Handle evidence](eden/HANDLE_ACTIVATION.md). Full migration coverage was not re-audited.
- OAI-PMH `ListMetadataFormats` advertised **only `oai_dc`**. Do not describe DataCite XML as an enabled OAI format without additional verification. A different endpoint exposing DataCite is a separate claim.
- [Privacy](https://repository.uist.edu.mk/info/privacy) and [End User Agreement](https://repository.uist.edu.mk/info/end-user-agreement) pages both responded successfully; both display an update date of 4 May 2023.

The terms grant personal/non-commercial access and prohibit systematic retrieval without permission. They also assert US hosting, which UIST should verify. These are content-review findings, not a conclusion about legal enforceability. UIST should approve wording that accurately describes the service and clearly explains the relationship between general terms, metadata permissions, and item-specific licences. A privacy policy does not replace an access or data-use policy.

Saved evidence: [public response excerpts, item metadata, and counts](eden/evidence/2026-09-30/re3data-live-review.json). The older September 14 report concerned the local stack; the counts above come from fresh production requests.

## Work to complete before submission

1. **Settle research-data eligibility first.** Ask the repository manager to identify existing datasets, supplementary research data, research software where appropriate, or a genuine data-metadata harvesting service. If UIST currently accepts publications only, establish an approved research-data deposit service before presenting it as a research-data repository. A dedicated Research Data collection would make that scope easier to discover, but re3data does not prescribe this exact collection structure or a minimum dataset count in the reviewed policy.
2. **Publish the service scope and institutional responsibility.** Describe accepted data, eligible depositors, responsible UIST unit, contact, and the actual preservation arrangements. Link representative data records. The homepage should reflect the approved scope.
3. **Publish explicit access and deposit rules.** Distinguish open browsing of metadata, access to actual files, and permission to deposit. Describe restrictions and embargoes only if supported. Explain how external users request access where applicable.
4. **Clarify reuse terms.** Distinguish metadata reuse, dataset licences, and site terms. Record actual item permissions; do not blanket-apply CC BY or CC0 without authority from the relevant rights holders. re3data does not require all data to be openly accessible.
5. **Approve the submission facts.** Confirm the official name, operator, country, description, research areas, content types, public contact, and relevant policy URLs. Record the authorized institutional submitter and exact approved values using the existing UIST decision process.
6. **Suggest the repository and follow editorial review.** Use the [Suggest form](https://www.re3data.org/suggest/), answer curator questions, and capture the public identifier after acceptance. The form returned an anti-bot page during this review, so its current fields and login requirements were not verified. No submission was made.

## Useful improvements that are not the four minimum requirements

DOI minting, registered Handles, CoreTrustSeal certification, OAI-PMH, REST, JSON-LD, Signposting, FAIRiCat, and an EDEN score are not listed as minimum eligibility requirements in the reviewed registration policy. Describe capabilities accurately; their absence should not be treated as an automatic bar to suggesting an otherwise eligible repository.

The existing [registry draft](EDEN_REGISTRY_SUBMISSION.md) includes broader EDEN/FAIRsharing and institutional release prerequisites. These are useful project requirements, but they should not all be attributed to re3data. In particular:

- Do not claim registered Handle support from the example prefix `123456789`.
- A publisher-assigned DOI in an item is not proof that UIST mints identifiers.
- Do not claim certification without evidence; obtaining certification is not a prerequisite here.
- re3data's policy says anyone can suggest a repository. Maintaining institutional ownership of correspondence is good governance; a mandatory re3data account has not been established by this review.

## Preparation sheet

These are useful facts to assemble, not a verified list of current form fields.

| Fact | Candidate or next action |
| --- | --- |
| Name and homepage | UIST Digital Repository; `https://repository.uist.edu.mk/` — confirm official wording. |
| Operator | University of Information Science and Technology "St. Paul the Apostle" — confirm official legal name and responsible unit. |
| Country | North Macedonia, as displayed publicly — obtain institutional confirmation. |
| Repository type | Institutional is a candidate classification. |
| Public contact | `contact@uist.edu.mk` is a displayed general university contact; confirm whether it handles repository inquiries. |
| Scope and representative records | Pending demonstration of a research-data service. |
| Access and use | Supply approved public links and accurate explanations. |
| Software and interfaces | DSpace 10.0; REST API and OAI-PMH observed; OAI format `oai_dc` only in this response. |
| Subjects, licences, PIDs, certification | Use only evidence-backed, approved values. |

Conditional description for institutional review, **only after UIST actually provides and confirms the stated service**:

> UIST Digital Repository is the institutional repository of the University of Information Science and Technology "St. Paul the Apostle" in Ohrid, North Macedonia. It preserves and provides access to research datasets and associated documentation produced by the university's research community, alongside scholarly publications. Access and reuse conditions are stated in the repository policies and individual records.

Do not submit this conditional description as a present fact while the data-service scope remains unverified.
