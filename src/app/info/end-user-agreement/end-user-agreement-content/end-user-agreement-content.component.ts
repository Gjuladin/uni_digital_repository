import { AsyncPipe } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { SiteDataService } from '@dspace/core/data/site-data.service';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { MetadatumViewModel } from '@dspace/core/shared/metadata.models';
import { isNotEmpty } from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  Subscription,
} from 'rxjs';
import { MarkdownViewerComponent } from 'src/app/shared/markdown-viewer/markdown-viewer.component';

import { REPOSITORY_POLICY_DOCUMENTS } from '../../repository-policies/repository-policy-documents';
import { areRepositoryPoliciesPublished } from '../../repository-policies/repository-policy-publication.util';

@Component({
  selector: 'ds-end-user-agreement-content',
  templateUrl: './end-user-agreement-content.component.html',
  styleUrls: ['./end-user-agreement-content.component.scss'],
  imports: [
    AsyncPipe,
    MarkdownViewerComponent,
    RouterLink,
    TranslateModule,
  ],
})
/**
 * Component displaying the contents of the End User Agreement
 */
export class EndUserAgreementContentComponent implements OnInit, OnDestroy {

  USER_AGREEMENT_TEXT_METADATA = 'dc.rights';

  subs: Subscription[] = [];

  userAgreementText$: BehaviorSubject<string | null> = new BehaviorSubject(null);

  fallbackText = 'info.end-user-agreement.content.fallback';
  readonly repositoryPolicyHtml: string;

  constructor(private siteService: SiteDataService,
              private localeService: LocaleService,
              @Inject(APP_CONFIG) config: AppConfig,
  ) {
    if (areRepositoryPoliciesPublished(config.info)) {
      this.repositoryPolicyHtml = REPOSITORY_POLICY_DOCUMENTS['repository-policies'].html;
    }
  }

  /**
   * Filtering function used to filter out metadata values that do not match selected language
   * @param metadata The metadata to filter
   * @param langCode The language code to filter by
   * @returns True if the metadata is for the user agreement text and matches the language code, false otherwise
   */
  private filterMetadata(metadata: MetadatumViewModel, langCode: string) {
    return metadata.key === this.USER_AGREEMENT_TEXT_METADATA && metadata.language === langCode && isNotEmpty(metadata.value);
  }

  ngOnInit(): void {
    if (this.repositoryPolicyHtml) {
      return;
    }
    this.subs.push(
      combineLatest([this.siteService.find(), this.localeService.getCurrentLanguageCode()]).subscribe(([site, langCode]) => {
        const fallbackLangCode = 'en';

        const textArray = site?.metadataAsList.filter((metadata) =>
          this.filterMetadata(metadata, langCode),
        );
        const fallbackTextArray = site?.metadataAsList.filter((metadata) =>
          this.filterMetadata(metadata, fallbackLangCode),
        );

        const value = textArray[0]?.value || fallbackTextArray[0]?.value || '';
        this.userAgreementText$.next(value);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
