import { rewriteBitstreamDownloadPath } from './bitstream-download-proxy.util';

describe('rewriteBitstreamDownloadPath', () => {
  it('should rewrite a public bitstream download path to the REST content endpoint', () => {
    expect(rewriteBitstreamDownloadPath('/bitstreams/24174820-203a-4774-a4d1-0413e887ce9a/download'))
      .toBe('/api/core/bitstreams/24174820-203a-4774-a4d1-0413e887ce9a/content');
  });

  it('should preserve query parameters', () => {
    expect(rewriteBitstreamDownloadPath('/bitstreams/file-id/download/?sequence=1'))
      .toBe('/api/core/bitstreams/file-id/content?sequence=1');
  });

  it('should not rewrite unrelated paths', () => {
    expect(rewriteBitstreamDownloadPath('/items/item-id'))
      .toBe('/items/item-id');
  });
});
