#!/usr/bin/env python3
"""Exercise future suite namespaces and invalid metadata; no third design is published."""
import json
import os
from pathlib import Path
from typing import Any
from playwright.sync_api import sync_playwright  # type: ignore[import-not-found]
from suite_profiles import READY_SUITES, RESERVED_SLOTS, SHOWCASE_ROOT
from qa_product import confirm_dialog, download_json

BASE = os.environ.get('ARA_SHOWCASE_URL', 'http://127.0.0.1:8765/showcase')
OUTPUT = Path(os.environ.get('ARA_EXTENSION_QA_OUTPUT', '/tmp/ara-extension-qa'))
CHROME = Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = []
    source = (SHOWCASE_ROOT / READY_SUITES[0]['workspace']).read_text()
    body = '<body data-suite="kinetic" data-suite-label="Kinetic Signal System" data-product-contract="v1" data-product-workspace>'
    assert body in source
    with sync_playwright() as p:
        args: dict[str, Any] = {'headless': True}
        if CHROME.exists(): args['executable_path'] = str(CHROME)
        browser = p.chromium.launch(**args)
        try:
            context = browser.new_context(accept_downloads=True)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(BASE + '/kinetic-product.html', wait_until='networkidle')
            original_key = 'ara-showcase-product:kinetic:v1'
            original = page.evaluate('(key) => localStorage.getItem(key)', original_key)
            # Reuse markup ONLY as a transport fixture, not as a third visual proposal.
            fixture = source.replace(body, '<body data-suite="extension-test" data-suite-label="Extension Test Fixture" data-product-contract="v1" data-product-workspace>')
            url = BASE + '/extension-test.html'
            page.route(url, lambda route: route.fulfill(status=200, content_type='text/html', body=fixture))
            page.goto(url, wait_until='networkidle')
            assert page.locator('body').get_attribute('data-product-boot') == 'ready'
            assert 'Extension Test Fixture' in page.title()
            page.locator('[data-view-target="actions"]').click()
            for selector in ('[data-action-prepare]', '[data-action-review]', '[data-action-approve]'):
                page.locator(selector).click()
                confirm_dialog(page)
            assert page.locator('body').get_attribute('data-action-state') == 'accepted_for_demo_queue'
            page.locator('[data-view-target="outcomes"]').click()
            name, data = download_json(page, '[data-proof-export]')
            assert name == 'ara-extension-test-synthetic-proof.json' and data['suite'] == 'extension-test'
            page.locator('[data-reset-demo]').click()
            confirm_dialog(page)
            assert page.evaluate('(key) => localStorage.getItem(key)', original_key) == original
            assert not errors, errors
            results.append({'label': 'future-namespace-actions-export-reset-isolation', 'passed': True})
            context.close()

            for label, replacement in (
                ('missing-label', '<body data-suite="kinetic" data-product-contract="v1" data-product-workspace>'),
                ('invalid-slug', '<body data-suite="../kinetic" data-suite-label="Invalid" data-product-contract="v1" data-product-workspace>'),
                ('wrong-version', '<body data-suite="extension-test" data-suite-label="Extension" data-product-contract="v2" data-product-workspace>'),
                ('case-alias', '<body data-suite="Kinetic" data-suite-label="Alias" data-product-contract="v1" data-product-workspace>'),
            ):
                context = browser.new_context()
                page = context.new_page()
                url = BASE + '/' + label + '.html'
                html = source.replace(body, replacement)
                page.route(url, lambda route, request, html=html: route.fulfill(status=200, content_type='text/html', body=html))
                page.goto(url, wait_until='networkidle')
                assert page.locator('body').get_attribute('data-product-boot') == 'invalid-suite'
                assert page.evaluate('Object.keys(localStorage).length') == 0
                results.append({'label': label + '-fails-without-storage-alias', 'passed': True})
                context.close()

            for width, height in ((1440, 900), (320, 568)):
                context = browser.new_context(viewport={'width':width,'height':height})
                page = context.new_page()
                page.goto(BASE + '/', wait_until='networkidle')
                assert page.locator('[data-suite-card]').count() == len(READY_SUITES)
                assert page.locator('[data-suite-slot]').count() == len(RESERVED_SLOTS)
                assert page.locator('[data-suite-slot] a').count() == 0
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                assert page.locator('.suite-card h2').evaluate_all("els => els.every(el => el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().right <= el.closest('.suite-card').getBoundingClientRect().right - 10)")
                assert page.locator('[data-review-score]').evaluate_all("els => els.every(el => el.getBoundingClientRect().width >= 140 && el.getBoundingClientRect().height >= 44)")
                page.screenshot(path=str(OUTPUT / f'catalogue-{width}.png'), full_page=True)
                results.append({'label': f'catalogue-{width}-reserved-slot-and-layout', 'passed': True})
                context.close()
        finally:
            browser.close()
    report = {'total':len(results), 'passed':sum(item['passed'] for item in results), 'failed':[], 'results':results}
    (OUTPUT / 'report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps({k:report[k] for k in ('total','passed','failed')}, indent=2))

if __name__ == '__main__':
    main()
