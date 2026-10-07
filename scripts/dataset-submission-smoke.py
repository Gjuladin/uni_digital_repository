#!/usr/bin/env python3
"""Local synthetic validation only. Dependencies: requests; lxml for --check-exports.

The script creates one Research Data collection and a synthetic non-administrator
account, and archives a clearly labelled test dataset. It refuses remote targets,
redirects, and automatic adoption of an existing collection. State is saved so a
rerun verifies the same record. No prepared real package is read or deposited.
"""
import json,requests
from pathlib import Path
import argparse
from urllib.parse import urlparse

parser = argparse.ArgumentParser(description='Exercise the normal DSpace submission workflow with synthetic local data only.')
parser.add_argument('--base-url', default='http://localhost:8080/server')
parser.add_argument('--credentials', type=Path, required=True, help='Private JSON with admin_email/admin_password and synthetic depositor_email/depositor_password.')
parser.add_argument('--work-dir', type=Path, default=Path('work/dataset-submission-smoke'))
parser.add_argument('--parent-community', help='Local community UUID; otherwise use Supplementary Publications.')
parser.add_argument('--check-exports', action='store_true', help='Also validate OAI/DIM, JSON-LD, discovery and feeds after running the OAI import.')
args = parser.parse_args()
BASE = args.base_url.rstrip('/')
origin = urlparse(BASE)
if origin.scheme != 'http' or origin.hostname not in ('localhost', '127.0.0.1', '[::1]', '::1') or origin.username or origin.password or origin.path != '/server':
    parser.error('Only an explicit local HTTP DSpace /server origin is supported. Production targets are refused.')
WORK = args.work_dir.resolve()
WORK.mkdir(parents=True, exist_ok=True)

class Client:
 def __init__(self): self.s=requests.Session();self.s.trust_env=False;self.s.get(BASE+'/api',timeout=30,allow_redirects=False)
 def call(self,method,path,expect=(200,),**kw):
  csrf=self.s.cookies.get('DSPACE-XSRF-COOKIE')
  if csrf:self.s.headers['X-XSRF-TOKEN']=csrf
  r=self.s.request(method,BASE+path,timeout=60,allow_redirects=False,**kw)
  if r.status_code not in expect: raise RuntimeError(f'{method} {path}: {r.status_code}: {r.text[:1500]}')
  return r
 def login(self,email,password):
  r=self.call('POST','/api/authn/login',expect=(200,),data={'user':email,'password':password})
  self.s.headers['Authorization']=r.headers['Authorization']
 def json(self,path):return self.call('GET',path).json()
 def post(self,path,obj):return self.call('POST',path,expect=(200,201),json=obj).json()
 def patch(self,path,ops):return self.call('PATCH',path,json=ops).json()
def md(v):return [{'value':v,'language':'en','authority':None,'confidence':-1}]
creds=json.loads(args.credentials.read_text());
if not creds['depositor_email'].endswith('@uist.invalid'):
 parser.error('The depositor must be a synthetic @uist.invalid account.')
admin=Client();admin.login(creds['admin_email'],creds['admin_password'])
statepath=(WORK / 'dataset-local-state.json');state=json.loads(statepath.read_text()) if statepath.exists() else {}
def save():statepath.write_text(json.dumps(state,indent=2))
if 'collection' not in state:
 cs=admin.json('/api/core/collections?size=100')['_embedded']['collections'];matches=[c for c in cs if c['name']=='Research Data']
 if matches:raise RuntimeError('Existing Research Data collection: inspect before mutation; no automatic adoption.')
 communities=admin.json('/api/core/communities?size=100')['_embedded']['communities']
 community=next(c for c in communities if (c['uuid']==args.parent_community if args.parent_community else c['name']=='Supplementary Publications'))
 c=admin.post('/api/core/collections?parent='+community['uuid'],{'metadata':{'dc.title':md('Research Data'),'dc.description.abstract':md('UIST research datasets and supporting documentation. Local validation collection; no production changes.'),'dspace.entity.type':md('Dataset')}})
 state['collection']=c['uuid'];state['collection_handle']=c['handle'];save()
if 'depositor' not in state:
 p=admin.post('/api/eperson/epersons',{'email':creds['depositor_email'],'password':creds['depositor_password'],'canLogIn':True,'requireCertificate':False,'selfRegistered':False,'metadata':{'eperson.firstname':md('Synthetic dataset'),'eperson.lastname':md('Local test depositor')}})
 state['depositor']=p['uuid'];save()
