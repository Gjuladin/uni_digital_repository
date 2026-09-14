import {
  DOCUMENT,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import {
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { LinkHeadService } from './link-head.service';

describe('LinkHeadService', () => {
  let service: LinkHeadService;

  const renderer2: Renderer2 = {
    createRenderer: jasmine.createSpy('createRenderer'),
    createElement: jasmine.createSpy('createElement'),
    setAttribute: jasmine.createSpy('setAttribute'),
    appendChild: jasmine.createSpy('appendChild'),
  } as unknown as Renderer2;

  beforeEach(waitForAsync(() => {
    return TestBed.configureTestingModule({
      providers: [
        MockProvider(RendererFactory2, {
          createRenderer: () => renderer2,
        }),
        { provide: Document, useExisting: DOCUMENT },
      ],
    });
  }));

  beforeEach(() => {
    (renderer2.appendChild as jasmine.Spy).calls.reset();
    service = new LinkHeadService(
      TestBed.inject(RendererFactory2),
      TestBed.inject(DOCUMENT),
    );
  });

  describe('link', () => {
    it('should create a link tag', () => {
      const link = service.addTag({
        href: 'test',
        type: 'application/atom+xml',
        rel: 'alternate',
        title: 'Sitewide Atom feed',
      });
      expect(link).not.toBeUndefined();
    });

    it('should not append a duplicate link already rendered by SSR', () => {
      const existing = TestBed.inject(DOCUMENT).createElement('link');
      existing.setAttribute('href', 'https://example.org/metadata');
      existing.setAttribute('rel', 'describedby');
      existing.setAttribute('type', 'application/ld+json');
      TestBed.inject(DOCUMENT).head.appendChild(existing);

      service.addTag({
        href: 'https://example.org/metadata',
        rel: 'describedby',
        type: 'application/ld+json',
      });

      expect(renderer2.appendChild).not.toHaveBeenCalled();
      existing.remove();
    });

    it('should treat ownership and title attributes as non-semantic for deduplication', () => {
      const existing = TestBed.inject(DOCUMENT).createElement('link');
      existing.setAttribute('href', 'https://example.org/feed');
      existing.setAttribute('rel', 'alternate');
      existing.setAttribute('type', 'application/atom+xml');
      existing.setAttribute('data-uist-harvesting', 'true');
      TestBed.inject(DOCUMENT).head.appendChild(existing);

      service.addTag({
        href: 'https://example.org/feed',
        rel: 'alternate',
        type: 'application/atom+xml',
        title: 'Sitewide Atom feed',
        'data-uist-rss': 'true',
      });

      expect(renderer2.appendChild).not.toHaveBeenCalled();
      existing.remove();
    });
  });
});
