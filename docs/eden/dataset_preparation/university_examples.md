# How university DSpace repositories link data to publications

Observed **4 October 2026**. Two GPT-5.6 Luna subagents at high reasoning researched official university repository/library sources. The parent independently checked the Maryland and Edinburgh item pages, Maryland service guidance, Cambridge's version policy and Cornell's small README. Production work was anonymous/read-only; no data archives were downloaded. The earlier dual-registry/platform study remains at [the comparator report](../evidence/2026-10-04-dspace-comparators/comparison_summary.md).

## Patterns to use at UIST

**Verified public examples / Source implementation proposal for UIST:** keep the publication and a separately described dataset linked; place actual data and human-readable documentation together in the dataset record; give the dataset its own citation/version/identifier and item-specific rights/access. Record review and depositor responsibility rather than treating repository checking as scientific validation.

### Edinburgh DataShare

**Verified public:** [rotor-thrust simulation dataset](https://datashare.ed.ac.uk/items/e98337bc-f7ce-4998-8f91-c87fa8f8a307) links to [the journal article](https://doi.org/10.1016/j.jfluidstructs.2022.103599) and has its own dataset DOI `10.7488/ds/3426`. Its record groups four `.sim` files with `Simulation Information.docx`. The subagent retrieved the small documentation (HTTP 200); it maps simulation files to paper sections and identifies Star-CCM+ 2019.3. The large simulation files were not downloaded, so their contents/download operation remain **Unknown**. Documentation can be a methods document rather than a filename literally called README.

**Verified public policy statements:** [submission policy](https://library.ed.ac.uk/research-support/research-data-service/after/data-repository/service-policies/submission-policy) describes eligible institutional depositors/delegates and administrative checks, with authenticity the depositor's responsibility. [Trust guidance](https://library.ed.ac.uk/research-support/research-data-service/after/data-repository/trustworthy-digital-repository) expects human-readable documentation. [EatSense](https://datashare.ed.ac.uk/items/2f4e3531-c356-40d1-ae6b-afb95e42851c) shows a dataset replacement relationship and a withdrawn predecessor; actual version handling must be implemented at UIST, not inferred from DSpace capability.

### University of Maryland DRUM

**Verified public:** [electronic supporting chemistry data](https://drum.lib.umd.edu/items/4be40bf8-ccd4-4076-9d17-b72ddb084bf1) is a separate data record linking to article DOI `10.1002/chem.202502177`. It contains `Archive.zip` (displayed 17.35 MB) and `Read Me.txt` (5.46 KB), and has its own DOI `10.13016/pdpr-fvnj` and Handle. The subagent read the small README: it describes researcher-collected NMR, UV/Vis, fluorescence and computational-coordinate files used for publication figures. The archive was not inspected. [Official data guidance](https://researchdata.umd.edu/share-preserve/data-repositories) explicitly supports linking data to research outputs and says DRUM self-deposit does not include a data-curation service. [Deposit guidance](https://drum.lib.umd.edu/info/drum-about) describes moderation and depositor permissions.

**Unknown / discrepancy:** the landing page says CC BY-NC 3.0 US, while the README reports no restrictions. Do not copy this inconsistency. Maryland DRUM is a different service from **Minnesota DRUM**, the dual-registry example in the earlier comparison; no new dual-registry assertion about Maryland is made here.

### Cornell eCommons

**Verified public:** [AACSE land seismic waveform dataset](https://ecommons.cornell.edu/entities/publication/c1800916-1537-4070-9759-4b9ba7972b7f) contains README, metadata archive and waveform archive together. Its own DOI is `10.7298/q2fq-9688`; it links related papers and a separate companion ocean-bottom dataset. The parent retrieved the [10,945-byte README](https://ecommons.cornell.edu/server/api/core/bitstreams/a85dde1d-615b-4b19-bf49-83a995873473/content) anonymously (HTTP 200). It describes researcher processing of EarthScope waveforms into CSV metadata and HDF5 traces, with provenance and software guidance. Neither large archive was downloaded.

**Verified public policy statements:** [data policy](https://guides.library.cornell.edu/ecommons/datapolicy) requires usable description/documentation and a reuse licence, with curation for completeness and reuse. [Submission guidance](https://guides.library.cornell.edu/ecommons/submit) separates collection permission, deposit licence and submission/approval. [Alteration policy](https://guides.library.cornell.edu/ecommons/alteration) describes visible new versions. Parent web-tool access to the data-policy page returned HTTP 429; the subagent's primary-source observation supplies that policy finding.

**Unknown / discrepancy:** the landing metadata says CC0, while the README says CC BY 4.0. UIST should make the metadata, README and licence statement consistent before release. Researcher/source-processing provenance is documented; the exact private deposit/reviewer audit is not publicly established.

### Cambridge Apollo

**Verified public metadata:** [Must Farm metalwork dataset](https://www.repository.cam.ac.uk/items/998cd710-47fa-43cc-92b8-d79289675983), DOI `10.17863/CAM.107062`, has a `Supplements` relation to the separate [chapter record](https://www.repository.cam.ac.uk/items/1b3ffe93-18de-4045-b7c9-7135ef2914c9). A 28.2 MB PDF is listed with CC BY-NC-ND terms. Direct content access failed (HTTP 500); substantive dataset contents and documentation remain **Unknown**. This demonstrates record linking, not verified reusable data contents.

**Verified public policy statement:** [Apollo's DOI policy](https://www.repository.cam.ac.uk/info/doi-policy) distinguishes new file versions from metadata-only corrections and retains withdrawal notices. Adapt the version principle; UIST does not need to start minting DOIs to follow it. [Deposit guidance](https://www.repository.cam.ac.uk/info/howto-deposit) and [service definition](https://www.repository.cam.ac.uk/info/service-level) describe researcher/delegate deposit and quality checks.

## Boundary for UIST's derived aggregate packages

**Unknown:** no inspected policy/example establishes a university practice of repository staff transcribing published percentages merely to populate a data collection. These examples support genuine researcher data, documentation, separate linked records and controlled review. They do not independently validate the UIST compiler-created route.

**Institutional decision required:** The depositor should confirm transparently labelled derived compilations fit the chosen UIST collection scope and identify the responsible authorised compiler/depositor. The item 188 package has real source-derived values and documented CC BY provenance, but remains a local proposal. Original source creators and compilation contributors must be distinguished. Where possible, prefer a researcher-supplied documented dataset. Every publication gets an honest outcome; many need requests or remain publications only.

Limited supporting check: [README checks](research/readme-checks.json). No administrator confirmations, researcher permissions, licence reconciliations or University commitments were obtained from comparator research.
