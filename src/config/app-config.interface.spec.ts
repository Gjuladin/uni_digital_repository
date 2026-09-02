import { toClientConfig } from './app-config.interface';
import { DefaultAppConfig } from './default-app-config';

describe('toClientConfig', () => {
  it('should remove server-only listener and private REST configuration', () => {
    const config = new DefaultAppConfig();
    config.ui.ssl = false;
    config.ui.host = '0.0.0.0';
    config.ui.port = 4000;
    config.ui.baseUrl = 'https://repository.uist.edu.mk';
    config.rest.ssrBaseUrl = 'http://dspace:8080/server';
    config.rest.hasSsrBaseUrl = true;

    const clientConfig = toClientConfig(config);

    expect(clientConfig.ui.ssl).toBeUndefined();
    expect(clientConfig.ui.host).toBeUndefined();
    expect(clientConfig.ui.port).toBeUndefined();
    expect(clientConfig.ui.rateLimiter).toBeUndefined();
    expect(clientConfig.ui.useProxies).toBeUndefined();
    expect(clientConfig.ui.baseUrl).toBe('https://repository.uist.edu.mk');
    expect(clientConfig.rest.ssrBaseUrl).toBeUndefined();
    expect(clientConfig.rest.hasSsrBaseUrl).toBeUndefined();
    expect(clientConfig.cache.serverSide).toBeUndefined();
  });
});
