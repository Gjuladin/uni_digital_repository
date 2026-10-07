import { InfoConfig } from '@dspace/config/info-config.interface';

import { REPOSITORY_POLICY_VERSION } from './repository-policy-documents';

/** Publish only the explicitly enabled bundled version; validate any supplied date. */
export function areRepositoryPoliciesPublished(info: InfoConfig): boolean {
  const publication = info?.repositoryPolicyPublication;
  if (publication?.enabled !== true || publication.version !== REPOSITORY_POLICY_VERSION) {
    return false;
  }
  if (!publication.effectiveDate) {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publication.effectiveDate)) {
    return false;
  }
  const date = new Date(`${publication.effectiveDate}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === publication.effectiveDate;
}
