import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { getRepositoryPolicyLinks } from '@dspace/config/repository-policy-links.util';

/** Do not expose an empty policy directory before documents are enabled. */
export const repositoryPoliciesGuard: CanActivateFn = () => {
  const config = inject(APP_CONFIG);
  return getRepositoryPolicyLinks(config.harvesting).length > 0 || inject(Router).parseUrl('/404');
};