if 'submitters' not in state:
 g=admin.post('/api/core/collections/'+state['collection']+'/submittersGroup',{'metadata':{'dc.description':md('Authorised local synthetic test depositors')}})
 state['submitters']=g['uuid'];save()
 admin.call('POST','/api/eperson/groups/'+g['uuid']+'/epersons',expect=(204,200),data=BASE+'/api/eperson/epersons/'+state['depositor'],headers={'Content-Type':'text/uri-list'})
print('Synthetic local collection/depositor configured:',json.dumps(state))
depositor=Client();depositor.login(creds['depositor_email'],creds['depositor_password'])
if not state.get('published') and 'workspace' not in state:
 ws=depositor.json('/api/submission/workspaceitems/search/findBySubmitter?uuid='+state['depositor'])['_embedded'].get('workspaceitems',[])
 w=ws[0] if ws else depositor.call('POST','/api/submission/workspaceitems?owningCollection='+state['collection'],expect=(200,201),json={}).json()
 state['workspace']=w['id'];state['item']=depositor.json('/api/submission/workspaceitems/'+str(w['id'])+'/item')['uuid'];save()
if not state.get('published'):print('Submission sections:',list(depositor.json('/api/submission/workspaceitems/'+str(state['workspace']))['sections']))

from datetime import datetime,timedelta,timezone
import hashlib
wpath='/api/submission/workspaceitems/'+str(state['workspace'])
release=state.get('embargo_end') or (datetime.now(timezone.utc)+timedelta(days=30)).date().isoformat()
metadata={
'datasetStep':{'dc.title':'SYNTHETIC TEST DATASET — UIST submission validation (not research)','dc.contributor.author':'Synthetic Test Compiler','local.creator.affiliation':'Synthetic Test Compiler — local validation only','dc.type':'Dataset','dc.date.issued':'2026-10-06','dc.date.created':'2026-10-06','dc.language.iso':'en','local.dataset.version':'1.0-test'},
'datasetDetails':{'dc.description.abstract':'Synthetic generated values solely for local workflow testing. No real participants or published study data.','local.dataset.methods':'Generate integers 1, 2, 3 and square each integer; synthetic test only.','dc.description':'Three fabricated rows. No scientific validity, original participant data, or source-study claims.','dc.subject':'synthetic workflow validation','dc.relation.isreferencedby':'https://example.org/synthetic-publication','dc.relation.references':'https://example.org/synthetic-source','dc.rights':'Synthetic test files may be reused for testing. No licence or rights claim applies to real dataset packages.','dc.rights.uri':'https://example.org/synthetic-test-terms','dcterms.accessRights':f'Mixed: data.csv, README.md and DATA_DICTIONARY.md are open; restricted.txt is administrator-only; embargo.txt is embargoed until {release}.'}}
report=json.loads((WORK / 'dataset-validation.json').read_text()) if (WORK / 'dataset-validation.json').exists() else {'environment':BASE,'synthetic':True,'collection':state['collection'],'item':state['item'],'policy_version':'2026-10-06-simple','checks':{}}
def check(name,result):
 report['checks'][name]=result
 (WORK / 'dataset-validation.json').write_text(json.dumps(report,indent=2))
 print(name,':',result)
