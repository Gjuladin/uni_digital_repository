import { AsyncPipe } from '@angular/common';
import {
  Component,
  Inject,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { TranslateModule } from '@ngx-translate/core';
import {
  map,
  Observable,
} from 'rxjs';

import {
  REPOSITORY_POLICY_DOCUMENTS,
  RepositoryPolicyDocument,
} from './repository-policy-documents';

/** Public repository information, kept in sync with the retained policy sources. */
@Component({
  selector: 'ds-repository-policy-page',
  template: `
    <section class="container py-4">
      <nav [attr.aria-label]="'footer.uist.policies' | translate" class="mb-4 d-flex flex-wrap gap-3">
        @for (policy of policies; track policy.path) {
          <a [routerLink]="['/info', policy.path]">{{ policy.labelKey | translate }}</a>
        }
      </nav>
      @if (publication.effectiveDate) {
        <p class="text-muted">{{ 'info.repository-policies.effective' | translate:{ date: publication.effectiveDate } }}</p>
      }
      @if (document$ | async; as document) {
        <article [innerHTML]="document.html"></article>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    article { max-width: 52rem; line-height: 1.65; }
  `],
  imports: [
    AsyncPipe,
    RouterLink,
    TranslateModule,
  ],
})
export class RepositoryPolicyPageComponent {
  readonly policies = Object.entries(REPOSITORY_POLICY_DOCUMENTS).map(([path, doc]) => ({ path, labelKey: doc.labelKey }));
  readonly document$: Observable<RepositoryPolicyDocument>;
  readonly publication: AppConfig['info']['repositoryPolicyPublication'];

  constructor(route: ActivatedRoute, @Inject(APP_CONFIG) config: AppConfig) {
    this.document$ = route.data.pipe(map(data => REPOSITORY_POLICY_DOCUMENTS[data.policyId as string]));
    this.publication = config.info.repositoryPolicyPublication;
  }
}
