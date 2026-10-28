import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AddressInfo } from 'node:net';
import { test } from 'node:test';

import express from 'express';
import { load } from 'js-yaml';

import { HarvestingConfig } from '../src/config/harvesting-config.interface';
import { getRepositoryDiscoveryLinks } from '../src/config/harvesting-metadata.util';
import { registerRepositoryDiscovery } from '../src/server/repository-discovery';

const config = (load(readFileSync('config/config.yml', 'utf8')) as { harvesting: HarvestingConfig }).harvesting;
const publicUi = 'https://repository.uist.edu.mk';
const publicRest = `${publicUi}/server`;

async function withServer(
  run: (origin: string) => Promise<void>,
  harvesting: HarvestingConfig | undefined = config,
  ui = publicUi,
  rest = publicRest,
): Promise<void> {
  const app = express();
  registerRepositoryDiscovery(app, harvesting, ui, rest);
  app.use((req, res) => res.send('Page'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await run(origin);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

void test('GET and HEAD landing pages advertise the same links as the HTML builder', async () => {
  await withServer(async origin => {
    const links = getRepositoryDiscoveryLinks(config, publicUi, publicRest);
    for (const path of ['/', '/home', '/home/']) {
      for (const method of ['GET', 'HEAD']) {
        const response = await fetch(`${origin}${path}`, { method });
        assert.equal(response.status, 200);
        for (const link of links) {
          assert.ok(response.headers.get('link')?.includes(`<${link.href}>; rel="${link.rel}"; type="${link.type}"`));
        }
        if (method === 'HEAD') {
          assert.equal(await response.text(), '');
        }
      }
    }
  });
});

void test('repository graph retains verified identity and never trusts the incoming Host', async () => {
  await withServer(async origin => {
    const response = await fetch(`${origin}/.well-known/repository.jsonld`, {
      headers: { Host: 'spoofed.invalid', 'X-Forwarded-Host': 'private.internal' },
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /^application\/ld\+json/);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=300');
    const graph = await response.json() as any;
    const catalog = graph['@graph'][0];
    assert.equal(catalog['@id'], `${publicUi}/#repository`);
    assert.ok(catalog.identifier.includes('https://www.re3data.org/repository/r3d100014963'));
    assert.equal(catalog.dateCreated, '2025');
    assert.equal(catalog.creditText, 'University-funded');
    assert.equal(graph['@graph'][1].address.addressCountry, 'MK');
    assert.equal(catalog.publishingPrinciples.length, 5);
    assert.equal(new Set(catalog.publishingPrinciples.map((policy: any) => policy['@id'])).size, 5);
    assert.ok(!JSON.stringify(graph).includes('spoofed.invalid'));
    assert.ok(!JSON.stringify(graph).includes('private.internal'));
  });
});

void test('both API catalog routes support GET, HEAD and conditional retrieval', async () => {
  await withServer(async origin => {
    let expectedBody: string | undefined;
    for (const path of ['/api-catalog', '/.well-known/api-catalog']) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /^application\/linkset\+json/);
      const body = await response.text();
      expectedBody ??= body;
      assert.equal(body, expectedBody);
      const catalog = JSON.parse(body);
      assert.equal(catalog.linkset.find((entry: any) => entry.anchor.endsWith('/opensearch/service'))['service-meta'][0].type,
        'application/opensearchdescription+xml');
      const head = await fetch(`${origin}${path}`, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
      assert.equal(head.headers.get('content-type'), response.headers.get('content-type'));
      assert.ok(response.headers.get('etag'));
      const cached = await fetch(`${origin}${path}`, {
        headers: { 'If-None-Match': response.headers.get('etag') as string },
        // Undici otherwise adds Cache-Control: no-cache to conditional requests.
        cache: 'force-cache',
      });
      assert.equal(cached.status, 304);
    }
  });
});

void test('public discovery headers do not appear on item or account routes', async () => {
  await withServer(async origin => {
    for (const path of ['/items/example', '/profile', '/search']) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.headers.get('link'), null);
    }
  });
});

void test('disabled discovery returns 404 documents and no discovery headers', async () => {
  await withServer(async origin => {
    assert.equal((await fetch(origin)).headers.get('link'), null);
    for (const path of ['/api-catalog', '/.well-known/api-catalog', '/.well-known/repository.jsonld']) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 404);
      assert.equal(response.headers.get('link'), null);
    }
  }, { ...config, enabled: false });
});

void test('unsafe public UI addresses cannot publish a discovery document', async () => {
  await withServer(async origin => {
    assert.equal((await fetch(`${origin}/api-catalog`)).status, 404);
    assert.equal((await fetch(origin)).headers.get('link'), null);
  }, config, 'http://private.internal');
});

void test('private REST addresses stay out of graph, catalog and HTTP headers', async () => {
  await withServer(async origin => {
    for (const path of ['/.well-known/repository.jsonld', '/api-catalog']) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 200);
      assert.ok(!(await response.text()).includes('private.internal'));
      assert.ok(!response.headers.get('link')?.includes('private.internal'));
    }
  }, config, publicUi, 'http://private.internal:8080/server');
});

void test('discovery honors deployments under a configured public base path', async () => {
  await withServer(async origin => {
    const response = await fetch(`${origin}/repository/api-catalog`);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('link')?.includes(`${publicUi}/repository/.well-known/repository.jsonld`));
    const home = await fetch(`${origin}/repository/home`);
    assert.ok(home.headers.get('link')?.includes(`${publicUi}/repository/api-catalog`));
  }, config, `${publicUi}/repository/`);
});
