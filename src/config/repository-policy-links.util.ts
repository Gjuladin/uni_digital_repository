import { HarvestingConfig } from './harvesting-config.interface';
import {
  getEnabledClaimValue,
  getSafePublicBaseUrl,
} from './harvesting-metadata.util';

export interface RepositoryPolicyLink {
  labelKeys: string[];
  url: string;
}

/** Use the same explicit publication switches as machine-readable governance claims. */
export function getRepositoryPolicyLinks(config?: HarvestingConfig): RepositoryPolicyLink[] {
  if (!config?.enabled) {
    return [];
  }

  const repository = config.repository;
  const claims = [
    { labelKey: 'info.repository-policies.access', claim: repository.accessRightsUrl },
    { labelKey: 'info.repository-policies.deposit', claim: repository.depositPolicyUrl },
    { labelKey: 'info.repository-policies.curation', claim: repository.curationPolicyUrl },
    { labelKey: 'info.repository-policies.preservation', claim: repository.preservationPolicyUrl },
    { labelKey: 'info.repository-policies.licensing', claim: repository.licenseUrl },
  ];
  const seen = new Map<string, RepositoryPolicyLink>();
  const links: RepositoryPolicyLink[] = [];

  for (const { labelKey, claim } of claims) {
    const value = getEnabledClaimValue(claim);
    if (!value) {
      continue;
    }
    try {
      const parsed = new URL(value);
      // Policy destinations must be public HTTPS documents. Preserve query strings
      // and fragments, which can identify sections of a shared approved document.
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !getSafePublicBaseUrl(parsed.origin)) {
        continue;
      }
      const url = parsed.toString();
      const existing = seen.get(url);
      if (existing) {
        existing.labelKeys.push(labelKey);
      } else {
        const link = { labelKeys: [labelKey], url };
        links.push(link);
        seen.set(url, link);
      }
    } catch {
      // Ignore incomplete or unsafe publication configuration.
    }
  }
  return links;
}
