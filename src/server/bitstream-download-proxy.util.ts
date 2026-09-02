/**
 * Rewrite a public UI bitstream URL to the REST content endpoint that streams
 * the bytes. Query parameters are deliberately preserved.
 */
export const rewriteBitstreamDownloadPath = (requestPath: string): string =>
  requestPath.replace(
    /^\/bitstreams\/([^/?]+)\/download\/?(?=\?|$)/,
    '/api/core/bitstreams/$1/content',
  );
