#!/usr/bin/env python3
"""Read-only local archive checker; no GitHub access and no repo writes."""
from pathlib import Path
import json,hashlib,sys,re
root=Path(__file__).resolve().parent
m=json.loads((root/'MANIFEST.json').read_text(encoding='utf8'))
errors=[]
entries=m['documents']; paths=[]; nlines=0
for d in entries:
    rel=d['path']; p=root/rel; paths.append(rel)
    if not p.is_file(): errors.append(f'Missing: {rel}');continue
    n=len(p.read_text(encoding='utf8').splitlines()); nlines+=n
    if n!=d['actual_lines']:errors.append(f'Count mismatch: {rel}: {n} != {d["actual_lines"]}')
    if n<100: errors.append(f'Unexpectedly short spec: {rel}, {n} lines')
    text=p.read_text(encoding='utf8')
    for marker in ('Purpose','Acceptance','Dependencies','Open questions'):
        if marker.lower() not in text.lower():errors.append(f'Missing {marker}: {rel}')
all_num={str(d['num']).zfill(2):d['path'] for d in entries}
for d in entries:
    for dep in d['deps']:
        if dep in ('SOURCE','OWNER'):continue
        tag=dep.zfill(2)
        if tag not in all_num:errors.append(f'Missing dep {dep}: {d["path"]}')
        if tag==str(d['num']).zfill(2):errors.append(f'Self dependency {dep}: {d["path"]}')
if len(entries)!=m['numbered_docs']:errors.append('Document count mismatch')
if len(set(paths))!=len(paths): errors.append('Duplicate doc paths')
if len(entries)<=50 or nlines<=10000:errors.append('Mandatory scale missing')
if nlines!=m['actual_numbered_lines']:errors.append(f'Total line mismatch: {nlines} vs {m["actual_numbered_lines"]}')
checksum=root/'SHA256SUMS.txt'
for row in checksum.read_text(encoding='utf8').splitlines():
    if not row.strip():continue
    digest,rel=row.split('  ',1)
    p=root/rel
    if not p.is_file(): errors.append('No checksum file: '+rel);continue
    if hashlib.sha256(p.read_bytes()).hexdigest()!=digest:errors.append('Hash failure: '+rel)
print(f'Numbered docs: {len(entries)} | lines: {nlines} | audit findings: {m["audit_finding_count"]} | checklist items: {m["website_checklist_count"]}')
print('PASS — package integrity verified' if not errors else 'FAIL — '+str(len(errors))+' problems: '+'; '.join(errors[:25]))
sys.exit(bool(errors))
