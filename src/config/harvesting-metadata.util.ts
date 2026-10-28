import {
  HarvestingConfig,
  HarvestingOptionalClaim,
  HarvestingRepositoryConfig,
} from './harvesting-config.interface';

export interface HarvestingServiceDescription {
  id: string;
  name: string;
  endpointUrl: string;
  conformsTo: string;
  type?: string;
  discoveryRel?: 'alternate' | 'search' | 'sitemap';
  mediaType?: string;
  metadataMediaType?: string;
  metadataUrl?: string;
}

export interface RepositoryDiscoveryLink {
  rel: string;
  href: string;
  type: string;
  title: string;
}

function withoutTrailingSlash(value: string): string {
  return (value || '').replace(/\/+$/, '');
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    !host.includes('.') ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === '::1' ||
    host === '::' ||
    host.startsWith('fc') ||
    host.startsWith('fd') ||
    /^fe[89ab]/.test(host)
  ) {
    return true;
  }
  if (host.startsWith('::ffff:')) {
    const mapped = host.slice('::ffff:'.length);
    const mappedHex = mapped.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mappedHex) {
      const high = Number.parseInt(mappedHex[1], 16);
      const low = Number.parseInt(mappedHex[2], 16);
      return isPrivateHost(
        `${Math.floor(high / 256)}.${high % 256}.${Math.floor(low / 256)}.${low % 256}`,
      );
    }
    return isPrivateHost(mapped);
  }
  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || octets.some(Number.isNaN)) {
    return false;
  }
  return (
    octets[0] === 0 ||
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    (octets[0] === 192 && octets[1] === 0 && [0, 2].includes(octets[2])) ||
    (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19)) ||
    (octets[0] === 198 && octets[1] === 51 && octets[2] === 100) ||
    (octets[0] === 203 && octets[1] === 0 && octets[2] === 113) ||
    octets[0] >= 224
  );
}

/**
 * Accept a configured browser-facing origin/base path, never an SSR-only or
 * private deployment hostname. Localhost HTTP is allowed solely for local QA.
 */
export function getSafePublicBaseUrl(value: string): string | undefined {
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      return undefined;
    }
    const localHost = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(
      parsed.hostname,
    );
    if (localHost && parsed.protocol === 'http:') {
      return withoutTrailingSlash(parsed.toString());
    }
    if (parsed.protocol !== 'https:' || isPrivateHost(parsed.hostname)) {
      return undefined;
    }
    return withoutTrailingSlash(parsed.toString());
  } catch {
    return undefined;
  }
}

function compact<T>(values: Array<T | undefined>): T[] {
  return values.filter((value): value is T => value !== undefined);
}

export function getEnabledClaimValue(
  claim?: HarvestingOptionalClaim,
): string | undefined {
  const value = claim?.value?.trim();
  return claim?.enabled && value ? value : undefined;
}

export function getHarvestingServices(
  config: HarvestingConfig,
  uiBaseUrl: string,
  restBaseUrl: string,
): HarvestingServiceDescription[] {
  const ui = getSafePublicBaseUrl(uiBaseUrl);
  const rest = getSafePublicBaseUrl(restBaseUrl);
  const enabled = config.services;

  return compact([
    enabled.rest && rest
      ? {
        id: `${rest}/api`,
        name: 'DSpace REST API',
        type: 'REST',
        endpointUrl: `${rest}/api`,
        conformsTo: 'https://github.com/DSpace/RestContract',
        mediaType: 'application/hal+json',
        metadataUrl: `${rest}/api`,
      }
      : undefined,
    enabled.oaiPmh && rest
      ? {
        id: `${rest}/oai/request`,
        name: 'OAI-PMH',
        endpointUrl: `${rest}/oai/request`,
        conformsTo:
            'https://www.openarchives.org/OAI/openarchivesprotocol.html',
        mediaType: 'application/xml',
        metadataUrl: `${rest}/oai/request?verb=Identify`,
      }
      : undefined,
    enabled.openSearch && rest
      ? {
        id: `${rest}/opensearch/service`,
        name: 'OpenSearch',
        discoveryRel: 'search',
        endpointUrl: `${rest}/opensearch/service`,
        conformsTo:
            'https://github.com/dewitt/opensearch/blob/master/opensearch-1-1-draft-6.md',
        mediaType: 'application/opensearchdescription+xml',
        // Keep this URL distinct from the HTML rel="search" URL. EDEN's
        // current link collector deduplicates by URL alone, so an identical
        // FAIRiCat service-meta link would overwrite the rel="search" entry.
        metadataUrl: `${rest}/opensearch/service?source=fairicat`,
      }
      : undefined,
    enabled.feeds && rest
      ? {
        id: `${rest}/opensearch/search?format=atom&sort=dc.date.accessioned&sort_direction=DESC&query=%2A&rpp=10`,
        name: 'Sitewide Atom feed',
        discoveryRel: 'alternate',
        endpointUrl: `${rest}/opensearch/search?format=atom&sort=dc.date.accessioned&sort_direction=DESC&query=%2A&rpp=10`,
        conformsTo: 'https://www.ietf.org/rfc/rfc4287.txt',
        mediaType: 'application/atom+xml',
      }
      : undefined,
    enabled.feeds && rest
      ? {
        id: `${rest}/opensearch/search?format=rss&sort=dc.date.accessioned&sort_direction=DESC&query=%2A&rpp=10`,
        name: 'Sitewide RSS feed',
        discoveryRel: 'alternate',
        endpointUrl: `${rest}/opensearch/search?format=rss&sort=dc.date.accessioned&sort_direction=DESC&query=%2A&rpp=10`,
        conformsTo: 'https://www.rssboard.org/rss-specification',
        mediaType: 'application/rss+xml',
      }
      : undefined,
    enabled.sitemap && ui
      ? {
        id: `${ui}/sitemap_index.xml`,
        name: 'Repository sitemap',
        discoveryRel: 'sitemap',
        endpointUrl: `${ui}/sitemap_index.xml`,
        conformsTo: 'https://www.sitemaps.org/protocol.html',
        mediaType: 'application/xml',
      }
      : undefined,
    // Signposting linksets belong to actual items. A {uuid} URL template is
    // not a resolvable service endpoint; item pages advertise their own links.
  ]);
}

