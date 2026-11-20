#!/usr/bin/env python3
"""Download verified public university resources for personal use. Standard library only."""
import json,hashlib,urllib.request,zipfile,io,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent
DEST=BASE/'downloaded-resources'
DEST.mkdir(exist_ok=True)
failures=0
for row in json.loads((BASE/'resources.json').read_text()):
    if row.get('status')!='downloaded' or not row.get('sha256') or not row.get('download_url'): continue
    ext='.docx' if '.docx' in row['download_url'] else '.pdf'
    path=DEST/(row['id']+ext)
    try:
        if path.exists():
            if hashlib.sha256(path.read_bytes()).hexdigest()==row['sha256']:
                print('Already verified:',path.name);continue
            raise ValueError('Existing local file differs; rename it before downloading again')
        req=urllib.request.Request(row['download_url'],headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=45) as response: data=response.read(30_000_000)
        if hashlib.sha256(data).hexdigest()!=row['sha256']:
            raise ValueError('Official file has changed or the server returned another page; inspect the official source manually')
        if ext=='.pdf' and not data.startswith(b'%PDF-'):raise ValueError('Not a PDF')
        if ext=='.docx':
            with zipfile.ZipFile(io.BytesIO(data)) as doc:
                if 'word/document.xml' not in doc.namelist() or doc.testzip() is not None:raise ValueError('Invalid DOCX')
        path.write_bytes(data);print('Downloaded:',path.name)
    except Exception as exc:
        failures+=1;print('Needs review:',row['title'],str(exc));print('Official source:',row['source'])
print('Done. Review needed:',failures)
sys.exit(1 if failures else 0)
