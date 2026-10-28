import { Express } from 'express';

import { HarvestingConfig } from '../config/harvesting-config.interface';
import {
  buildFairicatLinkset,
  buildRepositoryGraph,
  getRepositoryDiscoveryLinks,
  getSafePublicBaseUrl,
} from '../config/harvesting-metadata.util';

/** Public discovery only: never derive canonical URLs from request/proxy headers. */
export function registerRepositoryDiscovery(
  server: Express,
  config: HarvestingConfig | undefined,
  uiBaseUrl: string,
  restBaseUrl: string,
): void {
  const ui = getSafePublicBaseUrl(uiBaseUrl);
  const basePath = ui ? new URL(ui).pathname.replace(/\/$/, '') : '';
  const metadataPath = `${basePath}/.well-known/repository.jsonld`;
  const catalogPaths = [`${basePath}/api-catalog`, `${basePath}/.well-known/api-catalog`];
  const discoveryPaths = new Set([
    basePath || '/',
    `${basePath}/`,
    `${basePath}/home`,
    `${basePath}/home/`,
    metadataPath,
    ...catalogPaths,
  ]);

  server.use((req, res, next) => {
    if (config?.enabled && ui && ['GET', 'HEAD'].includes(req.method) && discoveryPaths.has(req.path)) {
      const links = getRepositoryDiscoveryLinks(config, ui, restBaseUrl);
      res.append('Link', links.map(link => `<${link.href}>; rel="${link.rel}"; type="${link.type}"`).join(', '));
    }
    next();
  });

  server.get(metadataPath, (req, res) => {
    if (!config?.enabled || !ui) {
      res.sendStatus(404);
      return;
    }
    res.set('Cache-Control', 'public, max-age=300');
    res.type('application/ld+json').send(JSON.stringify(buildRepositoryGraph(config, ui, restBaseUrl)));
  });

  // The clean alias avoids encoded dot paths rejected by some catalog consumers.
  server.get(catalogPaths, (req, res) => {
    if (!config?.enabled || !ui) {
      res.sendStatus(404);
      return;
    }
    res.set('Cache-Control', 'public, max-age=300');
    res.type('application/linkset+json').send(JSON.stringify(buildFairicatLinkset(config, ui, restBaseUrl)));
  });
}
