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
  mediaType?: string;
  metadataUrl?: string;
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
        id: `${rest}/opensearch/search`,
        name: 'OpenSearch',
        endpointUrl: `${rest}/opensearch/search`,
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
        id: `${rest}/opensearch/search?format=atom&query=*`,
        name: 'Sitewide Atom feed',
        endpointUrl: `${rest}/opensearch/search?format=atom&query=*`,
        conformsTo: 'https://www.ietf.org/rfc/rfc4287.txt',
        mediaType: 'application/atom+xml',
      }
      : undefined,
    enabled.feeds && rest
      ? {
        id: `${rest}/opensearch/search?format=rss&query=*`,
        name: 'Sitewide RSS feed',
        endpointUrl: `${rest}/opensearch/search?format=rss&query=*`,
        conformsTo: 'https://www.rssboard.org/rss-specification',
        mediaType: 'application/rss+xml',
      }
      : undefined,
    enabled.sitemap && ui
      ? {
        id: `${ui}/sitemap_index.xml`,
        name: 'Repository sitemap',
        endpointUrl: `${ui}/sitemap_index.xml`,
        conformsTo: 'https://www.sitemaps.org/protocol.html',
        mediaType: 'application/xml',
      }
      : undefined,
    enabled.signposting && ui
      ? {
        id: `${ui}/signposting/links/{uuid}`,
        name: 'Signposting item links',
        endpointUrl: `${ui}/signposting/links/{uuid}`,
        conformsTo: 'https://signposting.org/',
      }
      : undefined,
  ]);
}

function getPolicyNodes(
  repository: HarvestingRepositoryConfig,
): Array<Record<string, unknown>> {
  const depositPolicyUrl = getEnabledClaimValue(repository.depositPolicyUrl);
  const preservationPolicyUrl = getEnabledClaimValue(
    repository.preservationPolicyUrl,
  );
  const curationPolicyUrl = getEnabledClaimValue(repository.curationPolicyUrl);
  return compact([
    depositPolicyUrl
      ? {
        '@type': 'DigitalDocument',
        '@id': depositPolicyUrl,
        name: 'Terms of deposit',
        url: depositPolicyUrl,
      }
      : undefined,
    preservationPolicyUrl
      ? {
        '@type': 'DigitalDocument',
        '@id': preservationPolicyUrl,
        name: 'Preservation policy',
        url: preservationPolicyUrl,
      }
      : undefined,
    curationPolicyUrl
      ? {
        '@type': 'DigitalDocument',
        '@id': curationPolicyUrl,
        name: 'Curation policy',
        url: curationPolicyUrl,
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
  const licenseUrl = getEnabledClaimValue(repository.licenseUrl);
  const accessRightsUrl = getEnabledClaimValue(repository.accessRightsUrl);
  const registryIdentifiers = compact([
    getEnabledClaimValue(repository.re3dataId),
    getEnabledClaimValue(repository.fairsharingId),
  ]);
  const countryCode = getEnabledClaimValue(publisher.countryCode);

  const catalog: Record<string, unknown> = {
    '@type': 'DataCatalog',
    '@id': `${ui}/#repository`,
    name: repository.name,
    description: repository.description,
    url: `${ui}/`,
    landingPage: `${ui}/`,
    inLanguage: repository.languages,
    keywords: repository.subjects.length > 0 ? repository.subjects : undefined,
    publisher: { '@id': publisher.id },
    provider: { '@id': publisher.id },
    contactPoint: contactEmail
      ? {
        '@type': 'ContactPoint',
        email: contactEmail,
      }
      : undefined,
    license: licenseUrl,
    conditionsOfAccess: accessRightsUrl,
    identifier: registryIdentifiers.length > 0 ? registryIdentifiers : undefined,
    sameAs: registryIdentifiers.length > 0
      ? registryIdentifiers.filter((value) => /^https?:\/\//i.test(value))
      : undefined,
    service: services.map((service) => ({
      '@type': 'DataService',
      '@id': service.id,
      name: service.name,
      url: service.endpointUrl,
      endpointURL: service.endpointUrl,
      conformsTo: service.conformsTo,
      encodingFormat: service.mediaType,
    })),
    policy: policies.length > 0 ? policies : undefined,
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
    '@context': 'https://schema.org',
    '@graph': [catalog, organization, ...policies],
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
                ...(service.mediaType ? { type: service.mediaType } : {}),
                title: service.name,
              },
            ],
          }
          : {}),
      }),
    ),
  };
}
