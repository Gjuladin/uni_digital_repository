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
  const ui = withoutTrailingSlash(uiBaseUrl);
  const rest = withoutTrailingSlash(restBaseUrl);
  const enabled = config.services;

  return compact([
    enabled.rest
      ? {
        id: `${rest}/api`,
        name: 'DSpace REST API',
        endpointUrl: `${rest}/api`,
        conformsTo: 'https://github.com/DSpace/RestContract',
        mediaType: 'application/hal+json',
        metadataUrl: `${rest}/api`,
      }
      : undefined,
    enabled.oaiPmh
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
    enabled.openSearch
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
    enabled.feeds
      ? {
        id: `${rest}/opensearch/search?format=atom&query=*`,
        name: 'Sitewide Atom feed',
        endpointUrl: `${rest}/opensearch/search?format=atom&query=*`,
        conformsTo: 'https://www.ietf.org/rfc/rfc4287.txt',
        mediaType: 'application/atom+xml',
      }
      : undefined,
    enabled.feeds
      ? {
        id: `${rest}/opensearch/search?format=rss&query=*`,
        name: 'Sitewide RSS feed',
        endpointUrl: `${rest}/opensearch/search?format=rss&query=*`,
        conformsTo: 'https://www.rssboard.org/rss-specification',
        mediaType: 'application/rss+xml',
      }
      : undefined,
    enabled.sitemap
      ? {
        id: `${ui}/sitemap_index.xml`,
        name: 'Repository sitemap',
        endpointUrl: `${ui}/sitemap_index.xml`,
        conformsTo: 'https://www.sitemaps.org/protocol.html',
        mediaType: 'application/xml',
      }
      : undefined,
    enabled.signposting
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
  const ui = withoutTrailingSlash(uiBaseUrl);
  const repository = config.repository;
  const publisher = repository.publisher;
  const services = getHarvestingServices(config, ui, restBaseUrl);
  const policies = getPolicyNodes(repository);
  const contactEmail = getEnabledClaimValue(repository.contactEmail);
  const licenseUrl = getEnabledClaimValue(repository.licenseUrl);
  const accessRightsUrl = getEnabledClaimValue(repository.accessRightsUrl);

  const catalog: Record<string, unknown> = {
    '@type': 'DataCatalog',
    '@id': `${ui}/#repository`,
    name: repository.name,
    description: repository.description,
    url: `${ui}/`,
    landingPage: `${ui}/`,
    inLanguage: repository.languages,
    keywords: repository.subjects,
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
    service: services.map((service) => ({
      '@type': 'DataService',
      '@id': service.id,
      name: service.name,
      url: service.endpointUrl,
      endpointURL: service.endpointUrl,
      conformsTo: service.conformsTo,
      encodingFormat: service.mediaType,
    })),
    policy: policies,
  };

  const organization = {
    '@type': 'CollegeOrUniversity',
    '@id': publisher.id,
    name: publisher.name,
    url: publisher.url,
    address: {
      '@type': 'PostalAddress',
      addressCountry: publisher.countryCode,
    },
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
