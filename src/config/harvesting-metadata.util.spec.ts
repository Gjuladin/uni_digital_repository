import { HarvestingConfig } from './harvesting-config.interface';
import {
  buildFairicatLinkset,
  buildRepositoryGraph,
  getHarvestingServices,
} from './harvesting-metadata.util';

describe('harvesting metadata utilities', () => {
  const config: HarvestingConfig = {
    enabled: true,
    repository: {
      name: 'UIST Digital Repository',
      description: 'UIST research outputs',
      languages: ['en'],
      subjects: ['Open science'],
      publisher: {
        id: 'https://uist.edu.mk/#organization',
        name: 'UIST',
        url: 'https://uist.edu.mk/',
        countryCode: 'MK',
      },
    },
    services: {
      rest: true,
      oaiPmh: true,
      openSearch: true,
      feeds: true,
      sitemap: true,
      signposting: false,
    },
  };

  it('builds a repository-first DataCatalog graph without unapproved claims', () => {
    const graph = buildRepositoryGraph(
      config,
      'https://repository.uist.edu.mk/',
      'https://repository.uist.edu.mk/server/',
    ) as any;

    expect(graph['@graph'][0]['@type']).toBe('DataCatalog');
    expect(graph['@graph'][0]['@id']).toBe(
      'https://repository.uist.edu.mk/#repository',
    );
    expect(graph['@graph'][0].license).toBeUndefined();
    expect(graph['@graph'][0].contactPoint).toBeUndefined();
  });

  it('uses the correct OpenSearch description endpoint', () => {
    const services = getHarvestingServices(
      config,
      'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server',
    );
    const openSearch = services.find(
      (service) => service.name === 'OpenSearch',
    );

    expect(openSearch.metadataUrl).toBe(
      'https://repository.uist.edu.mk/server/opensearch/service?source=fairicat',
    );
    expect(openSearch.mediaType).toBe('application/opensearchdescription+xml');
  });

  it('builds an RFC 9264 linkset with service documentation and metadata', () => {
    const catalog = buildFairicatLinkset(
      config,
      'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server',
    ) as any;

    expect(catalog.linkset.length).toBeGreaterThan(0);
    expect(
      catalog.linkset.some((entry: any) => entry['service-doc']),
    ).toBeTrue();
    expect(
      catalog.linkset.some((entry: any) => entry['service-meta']),
    ).toBeTrue();
    const openSearch = catalog.linkset.find((entry: any) =>
      entry.anchor.endsWith('/opensearch/search'),
    );
    expect(openSearch['service-meta'][0].href).toContain('?source=fairicat');
  });

  it('requires optional governance claims to be enabled and non-empty', () => {
    const gatedConfig: HarvestingConfig = {
      ...config,
      repository: {
        ...config.repository,
        licenseUrl: { enabled: false, value: 'https://example.org/license' },
        contactEmail: { enabled: true, value: '  ' },
        depositPolicyUrl: {
          enabled: true,
          value: 'https://example.org/deposit',
        },
      },
    };
    const graph = buildRepositoryGraph(
      gatedConfig,
      'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server',
    ) as any;

    expect(graph['@graph'][0].license).toBeUndefined();
    expect(graph['@graph'][0].contactPoint).toBeUndefined();
    expect(graph['@graph'][0].policy).toEqual([
      jasmine.objectContaining({ '@id': 'https://example.org/deposit' }),
    ]);
  });
});
