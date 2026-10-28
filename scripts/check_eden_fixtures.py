#!/usr/bin/env python3
"""Check generated UIST fixtures against a local EDEN harvester, without network.

Run using the harvester's Python environment:
  HARVESTER/.venv/bin/python check_eden_fixtures.py --harvester-path HARVESTER --fixtures-dir FIXTURES
"""
import argparse
import html
import json
import sys
from pathlib import Path
from unittest.mock import patch

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--harvester-path', type=Path, required=True)
p.add_argument('--fixtures-dir', type=Path, required=True)
a = p.parse_args()
sys.path.insert(0, str(a.harvester_path.resolve()))
from repo_harvester_server.helper.MetadataHelper import MetadataHelper
from repo_harvester_server.helper.RepositoryHarmonizer import RepositoryHarmonizer

# A consumer change must never turn this regression check into an external call.
for target in ('socket.socket.connect', 'socket.socket.connect_ex', 'socket.getaddrinfo'):
    patch(target, side_effect=AssertionError('Network is disabled in this offline compatibility check')).start()

def load(name):
    return json.loads((a.fixtures_dir / name).read_text(encoding='utf-8'))

graph, catalog, links = (load(x) for x in ('repository.jsonld', 'api-catalog.json', 'discovery-links.json'))
base = next(x['url'] for x in graph['@graph'] if x.get('@type') == 'DataCatalog')
base = base.rstrip('/') + '/'

class Response:
    status_code = 200
    def __init__(self, obj): self.obj = obj
    def json(self): return self.obj

class OfflineSession:
    def get(self, url, **kwargs):
        if url == base + 'api-catalog': return Response(catalog)
        if url == base + '.well-known/repository.jsonld': return Response(graph)
        raise AssertionError(f'Unexpected network request: {url}')

link_html = ''.join('<link ' + ' '.join(f'{k}="{html.escape(str(v), quote=True)}"' for k, v in item.items()) + '>' for item in links)
page = '<html><head>' + link_html + '<script type="application/ld+json">' + json.dumps(graph).replace('</', '<\\/') + '</script></head><body></body></html>'
m = MetadataHelper(base, page, {}, session=OfflineSession())
embedded = m.get_embedded_jsonld_metadata('simple')
linked = m.get_linked_jsonld_metadata(base + '.well-known/repository.jsonld', 'simple')
assert embedded == linked, 'Embedded and linked JSON-LD extraction differ'
assert embedded.get('title') == 'UIST Digital Repository'
assert 'University-funded' in embedded.get('description', '') and '2025' in embedded.get('description', '')
assert len(set(embedded.get('subject', []))) == 8
assert 'https://www.re3data.org/repository/r3d100014963' in embedded.get('identifier', [])
assert any(x.get('country') == 'MK' and 'University of Information Science' in str(x.get('name')) for x in embedded.get('publisher', [])), 'Publisher country or name missing'
assert any(x.get('email') == 'pavel.taskov@uist.edu.mk' for x in embedded.get('contact', []))
policies = embedded.get('policies', [])
assert len(policies) == 5 and len({x['policy_uri'] for x in policies}) == 5
assert {x['title'] for x in policies} == {'Terms of deposit', 'Preservation policy', 'Curation policy', 'Access and file reuse', 'Privacy policy'}
services = {x['endpoint_uri']: x for x in embedded.get('services', [])}
rest, osd = base + 'server/api', base + 'server/opensearch/service'
assert services[rest]['type'] == 'REST' and services[rest]['output_format'] == 'application/hal+json'
assert services[osd]['type'] == 'OpenSearch' and services[osd]['output_format'] == 'application/opensearchdescription+xml'
search = m.get_opensearch_metadata()['services']
fairicat = m.get_fairicat_metadata()['services']
assert any(x['endpoint_uri'] == osd for x in search)
assert any(x['endpoint_uri'] == osd and x.get('type') == 'OpenSearch' for x in fairicat)
assert any(x['endpoint_uri'] == base + 'api-catalog' for x in fairicat)
assert any(x.get('rel') == 'service-meta' and x.get('link') == osd + '?source=fairicat' for x in m.signposting_helper.links)
feed_discovery = {x['endpoint_uri'] for x in m.get_feed_metadata()['services']}
feed_graph = {x['endpoint_uri'] for x in embedded['services'] if x.get('type') in ('ATOM', 'RSS')}
feed_catalog = {x['endpoint_uri'] for x in fairicat if x.get('type') in ('ATOM', 'RSS')}
assert len(feed_graph) == 2 and feed_graph == feed_discovery == feed_catalog, 'Feed endpoint URLs differ across discovery methods'
raw = m.export(embedded)
gid = 'eden://harvester/embedded_jsonld/' + base
raw['@id'] = gid
raw['foaf:primaryTopic']['@id'] = base
class FakeFuseki:
    def get_repo_graphs(self, uri): return {gid: raw}
    def save(self, uri, body): return 1
h = RepositoryHarmonizer(base)
h.fuseki = FakeFuseki()
h.enrich_services_with_validation = lambda data: None
out = h.harmonize()['foaf:primaryTopic']
assert out['dct:title'] == 'UIST Digital Repository'
assert len(set(out['dcat:keyword'])) == 8
assert 'https://www.re3data.org/repository/r3d100014963' in out['dct:identifier']
assert any(x.get('vcard:country') == 'MK' for x in out['dct:publisher']), 'Harmonized publisher country missing'
assert any(x.get('vcard:hasEmail') == 'pavel.taskov@uist.edu.mk' for x in out['dcat:contactPoint'])
assert len({x['@id'] for x in out['dct:conformsTo']}) == 5
out_services = {x['dcat:endpointURL']: x for x in out['dcat:service']}
assert out_services[rest]['dct:type'] == 'REST'
assert out_services[osd]['dct:type'] == 'OpenSearch'
print('PASS: embedded/linked extraction, publisher MK, metadata, policy and service round trip, feed URI deduplication')
print('Consumer limitation: service formats are absent after harmonizer re-extraction; no network validation or DANS update was performed.')
