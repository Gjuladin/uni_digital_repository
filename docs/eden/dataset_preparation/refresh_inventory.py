"""Anonymous GET census, all returned pagination, OAI reconciliation; preserve review state."""
from pathlib import Path
import collections, concurrent.futures, datetime, hashlib, json, sys, urllib.request, urllib.parse, xml.etree.ElementTree as ET, zoneinfo
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'inventory'; SNAP=ROOT/'research/public-snapshots'
OUT.mkdir(exist_ok=True)
SAVE_RAW = '--save-raw' in sys.argv
if SAVE_RAW: SNAP.mkdir(parents=True,exist_ok=True)
def save_raw(name, data):
    if SAVE_RAW: (SNAP/name).write_bytes(data if isinstance(data,bytes) else data.encode('utf-8'))
# Client task date; timestamps retain the actual request observation time.
date_args = [arg for arg in sys.argv[1:] if not arg.startswith('--')]
TASK_DATE = date_args[0] if date_args else datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Skopje')).date().isoformat()
datetime.date.fromisoformat(TASK_DATE)
def stamp(): return datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Skopje')).isoformat()
logs=[]
def fetch(url, local_log=None):
    if urllib.parse.urlparse(url).netloc!='repository.uist.edu.mk': raise ValueError('Unexpected origin '+url)
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'UIST-read-only-dataset-preparation/2.0'}),timeout=45) as r:
        b=r.read(); rec={'url':url,'final_url':r.url,'status':r.status,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'observed_at':stamp(),'environment':'Production; anonymous GET; read-only'}
        (local_log if local_log is not None else logs).append(rec)
        return b

def get(url, local_log=None): return json.loads(fetch(url,local_log))
def pages(url,key,local_log=None):
    seen=set(); results=[]
    while url:
        if url in seen: raise ValueError('Pagination loop '+url)
        seen.add(url); doc=get(url,local_log)
        results.extend(doc.get('_embedded',{}).get(key,[]))
        url=doc.get('_links',{}).get('next',{}).get('href')
    return results
previous=json.loads((OUT/'publications.json').read_text()); old={i['uuid']:i for i in previous['items']}
api=get('https://repository.uist.edu.mk/server/api'); discover=get(api['_links']['discover']['href']); search=get(discover['_links']['search']['href'])
url=search['_links']['objects']['href']+'?size=100'; seen=set(); raw={}; kinds=collections.Counter(); count=0
while url:
    if url in seen: raise ValueError('Discovery pagination loop')
    seen.add(url); envelope=get(url); result=envelope['_embedded']['searchResult']; count+=1
    save_raw(f'discovery-page-{count}.json',json.dumps(envelope,ensure_ascii=False,indent=2)+'\n')
    for hit in result['_embedded']['objects']:
        item=hit['_embedded']['indexableObject']; kinds[item['type']]+=1
        if item['type']=='item': raw[item['uuid']]=item
    url=result.get('_links',{}).get('next',{}).get('href') or envelope.get('_links',{}).get('next',{}).get('href')

