(() => {
  'use strict';
  if (document.body.dataset.suite !== 'kinetic') return;
  const isWorkspace = document.body.hasAttribute('data-product-workspace');
  // The legacy shared landing handler treats any matching hash as same-page.
  // Intercept only cross-document links in Kinetic; leave Editorial unchanged.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, document.baseURI);
    if (!url.hash || (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search)) return;
    const plan = link.dataset.refPlan;
    if (plan === 'proof' || plan === 'action') { try { sessionStorage.setItem('ara-kinetic-plan-intent',plan); } catch {} }
    event.preventDefault(); event.stopImmediatePropagation(); location.assign(url.href);
  }, true);

  // Project historical wording into the current brand without rewriting the answers.
  const displayBrand = value => String(value).replace(/\bARA\b/g,'King AI').replace(/\b([Aa])n King AI\b/g,'$1 King AI');
  const bank = Array.isArray(window.ARA_BANKED_DECISIONS) ? window.ARA_BANKED_DECISIONS : [];
  const navigate = (view) => {
    if (!/^(overview|onboarding|diagnostic|truth|scorecard|actions|outcomes|connectors|team|recovery|billing|audit)$/.test(view)) return;
    if (isWorkspace) {
      document.querySelector(`[data-view-target="${view}"]`)?.click();
      if (view === 'audit') {
        const details = document.querySelector('[data-requirements-bank]');
        if (details) { details.open = true; details.scrollIntoView({behavior:'smooth',block:'start'}); }
      }
    } else location.href = `kinetic-product.html#${view}`;
  };
  document.querySelectorAll('[data-ref-view]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); navigate(a.dataset.refView);
  }));
  document.querySelectorAll('[data-requirements-bank]').forEach(container => {
    const list = container.querySelector('[data-decision-list]');
    const input = container.querySelector('[data-decision-search]');
    const count = container.querySelector('[data-decision-count]');
    const render = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const rows = bank.filter(r => {
        const original = `${r.id} ${r.choice} ${r.decision} ${r.state}`;
        return `${original} ${displayBrand(original)}`.toLowerCase().includes(q);
      });
      list.replaceChildren();
      rows.forEach(r => {
        const article = document.createElement('article'); article.className='ref-decision-item'; article.dataset.questionId=r.id;
        const heading=document.createElement('strong');heading.textContent=`${r.id} · ${r.choice || 'Custom'}`;
        const body=document.createElement('div');
        const text=document.createElement('p');text.textContent=displayBrand(r.decision.replace(/[*`]/g,''));
        const state=document.createElement('p');state.textContent=r.state;state.style.fontWeight='600';state.style.marginTop='8px';
        const link=document.createElement('a');link.href=`kinetic-product.html#${r.view}`;link.textContent=`Explore ${r.view === 'truth' ? 'Truth Sheet' : r.view} →`;
        link.addEventListener('click',e=>{if(isWorkspace){e.preventDefault();navigate(r.view);}});
        body.append(text,state,link);article.append(heading,body);list.append(article);
      });
      count.textContent = `${rows.length} of ${bank.length} decision records · Q1–Q20 grouped; Q21–Q72 individually indexed; E1–E4 banked; E5 open.`;
    };
    input?.addEventListener('input',render);render();
  });
  document.querySelectorAll('[data-ref-plan]').forEach(a=>a.addEventListener('click',()=>{
    const plan=a.dataset.refPlan;
    if(plan==='proof'||plan==='action'){
      try{sessionStorage.setItem('ara-kinetic-plan-intent',plan);}catch{/* Display preference only. */}
    }
  }));
  const applyPlanIntent = () => {
    if(!isWorkspace || location.hash!=='#billing') return;
    try{
      const plan=sessionStorage.getItem('ara-kinetic-plan-intent');
      sessionStorage.removeItem('ara-kinetic-plan-intent');
      if(plan==='proof'||plan==='action') document.querySelector(`[data-plan="${plan}"]`)?.click();
    }catch{/* Storage can be disabled; no entitlement depends on it. */}
  };
  if(document.readyState==='loading'||document.readyState==='interactive') document.addEventListener('DOMContentLoaded',applyPlanIntent,{once:true});
  else applyPlanIntent();
  if(!isWorkspace){ const syncHeader=()=>{document.body.dataset.refScrolled=String(scrollY>70);};window.addEventListener('scroll',syncHeader,{passive:true});syncHeader(); }
  const toggle=document.querySelector('[data-nav-toggle]');
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&isWorkspace&&document.body.dataset.productNavOpen==='true'){ toggle?.click(); toggle?.focus(); }
    if(e.key==='Escape'&&!isWorkspace){
      const nav=document.querySelector('[data-site-nav]');
      if(nav?.classList.contains('is-open')){nav.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');toggle?.focus();}
    }
  });
})();
