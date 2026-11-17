"""Verify copied Java exactly against the recorded Git revisions; no live services."""
from pathlib import Path
import json, subprocess, hashlib, re
site=Path(__file__).resolve().parent.parent
source_root=site.parent/'TSC-MOH'
s=(site/'reference-evidence.js').read_text()
evidence=json.loads(s[s.index('{'):s.rindex('}')+1])
for key,item in evidence.items():
    source=subprocess.check_output(['git','-C',str(source_root/item['repo']),'show',item['rev']+':'+item['path']],text=True).splitlines()
    start=item['line']-1
    assert '\n'.join(source[start:start+len(item['code'].split('\n'))])==item['code'], key
for filename,digest in re.findall(r'="([a-z0-9-]+\.(?:js|css))\?v=([a-f0-9]+)"',(site/'index.html').read_text()):
    assert hashlib.sha256((site/filename).read_bytes()).hexdigest().startswith(digest),filename
print(f'{len(evidence)} exact Git-pinned reference excerpts and all loaded asset hashes verified.')
