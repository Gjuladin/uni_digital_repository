"""Coordinator-only: integrate independent reports; retain old work; regenerate queue/report."""
from pathlib import Path
import collections, datetime, json, html, re, zoneinfo
ROOT=Path(__file__).resolve().parent
p=json.loads((ROOT/'inventory/publications.json').read_text())
known={x['uuid'] for x in p['items']}; unknown=[]; reviews={}
# The master inventory retains complete reviews; optional new batch files override them.
for item in p['items']:
 r=item.get('last_integrated_review')
 if r:
  if r['uuid']!=item['uuid']: raise ValueError('Review UUID mismatch '+item['uuid'])
  reviews[item['uuid']]=(r,ROOT/'inventory/publications.json')
for f in (ROOT/'research/reviews').glob('*.json'):
 r=json.loads(f.read_text()); uid=r['uuid']
 if uid not in known: unknown.append(uid); continue
 reviews[uid]=(r,f)
draft_file=ROOT/'requests/DRAFTS.md'
draft_ids=set(re.findall(r'<a id="([0-9a-f-]{36})"></a>',draft_file.read_text())) if draft_file.exists() else set()
for item in p['items']:
 uid=item['uuid']; entry=reviews.get(uid)
 if not entry:
  item.setdefault('substantive_review_complete',False)
  item.setdefault('incomplete_reason','Current publication content investigation still pending.')
  continue
 r,f=entry
 if item.get('last_integrated_review')!=r:
  prior={k:item.get(k) for k in ['stage','outcome_note','package_path','investigation_evidence','last_content_review','substantive_review_complete']}
  if prior.get('stage') not in {'not_reviewed','metadata_screened'} and prior.get('outcome_note')!=r.get('outcome_note'):
   history=item.setdefault('previous_investigations',[])
   if prior not in history: history.append(prior)
  for k in ['stage','outcome_note','package_path','substantive_review_complete','incomplete_reason']:
   if k in r: item[k]=r[k]
  evidence=str(f.relative_to(ROOT))
  if evidence not in item['investigation_evidence']: item['investigation_evidence'].append(evidence)
  item['last_content_review']=r.get('observed_at',r.get('observation_date','2026-10-04'))
  item['last_integrated_review']=r
 item['review_report_path']=str(f.relative_to(ROOT))
 item['request_path']=f'requests/{uid}.md' if (ROOT/f'requests/{uid}.md').exists() else (f'requests/DRAFTS.md#{uid}' if uid in draft_ids else None)
 if item.get('substantive_review_complete'): item['incomplete_reason']=None
 else: item['incomplete_reason']=r.get('incomplete_reason') or r.get('limitations') or 'Publication source unavailable or substantive content inspection remains incomplete; see review report.'
# Never infer content completion from a stage or a metadata listing.
stage_counts=dict(collections.Counter(x['stage'] for x in p['items']))
complete=[x for x in p['items'] if x.get('substantive_review_complete') is True]
incomplete=[x for x in p['items'] if x.get('substantive_review_complete') is not True]
packages=[x for x in p['items'] if x.get('package_path')]
requests=[x for x in p['items'] if x.get('request_path')]
p.update(stage_counts=stage_counts,review_coverage={'publications':len(p['items']),'current_batch_reports':len(reviews),'substantive_reviews_complete':len(complete),'substantive_reviews_remaining':len(incomplete),'local_prepared_packages':len(packages),'unsent_request_drafts':len(requests),'public_deposits_by_this_work':0,'definition':'Complete = actual publication content examined for association, methods/data, rights/access and UIST relationship. A metadata/file listing or unavailable-source outcome does not count as substantive content completion.'},queue_updated_at=datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Skopje')).isoformat())
(ROOT/'inventory/publications.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
esc=lambda s:str(s).replace('|','\\|').replace('\n',' ')
lines=['# Complete public publication queue','',f"Census: **{len(p['items'])} public publications**, REST/OAI agreement, 4 October 2026. Content reviews complete: **{len(complete)}**; still incomplete: **{len(incomplete)}**. Current independent review reports: **{len(reviews)}**. Local packages: **{len(packages)}**. Public dataset deposits by this work: **0**.",'','Every row retains an outcome. A held or unavailable-source outcome is not a completed substantive review. Complete reviews are retained under each UUID in publications.json. All packages remain local and require confirmation by the responsible authorised depositor. Previous investigations are preserved in the JSON history.','', '| Publication / Handle | Type | Outcome | Content review | Package / Request |','|---|---|---|---|---|']
for x in p['items']:
 links=[]
 if x.get('package_path'): links.append(f"[package](../{x['package_path']})")
 if x.get('request_path'): links.append(f"[unsent request](../{x['request_path']})")
 if x.get('review_report_path'): links.append(f"[evidence](../{x['review_report_path']})")
 lines.append(f"| [{esc(x['title'])}]({x['public_url']}) · {x['handle']} | {esc('; '.join(x['metadata_type']))} | `{x['stage']}` — {esc(x['outcome_note'])} | {'Complete' if x.get('substantive_review_complete') else '**Incomplete**'} | {' · '.join(links) or '—'} |")
(ROOT/'inventory/publication_index.md').write_text('\n'.join(lines)+'\n')
lines=['# Incomplete substantive investigations','',f'Exact remaining count: **{len(incomplete)} / {len(p["items"])}**. This list includes unavailable intended sources and investigations still awaiting source inspection. It is not a claim that these publications have no data.','', '| Handle / Publication | Outcome | What remains |','|---|---|---|']
for x in incomplete: lines.append(f"| [{x['handle']}: {esc(x['title'])}]({x['public_url']}) | `{x['stage']}` | {esc(x.get('incomplete_reason'))} |")
(ROOT/'inventory/incomplete_publications.md').write_text('\n'.join(lines)+'\n')
lines=['# Unsent researcher and rights requests','',f'**{len(requests)} drafts. None sent.** Intended recipient identity/contact and authority require human confirmation. A draft is not permission or a successful data transfer.','', '| Publication | Draft | Outcome |','|---|---|---|']
for x in requests: lines.append(f"| [{x['handle']}: {esc(x['title'])}]({x['public_url']}) | [draft](../{x['request_path']}) | `{x['stage']}` |")
(ROOT/'requests').mkdir(exist_ok=True)
(ROOT/'requests/README.md').write_text('\n'.join(lines)+'\n')
summary={'observation_date':'2026-10-04','evidence_label':'Verified local','coverage':p['coverage'],'review_coverage':p['review_coverage'],'stage_counts':stage_counts,'unknown_report_uuids':unknown,'prepared_packages':[{'handle':x['handle'],'uuid':x['uuid'],'path':x['package_path'],'stage':x['stage']} for x in packages],'incomplete_uuids':[x['uuid'] for x in incomplete]}
(ROOT/'inventory/preparation_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'review_coverage':p['review_coverage'],'stage_counts':stage_counts,'unknown_report_uuids':unknown}))
