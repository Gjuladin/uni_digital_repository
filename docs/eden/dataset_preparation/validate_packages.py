"""Local structural/fixity validation; source-value review remains separate evidence."""
from pathlib import Path
import csv, hashlib, json, re, zipfile
ROOT=Path(__file__).resolve().parent
required=['dataset/README.md','dataset/DATA_DICTIONARY.md','dataset/LICENSE.md','dataset/SHA256SUMS.txt','proposed_metadata.json','release_checklist.md','package_manifest.json','comparison.md','preview.html','review_package.zip']
reports=[]
for path in sorted((ROOT/'packages').glob('*/*')):
 if not path.is_dir(): continue
 problems=[]; warnings=[]; rows=[]; hashes=[]
 for name in required:
  if not (path/name).is_file(): problems.append('Missing '+name)
 manifest={}
 if (path/'package_manifest.json').exists():
  manifest=json.loads((path/'package_manifest.json').read_text())
  if manifest.get('stage')!='prepared_needs_deposit': problems.append('Unexpected release stage '+str(manifest.get('stage')))
  for field in ['published_dataset_url','depositor']:
   if manifest.get(field) is not None: warnings.append('Manually verify non-null '+field)
 for f in sorted((path/'dataset').glob('*.csv')):
  with f.open(newline='',encoding='utf-8-sig') as stream:
   reader=csv.DictReader(stream); data=list(reader); fields=reader.fieldnames
  if not data: problems.append('Empty data '+f.name)
  if not fields or len(set(fields))!=len(fields): problems.append('Missing/duplicate CSV header '+f.name)
  if any(None in row or None in row.values() for row in data): problems.append('Malformed rows '+f.name)
  rows.append({'file':f.name,'rows':len(data),'columns':len(fields or []),'exact_duplicate_rows':len(data)-len({tuple(row.get(k) for k in fields) for row in data})})
 if not rows and not any(f.is_file() and f.name not in {'README.md','LICENSE.md','DATA_DICTIONARY.md','SHA256SUMS.txt'} for f in (path/'dataset').glob('*')): problems.append('No actual data files')
 sha=path/'dataset/SHA256SUMS.txt'; listed=set()
 if sha.exists():
  for line in sha.read_text().splitlines():
   if not line.strip(): continue
   match=re.match(r'^([0-9a-fA-F]{64})\s+\*?(.+)$',line)
   if not match: problems.append('Malformed checksum line'); continue
   expected,name=match.groups(); candidate=path/'dataset'/name
   if not candidate.exists(): candidate=path/name
   if not candidate.is_file(): problems.append('Checksum references missing '+name); continue
   actual=hashlib.sha256(candidate.read_bytes()).hexdigest(); ok=actual==expected.lower()
   hashes.append({'file':str(candidate.relative_to(path)),'sha256':actual,'matches':ok}); listed.add(candidate.resolve())
   if not ok: problems.append('Checksum mismatch '+name)
  unhashed=[f.name for f in (path/'dataset').iterdir() if f.is_file() and f.name!='SHA256SUMS.txt' and f.resolve() not in listed]
  if unhashed: problems.append('Files absent from checksum list '+str(unhashed))
 if isinstance(manifest.get('files'),list):
  for entry in manifest['files']:
   if not isinstance(entry,dict): continue
   name=entry.get('name') or entry.get('path'); expected=entry.get('sha256')
   if name and expected:
    f=path/name
    if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=expected: problems.append('Manifest mismatch '+name)
 z=path/'review_package.zip'; zip_files=[]
 if z.exists():
  with zipfile.ZipFile(z) as archive:
   if archive.testzip(): problems.append('Zip CRC failure')
   for name in archive.namelist():
    if name.endswith('/'): continue
    if name.startswith('/') or '..' in Path(name).parts: problems.append('Unsafe zip path '+name); continue
    f=path/name
    if not f.exists(): f=path/'dataset'/name
    if not f.exists() and Path(name).parts[0] not in {'dataset'}: f=path/'dataset'/Path(name).name
    ok=f.is_file() and archive.read(name)==f.read_bytes(); zip_files.append({'file':name,'matches':ok})
    if not ok: problems.append('Zip content mismatch '+name)
   expected_names={f.name for f in (path/'dataset').iterdir() if f.is_file()}
   zipped_names={Path(x['file']).name for x in zip_files}
   if expected_names!=zipped_names: problems.append('Zip dataset membership mismatch')
 if not list((path/'evidence').glob('*')): problems.append('No source/validation evidence')
 reports.append({'package_path':str(path.relative_to(ROOT)),'evidence_label':'Verified local','observation_date':'2026-10-06','stage':manifest.get('stage'),'csv':rows,'checksum_checks':hashes,'zip_checks':zip_files,'errors':problems,'warnings':warnings,'passed':not problems,'limitation':'Structural/fixity checks only. Every extracted value requires source association and textual/visual verification in each package evidence; institutional/rights/privacy gates remain pending.'})
result={'packages':len(reports),'passed':sum(x['passed'] for x in reports),'reports':reports}
(ROOT/'research/package-structure-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'packages':result['packages'],'passed':result['passed'],'errors':[(x['package_path'],x['errors']) for x in reports if x['errors']]}))
