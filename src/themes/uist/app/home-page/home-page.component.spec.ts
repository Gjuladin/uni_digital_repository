import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { of } from 'rxjs';

import { DSONameService } from '../../../../app/core/breadcrumbs/dso-name.service';
import { CollectionDataService } from '../../../../app/core/data/collection-data.service';
import { LocaleService } from '../../../../app/core/locale/locale.service';
import { Collection } from '../../../../app/core/shared/collection.model';
import { AppConfig } from '../../../../config/app-config.interface';
import { HomePageComponent } from './home-page.component';

describe('UIST HomePageComponent', () => {
  let component: HomePageComponent;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('router', ['navigate']);
    component = new HomePageComponent(
      {
        homePage: {
          recentSubmissions: { pageSize: 0 },
          showDiscoverFilters: false,
        },
      } as AppConfig,
      { data: of({}) } as ActivatedRoute,
      { getCurrentLanguageCode: () => of('en') } as LocaleService,
      jasmine.createSpyObj<CollectionDataService>('collectionDataService', ['findAll']),
      { getName: (collection: Collection) => collection.name } as DSONameService,
      router,
    );
  });

  it('builds an escaped field-specific search and resets the form', () => {
    component.selectedSearchField = 'title';
    component.searchByValue = 'A "quoted" \\ title';

    component.onSearchBySubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { query: 'title:"A \\"quoted\\" \\\\ title"' },
    });
    expect(component.selectedSearchField).toBe('');
    expect(component.searchByValue).toBe('');
  });

  it('does not navigate for an empty search', () => {
    component.searchByValue = '   ';

    component.onSearchBySubmit();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('orders matching category collections by the approved homepage order', () => {
    const collections = [
      { name: 'Additional Publications', uuid: 'additional' },
      { name: 'Impact Factor Articles', uuid: 'impact' },
      { name: 'Not a homepage category', uuid: 'other' },
    ] as Collection[];

    const cards = (component as any).buildCategoryCards(collections);

    expect(cards.map((card) => card.uuid)).toEqual(['impact', 'additional']);
  });
});
