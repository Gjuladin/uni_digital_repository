import { Config } from './config.interface';

export interface InfoConfig extends Config {
  enableEndUserAgreement?: boolean;
  enablePrivacyStatement?: boolean;
  enableCOARNotifySupport?: boolean;
  enableCookieConsentPopup?: boolean;
  /** Explicit activation of the bundled repository pages. */
  repositoryPolicyPublication?: {
    enabled: boolean;
    version: string;
    effectiveDate?: string;
  };
}