/** Keep HTML, HTTP discovery and the catalog on the same public endpoint URLs. */
export function getRepositoryDiscoveryLinks(
  config: HarvestingConfig,
  uiBaseUrl: string,
  restBaseUrl: string,
): RepositoryDiscoveryLink[] {
  const ui = getSafePublicBaseUrl(uiBaseUrl);
  if (!config?.enabled || !ui) {
    return [];
  }
  const services = getHarvestingServices(config, ui, restBaseUrl);
  return [
    {
      rel: 'describedby',
      href: `${ui}/.well-known/repository.jsonld`,
      type: 'application/ld+json',
      title: `${config.repository.name} metadata`,
    },
    {
      rel: 'api-catalog',
      href: `${ui}/api-catalog`,
      type: 'application/linkset+json',
      title: `${config.repository.name} API catalog`,
    },
    ...services.filter(service => service.discoveryRel)
      .map(service => ({
        rel: service.discoveryRel,
        href: service.endpointUrl,
        type: service.mediaType,
        title: service.name,
      })),
  ];
}

function getPolicyNodes(
  repository: HarvestingRepositoryConfig,
): Array<Record<string, unknown>> {
  const depositPolicyUrl = getEnabledClaimValue(repository.depositPolicyUrl);
  const preservationPolicyUrl = getEnabledClaimValue(
    repository.preservationPolicyUrl,
  );
  const curationPolicyUrl = getEnabledClaimValue(repository.curationPolicyUrl);
  const accessPolicyUrl = getEnabledClaimValue(repository.accessRightsUrl);
  const privacyPolicyUrl = getEnabledClaimValue(repository.privacyPolicyUrl);
  return compact([
    depositPolicyUrl
      ? {
        '@type': ['CreativeWork', 'DigitalDocument'],
        '@id': depositPolicyUrl,
        name: 'Terms of deposit',
        url: depositPolicyUrl,
      }
      : undefined,
    preservationPolicyUrl
      ? {
        '@type': ['CreativeWork', 'DigitalDocument'],
        '@id': preservationPolicyUrl,
        name: 'Preservation policy',
        url: preservationPolicyUrl,
      }
      : undefined,
    curationPolicyUrl
      ? {
        '@type': ['CreativeWork', 'DigitalDocument'],
        '@id': curationPolicyUrl,
        name: 'Curation policy',
        url: curationPolicyUrl,
      }
      : undefined,
    accessPolicyUrl
      ? {
        '@type': ['CreativeWork', 'DigitalDocument'],
        '@id': accessPolicyUrl,
        name: 'Access and file reuse',
        url: accessPolicyUrl,
      }
      : undefined,
    privacyPolicyUrl
      ? {
        '@type': ['CreativeWork', 'DigitalDocument'],
        '@id': privacyPolicyUrl,
        name: 'Privacy policy',
        url: privacyPolicyUrl,
      }
      : undefined,
  ]);
}

