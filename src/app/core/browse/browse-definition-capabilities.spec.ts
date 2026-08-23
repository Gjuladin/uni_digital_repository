import {
  supportsBrowseContains,
  UIST_CONTAINS_BROWSE_IDS,
} from './browse-definition-capabilities';

describe('browse definition contains capabilities', () => {
  it('always uses contains for the UIST Author and Title browses', () => {
    expect(UIST_CONTAINS_BROWSE_IDS).toEqual(new Set(['author', 'title']));
    expect(supportsBrowseContains({ id: 'author', supportsContains: false } as any)).toBeTrue();
    expect(supportsBrowseContains({ id: 'title', supportsContains: false } as any)).toBeTrue();
  });

  it('uses the capability advertised by the REST browse definition', () => {
    expect(supportsBrowseContains({ id: 'custom', supportsContains: true } as any)).toBeTrue();
    expect(supportsBrowseContains({ id: 'subject', supportsContains: false } as any)).toBeFalse();
    expect(supportsBrowseContains(undefined)).toBeFalse();
  });
});
