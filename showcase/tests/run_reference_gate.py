#!/usr/bin/env python3
"""Run the unchanged full QA lanes plus refit acceptance concurrently on a local preview."""
import argparse,json,os,subprocess,sys
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--base-url',default='http://127.0.0.1:8778/showcase');parser.add_argument('--output',default='/tmp/ara-reference-final-gate');args=parser.parse_args()
 if not args.base_url.startswith(('http://127.0.0.1:','http://localhost:')):parser.error('This acceptance runner is restricted to the local review server')
 root=Path(__file__).resolve().parents[2];out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
 lanes=[('landing','qa_showcase.py','ARA_SHOWCASE_QA_OUTPUT'),('product','qa_product.py','ARA_PRODUCT_QA_OUTPUT'),('extension','qa_extension.py','ARA_EXTENSION_QA_OUTPUT'),('reference','qa_reference.py','ARA_REFERENCE_QA_OUTPUT')]
 def run(lane):
  label,file,var=lane;env=os.environ.copy();env['ARA_SHOWCASE_URL']=args.base_url;env[var]=str(out/label)
  print(f'{label}: running',flush=True)
  try:
   result=subprocess.run([sys.executable,str(root/'showcase/tests'/file)],cwd=root,env=env,capture_output=True,text=True,timeout=600)
   (out/f'{label}.log').write_text(result.stdout+'\n'+result.stderr)
   summary={'lane':label,'exitCode':result.returncode,'log':str(out/f'{label}.log')}
  except subprocess.TimeoutExpired as e:
   (out/f'{label}.log').write_text('Timed out after 600 seconds.');summary={'lane':label,'exitCode':124,'log':str(out/f'{label}.log')}
  print(f'{label}: '+('PASS' if summary['exitCode']==0 else 'FAIL'),flush=True);return summary
 with ThreadPoolExecutor(max_workers=4) as pool:results=[f.result() for f in as_completed([pool.submit(run,x) for x in lanes])]
 results.sort(key=lambda x:x['lane']);(out/'gate.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));return int(any(x['exitCode'] for x in results))
if __name__=='__main__':raise SystemExit(main())
