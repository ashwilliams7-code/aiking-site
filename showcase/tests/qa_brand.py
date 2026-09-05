#!/usr/bin/env python3
"""Current-brand, responsive and historical-record checks for the synthetic suite."""
import argparse, hashlib, json, re, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright  # type: ignore[import-not-found]

ROOT = Path(__file__).resolve().parents[2]
VIEWS = ['overview','onboarding','diagnostic','truth','scorecard','actions','outcomes','connectors','team','recovery','billing','audit']
parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:8778/showcase')
parser.add_argument('--output', default='/tmp/king-ai-brand-qa')
args = parser.parse_args()
BASE = args.base_url.rstrip('/')
OUT = Path(args.output); OUT.mkdir(parents=True, exist_ok=True)
results = []
def check(name, ok, detail=None):
    results.append({'check':name, 'pass':bool(ok), 'detail':detail})
def audit(page, name):
    state = page.evaluate('''() => ({brand:document.body.dataset.productBrand,domain:document.body.dataset.productDomain,title:document.title,text:document.body.innerText,overflow:document.documentElement.scrollWidth-innerWidth,labels:[...document.querySelectorAll('[aria-label],[title],[alt]')].map(e=>[e.getAttribute('aria-label'),e.getAttribute('title'),e.getAttribute('alt')].join(' ')).join(' ')})''')
    check(name+' current brand and domain',state['brand']=='King AI' and state['domain']=='kingai.au' and 'King AI' in state['title'])
    check(name+' no legacy visible or accessible brand',not re.search(r'\bARA\b',state['text']+' '+state['labels']), re.findall(r'.{0,35}\bARA\b.{0,35}',state['text']+' '+state['labels'])[:3])
    check(name+' no horizontal overflow',state['overflow']<=1,state['overflow'])

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True,executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    for width,height in [(1440,900),(390,844),(320,568)]:
        for route in ['kinetic.html','kinetic-product.html','editorial.html','editorial-product.html','index.html']:
            name=f'{route} {width}'
            context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce')
            page=context.new_page(); errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            response=page.goto(BASE+'/'+route,wait_until='networkidle');check(name+' HTTP',response.status==200)
            page.evaluate('document.fonts.ready');page.wait_for_timeout(550)
            audit(page,name)
            if route.startswith('kinetic') and width in (1440,390):
                page.screenshot(path=str(OUT/f'{route[:-5]}-{width}.png'))
            if '-product.' in route:
                for view in VIEWS:
                    if width<=760 and page.locator('[data-product-nav-toggle]').count() and page.locator('[data-product-nav-toggle]').get_attribute('aria-expanded')!='true':
                        page.locator('[data-product-nav-toggle]').click()
                    page.locator(f'[data-view-target="{view}"]').click()
                    page.wait_for_function('(view)=>document.body.dataset.currentView===view',arg=view)
                    page.wait_for_timeout(80)
                    audit(page,name+' '+view)
                    if view=='billing':
                        billing=page.locator('[data-view="billing"]').inner_text()
                        check(name+' both renamed plans', 'king ai proof' in billing.lower() and 'king ai action' in billing.lower())
            if route.startswith('kinetic'):
                bank=page.locator('[data-requirements-bank]');bank.locator('summary').click()
                search=page.locator('[data-decision-search]')
                search.fill('King AI');check(name+' current brand searchable',page.locator('[data-question-id]').count()>0)
                audit(page,name+' open decision bank')
                search.fill('ARA');check(name+' historical alias searchable',page.locator('[data-question-id]').count()>0)
                search.fill('E5');check(name+' E5 still unanswered','Unanswered' in page.locator('[data-question-id]').inner_text())
                search.fill('Q55');prices=page.locator('[data-question-id]').inner_text()
                check(name+' unchanged approved price values',all(x in prices for x in ['149','399','1,500']))
            check(name+' no JS errors',not errors,errors)
            context.close()
    browser.close()
for path in ['showcase/assets/kinetic-decisions.js','showcase/assets/reference-design.css','showcase/assets/reference/construction-hero.jpg','showcase/assets/editorial-product.css','showcase/assets/product-base.css','showcase/assets/showcase.css','showcase/suite-registry.json']:
    old=subprocess.check_output(['git','show','design/ara-kinetic-kingkong-v1:'+path],cwd=ROOT)
    check('V1 bank/design/contract unchanged '+path,hashlib.sha256(old).digest()==hashlib.sha256((ROOT/path).read_bytes()).digest())
report={'base':BASE,'total':len(results),'passed':sum(r['pass'] for r in results),'failed':[r for r in results if not r['pass']],'results':results}
(OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:report[k] for k in ['base','total','passed','failed']},indent=2))
raise SystemExit(bool(report['failed']))
