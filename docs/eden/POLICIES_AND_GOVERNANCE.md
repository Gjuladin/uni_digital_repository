# Policies and governance required from UIST

The development team can supply page templates and machine-readable links, but UIST must define, approve, own, and maintain the policy content. Existing general university terms should only be reused when UIST confirms that they govern this repository.

## Policy set

| Policy | Questions UIST must settle | EDEN/registry use |
| --- | --- | --- |
| Deposit policy | Who may deposit, accepted content, required metadata/files, moderation, depositor warranties, rights checks, and refusal criteria? | Terms of deposit; repository policy. |
| Access policy | What is openly accessible, what may be restricted, who authorizes restrictions, and how are embargoes handled? | Terms of access; access rights. |
| Preservation policy | Preservation commitment, supported formats, fixity/backups, migrations, retention period, and responsibilities. | Preservation claim; repository policy. |
| Curation policy | Review level, metadata enhancement, file validation, version handling, and service expectations. | Curation level. |
| Metadata policy | Who may reuse metadata and under what licence; required fields and vocabularies. | Metadata reuse and format claims. |
| Content/data licence policy | Whether there is any default licence and how depositors select item-specific licences. | Dataset-use licence and registry licence fields. |
| Takedown policy | Copyright/privacy complaint channel, assessment, temporary suppression, appeal, and retained tombstone metadata. | Governance evidence and public trust. |
| Withdrawal/versioning policy | When items may be withdrawn, corrected, replaced, or versioned and how persistent identifiers behave. | PID and curation claims. |
| Privacy policy | Personal data processed by the repository, lawful basis, logs/accounts, retention, processors, and contact rights. | Public policy and registry link where accepted. |
| Terms of use | Permitted site/API use, user responsibilities, disclaimers, and relationship to the general End User Agreement. | Terms of access/use. |
| PID policy | Identifier assignment, persistence commitment, ownership, updates, tombstones, and succession. | Handle/DOI registry claims. |
| Certification policy/decision | Whether UIST will pursue CoreTrustSeal or another relevant certification and who owns the evidence process. | Certificate/seal/standard field. |

## Publication requirements

Each approved policy needs:

- a stable public HTTPS URL under a UIST-controlled domain;
- a title, owner, approval date, effective date, and review date;
- version history and an archival strategy for replaced versions;
- contact details for questions or complaints;
- English text and any additional language version UIST requires;
- confirmation that the wording applies specifically to the repository.

The frontend `harvesting` configuration must enable a policy link only after its URL is public and approved. A blank or draft URL remains unpublished.
