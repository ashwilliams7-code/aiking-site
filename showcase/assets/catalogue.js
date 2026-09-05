(() => {
  'use strict';

  const boot = () => {
    const grid = document.querySelector('[data-review-grid]');
    if (!grid) return;

    const cards = Array.from(document.querySelectorAll('[data-suite-card]'));
    const status = document.querySelector('[data-review-status]');
    const reset = document.querySelector('[data-review-reset]');
    const exportButton = document.querySelector('[data-review-export]');
    const storageKey = 'ara-showcase-founder-review:v1';
    const slugPattern = /^[a-z][a-z0-9-]{0,31}$/;
    const criteria = Object.freeze([
      ['comprehension', 'Comprehension'],
      ['confidence', 'Confidence'],
      ['actionFindability', 'Action findability'],
      ['evidenceClarity', 'Evidence clarity'],
      ['mobileComfort', 'Mobile comfort']
    ]);

    const suites = cards.map((card) => ({
      slug: (card.dataset.suiteCard || '').trim(),
      label: (card.dataset.suiteLabel || '').trim(),
      workspace: card.getAttribute('href') || ''
    })).filter((suite) => slugPattern.test(suite.slug) && suite.label && suite.workspace);

    if (!suites.length || suites.length !== cards.length) {
      document.body.dataset.reviewBoot = 'invalid-suite-catalogue';
      return;
    }

    const makeEmptyState = () => Object.fromEntries(
      suites.map((suite) => [suite.slug, Object.fromEntries(criteria.map(([key]) => [key, 0]))])
    );

    const normaliseScore = (value) => {
      const score = Number(value);
      return Number.isInteger(score) && score >= 1 && score <= 5 ? score : 0;
    };

    const loadState = () => {
      const empty = makeEmptyState();
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        suites.forEach((suite) => {
          criteria.forEach(([key]) => {
            empty[suite.slug][key] = normaliseScore(saved?.[suite.slug]?.[key]);
          });
        });
      } catch (_error) {
        // Invalid or unavailable storage falls back to a clean local scorecard.
      }
      return empty;
    };

    let state = loadState();

    const save = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        document.body.dataset.reviewStorage = 'available';
      } catch (_error) {
        document.body.dataset.reviewStorage = 'unavailable';
      }
    };

    const totalFor = (slug) => criteria.reduce((total, [key]) => total + state[slug][key], 0);
    const completeFor = (slug) => criteria.every(([key]) => state[slug][key] > 0);

    const renderStatus = () => {
      document.querySelectorAll('[data-review-total]').forEach((output) => {
        const slug = output.dataset.reviewTotal;
        if (!slug || !state[slug]) return;
        const rated = criteria.filter(([key]) => state[slug][key] > 0).length;
        output.textContent = rated === 0 ? 'Not scored' : rated < criteria.length
          ? `Partial ${totalFor(slug)} / 25 · ${rated} of 5 rated`
          : `${totalFor(slug)} / 25`;
      });
      const completed = suites.filter((suite) => completeFor(suite.slug)).length;
      document.body.dataset.reviewComplete = String(completed === suites.length);
      if (status) {
        status.textContent = completed === suites.length
          ? 'Comparison complete. Totals are visible, but the founders still choose the direction—no score auto-selects production.'
          : `${completed} of ${suites.length} suite reviews complete. Run the same five tasks in every suite before scoring.`;
      }
    };

    suites.forEach((suite, suiteIndex) => {
      const panel = document.createElement('article');
      panel.className = 'review-suite';
      panel.dataset.reviewSuite = suite.slug;

      const heading = document.createElement('h3');
      heading.textContent = suite.label;
      panel.appendChild(heading);

      const link = document.createElement('a');
      link.href = suite.workspace;
      link.textContent = 'Open workspace ↗';
      panel.appendChild(link);

      const fields = document.createElement('div');
      fields.className = 'review-fields';
      criteria.forEach(([key, label]) => {
        const row = document.createElement('div');
        row.className = 'review-field';
        const fieldLabel = document.createElement('label');
        const id = `review-${suite.slug}-${key}`;
        fieldLabel.htmlFor = id;
        fieldLabel.textContent = label;
        const select = document.createElement('select');
        select.id = id;
        select.dataset.reviewScore = key;
        select.dataset.reviewSuite = suite.slug;
        select.setAttribute('aria-label', `${suite.label}: ${label}`);
        [['0', 'Not scored'], ['1', '1 — weak'], ['2', '2'], ['3', '3 — solid'], ['4', '4'], ['5', '5 — excellent']].forEach(([value, text]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = text;
          select.appendChild(option);
        });
        select.value = String(state[suite.slug][key]);
        select.addEventListener('change', () => {
          state[suite.slug][key] = normaliseScore(select.value);
          save();
          renderStatus();
        });
        row.append(fieldLabel, select);
        fields.appendChild(row);
      });
      panel.appendChild(fields);

      const total = document.createElement('p');
      total.className = 'review-total';
      const totalLabel = document.createElement('span');
      totalLabel.textContent = `Suite ${String.fromCharCode(65 + suiteIndex)} total`;
      const output = document.createElement('output');
      output.dataset.reviewTotal = suite.slug;
      output.textContent = '0 / 25';
      total.append(totalLabel, output);
      panel.appendChild(total);
      grid.appendChild(panel);
    });

    reset?.addEventListener('click', () => {
      state = makeEmptyState();
      document.querySelectorAll('[data-review-score]').forEach((select) => {
        select.value = '0';
      });
      try {
        localStorage.removeItem(storageKey);
      } catch (_error) {
        // The in-memory reset still succeeds when storage is unavailable.
      }
      renderStatus();
    });

    exportButton?.addEventListener('click', () => {
      const payload = {
        schemaVersion: 1,
        kind: 'ara-founder-design-review',
        boundary: {
          productionDecision: false,
          externalSubmission: false,
          customerData: false,
          note: 'Local founder review only. A score does not select or deploy a production interface.'
        },
        criteria: criteria.map(([key, label]) => ({ key, label, range: '1-5' })),
        suites: suites.map((suite) => ({
          slug: suite.slug,
          label: suite.label,
          scores: state[suite.slug],
          total: totalFor(suite.slug),
          complete: completeFor(suite.slug)
        }))
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'ara-founder-design-review.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    });

    save();
    renderStatus();
    document.body.dataset.reviewBoot = 'ready';
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