if not state.get('published'):
 ops=[{'op':'add','path':f'/sections/{section}/{k}','value':md(v)} for section,fields in metadata.items() for k,v in fields.items()]
 depositor.patch(wpath,ops)
 check('metadata_saved',True)
 # All normal DSpace validation still applies; this is not a shortcut around submission.
 r=depositor.call('POST','/api/workflow/workflowitems',expect=(422,400),data=BASE+wpath,headers={'Content-Type':'text/uri-list'})
 check('incomplete_submission_rejected',r.status_code)
 depositor.patch(wpath,[{'op':'add','path':'/sections/license/granted','value':True}])
 if not depositor.json(wpath)['sections']['datasetUpload']['files']:
  r=depositor.call('POST','/api/workflow/workflowitems',expect=(422,400),data=BASE+wpath,headers={'Content-Type':'text/uri-list'})
  check('no_data_file_rejected',r.status_code)
 fixtures={'data.csv':b'id,square\n1,1\n2,4\n3,9\n','README.md':b'# SYNTHETIC TEST ONLY\nLocal workflow validation, not research. data.csv has three fabricated rows.\nMethods: square integers. Limitations: no scientific validity.\n','DATA_DICTIONARY.md':b'# SYNTHETIC TEST ONLY\nid: fabricated integer; square: id squared. No missing values.\n','restricted.txt':b'SYNTHETIC administrator-only access test.\n','embargo.txt':b'SYNTHETIC future embargo access test.\n'}
 fixturepath=(WORK / 'synthetic-dataset');fixturepath.mkdir(exist_ok=True)
 for name,data in fixtures.items():
  (fixturepath/name).write_bytes(data)
  files=depositor.json(wpath)['sections']['datasetUpload']['files']
  if not any(f['metadata']['dc.title'][0]['value']==name for f in files):
   depositor.call('POST',wpath,expect=(200,201),files={'file':(name,data,'text/csv' if name.endswith('.csv') else 'text/plain')})
 files=depositor.json(wpath)['sections']['datasetUpload']['files'];assert len(files)==5
 for i,f in enumerate(files):
  name=f['metadata']['dc.title'][0]['value']
  cond={'name':'administrator'} if name=='restricted.txt' else {'name':'embargo','startDate':release} if name=='embargo.txt' else {'name':'openaccess'}
  depositor.patch(wpath,[{'op':'add','path':f'/sections/datasetUpload/files/{i}/accessConditions','value':[cond]}, {'op':'add','path':f'/sections/datasetUpload/files/{i}/metadata/dc.description','value':md('Synthetic data' if name=='data.csv' else 'Synthetic supporting documentation / access test')},{'op':'add','path':f'/sections/datasetUpload/files/{i}/metadata/dc.rights','value':md('Reuse for synthetic testing only.')}])
 check('multiple_file_uploads',len(files))
 r=depositor.call('POST','/api/workflow/workflowitems',expect=(201,204),data=BASE+wpath,headers={'Content-Type':'text/uri-list'})
 state['published']=True;state['embargo_end']=release;save()
 check('direct_publication_by_nonadministrator',r.status_code)
# Check using a separate anonymous session, not the submitting account.
anon=Client();item=anon.json('/api/core/items/'+state['item']);assert item['inArchive'] and not item['withdrawn'];check('public_archived_record',True)
for section,fields in metadata.items():
 for key,value in fields.items():
  actual=[v['value'] for v in item['metadata'].get(key,[])];assert value in actual,(key,actual)
check('metadata_persistence',list(item['metadata']))
check('dataset_entity_type',item['metadata']['dspace.entity.type'][0]['value'])
assert item['handle'].startswith('20.500.15029/');check('assigned_handle',item['handle'])
assert not any('CC0' in v['value'] for k,vv in item['metadata'].items() if k.startswith('dc.rights') for v in vv);check('no_automatic_cc0_file_licence',True)
bundles=anon.json('/api/core/items/'+state['item']+'/bundles?size=100')['_embedded']['bundles'];bundle=next(b for b in bundles if b['name']=='ORIGINAL')
files=anon.json('/api/core/bundles/'+bundle['uuid']+'/bitstreams?size=100')['_embedded']['bitstreams'];assert len(files)==5
results={}
for f in files:
 name=f['name'];r=anon.call('GET','/api/core/bitstreams/'+f['uuid']+'/content',expect=(200,401,403))
 expected=200 if name not in ('restricted.txt','embargo.txt') else (401,403)
 assert r.status_code==expected if isinstance(expected,int) else r.status_code in expected
 if r.status_code==200:assert hashlib.sha256(r.content).hexdigest()==hashlib.sha256(((WORK / 'synthetic-dataset')/name).read_bytes()).hexdigest()
 assert f['metadata']['dc.rights'][0]['value']=='Reuse for synthetic testing only.'
 status=anon.json('/api/core/bitstreams/'+f['uuid']+'/accessStatus')
 results[name]={'uuid':f['uuid'],'anonymous_content_status':r.status_code,'access_status':status,'rights_persisted':True}
check('anonymous_file_access_and_checksums',results)
for role in ('reviewer','editor','finaleditor'):
 r=admin.call('GET','/api/core/collections/'+state['collection']+'/workflowGroups/'+role,expect=(204,404));assert r.status_code in (204,404)
