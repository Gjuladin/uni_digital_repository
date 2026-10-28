import { HarvestingConfig } from './harvesting-config.interface';
import {
  buildFairicatLinkset,
  buildRepositoryGraph,
  getHarvestingServices,
  getRepositoryDiscoveryLinks,
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
    expect(graph['@context'][1].endpointURL).toEqual({ '@id': 'dcat:endpointURL', '@type': '@id' });
    expect(graph['@graph'][0].license).toBeUndefined();
    expect(graph['@graph'][0].contactPoint).toBeUndefined();
    expect(graph['@graph'][1].address).toBeUndefined();
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
    expect(openSearch.endpointUrl).toBe('https://repository.uist.edu.mk/server/opensearch/service');
    expect(openSearch.mediaType).toBe('application/opensearchdescription+xml');
  });

  it('omits services whose configured browser URL is private or insecure', () => {
    const services = getHarvestingServices(
      config,
      'https://repository.uist.edu.mk',
      'http://internal-rest:8080/server',
    );

    expect(services.map((service) => service.name)).toEqual([
      'Repository sitemap',
    ]);
    expect(JSON.stringify(services)).not.toContain('internal-rest');
  });

  it('rejects special-use and IPv4-mapped private browser URLs', () => {
    for (const restUrl of [
      'https://192.0.2.1/server',
      'https://198.51.100.1/server',
      'https://203.0.113.1/server',
      'https://[::ffff:127.0.0.1]/server',
    ]) {
      const services = getHarvestingServices(
        config,
        'https://repository.uist.edu.mk',
        restUrl,
      );
      expect(services.map((service) => service.name)).toEqual([
        'Repository sitemap',
      ]);
    }
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
      entry.anchor.endsWith('/opensearch/service'),
    );
    expect(openSearch['service-meta'][0].href).toContain('?source=fairicat');
    expect(openSearch['service-meta'][0].type).toBe('application/opensearchdescription+xml');
    const graph = buildRepositoryGraph(config, 'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server') as any;
    expect(graph['@graph'][0].service.find((service: any) => service.name === 'OpenSearch').encodingFormat)
      .toBe('application/opensearchdescription+xml');
    const rest = graph['@graph'][0].service.find((service: any) => service.type === 'REST');
    expect(rest.endpointURL).toBe('https://repository.uist.edu.mk/server/api');
    expect(graph['@context'][1].type).toBe('dct:type');
  });

  it('uses identical service URLs in discovery links and the API catalog, including a UI base path', () => {
    const links = getRepositoryDiscoveryLinks(config, 'https://example.edu/repository/', 'https://example.edu/server');
    expect(links[0].href).toBe('https://example.edu/repository/.well-known/repository.jsonld');
    expect(links[1].href).toBe('https://example.edu/repository/api-catalog');
    const services = getHarvestingServices(config, 'https://example.edu/repository/', 'https://example.edu/server');
    for (const link of links.slice(2)) {
      expect(services.some(service => service.endpointUrl === link.href && service.mediaType === link.type)).toBeTrue();
    }
    expect(getRepositoryDiscoveryLinks({ ...config, enabled: false }, 'https://example.edu', 'https://example.edu/server')).toEqual([]);
  });

  it('publishes only enabled contact details and independently linked privacy policy', () => {
    const configured: HarvestingConfig = {
      ...config,
      repository: {
        ...config.repository,
        contactEmail: { enabled: true, value: 'admin@example.edu' },
        contactName: { enabled: true, value: 'Repository administrator' },
        contactUrl: { enabled: true, value: 'https://example.edu/info/contact' },
        privacyPolicyUrl: { enabled: true, value: 'https://example.edu/info/privacy' },
      },
    };
    const catalog = (buildRepositoryGraph(configured, 'https://example.edu', 'https://example.edu/server') as any)['@graph'][0];
    expect(catalog.contactPoint).toEqual({ '@type': 'ContactPoint', email: 'admin@example.edu', name: 'Repository administrator', url: 'https://example.edu/info/contact' });
    expect(catalog.publishingPrinciples).toEqual([jasmine.objectContaining({ '@id': 'https://example.edu/info/privacy', name: 'Privacy policy' })]);
    configured.repository.contactName.enabled = false;
    configured.repository.contactUrl.enabled = false;
    configured.repository.privacyPolicyUrl.enabled = false;
    const unpublished = (buildRepositoryGraph(configured, 'https://example.edu', 'https://example.edu/server') as any)['@graph'][0];
    expect(unpublished.contactPoint.name).toBeUndefined();
    expect(unpublished.contactPoint.url).toBeUndefined();
    expect(unpublished.publishingPrinciples).toBeUndefined();
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
        re3dataId: {
          enabled: true,
          value: 'https://www.re3data.org/repository/example',
        },
        re3dataDoi: {
          enabled: true,
          value: 'https://doi.org/10.17616/EXAMPLE',
        },
        fairsharingId: {
          enabled: false,
          value: 'https://fairsharing.org/example',
        },
        publisher: {
          ...config.repository.publisher,
          countryCode: { enabled: true, value: 'MK' },
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
    expect(graph['@graph'][0].publishingPrinciples).toEqual([
      jasmine.objectContaining({ '@id': 'https://example.org/deposit' }),
    ]);
    expect(graph['@graph'][0].identifier).toEqual([
      'https://www.re3data.org/repository/example',
    ]);
    expect(graph['@graph'][0].sameAs).toEqual([
      'https://www.re3data.org/repository/example',
    ]);
    expect(graph['@graph'][0].subjectOf).toEqual(jasmine.objectContaining({
      '@type': 'WebPage',
      '@id': 'https://doi.org/10.17616/EXAMPLE',
      identifier: 'https://doi.org/10.17616/EXAMPLE',
    }));
    expect(graph['@graph'][1].address.addressCountry).toBe('MK');
    gatedConfig.repository.re3dataDoi.enabled = false;
    const withoutDoi = buildRepositoryGraph(gatedConfig, 'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server') as any;
    expect(withoutDoi['@graph'][0].subjectOf).toBeUndefined();
  });

  it('never publishes an item URL template as a repository service', () => {
    const withSignposting = { ...config, services: { ...config.services, signposting: true } };
    const graph = buildRepositoryGraph(withSignposting, 'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server');
    const linkset = buildFairicatLinkset(withSignposting, 'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server');
    expect(JSON.stringify(graph)).not.toContain('{uuid}');
    expect(JSON.stringify(linkset)).not.toContain('{uuid}');
  });

  it('publishes distinct named CreativeWork policies and verified repository facts', () => {
    const policyBase = 'https://repository.uist.edu.mk/info/repository-policies';
    const configured: HarvestingConfig = {
      ...config,
      repository: {
        ...config.repository,
        depositPolicyUrl: { enabled: true, value: `${policyBase}#content-and-deposit` },
        preservationPolicyUrl: { enabled: true, value: `${policyBase}#retention-and-service-continuity` },
        curationPolicyUrl: { enabled: true, value: `${policyBase}#metadata-reuse-and-curation` },
        accessRightsUrl: { enabled: true, value: `${policyBase}#access-and-file-reuse` },
        establishedYear: { enabled: true, value: '2025' },
        fundingStatement: { enabled: true, value: 'University-funded' },
        funderId: { enabled: true, value: 'https://uist.edu.mk/#organization' },
      },
    };
    const graph = buildRepositoryGraph(configured, 'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server') as any;
    const catalog = graph['@graph'][0];
    const policies = catalog.publishingPrinciples;
    expect(policies.length).toBe(4);
    expect(new Set(policies.map((policy: any) => policy['@id'])).size).toBe(4);
    expect(policies.every((policy: any) => policy['@type'].includes('CreativeWork') && policy.name)).toBeTrue();
    expect(graph['@graph'].length).toBe(2);
    expect(catalog.dateCreated).toBe('2025');
    expect(catalog.creditText).toBe('University-funded');
    expect(catalog.funder).toEqual({ '@id': 'https://uist.edu.mk/#organization' });
    configured.repository.establishedYear.value = 'unknown';
    configured.repository.fundingStatement.enabled = false;
    configured.repository.funderId.enabled = false;
    const unpublished = buildRepositoryGraph(configured, 'https://repository.uist.edu.mk',
      'https://repository.uist.edu.mk/server') as any;
    expect(unpublished['@graph'][0].dateCreated).toBeUndefined();
    expect(unpublished['@graph'][0].creditText).toBeUndefined();
    expect(unpublished['@graph'][0].funder).toBeUndefined();
  });
});
