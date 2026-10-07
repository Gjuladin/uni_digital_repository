import { InfoConfig } from '@dspace/config/info-config.interface';

import { REPOSITORY_POLICY_VERSION } from './repository-policy-documents';
import { areRepositoryPoliciesPublished } from './repository-policy-publication.util';

describe('repository page publication', () => {
  const configured = (): InfoConfig => ({
    repositoryPolicyPublication: {
      enabled: true,
      version: REPOSITORY_POLICY_VERSION,
      effectiveDate: '2026-10-05',
    },
  });

  it('keeps the bundle disabled without explicit configuration', () => {
    expect(areRepositoryPoliciesPublished(undefined)).toBeFalse();
    expect(areRepositoryPoliciesPublished({})).toBeFalse();
  });

  it('requires explicit enablement', () => {
    const config = configured();
    config.repositoryPolicyPublication.enabled = false;
    expect(areRepositoryPoliciesPublished(config)).toBeFalse();
  });

  it('requires the configured bundle to match the page content version', () => {
    const config = configured();
    config.repositoryPolicyPublication.version = 'earlier-version';
    expect(areRepositoryPoliciesPublished(config)).toBeFalse();
  });

  it('permits explicitly enabled pages without inventing an effective date', () => {
    const config = configured();
    delete config.repositoryPolicyPublication.effectiveDate;
    expect(areRepositoryPoliciesPublished(config)).toBeTrue();
  });

  it('rejects malformed or impossible effective dates when supplied', () => {
    const config = configured();
    for (const date of ['YYYY-MM-DD', '2026-02-30', '2026-13-05']) {
      config.repositoryPolicyPublication.effectiveDate = date;
      expect(areRepositoryPoliciesPublished(config)).toBeFalse();
    }
  });

  it('permits an explicitly enabled bundle with its effective date', () => {
    expect(areRepositoryPoliciesPublished(configured())).toBeTrue();
  });
});