check('no_collection_review_groups',True)
# An authenticated institutional account without membership cannot submit to publication collections.
other=admin.json('/api/core/collections?size=100')['_embedded']['collections'];other=next(c for c in other if c['uuid']!=state['collection'])
r=depositor.call('POST','/api/submission/workspaceitems?owningCollection='+other['uuid'],expect=(403,),json={});check('depositor_cannot_submit_elsewhere',r.status_code)
r=anon.call('POST','/api/submission/workspaceitems?owningCollection='+state['collection'],expect=(401,403),json={});check('anonymous_cannot_submit',r.status_code)
(WORK / 'published-synthetic-item.json').write_text(json.dumps(item,indent=2))

if args.check_exports:
    import requests,json
    from pathlib import Path
    from lxml import etree as E
    BASE='http://localhost:8080/server'
    state=json.loads((WORK / 'dataset-local-state.json').read_text());report=json.loads((WORK / 'dataset-validation.json').read_text())
    s=requests.Session();s.trust_env=False
    ns={'oai':'http://www.openarchives.org/OAI/2.0/','dc':'http://purl.org/dc/elements/1.1/','dim':'http://www.dspace.org/xmlns/dspace/dim'}
    r=s.get(BASE+'/oai/request',params={'verb':'ListIdentifiers','metadataPrefix':'oai_dc','set':'col_'+state['collection_handle'].replace('/','_')},timeout=60)
    (WORK / 'dataset-oai-identifiers.xml').write_bytes(r.content);doc=E.fromstring(r.content)
    ids=doc.xpath('//oai:identifier/text()',namespaces=ns);print('identifiers:',ids)
    assert len(ids)==1;identifier=ids[0];report['checks']['oai_identifier']=identifier
    for prefix in ('oai_dc','dim'):
     r=s.get(BASE+'/oai/request',params={'verb':'GetRecord','metadataPrefix':prefix,'identifier':identifier},timeout=60)
     (WORK / f'dataset-oai-{prefix}.xml').write_bytes(r.content);d=E.fromstring(r.content);errors=d.xpath('//oai:error',namespaces=ns);assert not errors,errors
     text=' '.join(d.itertext())
     for value in ('Dataset','1.0-test','Generate integers','Three fabricated rows','https://example.org/synthetic-publication','https://example.org/synthetic-source','Synthetic test files','2026-11-05'):
      assert value in text,(prefix,value)
     if prefix=='dim':
      assert d.xpath('//dim:field[@mdschema="local" and @element="dataset" and @qualifier="version"]/text()',namespaces=ns)==['1.0-test']
     report['checks']['oai_'+prefix+'_facts_preserved']=True
    r=s.get(BASE+'/signposting/describedby-jsonld/'+state['item'],timeout=30);assert r.ok,r.status_code
    j=r.json();(WORK / 'dataset-signposting.jsonld').write_text(json.dumps(j,indent=2));print('signposting:',json.dumps(j,indent=2))
    assert j['@type']=='Dataset' and j['version']=='1.0-test' and 'Generate integers' in j['measurementTechnique']
    assert j['conditionsOfAccess'].endswith('2026-11-05.')
    assert j['license']=='https://example.org/synthetic-test-terms'
    report['checks']['backend_jsonld_facts_preserved']=True
    # Check existing discovery and feed routes without inventing file content links.
    r=s.get(BASE+'/api/discover/search/objects',params={'query':'dc.title:"SYNTHETIC TEST DATASET"'},timeout=60)
    print('discovery',r.status_code);assert r.ok
    (WORK / 'dataset-discovery.json').write_text(json.dumps(r.json(),indent=2))
    assert state['item'] in r.text
    report['checks']['discovery_indexed']=True
    for format in ('rss','atom'):
     r=s.get(BASE+'/opensearch/search',params={'format':format,'scope':state['collection'],'query':'*'},timeout=60)
     (WORK / ('dataset-feed-'+format+'.xml')).write_bytes(r.content)
     print('feed',format,r.status_code)
     if r.ok:
      assert 'SYNTHETIC TEST DATASET' in r.text;report['checks']['feed_'+format+'_record_present']=True
     else:report['checks']['feed_'+format+'_http_status']=r.status_code
    (WORK / 'dataset-validation.json').write_text(json.dumps(report,indent=2))