export function buildRepositoryGraph(
  config: HarvestingConfig,
  uiBaseUrl: string,
  restBaseUrl: string,
): Record<string, unknown> {
  const ui = getSafePublicBaseUrl(uiBaseUrl);
  if (!ui) {
    throw new Error('A safe public UI base URL is required for harvesting metadata');
  }
  const repository = config.repository;
  const publisher = repository.publisher;
  const services = getHarvestingServices(config, ui, restBaseUrl);
  const policies = getPolicyNodes(repository);
  const contactEmail = getEnabledClaimValue(repository.contactEmail);
  const contactName = getEnabledClaimValue(repository.contactName);
  const contactUrl = getEnabledClaimValue(repository.contactUrl);
  const licenseUrl = getEnabledClaimValue(repository.licenseUrl);
  const accessRightsUrl = getEnabledClaimValue(repository.accessRightsUrl);
  const re3dataId = getEnabledClaimValue(repository.re3dataId);
  const re3dataDoi = getEnabledClaimValue(repository.re3dataDoi);
  const registryIdentifiers = compact([
    re3dataId,
    getEnabledClaimValue(repository.fairsharingId),
  ]);
  const countryCode = getEnabledClaimValue(publisher.countryCode);
  const establishedYear = getEnabledClaimValue(repository.establishedYear);
  const fundingStatement = getEnabledClaimValue(repository.fundingStatement);
  const funderId = getEnabledClaimValue(repository.funderId);

  const catalog: Record<string, unknown> = {
    '@type': 'DataCatalog',
    '@id': `${ui}/#repository`,
    name: repository.name,
    description: repository.description,
    url: `${ui}/`,
    landingPage: `${ui}/`,
    inLanguage: repository.languages,
    dateCreated: /^\d{4}$/.test(establishedYear || '') ? establishedYear : undefined,
    creditText: fundingStatement,
    keywords: repository.subjects.length > 0 ? repository.subjects : undefined,
    // The existing EDEN graph expander only fully expands the first reference
    // to a shared node. Resolve the publisher before funder/provider so its
    // name and country remain available to the fixed repository extractor.
    publisher: { '@id': publisher.id },
    provider: { '@id': publisher.id },
    funder: funderId ? { '@id': funderId } : undefined,
    contactPoint: contactEmail || contactUrl
      ? {
        '@type': 'ContactPoint',
        email: contactEmail,
        name: contactName,
        url: contactUrl,
      }
      : undefined,
    license: licenseUrl,
    conditionsOfAccess: accessRightsUrl,
    identifier: registryIdentifiers.length > 0 ? registryIdentifiers : undefined,
    sameAs: registryIdentifiers.length > 0
      ? registryIdentifiers.filter((value) => /^https?:\/\//i.test(value))
      : undefined,
    // This DOI identifies the registry's description of the repository.
    // WebPage also keeps the fixed extractor from classifying it as a policy.
    subjectOf: re3dataId && re3dataDoi
      ? {
        '@type': 'WebPage',
        '@id': re3dataDoi,
        name: `${repository.name}: re3data registry record`,
        url: re3dataId,
        identifier: re3dataDoi,
      }
      : undefined,
    service: services.map((service) => ({
      '@type': 'DataService',
      '@id': service.id,
      name: service.name,
      type: service.type,
      url: service.endpointUrl,
      endpointURL: service.endpointUrl,
      endpointDescription: service.metadataUrl,
      conformsTo: service.conformsTo,
      encodingFormat: service.mediaType,
      mediaType: service.mediaType,
    })),
    publishingPrinciples: policies.length > 0 ? policies : undefined,
  };

  const organization = {
    '@type': 'CollegeOrUniversity',
    '@id': publisher.id,
    name: publisher.name,
    url: publisher.url,
    address: countryCode
      ? {
        '@type': 'PostalAddress',
        addressCountry: countryCode,
      }
      : undefined,
  };

  return {
    '@context': [
      'https://schema.org',
      {
        dcat: 'http://www.w3.org/ns/dcat#',
        dct: 'http://purl.org/dc/terms/',
        DataService: 'dcat:DataService',
        service: { '@id': 'dcat:service', '@type': '@id' },
        endpointURL: { '@id': 'dcat:endpointURL', '@type': '@id' },
        endpointDescription: { '@id': 'dcat:endpointDescription', '@type': '@id' },
        conformsTo: { '@id': 'dct:conformsTo', '@type': '@id' },
        mediaType: 'dct:format',
        type: 'dct:type',
      },
    ],
    '@graph': [catalog, organization],
  };
}

export function buildFairicatLinkset(
  config: HarvestingConfig,
  uiBaseUrl: string,
  restBaseUrl: string,
): Record<string, unknown> {
  return {
    linkset: getHarvestingServices(config, uiBaseUrl, restBaseUrl).map(
      (service) => ({
        anchor: service.endpointUrl,
        'service-doc': [
          {
            href: service.conformsTo,
            type: 'text/html',
            title: `${service.name} documentation`,
          },
        ],
        ...(service.metadataUrl
          ? {
            'service-meta': [
              {
                href: service.metadataUrl,
                ...(service.metadataMediaType || service.mediaType
                  ? { type: service.metadataMediaType || service.mediaType }
                  : {}),
                title: service.name,
              },
            ],
          }
          : {}),
      }),
    ),
  };
}
