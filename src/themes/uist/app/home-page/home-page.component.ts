import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DSONameService } from '../../../../app/core/breadcrumbs/dso-name.service';
import { CollectionDataService } from '../../../../app/core/data/collection-data.service';
import { LocaleService } from '../../../../app/core/locale/locale.service';
import { Collection } from '../../../../app/core/shared/collection.model';
import { getAllSucceededRemoteListPayload } from '../../../../app/core/shared/operators';
import { HomeCoarComponent } from '../../../../app/home-page/home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from '../../../../app/home-page/home-news/themed-home-news.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { RecentItemListComponent } from '../../../../app/home-page/recent-item-list/recent-item-list.component';
import { ThemedTopLevelCommunityListComponent } from '../../../../app/home-page/top-level-community-list/themed-top-level-community-list.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions/popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';
import { BtnDisabledDirective } from '../../../../app/shared/btn-disabled.directive';
import {
  APP_CONFIG,
  AppConfig,
} from '../../../../config/app-config.interface';

interface HomeCategoryCard {
  iconClass: string;
  name: string;
  uuid: string;
}

@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html',
  imports: [
    AsyncPipe,
    BtnDisabledDirective,
    FormsModule,
    HomeCoarComponent,
    NgTemplateOutlet,
    RecentItemListComponent,
    RouterLink,
    SuggestionsPopupComponent,
    ThemedConfigurationSearchPageComponent,
    ThemedHomeNewsComponent,
    ThemedTopLevelCommunityListComponent,
    TranslateModule,
  ],
})
export class HomePageComponent extends BaseComponent implements OnInit {
  selectedSearchField = '';
  searchByValue = '';
  categoryCollections$!: Observable<HomeCategoryCard[]>;

  private readonly preferredCategoryOrder = [
    'Impact Factor Articles',
    'Indexed Journal Articles',
    'International Editorial Journals',
    'EU OECD Journals',
    'Scientific Professional Journals',
    'Peer Reviewed Books',
    'Professional Field Books',
    'International Conference Papers',
    'Additional Publications',
  ];

  searchFields = [
    { id: 'title', labelKey: 'home.uist.search.field.title', solr: 'title' },
    { id: 'author', labelKey: 'home.uist.search.field.author', solr: 'author' },
    { id: 'abstract', labelKey: 'home.uist.search.field.abstract', solr: 'abstract' },
    { id: 'year', labelKey: 'home.uist.search.field.year', solr: 'dateIssued' },
  ];

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected route: ActivatedRoute,
    localeService: LocaleService,
    private collectionDataService: CollectionDataService,
    private dsoNameService: DSONameService,
    private router: Router,
  ) {
    super(appConfig, route, localeService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.categoryCollections$ = this.collectionDataService.findAll({
      currentPage: 1,
      elementsPerPage: 100,
    }).pipe(
      getAllSucceededRemoteListPayload(),
      map((collections: Collection[]) => this.buildCategoryCards(collections)),
    );
  }

  getSelectedFieldLabel(): string {
    return this.searchFields.find(f => f.id === this.selectedSearchField)?.labelKey || '';
  }

  onSearchBySubmit(): void {
    const value = this.searchByValue.trim();
    if (!value) { return; }
    const field = this.searchFields.find(f => f.id === this.selectedSearchField);
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const query = field ? `${field.solr}:"${escapedValue}"` : value;
    void this.router.navigate(['/search'], { queryParams: { query } });
    this.searchByValue = '';
    this.selectedSearchField = '';
  }

  private buildCategoryCards(collections: Collection[]): HomeCategoryCard[] {
    const preferredCollections = this.sortCollectionsByPreferredOrder(collections);
    const collectionsToRender = preferredCollections.length > 0 ? preferredCollections : collections.slice(0, 9);

    return collectionsToRender.map((collection: Collection) => ({
      iconClass: this.getIconClassForCollectionName(this.getCollectionName(collection)),
      name: this.getCollectionName(collection),
      uuid: collection?.uuid,
    }));
  }

  private sortCollectionsByPreferredOrder(collections: Collection[]): Collection[] {
    const order = new Map(this.preferredCategoryOrder.map((name, index) => [this.normalizeCategoryName(name), index]));

    return collections
      .filter((collection: Collection) => order.has(this.normalizeCategoryName(this.getCollectionName(collection))))
      .sort((left: Collection, right: Collection) =>
        (order.get(this.normalizeCategoryName(this.getCollectionName(left))) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(this.normalizeCategoryName(this.getCollectionName(right))) ?? Number.MAX_SAFE_INTEGER),
      );
  }

  private getCollectionName(collection: Collection): string {
    return this.dsoNameService.getName(collection);
  }

  private getIconClassForCollectionName(name: string): string {
    const normalizedName = this.normalizeCategoryName(name);

    if (normalizedName.includes('impact factor')) {
      return 'fas fa-chart-line';
    }

    if (normalizedName.includes('indexed')) {
      return 'fas fa-list-ol';
    }

    if (normalizedName.includes('editorial')) {
      return 'fas fa-user-edit';
    }

    if (normalizedName.includes('eu oecd')) {
      return 'fas fa-globe-europe';
    }

    if (normalizedName.includes('scientific professional')) {
      return 'fas fa-flask';
    }

    if (normalizedName.includes('peer reviewed')) {
      return 'fas fa-book-reader';
    }

    if (normalizedName.includes('professional field')) {
      return 'fas fa-atlas';
    }

    if (normalizedName.includes('conference')) {
      return 'fas fa-chalkboard-teacher';
    }

    if (normalizedName.includes('additional')) {
      return 'fas fa-layer-group';
    }

    if (normalizedName.includes('book')) {
      return 'fas fa-book';
    }

    if (normalizedName.includes('journal') || normalizedName.includes('article')) {
      return 'fas fa-newspaper';
    }

    return 'fas fa-folder-open';
  }

  private normalizeCategoryName(name: string): string {
    return (name || '').trim().toLowerCase();
  }
}
