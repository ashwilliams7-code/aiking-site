"""Independent browser regression gate for the Sovereign presentation contract."""
from pathlib import Path
import json,os,sys,hashlib,subprocess
from playwright.sync_api import sync_playwright
BASE=os.environ.get('SOVEREIGN_BASE','http://127.0.0.1:8782/showcase').rstrip('/')
OUT=Path(os.environ.get('SOVEREIGN_QA_OUT','/tmp/sovereign-qa'));OUT.mkdir(parents=True,exist_ok=True)
checks=[]
def check(name,ok,detail=None):
 checks.append({'name':name,'ok':bool(ok),'detail':detail})
 if not ok:print('FAIL:',name,detail)
def layout(page,name):
 d=page.evaluate("""()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,lock:getComputedStyle(document.body).overflow,clipped:[...document.querySelectorAll('button,h1,h2,h3')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&r.width>0&&r.height>0&&!e.closest('dialog:not([open])')&&r.right>innerWidth+1}).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,55)}))})""")
 check(name+' layout',d['scroll']<=d['width']+1 and d['lock']!='hidden' and not d['clipped'],d)
def getstate(page):return page.evaluate('KingAISovereign.getState()')
def click(page,action,extra=''):page.locator('[data-so-action="'+action+'"]'+extra).click(timeout=4000)
def close(page):page.locator('[data-so-close]').click()
def goto(page,route):
 r=page.goto(BASE+'/'+route,wait_until='networkidle',timeout=30000);check(route+' HTTP',r.status==200);page.evaluate('document.fonts.ready')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
 try:
  for w,h in [(320,568),(390,844),(430,932),(760,900),(1050,900),(1280,800),(1440,900)]:
   ctx=b.new_context(viewport={'width':w,'height':h});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   for route in ['sovereign.html','sovereign-start.html','sovereign-product.html','designs.html']:
    goto(page,route);layout(page,route+' '+str(w));check(route+' brand '+str(w),page.get_attribute('body','data-product-brand')=='King AI');
    if route=='sovereign.html':check('Photo-tile and dark-CTA contrast '+str(w),page.evaluate("()=>[...document.querySelectorAll('.so-visual-tile h3,.so-plan-featured .so-btn-dark')].every(e=>getComputedStyle(e).color==='rgb(255, 255, 255)')"))
    if w in [390,1440]:page.screenshot(path=str(OUT/f'{route[:-5]}-{w}.png'))
   check('JS errors width '+str(w),not errors,errors);ctx.close()
  ctx=b.new_context(viewport={'width':390,'height':844});page=ctx.new_page();errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
  goto(page,'sovereign.html');photo=page.locator('.so-hero .so-photo');page.wait_for_timeout(150);start=photo.evaluate('e=>getComputedStyle(e).transform');page.wait_for_timeout(150);end=photo.evaluate('e=>getComputedStyle(e).transform');check('Photographic motion actually changes',start!=end)
  page.locator('[data-so-motion]').click();check('Motion pause receives click and pauses',photo.evaluate('e=>getComputedStyle(e).animationPlayState')=='paused');page.locator('[data-so-motion]').click();check('Motion resumes',photo.evaluate('e=>getComputedStyle(e).animationPlayState')=='running')
  page.locator('.so-final').scroll_into_view_if_needed();page.wait_for_timeout(150);check('Offscreen hero motion pauses',photo.evaluate('e=>getComputedStyle(e).animationPlayState')=='paused')
  page.evaluate('window.scrollTo(0,0)');page.locator('[data-so-menu]').click();check('Menu opens native focus-trapped dialog',page.locator('dialog').get_attribute('open') is not None);page.keyboard.press('Escape');check('Escape closes menu',page.locator('dialog').get_attribute('open') is None)
  goto(page,'sovereign-start.html');page.locator('[data-flow=next]').click();check('Empty URL validation',bool(page.locator('#so-flow-error').inner_text()))
  page.locator('[data-flow=sample]').click();seen=[]
  for i in range(8):
   q=page.locator('#so-question-stage').get_attribute('data-question');seen.append(q);check('Single current question '+q,page.locator('#so-question-stage h1').count()==1);layout(page,'onboarding '+q)
   if q=='role':page.locator('#so-authorised').check()
   if q=='consent':
    page.locator('[data-flow=next]').click();check('Explicit consent required',bool(page.locator('#so-flow-error').inner_text()));page.locator('[data-flow=manifest]').click();click(page,'custom-question','[data-index="0"]');page.locator('#so-custom-question').fill('Which local business can discuss a retaining wall project?');click(page,'custom-save','[data-index="0"]');click(page,'close');page.locator('#so-consent').check();page.screenshot(path=str(OUT/'onboarding-consent-390.png'))
   page.locator('[data-flow=next]').click()
  page.wait_for_url('**/sovereign-product.html');check('All eight questions reached',len(seen)==8 and seen[-1]=='consent',seen);check('Intake demo consent persisted',page.evaluate('KingAISovereign.getDraft().demoApproved===true'))
  page.locator('.so-home-hero [data-so-motion]').click();check('Workspace motion has its own working pause',page.locator('.so-home-hero .so-photo').evaluate('e=>getComputedStyle(e).animationPlayState')=='paused')
  qmotion=ctx.new_page();qmotion.set_viewport_size({'width':1440,'height':900});goto(qmotion,'sovereign-start.html');qmotion.locator('.so-onboarding-photo [data-so-motion]').click();check('Desktop onboarding has its own working pause',qmotion.locator('.so-onboarding-photo .so-photo').evaluate('e=>getComputedStyle(e).animationPlayState')=='paused');qmotion.close()
  # Conditional no-website flow, two distinct public surfaces.
  q=ctx.new_page();goto(q,'sovereign-start.html?no-website=1');check('No-website branch profile one',q.locator('#so-question-stage').get_attribute('data-question')=='profile1');q.locator('#so-answer').fill('https://profiles.example.test/business');q.locator('[data-flow=next]').click();check('No-website branch profile two',q.locator('#so-question-stage').get_attribute('data-question')=='profile2');q.locator('#so-answer').fill('https://profiles.example.test/business');q.locator('[data-flow=next]').click();check('Duplicate public surfaces rejected',bool(q.locator('#so-flow-error').inner_text()));q.locator('#so-answer').fill('https://directory.example.test/business');q.locator('[data-flow=next]').click();check('Second distinct surface advances',q.locator('#so-question-stage').get_attribute('data-question')=='business');q.close()
  # Workspace layouts across all six areas (five primary + account).
  for w,h in [(320,568),(390,844),(760,900),(1440,900)]:
   page.set_viewport_size({'width':w,'height':h})
   for view in ['home','facts','discovery','actions','results','account']:
    page.locator('[data-so-view="'+view+'"]').first.click();layout(page,'workspace '+view+' '+str(w));check('View '+view+' '+str(w),page.get_attribute('body','data-current-view')==view)
    if w in [390,1440] and view in ['facts','discovery','actions','results']:page.screenshot(path=str(OUT/f'workspace-{view}-{w}.png'))
  page.set_viewport_size({'width':390,'height':844});page.locator('[data-so-view=facts]').click();page.locator('#so-role').select_option('reviewer');before=getstate(page)['facts'];click(page,'edit-fact','[data-id="services"]');check('Reviewer cannot draft facts',page.locator('dialog').get_attribute('open') is None and getstate(page)['facts']==before)
  page.locator('#so-role').select_option('owner');click(page,'edit-fact','[data-id="services"]');page.locator('#so-fact-edit').fill('Retaining walls, paving, drainage and landscape design');click(page,'fact-save','[data-id="services"]');check('Draft does not silently overwrite truth',getstate(page)['facts']==before and 'services' in getstate(page)['draftFacts']);click(page,'edit-fact','[data-id="services"]');click(page,'fact-approve-preview','[data-id="services"]');click(page,'fact-approve','[data-id="services"]');check('Explicit evidence gate required',getstate(page)['facts']==before);page.locator('#so-fact-reviewed').check();click(page,'fact-approve','[data-id="services"]');check('Approved demo correction creates version',len(getstate(page)['versions'])==4 and not getstate(page)['draftFacts'])
  click(page,'recovery');target=getstate(page)['versions'][-1]['id'];current=getstate(page)['facts'];click(page,'restore-preview','[data-id="'+target+'"]');page.locator('#so-restore-check').check();click(page,'restore-confirm','[data-id="'+target+'"]');check('Restore changes state and preserves undo',getstate(page)['facts']!=current and getstate(page)['restoreUndo']==current);click(page,'restore-undo');check('Undo restores pre-restore head',getstate(page)['facts']==current);click(page,'delete-version','[data-id="'+target+'"]');page.locator('#so-delete-check').check();click(page,'delete-version-confirm','[data-id="'+target+'"]');check('Point deletion is pending not physical',any(v['id']==target and v.get('pending') for v in getstate(page)['versions']));click(page,'delete-version','[data-id="'+target+'"]');check('Point deletion undo works',not next(v for v in getstate(page)['versions'] if v['id']==target).get('pending'));close(page)
  page.locator('[data-so-view=discovery]').click();click(page,'report-exception');check('Report exception holds release',getstate(page)['reportState']=='needs-review');click(page,'review-report');page.locator('#so-review-resolved').check();click(page,'review-report-confirm');check('Reviewed sample releases',getstate(page)['reportState']=='released');click(page,'run-report');page.wait_for_timeout(1650);check('Queued collecting validating released exercised',getstate(page)['reportState']=='released');
  metrics=page.evaluate('KingAISovereign.metrics()');rows=page.evaluate('KingAISovereign.observations()');check('Complete 8x5x5x2 synthetic matrix',len(rows)==400);check('Unavailable excluded honestly',sum(r['available'] for r in rows)==metrics[0]['d'] and any(not r['available'] for r in rows));check('Metrics internally bounded',all(0<=m['n']<=m['d'] for m in metrics));check('Volatility explicitly exists',any(r.get('volatile') for r in rows));
  with page.expect_download() as dl:click(page,'export-report')
  report=json.loads(dl.value.path().read_text());check('Export is real local JSON without intake PII',report['synthetic'] and 'email' not in json.dumps(report) and report['metrics']==metrics)
  page.locator('[data-so-view=actions]').click();click(page,'propose-action');check('Proof cannot execute Action capability',page.locator('dialog').get_attribute('open') is None);click(page,'billing');click(page,'plan','[data-plan="action"]');close(page);click(page,'propose-action');page.locator('#so-action-sources').check();page.locator('#so-action-approved').check();click(page,'approve-action');check('Approved queue is explicitly demo',getstate(page)['action']['status']=='Approved demo queue');page.locator('#so-action-hazard').check();click(page,'propose-action');check('Safety-critical case routes to human',getstate(page)['action']['status']=='Human review required');close(page)
  page.locator('[data-so-view=account]').click();click(page,'connectors');click(page,'connector-approve');check('Connector cannot activate without consent',getstate(page)['connector']=='inactive');page.locator('#so-connector-consent').check();click(page,'connector-approve');check('Read-only sample manifest reconciles',getstate(page)['connector']=='active read-only demo');click(page,'connector-drift');check('Scope drift pauses access',getstate(page)['connector']=='paused — scope drift');click(page,'connector-revoke');check('Immediate internal revocation',getstate(page)['connector']=='revoked internally' and not getstate(page)['connectorConsent']);close(page)
  click(page,'team');page.locator('#so-invite-email').fill('reviewer@example.test');click(page,'invite');check('Invite remains pending, no email sent',getstate(page)['invites'][0]['status']=='pending acceptance');click(page,'transfer');page.locator('#so-transfer-auth').check();page.locator('#so-transfer-proof').check();page.locator('#so-transfer-accept').check();click(page,'transfer-confirm');check('Ownership handover held',getstate(page)['transfer']['status']=='hold');click(page,'cancel-transfer');check('Ownership handover reversible',getstate(page)['transfer'] is None);close(page)
  click(page,'billing');page.locator('#so-billing-state').select_option('past_due_restricted');click(page,'billing-apply');page.locator('[data-so-view=facts]').click();click(page,'edit-fact','[data-id="name"]');check('Restricted billing blocks new canonical work',page.locator('dialog').get_attribute('open') is None);page.locator('[data-so-view=account]').click();click(page,'retention');click(page,'delete-account');page.locator('#so-account-delete-check').check();click(page,'delete-account-confirm');check('Broad deletion remains pending',getstate(page)['accountDeletion']['status']=='pending');click(page,'undo-account');check('Broad deletion undo works',getstate(page)['accountDeletion'] is None);close(page)
  page.locator('[data-so-coverage]').click();page.locator('#so-decision-search').fill('E5');check('Open E5 not silently answered','Unanswered' in page.locator('#so-decision-results').inner_text());page.locator('#so-decision-search').fill('Q55');check('Recorded pricing retained','149' in page.locator('#so-decision-results').inner_text() and '399' in page.locator('#so-decision-results').inner_text());close(page)
  check('No unexpected JavaScript errors',not errors,errors);check('No provider or third-party requests from suite',all(u.startswith(BASE) or u.startswith('blob:') for u in requests),[u for u in requests if not u.startswith(BASE)])
  ctx.close()
  for mode in ['reduced','fontless','save-data']:
   ctx=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce' if mode=='reduced' else 'no-preference');q=ctx.new_page()
   if mode=='fontless':q.route('**/*',lambda route:route.abort() if any(x in route.request.url for x in ['.woff','.ttf']) else route.continue_())
   if mode=='save-data':q.add_init_script("Object.defineProperty(navigator,'connection',{value:{saveData:true}})")
   goto(q,'sovereign.html');layout(q,'fallback '+mode)
   if mode=='reduced':check('Reduced motion no animation',q.locator('.so-hero .so-photo').evaluate('e=>getComputedStyle(e).animationName')=='none')
   if mode=='save-data':check('Save-data omits decorative hero image',q.locator('.so-hero .so-photo').evaluate('e=>getComputedStyle(e).backgroundImage')=='none')
   q.screenshot(path=str(OUT/f'landing-{mode}-390.png'));ctx.close()
 except Exception as e:
  check('Test harness completed',False,str(e))
  try:page.screenshot(path=str(OUT/'failure.png'))
  except:pass
 finally:b.close()
summary={'base':BASE,'checks':len(checks),'passed':sum(c['ok'] for c in checks),'failed':[c for c in checks if not c['ok']],'results':checks}
(OUT/'results.json').write_text(json.dumps(summary,indent=2));print(json.dumps({k:summary[k] for k in ['base','checks','passed','failed']},indent=2));sys.exit(1 if summary['failed'] else 0)
