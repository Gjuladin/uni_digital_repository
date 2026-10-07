import { HarvestingConfig } from './harvesting-config.interface';
import { getRepositoryPolicyLinks } from './repository-policy-links.util';

describe('repository policy links', () => {
  let config: HarvestingConfig;

  beforeEach(() => {
    config = {
      enabled: true,
      repository: {
        name: 'Repository',
        description: '',
        languages: ['en'],
        subjects: [],
        publisher: { id: '', name: '', url: '' },
      },
      services: {
        rest: false,
        oaiPmh: false,
        openSearch: false,
        feeds: false,
        sitemap: false,
        signposting: false,
      },
    };
  });

  it('hides unconfigured, disabled and empty claims', () => {
    expect(getRepositoryPolicyLinks()).toEqual([]);
    config.repository.accessRightsUrl = { enabled: false, value: 'https://repository.uist.edu.mk/policies/access' };
    config.repository.depositPolicyUrl = { enabled: true, value: '  ' };
    expect(getRepositoryPolicyLinks(config)).toEqual([]);
    config.repository.accessRightsUrl.enabled = true;
    config.enabled = false;
    expect(getRepositoryPolicyLinks(config)).toEqual([]);
  });

  it('omits unsafe or non-public destinations', () => {
    for (const value of [
      'javascript:alert(1)',
      'data:text/html,draft',
      '/info/deposit-policy',
      'http://repository.uist.edu.mk/info/access',
      'https://localhost/info/access',
      'https://192.168.0.1/info/access',
      'https://admin:secret@repository.uist.edu.mk/info/access',
    ]) {
      config.repository.accessRightsUrl = { enabled: true, value };
      expect(getRepositoryPolicyLinks(config)).toEqual([]);
    }
  });

  it('deduplicates identical URLs while retaining links to distinct policy sections', () => {
    config.repository.accessRightsUrl = { enabled: true, value: ' https://repository.uist.edu.mk/policies?version=1#access ' };
    config.repository.depositPolicyUrl = { enabled: true, value: 'https://repository.uist.edu.mk/policies?version=1#access' };
    config.repository.curationPolicyUrl = { enabled: true, value: 'https://repository.uist.edu.mk/policies?version=1#curation' };

    expect(getRepositoryPolicyLinks(config)).toEqual([
      {
        labelKeys: ['info.repository-policies.access', 'info.repository-policies.deposit'],
        url: 'https://repository.uist.edu.mk/policies?version=1#access',
      },
      { labelKeys: ['info.repository-policies.curation'], url: 'https://repository.uist.edu.mk/policies?version=1#curation' },
    ]);
  });
});
