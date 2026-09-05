#!/usr/bin/env python3
"""Additional reference-design and decision-bank acceptance; no remote side effects."""
import json,os,hashlib,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright  # type: ignore[import-not-found]
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(os.environ.get('ARA_REFERENCE_QA_OUTPUT','/tmp/ara-reference-acceptance'));OUT.mkdir(exist_ok=True)
BASE=os.environ.get('ARA_SHOWCASE_URL','http://127.0.0.1:8778/showcase').rstrip('/')
VIEWS=['overview','onboarding','diagnostic','truth','scorecard','actions','outcomes','connectors','team','recovery','billing','audit']
results=[]
def check(name,condition,details=None):
 results.append({'check':name,'pass':bool(condition),'details':details})
def navigate(page,view,width):
 if width<=760 and page.locator('[data-product-nav-toggle]').get_attribute('aria-expanded')!='true':page.locator('[data-product-nav-toggle]').click()
 page.locator(f'[data-view-target="{view}"]').click()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 for width,height,reduced,fonts in [(1920,1080,False,True),(1440,900,False,True),(1280,720,False,True),(390,844,False,True),(320,568,False,True),(390,844,True,True),(390,844,False,False)]:
  label=f'{width}x{height}'+('-reduced' if reduced else '')+('-fallback' if not fonts else '')
  context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce' if reduced else 'no-preference')
  if not fonts:context.route('**/*',lambda route:route.abort() if route.request.resource_type=='font' else route.continue_())
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(BASE+'/kinetic.html',wait_until='networkidle')
  page.screenshot(path=str(OUT/f'landing-{label}.png'))
  geom=page.evaluate('''()=>{const h=document.querySelector('.ref-hero h1'),c=document.querySelector('.hero-copy').getBoundingClientRect(),p=document.querySelector('.ref-preview').getBoundingClientRect();return {width:innerWidth,scroll:document.documentElement.scrollWidth,lines:h.children.length,center:Math.abs(p.x+p.width/2-innerWidth/2),gap:p.top-c.bottom,bg:getComputedStyle(document.querySelector('.ref-hero'),'::before').backgroundImage,button:getComputedStyle(document.querySelector('.hero-join>strong')).backgroundColor}}''')
  check(label+' landing geometry',geom['width']==geom['scroll'] and geom['lines']==2 and geom['center']<2,geom)
  check(label+' reference image and lime', 'construction-hero.jpg' in geom['bg'] and geom['button']=='rgb(207, 241, 40)')
  check(label+' preview clear of copy',geom['gap']>=6,geom['gap'])
  page.locator('[data-nav-toggle]').click();check(label+' landing menu opens',page.locator('[data-site-nav]').is_visible());page.keyboard.press('Escape');check(label+' landing menu Escape',not page.locator('[data-site-nav]').is_visible())
  check(label+' complete surface panel',page.locator('.surface-row:not(.header)>strong').count()==8)
  page.locator('[data-requirements-bank]>summary').click();page.locator('[data-decision-search]').fill('Q55');check(label+' pricing decision searchable',page.locator('[data-question-id]').count()==1 and '149' in page.locator('[data-question-id]').inner_text() and '399' in page.locator('[data-question-id]').inner_text())
  page.locator('[data-decision-search]').fill('E5');check(label+' E5 not invented','Unanswered' in page.locator('[data-question-id]').inner_text())
  page.locator('[data-ref-plan="action"]').click();page.wait_for_url('**/kinetic-product.html#billing');page.wait_for_load_state('networkidle')
  check(label+' explicit Action selection carries through',page.locator('body').get_attribute('data-selected-plan')=='action')
  for view in VIEWS:
   navigate(page,view,width)
   dimensions=page.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})')
   check(label+' workspace '+view,dimensions['w']==dimensions['s'] and page.locator(f'[data-view="{view}"]').is_visible(),dimensions)
   if width in (1440,390) and fonts and not reduced:page.screenshot(path=str(OUT/f'workspace-{view}-{label}.png'))
  if width<=760:
   page.locator('[data-product-nav-toggle]').click();page.wait_for_function("document.querySelector('.command-rail').getBoundingClientRect().x >= -1");check(label+' drawer opens',page.locator('.command-rail').bounding_box()['x']>=-1);page.keyboard.press('Escape');check(label+' drawer Escape',page.locator('[data-product-nav-toggle]').get_attribute('aria-expanded')=='false')
  check(label+' no page errors',not errors,errors)
  context.close()
 browser.close()
for file in ['showcase/editorial.html','showcase/editorial-product.html','showcase/assets/editorial-product.css','showcase/assets/product.js','showcase/assets/showcase.js','showcase/assets/showcase.css','showcase/assets/product-base.css']:
 baseline=subprocess.check_output(['git','show','72be25b:'+file],cwd=ROOT)
 check('unchanged '+file,hashlib.sha256(baseline).digest()==hashlib.sha256((ROOT/file).read_bytes()).digest())
report={'total':len(results),'passed':sum(r['pass'] for r in results),'failed':[r for r in results if not r['pass']],'results':results}
(OUT/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:report[k] for k in ('total','passed','failed')},indent=2));raise SystemExit(bool(report['failed']))
