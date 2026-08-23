import {
  filterUistComcolBrowseOptions,
  UIST_COMCOL_BROWSE_OPTION_IDS,
} from './comcol-page-browse-by.component';

describe('UIST community and collection browse navigation', () => {
  it('retains search and only the three intended browse choices', () => {
    const options = [
      { id: 'search', label: 'collection.page.browse.search.head', routerLink: '/collections/id/search' },
      { id: 'browse_dateissued', label: 'browse.comcol.by.dateissued', routerLink: '/collections/id/browse/dateissued' },
      { id: 'browse_author', label: 'browse.comcol.by.author', routerLink: '/collections/id/browse/author' },
      { id: 'browse_title', label: 'browse.comcol.by.title', routerLink: '/collections/id/browse/title' },
      { id: 'browse_subject', label: 'browse.comcol.by.subject', routerLink: '/collections/id/browse/subject' },
      { id: 'browse_srsc', label: 'browse.comcol.by.srsc', routerLink: '/collections/id/browse/srsc' },
    ];

    expect(UIST_COMCOL_BROWSE_OPTION_IDS).toEqual(new Set(['browse_dateissued', 'browse_author', 'browse_title']));
    expect(filterUistComcolBrowseOptions(options).map((option) => option.id)).toEqual([
      'search',
      'browse_dateissued',
      'browse_author',
      'browse_title',
    ]);
  });
});