# Discover OAI endpoint from the actual public API catalog; use Identify-returned baseURL.
catalog=get('https://repository.uist.edu.mk/.well-known/api-catalog')
save_raw('api-catalog.json',json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
oai_anchor=next(x['anchor'] for x in catalog['linkset'] if '/oai/' in x['anchor'])
ns={'o':'http://www.openarchives.org/OAI/2.0/','dc':'http://purl.org/dc/elements/1.1/'}
identify=ET.fromstring(fetch(oai_anchor+'?verb=Identify')); base=identify.findtext('.//o:baseURL',namespaces=ns)
save_raw('oai-Identify.xml',ET.tostring(identify))
oai=[]; tokens=set(); oai_pages=0; url=base+'?verb=ListRecords&metadataPrefix=oai_dc'
while url:
    content=fetch(url); tree=ET.fromstring(content); oai_pages+=1
    save_raw(f'oai-ListRecords-{oai_pages}.xml',content)
    errors=tree.findall('o:error',ns)
    if errors: raise ValueError('OAI error '+str([(e.attrib,e.text) for e in errors]))
    for record in tree.findall('.//o:record',ns):
        h=record.find('o:header',ns); identifier=h.findtext('o:identifier',namespaces=ns)
        oai.append({'identifier':identifier,'handle':identifier.split('oai:repository.uist.edu.mk:',1)[-1],'deleted':h.get('status')=='deleted','title':record.findtext('.//dc:title',namespaces=ns),'setSpecs':[x.text for x in h.findall('o:setSpec',ns)]})
    token=tree.findtext('.//o:resumptionToken',namespaces=ns)
    if token:
        if token in tokens: raise ValueError('Repeated OAI token')
        tokens.add(token); url=base+'?'+urllib.parse.urlencode({'verb':'ListRecords','resumptionToken':token})
    else: url=None
save_raw('oai-records.json',json.dumps(oai,ensure_ascii=False,indent=2)+'\n')

def inspect(uid):
    ll=[]; item=raw[uid]; errors=[]; bundles=[]; files=[]; collection=None
    try:
        item=get(item['_links']['self']['href'],ll)
        col_url=item.get('_links',{}).get('owningCollection',{}).get('href')
        if col_url: collection=get(col_url,ll)
        bundles=pages(item['_links']['bundles']['href'],'bundles',ll)
        for bundle in bundles:
            streams=pages(bundle['_links']['bitstreams']['href'],'bitstreams',ll)
            for stream in streams:
                files.append({'bundle':bundle['name'],'bitstream':stream,'content_url':stream.get('_links',{}).get('content',{}).get('href')})
    except Exception as exc: errors.append(str(exc))
    snapshot={'uuid':uid,'item':item,'collection':collection,'bundles':bundles,'files':files,'logs':ll,'errors':errors,'observation_date':TASK_DATE,'environment':'Production; anonymous; read-only','limitation':'File listing and metadata only; bytes not yet inspected. Missing public files do not prove absence of underlying data.'}
    save_raw(f'{uid}.json',json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n')
    record=dict(old.get(uid,{})); md=item.get('metadata',{}); values=lambda key:[x['value'] for x in md.get(key,[])]
    record.update(uuid=uid,title=(values('dc.title') or [item['name']])[0],handle=item.get('handle'),public_url='https://repository.uist.edu.mk/items/'+uid,metadata_type=values('dc.type'),creators_as_stored=values('dc.contributor.author'),issued_dates=values('dc.date.issued'),source_dois=values('dc.identifier.doi'),rights_uris_as_stored=values('dc.rights.uri'),related_urls_as_stored=values('dc.relation.uri'),owning_collection_api=item.get('_links',{}).get('owningCollection',{}).get('href'),collection_name=collection.get('name') if collection else None,metadata_status='Verified public',metadata_observed_at=stamp(),environment='Production; anonymous; read-only',last_file_inventory_date=TASK_DATE,file_inventory_source=f'research/public-snapshots/{uid}.json' if SAVE_RAW else 'inventory/publications.json',current_public_files=[{'bundle':x['bundle'],'uuid':x['bitstream']['uuid'],'name':x['bitstream']['name'],'bytes':x['bitstream']['sizeBytes'],'checksum':x['bitstream'].get('checkSum',x['bitstream'].get('checksum')),'content_url':x['content_url']} for x in files],file_inventory_errors=errors)
    record.setdefault('stage','not_reviewed'); record.setdefault('outcome_note','Metadata and file listing refreshed; substantive inspection pending.'); record.setdefault('package_path',None); record.setdefault('investigation_evidence',[])
    prior_md=old.get(uid,{}); changed=any(record.get(k)!=prior_md.get(k) for k in ['title','creators_as_stored','source_dois'])
    record['metadata_changed_since_previous_census']=changed
    if record['title'].startswith('EDEN local QA fixture -'): record.update(stage='excluded_fixture',outcome_note='Synthetic fixture excluded from research-data evidence.')
    return record,ll
items=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for record,ll in pool.map(inspect,raw):
        items.append(record); logs.extend(ll)
        if len(items)%20==0: print('File inventories refreshed',len(items),flush=True)
removed=[x for uid,x in old.items() if uid not in raw]
if removed:
    path=OUT/'not_in_current_public_census.json'; hist=json.loads(path.read_text()) if path.exists() else []
    hist.extend({'not_seen_at':stamp(),'record':x,'limitation':'Absent from anonymous discovery; reason unknown'} for x in removed); path.write_text(json.dumps(hist,ensure_ascii=False,indent=2)+'\n')
rest_handles={x['handle'] for x in items}; oai_handles={x['handle'] for x in oai if not x['deleted']}
coverage={'discovery_pages':count,'object_counts':dict(kinds),'unique_items':len(items),'scope':'All returned public discovery pages; all current item bundle and bitstream pagination followed. No private submissions.','oai_pages':oai_pages,'oai_records':len(oai),'oai_reconciliation':{'matches':rest_handles==oai_handles,'rest_only':sorted(rest_handles-oai_handles),'oai_only':sorted(oai_handles-rest_handles)},'public_file_inventory_errors':sum(bool(x['file_inventory_errors']) for x in items)}
document=dict(previous); document.update(observation_date=TASK_DATE,observed_at=stamp(),coverage=coverage,file_coverage_limitation='Current public bundle/bitstream metadata refreshed; content suitability tracked separately per review.',stage_counts=dict(collections.Counter(x['stage'] for x in items)),items=sorted(items,key=lambda x:(x['title'].casefold(),x['uuid'])))
(OUT/'publications.json').write_text(json.dumps(document,ensure_ascii=False,indent=2)+'\n')
(OUT/'public-request-log-refresh-2026-10-04.json').write_text(json.dumps(logs,indent=2)+'\n')
(OUT/'coverage-refresh-2026-10-04.json').write_text(json.dumps(coverage,indent=2)+'\n')
print(json.dumps(coverage),flush=True)
