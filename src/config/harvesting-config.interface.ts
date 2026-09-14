/** Public repository metadata and machine-interface declarations used by harvesters. */
export interface HarvestingConfig {
  enabled: boolean;
  repository: HarvestingRepositoryConfig;
  services: HarvestingServicesConfig;
}

export interface HarvestingRepositoryConfig {
  name: string;
  description: string;
  languages: string[];
  subjects: string[];
  publisher: HarvestingPublisherConfig;
  contactEmail?: HarvestingOptionalClaim;
  licenseUrl?: HarvestingOptionalClaim;
  accessRightsUrl?: HarvestingOptionalClaim;
  depositPolicyUrl?: HarvestingOptionalClaim;
  preservationPolicyUrl?: HarvestingOptionalClaim;
  curationPolicyUrl?: HarvestingOptionalClaim;
  re3dataId?: HarvestingOptionalClaim;
  fairsharingId?: HarvestingOptionalClaim;
}

/** A governance or registry claim is published only when explicitly enabled and populated. */
export interface HarvestingOptionalClaim {
  enabled: boolean;
  value: string;
}

export interface HarvestingPublisherConfig {
  id: string;
  name: string;
  url: string;
  countryCode?: HarvestingOptionalClaim;
}

export interface HarvestingServicesConfig {
  rest: boolean;
  oaiPmh: boolean;
  openSearch: boolean;
  feeds: boolean;
  sitemap: boolean;
  signposting: boolean;
}
