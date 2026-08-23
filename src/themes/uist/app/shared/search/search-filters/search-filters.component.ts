import { AsyncPipe } from '@angular/common';
import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { SEARCH_CONFIG_SERVICE } from '../../../../../../app/my-dspace-page/my-dspace-configuration.service';
import { SearchConfigurationService } from '../../../../../../app/shared/search/search-configuration.service';
import { SearchFilterComponent } from '../../../../../../app/shared/search/search-filters/search-filter/search-filter.component';
import { SearchFiltersComponent as BaseComponent } from '../../../../../../app/shared/search/search-filters/search-filters.component';

@Component({
  selector: 'ds-themed-search-filters',
  templateUrl: '../../../../../../app/shared/search/search-filters/search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService,
    },
  ],
  imports: [
    AsyncPipe,
    NgxSkeletonLoaderModule,
    RouterLink,
    SearchFilterComponent,
    TranslateModule,
  ],
})
export class SearchFiltersComponent extends BaseComponent {
}
