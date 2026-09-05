"""Frozen, allowlisted static design review. No project tree or directory listings."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit,unquote
import argparse,json,mimetypes,hashlib
parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--port',type=int,default=8783);parser.add_argument('--manifest',required=True);args=parser.parse_args()
root=Path(args.source).resolve()
html=['sovereign.html','sovereign-start.html','sovereign-product.html','kinetic.html','kinetic-product.html','editorial.html','editorial-product.html','designs.html','design-suites.json','suite-registry.json']
allowed={'.css','.js','.json','.svg','.png','.jpg','.jpeg','.webp','.avif','.woff','.woff2','.ttf','.otf','.mp4','.webm','.txt'}
files={}
for p in [*(root/n for n in html),*(root/'assets').rglob('*')]:
 if p.is_file() and not p.is_symlink() and p.resolve().is_relative_to(root) and (p.parent==root or p.suffix.lower() in allowed):files['/'+p.relative_to(root).as_posix()]=p.read_bytes()
assert all('/'+x in files for x in html[:8])
manifest={path:{'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()} for path,data in files.items()}
Path(args.manifest).write_text(json.dumps(manifest,indent=2))
class Handler(BaseHTTPRequestHandler):
 def do_HEAD(self):self.serve(False)
 def do_GET(self):self.serve(True)
 def serve(self,body):
  path=unquote(urlsplit(self.path).path)
  if path in ['/','/index.html']:
   self.send_response(302);self.send_header('Location','/designs.html');self.send_header('Content-Length','0');self.end_headers();return
  data=files.get(path)
  if data is None:self.send_error(404);return
  self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream');self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer');self.send_header('X-Robots-Tag','noindex, nofollow, noarchive');self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");self.end_headers()
  if body:self.wfile.write(data)
 def log_message(self,*args):pass
print(json.dumps({'ready':True,'bind':'127.0.0.1','port':args.port,'files':len(files),'source':'frozen in-memory allowlist','private_tree_served':False}),flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
