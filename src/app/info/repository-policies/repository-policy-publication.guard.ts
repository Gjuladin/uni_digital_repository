import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';

import { areRepositoryPoliciesPublished } from './repository-policy-publication.util';

/** Fall through to existing terms/privacy routes when the bundled pages are disabled. */
export const repositoryPolicyPublicationGuard: CanMatchFn = () =>
  areRepositoryPoliciesPublished(inject(APP_CONFIG).info);
