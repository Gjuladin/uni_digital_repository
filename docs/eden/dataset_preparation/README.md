# UIST dataset preparation queue

Prepared 4 October 2026. This folder holds research-data packages **before** public deposit. It is not a published dataset collection.

Start with [HANDOFF_PROMPT.md](HANDOFF_PROMPT.md). The repeatable process is in [WORKFLOW.md](WORKFLOW.md); university examples are recorded in [university_examples.md](university_examples.md).

- [All-publication index](inventory/publication_index.md): public records found in the dated discovery census, with a task outcome for every record.
- [Machine-readable inventory](inventory/publications.json): identifiers, source links, dates, rights and progress. This is the queue's source of truth.
- `packages/<publication-uuid>/<version>/`: genuine data plus documentation, source evidence and release checks. No empty datasets are created merely to satisfy the queue.
- [requests/DRAFTS.md](requests/DRAFTS.md): all 111 unsent request drafts, with one anchor per publication UUID. Drafting a request does not mean it was sent.

The first package is the **22-observation derived aggregate release for item 188**, copied from the reviewed example. It is `prepared_needs_deposit`, not ready for automatic publication. Original example and evidence remain at [the item 188 report](../evidence/2026-10-04-item-188-dataset-example/comparison.md).

The repository administrator authorises institutional accounts and collection permissions and provides technical support. Authorised depositors publish directly; there is no mandatory administrator approval or assigned reviewer. Before release, identify the responsible human compiler/depositor, confirm source authority, documentation, rights/access and normal DSpace deposit terms, then verify the published files and metadata. Preserve each publication as a publication and link its separately described dataset.

Use the [current simplified policies](../rector_review_2026-10/dabar_simple_2026-10-06/README.md), accepted by the rector as reported on 6 October 2026. Earlier dated package/source-review evidence may retain pre-acceptance policy or assigned-reviewer assumptions; those historical labels do not add an administrator sign-off step to the current workflow. Complete the depositor's package checks alongside preparation; completing the entire publication backlog is not a re3data submission prerequisite.

## Continuation result —5 October 2026

The full165-record census was refreshed and reconciled across REST/OAI. Every record now has a current outcome.89 substantive source investigations are complete; 76 remain incomplete and explicitly listed. Three genuine local aggregate packages are validated; 111 researcher/source/rights requests are unsent. No dataset was deposited. The responsible authorised depositor and package-specific rights/access confirmations remain unresolved.

Start with [preparation report](PREPARATION_REPORT.md), [complete publication queue](inventory/publication_index.md), [incomplete sources](inventory/incomplete_publications.md) and [release actions](RELEASE_ACTIONS.md). Earlier starting counts above are historical.

Research cleanup, 6 October 2026: the master inventory retains all 165 full publication reviews under `last_integrated_review`; separate duplicate review files, raw snapshots, probe logs and interrupted helpers were removed. Unique probe details are consolidated in `research/external-probe-summary.json`. Source/rights holds, package evidence and research counts are preserved.
