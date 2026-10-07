import {
  Component,
  Inject,
} from '@angular/core';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import {
  getRepositoryPolicyLinks,
  RepositoryPolicyLink,
} from '@dspace/config/repository-policy-links.util';
import { TranslateModule } from '@ngx-translate/core';

/** A public directory of the configured repository policy documents. */
@Component({
  selector: 'ds-repository-policies',
  templateUrl: './repository-policies.component.html',
  imports: [
    TranslateModule,
  ],
})
export class RepositoryPoliciesComponent {
  readonly policyLinks: RepositoryPolicyLink[];

  constructor(@Inject(APP_CONFIG) appConfig: AppConfig) {
    this.policyLinks = getRepositoryPolicyLinks(appConfig.harvesting);
  }
}
