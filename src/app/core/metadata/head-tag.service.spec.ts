import {
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  Meta,
  Title,
} from '@angular/platform-browser';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import { AppConfig } from '@dspace/config/app-config.interface';
import { createMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  of,
  Subject,
} from 'rxjs';

import { DSONameService } from '../breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '../data/feature-authorization/authorization-data.service';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { RootDataService } from '../data/root-data.service';
import { HardRedirectService } from '../services/hard-redirect.service';
import { Bitstream } from '../shared/bitstream.model';
import { Bundle } from '../shared/bundle.model';
import { Collection } from '../shared/collection.model';
import { Item } from '../shared/item.model';
import { MetadataValue } from '../shared/metadata.models';
import {
  ItemMock,
  MockBitstream1,
  MockBitstream2,
  MockBitstream3,
  NonDiscoverableItemMock,
} from '../testing/item.mock';
import { getMockTranslateService } from '../testing/translate.service.mock';
import { createPaginatedList } from '../testing/utils.test';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../utilities/remote-data.utils';
import { HeadTagService } from './head-tag.service';
import {
  AddMetaTagAction,
  ClearMetaTagAction,
} from './meta-tag.actions';

describe('HeadTagService', () => {
  let headTagService: HeadTagService;

  let meta: Meta;

  let title: Title;

  let dsoNameService: DSONameService;

  let bundleDataService;
  let rootService: RootDataService;
  let translateService: TranslateService;
  let hardRedirectService: HardRedirectService;
  let authorizationService: AuthorizationDataService;

  let router: Router;
  let store;

  let appConfig: AppConfig;

  const initialState = {
    core: { metaTag: { tagsInUse: ['title', 'description'] } },
  };

  beforeEach(() => {
    rootService = jasmine.createSpyObj({
      findRoot: createSuccessfulRemoteDataObject$({
        dspaceVersion: 'mock-dspace-version',
      }),
    });
    bundleDataService = jasmine.createSpyObj({
      findByItemAndName: mockBundleRD$([MockBitstream3]),
    });
    translateService = getMockTranslateService();
    meta = jasmine.createSpyObj('meta', {
      addTag: {},
      removeTag: {},
    });
    title = jasmine.createSpyObj({
      setTitle: {},
      getTitle: 'UIST Digital Repository',
    });
    dsoNameService = jasmine.createSpyObj({
      getName: ItemMock.firstMetadataValue('dc.title'),
    });
    router = {
      url: '/items/0ec7ff22-f211-40ab-a69e-c819b0b1f357',
      events: of(new NavigationEnd(1, '', '')),
      routerState: {
        root: {},
      },
    } as any as Router;
    hardRedirectService = jasmine.createSpyObj({
      getBaseUrl: 'https://request.org',
    });
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: of(true),
    });

    store = createMockStore({ initialState });
    spyOn(store, 'dispatch');

    appConfig = {
      ui: {
        baseUrl: 'https://repository.uist.edu.mk',
      },
      rest: {
        baseUrl: 'https://repository.uist.edu.mk/server',
      },
      harvesting: {
        enabled: true,
        repository: {
          name: 'UIST Digital Repository',
          description: 'UIST research outputs',
          languages: ['en'],
          subjects: [],
          publisher: {
            id: 'https://uist.edu.mk/#organization',
            name: 'University of Information Science and Technology',
            url: 'https://uist.edu.mk/',
            countryCode: 'MK',
          },
        },
        services: {
          rest: true,
          oaiPmh: true,
          openSearch: true,
          feeds: true,
          sitemap: true,
          signposting: true,
        },
      },
      item: {
        bitstream: {
          pageSize: 5,
        },
      },
    } as any;

    headTagService = new HeadTagService(
      router,
      translateService,
      meta,
      title,
      dsoNameService,
      bundleDataService,
      rootService,
      store,
      hardRedirectService,
      appConfig,
      authorizationService,
      document,
    );
  });

  afterEach(() => {
    document
      .querySelectorAll(
        "link[rel='canonical'], link[data-uist-harvesting], script[data-uist-seo-jsonld]",
      )
      .forEach((element: Element) => element.remove());
  });

  describe(`robots tag`, () => {
    it(`should be set to noindex for non-discoverable items`, fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(NonDiscoverableItemMock),
          },
        },
      });
      tick();
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'robots',
        content: 'noindex',
      });
    }));
    it(`should not be set for discoverable items`, fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(ItemMock),
          },
        },
      });
      tick();
      expect(meta.addTag).not.toHaveBeenCalledWith({
        name: 'robots',
        content: 'noindex',
      });
    }));
  });

  it('items page should set meta tags', fakeAsync(() => {
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(ItemMock),
        },
      },
    });
    tick();
    expect(title.setTitle).toHaveBeenCalledWith(
      'Test PowerPoint Document | UIST Digital Repository',
    );
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_title',
      content: 'Test PowerPoint Document',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_author',
      content: 'Doe, Jane',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_publication_date',
      content: '1650-06-26',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_issn',
      content: '123456789',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_language',
      content: 'en',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_keywords',
      content: 'keyword1; keyword2; keyword3',
    });
  }));

  it('normalizes language labels and prefers the ISO field', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.language': [{ value: 'mk' }] as MetadataValue[],
        'dc.language.iso': [{ value: 'English' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_language',
      content: 'en',
    });
    const jsonLd = JSON.parse(
      document.querySelector('script[data-uist-seo-jsonld]').textContent,
    );
    expect(jsonLd['@graph'][0].inLanguage).toBe('en');
  }));

  it('exposes explicit journal and conference citation metadata', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.type': [{ value: 'Article' }] as MetadataValue[],
        'dc.relation.ispartof': [
          { value: 'International Journal of Security &amp; Research' },
        ] as MetadataValue[],
        'dc.relation.conference': [
          { value: '2024 International Congress on Human-Computer Interaction' },
        ] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_journal_title',
      content: 'International Journal of Security & Research',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_conference',
      content: '2024 International Congress on Human-Computer Interaction',
    });
  }));

  it('does not label a book or conference venue as a journal', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.type': [{ value: 'Book chapter' }] as MetadataValue[],
        'dc.relation.ispartof': [
          { value: 'A book title' },
        ] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'citation_journal_title' }),
    );
  }));

  it('items page should set meta tags as published Thesis', fakeAsync(() => {
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(
            mockPublisher(mockType(ItemMock, 'Thesis')),
          ),
        },
      },
    });
    tick();
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_dissertation_name',
      content: 'Test PowerPoint Document',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_pdf_url',
      content:
        'https://request.org/bitstreams/4db100c1-e1f5-4055-9404-9bc3e2d15f29/download',
    });
  }));

  it('items page should set meta tags as published Technical Report', fakeAsync(() => {
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(
            mockPublisher(mockType(ItemMock, 'Technical Report')),
          ),
        },
      },
    });
    tick();
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_technical_report_institution',
      content: 'Mock Publisher',
    });
  }));

  it('normalizes slash-separated issued dates for citation consumers', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.date.issued': [{ value: '2021/06/30' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_publication_date',
      content: '2021-06-30',
    });
    const jsonLd = JSON.parse(
      document.querySelector('script[data-uist-seo-jsonld]').textContent,
    );
    expect(jsonLd['@graph'][0].datePublished).toBe('2021-06-30');
  }));

  it('leaves an impossible slash date unchanged instead of normalizing it', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.date.issued': [{ value: '2021/02/30' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_publication_date',
      content: '2021/02/30',
    });
  }));

  it('does not infer publication timing from lifecycle or copyright dates', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.date.issued': [],
        'dc.date.copyright': [{ value: '2020' }] as MetadataValue[],
        'dc.date.available': [{ value: '2021-01-01' }] as MetadataValue[],
        'dc.date.accessioned': [{ value: '2021-01-02' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'citation_publication_date' }),
    );
    const jsonLd = JSON.parse(
      document.querySelector('script[data-uist-seo-jsonld]').textContent,
    );
    expect(jsonLd['@graph'][0].datePublished).toBeUndefined();
  }));

  it('prefers issued date over copyright date for publication metadata', fakeAsync(() => {
    const item = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.date.copyright': [{ value: '2020' }] as MetadataValue[],
        'dc.date.issued': [{ value: '2021' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).processRouteChange({
      data: { value: { dso: createSuccessfulRemoteDataObject(item) } },
    });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'citation_publication_date',
      content: '2021',
    });
  }));

  it('route titles should overwrite dso titles', fakeAsync(() => {
    (translateService.get as jasmine.Spy).and.returnValues(
      of('DSpace :: '),
      of('Translated Route Title'),
    );
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(ItemMock),
          title: 'route.title.key',
        },
      },
    });
    tick();
    expect(title.setTitle).toHaveBeenCalledTimes(2);
    expect((title.setTitle as jasmine.Spy).calls.argsFor(0)).toEqual([
      'Test PowerPoint Document | UIST Digital Repository',
    ]);
    expect((title.setTitle as jasmine.Spy).calls.argsFor(1)).toEqual([
      'DSpace :: Translated Route Title',
    ]);
  }));

  it('other navigation should add title and description', fakeAsync(() => {
    (translateService.get as jasmine.Spy).and.returnValues(
      of('DSpace :: '),
      of('Dummy Title'),
      of('This is a dummy item component for testing!'),
    );
    (headTagService as any).processRouteChange({
      data: {
        value: {
          title: 'Dummy Title',
          description: 'This is a dummy item component for testing!',
        },
      },
    });
    tick();
    expect(title.setTitle).toHaveBeenCalledWith('DSpace :: Dummy Title');
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'title',
      content: 'DSpace :: Dummy Title',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'This is a dummy item component for testing!',
    });
  }));

  it('should expose a DataCatalog and EDEN-compatible repository discovery metadata', fakeAsync(() => {
    (router as any).url = '/';
    (headTagService as any).processRouteChange({ data: { value: {} } });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'publisher',
      content: 'University of Information Science and Technology',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'language',
      content: 'en',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'type',
      content: 'DataCatalog',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'title',
      content:
        'UIST Digital Repository | University of Information Science and Technology',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'UIST research outputs',
    });

    const jsonLd = JSON.parse(
      document.querySelector('script[data-uist-seo-jsonld]')?.textContent,
    );
    expect(jsonLd['@graph'][0]['@type']).toBe('DataCatalog');
    expect(jsonLd['@graph'][0].publisher['@id']).toBe(
      'https://uist.edu.mk/#organization',
    );
    expect(jsonLd['@graph'][0].service.length).toBeGreaterThan(0);
    expect(
      document
        .querySelector("link[rel='describedby'][type='application/ld+json']")
        ?.getAttribute('href'),
    ).toBe('https://repository.uist.edu.mk/.well-known/repository.jsonld');
    expect(
      document
        .querySelector(
          "link[rel='api-catalog'][type='application/linkset+json']",
        )
        ?.getAttribute('href'),
    ).toBe('https://repository.uist.edu.mk/.well-known/api-catalog');
    expect(
      document
        .querySelector(
          "link[data-uist-harvesting][rel='search'][type='application/opensearchdescription+xml']",
        )
        ?.getAttribute('href'),
    ).toBe('https://repository.uist.edu.mk/server/opensearch/service');
    expect(
      document.querySelectorAll("link[data-uist-harvesting][rel='alternate']")
        .length,
    ).toBe(2);
    expect(meta.addTag).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'license' }),
    );
    expect(meta.addTag).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'contact' }),
    );
  }));

  it('uses dspace.entity.type when detailed dc.type is absent', () => {
    const entityOnlyItem = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.type': [],
        'dspace.entity.type': [{ value: 'Dataset' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).currentObject.next(entityOnlyItem);

    expect((headTagService as any).getSchemaType()).toBe('Dataset');
  });

  it('prefers detailed dc.type over the broad DSpace entity type', () => {
    const typedItem = Object.assign(new Item(), ItemMock, {
      metadata: {
        ...ItemMock.metadata,
        'dc.type': [{ value: 'Book chapter' }] as MetadataValue[],
        'dspace.entity.type': [{ value: 'Publication' }] as MetadataValue[],
      },
    }) as Item;
    (headTagService as any).currentObject.next(typedItem);

    expect((headTagService as any).getSchemaType()).toBe('Chapter');
  });

  it('should use the explicitly configured production HTTPS URL without query parameters', fakeAsync(() => {
    (router as any).url =
      '/items/0ec7ff22-f211-40ab-a69e-c819b0b1f357?mode=full#details';
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(ItemMock),
        },
      },
    });
    tick();

    const canonicals = document.querySelectorAll("link[rel='canonical']");
    expect(canonicals.length).toBe(1);
    expect(canonicals.item(0).getAttribute('href')).toBe(
      'https://repository.uist.edu.mk/items/0ec7ff22-f211-40ab-a69e-c819b0b1f357',
    );
  }));

  it('should canonicalize an item to its stable repository Handle path', fakeAsync(() => {
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(
            mockUri(
              ItemMock,
              'https://repository.uist.edu.mk/handle/123456789/78',
            ),
          ),
        },
      },
    });
    tick();

    expect(
      document.querySelector("link[rel='canonical']")?.getAttribute('href'),
    ).toBe('https://repository.uist.edu.mk/handle/123456789/78');
  }));

  it('does not rebase an external publisher Handle path onto the repository', fakeAsync(() => {
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(
            mockUri(
              ItemMock,
              'https://publisher.example.org/handle/123456789/78',
            ),
          ),
        },
      },
    });
    tick();

    const expected =
      'https://repository.uist.edu.mk/items/0ec7ff22-f211-40ab-a69e-c819b0b1f357';
    expect(
      document.querySelector("link[rel='canonical']")?.getAttribute('href'),
    ).toBe(expected);
    const jsonLd = JSON.parse(
      document.querySelector('script[data-uist-seo-jsonld]').textContent,
    );
    expect(jsonLd['@graph'][0]['@id']).toBe(expected);
  }));

  it('should use an explicitly configured staging HTTPS URL', fakeAsync(() => {
    (appConfig.ui as any).baseUrl = 'https://staging.repository.uist.edu.mk';
    (router as any).url = '/home?draft=true#preview';
    (headTagService as any).processRouteChange({ data: { value: {} } });
    tick();

    expect(
      document.querySelector("link[rel='canonical']")?.getAttribute('href'),
    ).toBe('https://staging.repository.uist.edu.mk/home');
    expect(meta.addTag).toHaveBeenCalledWith({
      property: 'og:url',
      content: 'https://staging.repository.uist.edu.mk/home',
    });
  }));

  [
    undefined,
    'not a URL',
    'http://repository.example.org',
    'https://dspace',
    'https://api.internal',
    'https://100.64.0.1',
    'https://169.254.1.1',
    'https://[fd00::1]',
    'https://user:redacted@repository.example.org',
    'https://repository.example.org/?origin=untrusted',
  ].forEach((invalidPublicUrl) => {
    it(`should omit canonical and JSON-LD for an invalid public URL: ${invalidPublicUrl}`, fakeAsync(() => {
      (appConfig.ui as any).baseUrl = invalidPublicUrl;
      (appConfig.rest as any) = {
        baseUrl: 'https://browser-rest.example.org/server',
        ssrBaseUrl: 'http://internal-rest:8080/server',
      };
      (router as any).url = '/home';
      (headTagService as any).processRouteChange({ data: { value: {} } });
      tick();

      expect(document.querySelector("link[rel='canonical']")).toBeNull();
      expect(document.querySelector('script[data-uist-seo-jsonld]')).toBeNull();
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({
          property: 'og:url',
        }),
      );
      expect(document.head.innerHTML).not.toContain('internal-rest:8080');
    }));
  });

  it('should preserve the localhost origin in local configuration', fakeAsync(() => {
    (appConfig.ui as any).baseUrl = 'http://localhost:4000';
    (router as any).url = '/home';
    (headTagService as any).processRouteChange({ data: { value: {} } });
    tick();

    expect(
      document.querySelector("link[rel='canonical']")?.getAttribute('href'),
    ).toBe('http://localhost:4000/home');
    expect(
      document.querySelector('script[data-uist-seo-jsonld]'),
    ).not.toBeNull();
  }));

  it('should add singleton OpenGraph, Twitter, and JSON-LD item metadata', fakeAsync(() => {
    (headTagService as any).processRouteChange({
      data: {
        value: {
          dso: createSuccessfulRemoteDataObject(ItemMock),
        },
      },
    });
    tick();

    expect(meta.addTag).toHaveBeenCalledWith({
      property: 'og:type',
      content: 'article',
    });
    expect(meta.addTag).toHaveBeenCalledWith({
      name: 'twitter:card',
      content: 'summary',
    });

    const scripts = document.querySelectorAll('script[data-uist-seo-jsonld]');
    expect(scripts.length).toBe(1);
    const jsonLd = JSON.parse(scripts.item(0).textContent);
    expect(jsonLd['@graph'].map((entry: any) => entry['@type'])).toEqual([
      jasmine.stringMatching(
        /^(CreativeWork|Dataset|Chapter|Book|Thesis|Report|SoftwareSourceCode|ScholarlyArticle)$/,
      ),
      'DataCatalog',
      'CollegeOrUniversity',
      'WebSite',
    ]);
    expect(jsonLd['@graph'][0].provider).toEqual({
      '@id': 'https://repository.uist.edu.mk/#repository',
    });
    expect(JSON.stringify(jsonLd)).not.toContain('localhost');
  }));

  describe('item structured metadata quality', () => {
    function renderItem(metadata: Record<string, MetadataValue[]>): any {
      const item = Object.assign(new Item(), {
        uuid: 'quality-item',
        metadata,
      });
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(item),
          },
        },
      });
      return JSON.parse(
        document.querySelector('script[data-uist-seo-jsonld]').textContent,
      )['@graph'][0];
    }

    it('exports dataset version, methods, related publication and source without file licence defaults', () => {
      const item = renderItem({
        'dc.type': [{ value: 'Dataset' }] as MetadataValue[],
        'local.dataset.version': [{ value: '1.0-test' }] as MetadataValue[],
        'local.dataset.methods': [{ value: 'Compile published aggregates.' }] as MetadataValue[],
        'dc.relation.isreferencedby': [{ value: 'https://example.org/publication' }] as MetadataValue[],
        'dc.relation.references': [{ value: 'https://example.org/source' }] as MetadataValue[],
        'dcterms.accessRights': [{ value: 'Mixed file access; embargo ends 2026-11-05.' }] as MetadataValue[],
      });
      expect(item['@type']).toBe('Dataset');
      expect(item.version).toBe('1.0-test');
      expect(item.measurementTechnique).toBe('Compile published aggregates.');
      expect(item.subjectOf).toEqual(['https://example.org/publication']);
      expect(item.isBasedOn).toEqual(['https://example.org/source']);
      expect(item.conditionsOfAccess).toContain('2026-11-05');
      expect(item.license).toBeUndefined();
    });

    it('omits unknown dataset version and methods', () => {
      const item = renderItem({ 'dc.type': [{ value: 'Dataset' }] as MetadataValue[] });
      expect(item.version).toBeUndefined();
      expect(item.measurementTechnique).toBeUndefined();
      expect(item.subjectOf).toBeUndefined();
      expect(item.isBasedOn).toBeUndefined();
    });

    it('keeps the full abstract in JSON-LD, without truncating it for previews', () => {
      const abstract = 'A detailed research abstract. '.repeat(20);
      expect(
        renderItem({
          'dc.description.abstract': [{ value: abstract }] as MetadataValue[],
        }).description,
      ).toBe(abstract.trim());
    });

    it('omits absent item descriptions instead of describing the repository', () => {
      expect(renderItem({}).description).toBeUndefined();
    });

    it('deduplicates normalized DOI identifiers', () => {
      const item = renderItem({
        'dc.identifier.doi': [
          { value: '10.1234/example' },
          { value: 'https://doi.org/10.1234/example' },
        ] as MetadataValue[],
      });
      expect(item.identifier).toEqual(['https://doi.org/10.1234/example']);
      expect(item.sameAs).toEqual(['https://doi.org/10.1234/example']);
    });

    it('keeps qualified OpenAlex identifiers and canonicalizes bare Handles', () => {
      const item = renderItem({
        'dc.identifier.handle': [
          { value: '20.500.15029/94' },
        ] as MetadataValue[],
        'dc.identifier.openalex': [
          { value: 'https://openalex.org/W4405082019' },
        ] as MetadataValue[],
      });
      expect(item.identifier).toEqual([
        'https://hdl.handle.net/20.500.15029/94',
        'https://openalex.org/W4405082019',
      ]);
      expect(item.sameAs).toEqual(['https://openalex.org/W4405082019']);
    });

    it('preserves a textual license when no license URI is available', () => {
      const item = renderItem({
        'dc.rights.license': [{ value: 'CC BY-NC 4.0' }] as MetadataValue[],
      });
      expect(item.license).toBe('CC BY-NC 4.0');
      expect(item.copyrightNotice).toBeUndefined();
    });

    it('uses an explicit license URI ahead of a textual license value', () => {
      const item = renderItem({
        'dc.rights.license': [{ value: 'cc-by' }] as MetadataValue[],
        'dc.rights.uri': [
          { value: 'https://creativecommons.org/licenses/by/4.0/' },
        ] as MetadataValue[],
      });
      expect(item.license).toBe('https://creativecommons.org/licenses/by/4.0/');
    });

    it('retains a generic rights URL as a license for legacy records', () => {
      const item = renderItem({
        'dc.rights': [
          { value: 'https://creativecommons.org/licenses/by/4.0/' },
        ] as MetadataValue[],
      });
      expect(item.license).toBe('https://creativecommons.org/licenses/by/4.0/');
    });

    it('keeps a copyright notice beside an explicit license URI', () => {
      const item = renderItem({
        'dc.rights.uri': [
          { value: 'https://creativecommons.org/licenses/by/4.0/' },
        ] as MetadataValue[],
        'dc.rights': [{ value: '2023 The Author(s)' }] as MetadataValue[],
      });
      expect(item.license).toBe('https://creativecommons.org/licenses/by/4.0/');
      expect(item.copyrightNotice).toBe('2023 The Author(s)');
    });

    it('decodes encoded markup as text and keeps JSON-LD script-safe', () => {
      const item = renderItem({
        'dc.description.abstract': [
          {
            value: '&lt;em&gt;A &amp; B&lt;/em&gt; &lt;/script&gt;',
          },
        ] as MetadataValue[],
      });
      expect(item.description).toBe('<em>A & B</em> </script>');
      expect(
        document.querySelector('script[data-uist-seo-jsonld]').textContent,
      ).toContain('\\u003c/script>');
    });

    it('does not turn publication venue metadata into a repository collection', () => {
      expect(
        renderItem({
          'dc.relation.ispartof': [
            { value: 'Journal of Testing' },
          ] as MetadataValue[],
        }).isPartOf,
      ).toBeUndefined();
    });

    it('uses the resolved owning collection rather than a journal name', () => {
      const collection = Object.assign(new Collection(), { uuid: 'collection-id' });
      (dsoNameService.getName as jasmine.Spy).and.returnValue('Research articles');
      const item = Object.assign(new Item(), {
        uuid: 'quality-item',
        metadata: { 'dc.relation.ispartof': [{ value: 'A journal' }] },
        owningCollection: createSuccessfulRemoteDataObject$(collection),
      });
      (headTagService as any).processRouteChange({ data: { value: {
        dso: createSuccessfulRemoteDataObject(item),
      } } });
      const graph = JSON.parse(document.querySelector('script[data-uist-seo-jsonld]').textContent)['@graph'];
      expect(graph[0].isPartOf).toEqual({
        '@type': 'DataCatalog',
        '@id': 'https://repository.uist.edu.mk/collections/collection-id',
        name: 'Research articles',
      });
    });

    it('ignores an old collection response after navigation', () => {
      const pending = new Subject<RemoteData<Collection>>();
      const oldItem = Object.assign(new Item(), {
        uuid: 'old-item', metadata: {}, owningCollection: pending,
      });
      (headTagService as any).processRouteChange({ data: { value: {
        dso: createSuccessfulRemoteDataObject(oldItem),
      } } });
      renderItem({});
      pending.next(createSuccessfulRemoteDataObject(Object.assign(new Collection(), { uuid: 'old-collection' })));
      expect(JSON.parse(document.querySelector('script[data-uist-seo-jsonld]').textContent)['@graph'][0].isPartOf)
        .toBeUndefined();
    });
  });

  describe(`listenForRouteChange`, () => {
    it(`should call processRouteChange`, fakeAsync(() => {
      spyOn(headTagService as any, 'processRouteChange').and.callFake(
        () => undefined,
      );
      headTagService.listenForRouteChange();
      tick();
      expect((headTagService as any).processRouteChange).toHaveBeenCalled();
    }));
    it(`should add Generator`, fakeAsync(() => {
      spyOn(headTagService as any, 'processRouteChange').and.callFake(
        () => undefined,
      );
      headTagService.listenForRouteChange();
      tick();
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'Generator',
        content: 'mock-dspace-version',
      });
    }));
  });

  describe('citation_abstract_html_url', () => {
    it('should use dc.identifier.uri if available', fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(
              mockUri(ItemMock, 'https://ddg.gg'),
            ),
          },
        },
      });
      tick();
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'citation_abstract_html_url',
        content: 'https://ddg.gg',
      });
    }));

    it('should use current route as fallback', fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(mockUri(ItemMock)),
          },
        },
      });
      tick();
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'citation_abstract_html_url',
        content:
          'https://repository.uist.edu.mk/items/0ec7ff22-f211-40ab-a69e-c819b0b1f357',
      });
    }));
  });

  describe('citation_*_institution / citation_publisher', () => {
    it('should use citation_dissertation_institution tag for dissertations', fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(
              mockPublisher(mockType(ItemMock, 'Thesis')),
            ),
          },
        },
      });
      tick();
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'citation_dissertation_institution',
        content: 'Mock Publisher',
      });
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'citation_technical_report_institution',
        }),
      );
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'citation_publisher' }),
      );
    }));

    it('should use citation_tech_report_institution tag for tech reports', fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(
              mockPublisher(mockType(ItemMock, 'Technical Report')),
            ),
          },
        },
      });
      tick();
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'citation_dissertation_institution' }),
      );
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'citation_technical_report_institution',
        content: 'Mock Publisher',
      });
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'citation_publisher' }),
      );
    }));

    it('should use citation_publisher for other item types', fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(
              mockPublisher(mockType(ItemMock, 'Some Other Type')),
            ),
          },
        },
      });
      tick();
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'citation_dissertation_institution' }),
      );
      expect(meta.addTag).not.toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'citation_technical_report_institution',
        }),
      );
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'citation_publisher',
        content: 'Mock Publisher',
      });
    }));
  });

  describe('citation_pdf_url', () => {
    it('should link to primary Bitstream URL regardless of format', fakeAsync(() => {
      (bundleDataService.findByItemAndName as jasmine.Spy).and.returnValue(
        mockBundleRD$([], MockBitstream3),
      );

      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(ItemMock),
          },
        },
      });
      tick();
      expect(meta.addTag).toHaveBeenCalledWith({
        name: 'citation_pdf_url',
        content:
          'https://request.org/bitstreams/4db100c1-e1f5-4055-9404-9bc3e2d15f29/download',
      });
    }));

    describe('bitstream not download allowed', () => {
      it('should not have citation_pdf_url', fakeAsync(() => {
        (bundleDataService.findByItemAndName as jasmine.Spy).and.returnValue(
          mockBundleRD$([MockBitstream3]),
        );
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(
          of(false),
        );

        (headTagService as any).processRouteChange({
          data: {
            value: {
              dso: createSuccessfulRemoteDataObject(ItemMock),
            },
          },
        });
        tick();
        expect(meta.addTag).not.toHaveBeenCalledWith(
          jasmine.objectContaining({ name: 'citation_pdf_url' }),
        );
      }));
    });

    describe('no primary Bitstream', () => {
      it('should link to first and only Bitstream regardless of format', fakeAsync(() => {
        (bundleDataService.findByItemAndName as jasmine.Spy).and.returnValue(
          mockBundleRD$([MockBitstream3]),
        );

        (headTagService as any).processRouteChange({
          data: {
            value: {
              dso: createSuccessfulRemoteDataObject(ItemMock),
            },
          },
        });
        tick();
        expect(meta.addTag).toHaveBeenCalledWith({
          name: 'citation_pdf_url',
          content:
            'https://request.org/bitstreams/4db100c1-e1f5-4055-9404-9bc3e2d15f29/download',
        });
      }));

      describe(`when there's a bitstream with an allowed format on the first page`, () => {
        let bitstreams;

        beforeEach(() => {
          bitstreams = [MockBitstream2, MockBitstream3, MockBitstream1];
          (bundleDataService.findByItemAndName as jasmine.Spy).and.returnValue(
            mockBundleRD$(bitstreams),
          );
        });

        it('should link to first Bitstream with allowed format', fakeAsync(() => {
          (headTagService as any).processRouteChange({
            data: {
              value: {
                dso: createSuccessfulRemoteDataObject(ItemMock),
              },
            },
          });
          tick();
          expect(meta.addTag).toHaveBeenCalledWith({
            name: 'citation_pdf_url',
            content:
              'https://request.org/bitstreams/99b00f3c-1cc6-4689-8158-91965bee6b28/download',
          });
        }));
      });
    });
  });

  describe(`when there's no bitstream with an allowed format on the first page`, () => {
    let bitstreams;

    beforeEach(() => {
      bitstreams = [MockBitstream1, MockBitstream3, MockBitstream2];
      (bundleDataService.findByItemAndName as jasmine.Spy).and.returnValue(
        mockBundleRD$(bitstreams),
      );
    });

    it(`shouldn't add a citation_pdf_url meta tag`, fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(ItemMock),
          },
        },
      });
      tick();
      expect(meta.addTag).not.toHaveBeenCalledWith({
        name: 'citation_pdf_url',
        content:
          'https://request.org/bitstreams/99b00f3c-1cc6-4689-8158-91965bee6b28/download',
      });
    }));
  });

  describe('tagstore', () => {
    beforeEach(fakeAsync(() => {
      (headTagService as any).processRouteChange({
        data: {
          value: {
            dso: createSuccessfulRemoteDataObject(ItemMock),
          },
        },
      });
      tick();
    }));

    it('should remove previous tags on route change', fakeAsync(() => {
      expect(meta.removeTag).toHaveBeenCalledWith("name='title'");
      expect(meta.removeTag).toHaveBeenCalledWith("name='description'");
    }));

    it('should clear all tags and add new ones on route change', () => {
      expect(store.dispatch.calls.argsFor(0)).toEqual([
        new ClearMetaTagAction(),
      ]);
      expect(store.dispatch.calls.argsFor(1)).toEqual([
        new AddMetaTagAction('title'),
      ]);
      expect(store.dispatch.calls.argsFor(2)).toEqual([
        new AddMetaTagAction('description'),
      ]);
    });
  });

  const mockType = (mockItem: Item, type: string): Item => {
    const typedMockItem = Object.assign(new Item(), mockItem) as Item;
    typedMockItem.metadata['dc.type'] = [{ value: type }] as MetadataValue[];
    return typedMockItem;
  };

  const mockPublisher = (mockItem: Item): Item => {
    const publishedMockItem = Object.assign(new Item(), mockItem) as Item;
    publishedMockItem.metadata['dc.publisher'] = [
      {
        language: 'en_US',
        value: 'Mock Publisher',
      },
    ] as MetadataValue[];
    return publishedMockItem;
  };

  const mockUri = (mockItem: Item, uri?: string): Item => {
    return Object.assign(new Item(), mockItem, {
      metadata: {
        ...mockItem.metadata,
        'dc.identifier.uri': [{ value: uri }] as MetadataValue[],
      },
    }) as Item;
  };

  const mockBundleRD$ = (
    bitstreams: Bitstream[],
    primary?: Bitstream,
  ): Observable<RemoteData<Bundle>> => {
    return createSuccessfulRemoteDataObject$(
      Object.assign(new Bundle(), {
        name: 'ORIGINAL',
        bitstreams: createSuccessfulRemoteDataObject$(
          mockBitstreamPages$(bitstreams)[0],
        ),
        primaryBitstream: createSuccessfulRemoteDataObject$(primary),
      }),
    );
  };

  const mockBitstreamPages$ = (
    bitstreams: Bitstream[],
  ): PaginatedList<Bitstream>[] => {
    return bitstreams.map((bitstream, index) =>
      Object.assign(createPaginatedList([bitstream]), {
        pageInfo: {
          totalElements: bitstreams.length, // announce multiple elements/pages
        },
        _links:
          index < bitstreams.length - 1
            ? { next: { href: 'not empty' } } // fake link to the next bitstream page
            : { next: { href: undefined } }, // last page has no link
      }),
    );
  };
});
