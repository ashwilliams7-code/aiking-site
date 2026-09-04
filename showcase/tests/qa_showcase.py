#!/usr/bin/env python3
"""Headless interaction and responsive QA for the static ARA dual-suite showcase."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from playwright.sync_api import Page, sync_playwright  # type: ignore[import-not-found]

BASE_URL = os.environ.get("ARA_SHOWCASE_URL", "http://127.0.0.1:8765/showcase")
OUTPUT = Path(os.environ.get("ARA_SHOWCASE_QA_OUTPUT", "/tmp/ara-showcase-qa"))
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
OUTPUT.mkdir(parents=True, exist_ok=True)

CONFIGS = [
    ("kinetic", 1440, 900, False),
    ("kinetic", 1280, 720, False),
    ("kinetic", 390, 844, False),
    ("kinetic", 320, 568, False),
    ("kinetic", 390, 844, True),
    ("editorial", 1440, 900, False),
    ("editorial", 1280, 720, False),
    ("editorial", 390, 844, False),
    ("editorial", 320, 568, False),
    ("editorial", 390, 844, True),
]


def visible_count(page: Page, selector: str) -> int:
    return page.locator(selector).evaluate_all(
        "els => els.filter(el => !el.hidden && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0).length"
    )


def check_suite(page: Page, suite: str, width: int, height: int, reduced: bool) -> dict[str, Any]:
    console_errors: list[str] = []
    page_errors: list[str] = []
    failed_requests: list[str] = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on(
        "requestfailed",
        lambda request: failed_requests.append(request.url)
        if "fonts.googleapis.com" not in request.url and "fonts.gstatic.com" not in request.url
        else None,
    )

    page.goto(f"{BASE_URL}/{suite}.html", wait_until="domcontentloaded")
    page.wait_for_timeout(500)
    assertions: dict[str, bool] = {}

    metrics = page.evaluate(
        """() => ({
          innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          title: document.title,
          suite: document.body.dataset.suite,
          dialogs: document.querySelectorAll('dialog').length,
          sections: document.querySelectorAll('main > section').length,
          reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
        })"""
    )
    assertions["correct_suite"] = metrics["suite"] == suite
    assertions["no_horizontal_overflow"] = metrics["scrollWidth"] <= metrics["innerWidth"] + 1
    assertions["complete_section_set"] = metrics["sections"] >= 9
    assertions["dialogs_present"] = metrics["dialogs"] == 10
    assertions["motion_mode_correct"] = metrics["reduced"] is reduced
    assertions["single_page_heading"] = page.locator("h1").count() == 1
    assertions["controls_have_names"] = page.evaluate(
        """() => [...document.querySelectorAll('button,a,input,select')].every(el => {
          const labelled = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
          const label = el.id ? document.querySelector(`label[for="${el.id}"]`) : el.closest('label');
          return Boolean(labelled || label || (el.textContent || '').trim() || el.value);
        })"""
    )
    assertions["dialogs_labelled"] = page.locator("dialog[aria-labelledby]").count() == metrics["dialogs"]
    page.keyboard.press("Tab")
    assertions["skip_link_first"] = page.evaluate("document.activeElement.classList.contains('skip-link')")
    if suite == "kinetic":
        assertions["kinetic_motion_system_present"] = (
            page.locator('[data-motion-toggle]').count() == 1
            and page.locator('[data-motion-zone]').count() == 2
            and page.locator('.kinetic-ticker').count() == 1
            and page.locator('.signal-packet').count() == 2
            and page.locator('[data-journey-progress]').count() == 1
        )
        if reduced:
            assertions["kinetic_reduced_motion_contract"] = (
                page.locator('[data-motion-toggle]').is_disabled()
                and page.locator('[data-motion-toggle]').inner_text().lower() == "motion reduced"
                and page.locator('.ticker-track').evaluate("el => getComputedStyle(el).animationName === 'none'")
                and page.locator('.ticker-group[aria-hidden="true"]').evaluate("el => getComputedStyle(el).display === 'none'")
            )
        else:
            packet_before = page.locator('.signal-packet.p1').evaluate("el => el.getBoundingClientRect().left")
            page.wait_for_timeout(180)
            packet_after = page.locator('.signal-packet.p1').evaluate("el => el.getBoundingClientRect().left")
            assertions["kinetic_motion_visibly_advances"] = abs(packet_after - packet_before) > 0.5
            page.locator('[data-motion-toggle]').click()
            assertions["kinetic_motion_pause"] = (
                page.locator('body').get_attribute('data-motion-paused') == "true"
                and page.locator('[data-motion-toggle]').get_attribute('aria-pressed') == "true"
                and page.locator('.ticker-track').evaluate("el => getComputedStyle(el).animationPlayState === 'paused'")
            )
            page.locator('[data-motion-toggle]').click()
            assertions["kinetic_motion_resume"] = page.locator('body').get_attribute('data-motion-paused') == "false"
    else:
        assertions["editorial_motion_identity_separate"] = (
            page.locator('[data-motion-toggle]').count() == 0
            and page.locator('.kinetic-ticker').count() == 0
            and page.locator('[data-journey-progress]').count() == 0
        )
    if width < 1000:
        page.locator('[data-nav-toggle]').click()
        assertions["mobile_navigation_opens"] = (
            page.locator('[data-nav-toggle]').get_attribute("aria-expanded") == "true"
            and page.locator('[data-site-nav]').evaluate("el => el.classList.contains('is-open')")
        )
        page.locator('[data-nav-toggle]').click()
    if reduced:
        assertions["reduced_motion_css"] = page.locator('[data-reveal]').first.evaluate(
            "el => getComputedStyle(el).transitionDuration === '1e-06s' && getComputedStyle(document.documentElement).scrollBehavior === 'auto'"
        )

    page.locator('[data-path-stage="act"]').click()
    assertions["pathway_direct_control"] = (
        page.locator('[data-path-stage="act"]').get_attribute("aria-pressed") == "true"
        and page.locator('[data-path-panel="act"]').evaluate("el => el.classList.contains('is-active')")
    )

    page.locator('[data-diagnostic-next]').first.click()
    page.locator('[data-diagnostic-next]').nth(1).click()
    assertions["diagnostic_progression"] = visible_count(page, '[data-diagnostic-step]') == 1

    page.locator('[data-diagnostic-run]').click()
    page.wait_for_function("document.querySelector('[data-diagnostic-run]').textContent.includes('complete')", timeout=10000)
    assertions["diagnostic_run_complete"] = page.locator('[data-run-state].is-complete').count() == 5

    page.locator('[data-tab-button="priorities"]').click()
    assertions["scorecard_tabs"] = visible_count(page, '[data-tab-panel="priorities"]') == 1
    page.locator('[data-tab-button="priorities"]').press("ArrowRight")
    assertions["scorecard_keyboard_tabs"] = visible_count(page, '[data-tab-panel="method"]') == 1

    assertions["five_fixed_roles"] = page.locator('[data-role]').count() == 5
    page.locator('[data-role="billing"]').click()
    assertions["billing_role_isolated"] = (
        page.locator('[data-invite-open]').is_disabled()
        and page.locator('[data-connector-open]').is_disabled()
        and not page.locator('li[data-capability="billing"]').evaluate("el => el.classList.contains('is-disabled')")
    )
    page.locator('[data-role="admin"]').click()
    assertions["admin_boundary"] = not page.locator('[data-invite-open]').is_disabled() and page.locator('[data-transfer-open]').is_disabled()
    page.locator('[data-role="reviewer"]').click()
    assertions["reviewer_action_disabled"] = page.locator('[data-action-request]').is_disabled()
    page.locator('[data-role="owner"]').click()
    assertions["owner_action_enabled"] = not page.locator('[data-action-request]').is_disabled()

    page.locator('[data-invite-open]').click()
    page.locator('[data-invite-confirm]').click()
    assertions["bounded_invitation_preview"] = visible_count(page, '[data-invite-receipt]') == 1
    page.locator('[data-transfer-open]').click()
    page.locator('[data-transfer-confirm]').click()
    assertions["protected_transfer_preview"] = (
        visible_count(page, '[data-transfer-receipt]') == 1
        and "72h" in page.locator('[data-transfer-state]').inner_text()
    )

    page.locator('[data-action-request]').click()
    assertions["action_dialog"] = page.locator('#action-dialog').evaluate("el => el.open")
    page.locator('#action-dialog').press("Escape")
    assertions["dialog_escape"] = not page.locator('#action-dialog').evaluate("el => el.open")
    page.locator('[data-action-request]').click()
    page.locator('[data-action-confirm]').click()
    assertions["governed_action_receipt"] = visible_count(page, '[data-action-receipt]') == 1

    page.locator('[data-connector-state="degraded"]').click()
    assertions["connector_degrades_closed"] = (
        page.locator('body').get_attribute('data-connector-state') == "degraded"
        and "reconciliation" in page.locator('[data-connector-status]').inner_text().lower()
        and "degraded" in page.locator('[data-proof-coverage]').inner_text().lower()
    )
    page.locator('[data-connector-open]').click()
    page.locator('[data-connector-confirm]').click()
    assertions["connector_consent_restores_bounded_state"] = page.locator('body').get_attribute('data-connector-state') == "active"
    page.locator('[data-connector-revoke-open]').click()
    page.locator('[data-connector-revoke-confirm]').click()
    assertions["connector_revokes_immediately"] = (
        page.locator('body').get_attribute('data-connector-state') == "revoked"
        and "blocked" in page.locator('[data-connector-freshness]').inner_text().lower()
    )
    page.locator('[data-connector-state="active"]').click()

    page.locator('[data-outcome-filter="assisted"]').click()
    assertions["attribution_filter"] = visible_count(page, '[data-outcome-row]') == 1
    page.locator('[data-outcome-open="assisted"]').click()
    assertions["attribution_evidence_drawer"] = (
        page.locator('#outcome-dialog').evaluate("el => el.open")
        and "separately" in page.locator('[data-outcome-treatment]').inner_text().lower()
        and page.locator('[data-outcome-confidence]').inner_text() == "Medium"
        and "phone" in page.locator('[data-outcome-provenance]').inner_text().lower()
    )
    page.locator('#outcome-dialog [data-dialog-close]').first.click()
    page.locator('[data-outcome-filter="all"]').click()
    assertions["four_attribution_classes"] = visible_count(page, '[data-outcome-row]') == 4
    page.locator('[data-proof-export]').click()
    assertions["proof_pack_preview"] = (
        page.locator('#proof-export-dialog').evaluate("el => el.open")
        and "Cross-customer comparison disabled" in page.locator('#proof-export-dialog').inner_text()
        and "Customer-confirmed synthetic invoice value" in page.locator('#proof-export-dialog').inner_text()
    )
    page.locator('[data-proof-export-confirm]').click()
    if suite == "kinetic" and not reduced:
        page.locator('#outcomes').scroll_into_view_if_needed()
        page.wait_for_timeout(220)
        progress_value = page.locator('[data-journey-progress]').evaluate(
            "el => parseFloat(el.style.getPropertyValue('--journey-progress'))"
        )
        assertions["kinetic_scroll_progress"] = progress_value > 20
        assertions["kinetic_offscreen_motion_pauses"] = (
            not page.locator('#overview').evaluate("el => el.classList.contains('is-motion-zone-active')")
            and page.locator('.hero-frame').evaluate("el => getComputedStyle(el).animationPlayState === 'paused'")
        )

    assertions["milestone_default"] = visible_count(page, '[data-recovery-point]') == 2
    page.locator('[data-history-filter="all"]').click()
    assertions["complete_history"] = visible_count(page, '[data-recovery-point]') == 4
    checks = page.locator('[data-compare-check]')
    checks.nth(0).check()
    checks.nth(1).check()
    assertions["compare_exactly_two"] = not page.locator('[data-compare-button]').is_disabled()

    page.locator('[data-restore-open]').first.click()
    page.locator('[data-restore-confirm]').click()
    assertions["restore_preview"] = visible_count(page, '[data-restore-status]') == 1
    page.locator('[data-restore-undo]').click()
    assertions["restore_undo"] = visible_count(page, '[data-restore-status]') == 0

    first_point = page.locator('[data-recovery-point]').first
    first_point.locator('[data-delete-open]').click()
    page.locator('[data-delete-confirm]').click()
    assertions["pending_deletion"] = first_point.evaluate("el => el.classList.contains('is-pending-deletion')")
    first_point.locator('[data-delete-undo]').click()
    assertions["deletion_undo"] = not first_point.evaluate("el => el.classList.contains('is-pending-deletion')")

    page.locator('[data-plan="ARA Action"]').click()
    assertions["plan_selection"] = "ARA Action selected" in page.locator('[data-plan-summary]').inner_text()
    page.locator('[data-checkout-preview]').click()
    assertions["safe_checkout_dialog"] = page.locator('#checkout-dialog').evaluate("el => el.open")
    page.locator('[data-checkout-confirm]').click()
    page.locator('[data-billing-state="former"]').click()
    assertions["entitlement_state_preview"] = page.locator('[data-billing-banner]').get_attribute("data-state") == "former"

    page.evaluate("window.scrollTo(0, 0)")
    page.locator('[data-toast]').evaluate("el => el.classList.remove('is-visible')")
    page.wait_for_timeout(350)
    label = f"{suite}-{width}x{height}{'-reduced' if reduced else ''}"
    page.screenshot(path=str(OUTPUT / f"{label}-hero.png"), full_page=False)
    if width >= 1000 and not reduced:
        for section in ("diagnostic", "scorecard", "workspace", "connectors", "recovery", "outcomes", "billing"):
            page.evaluate("section => window.scrollTo(0, document.getElementById(section).offsetTop - 110)", section)
            page.wait_for_timeout(220)
            assertions[f"nav_{section}"] = page.locator(f'[data-site-nav] a[href$="#{section}"]').evaluate("el => el.classList.contains('is-active')")
            page.screenshot(path=str(OUTPUT / f"{label}-{section}.png"), full_page=False)
            page.locator(f"#{section}").screenshot(path=str(OUTPUT / f"{label}-{section}-full.png"))

    assertions["console_clean"] = not console_errors
    assertions["page_errors_clean"] = not page_errors
    assertions["requests_clean"] = not failed_requests
    assertions["all_primary_headings_visible"] = page.locator("h1, main h2").evaluate_all(
        "els => els.every(el => { const r=el.getBoundingClientRect(); const s=getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; })"
    )

    return {
        "label": label,
        "metrics": metrics,
        "assertions": assertions,
        "console_errors": console_errors,
        "page_errors": page_errors,
        "failed_requests": failed_requests,
        "passed": all(assertions.values()),
    }


def main() -> None:
    results: list[dict[str, Any]] = []
    with sync_playwright() as playwright:
        launch: dict[str, Any] = {"headless": True}
        if CHROME.exists():
            launch["executable_path"] = str(CHROME)
        browser = playwright.chromium.launch(**launch)
        try:
            for suite, width, height, reduced in CONFIGS:
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    reduced_motion="reduce" if reduced else "no-preference",
                    color_scheme="dark" if suite == "kinetic" else "light",
                )
                page = context.new_page()
                results.append(check_suite(page, suite, width, height, reduced))
                context.close()

            for suite in ("kinetic", "editorial"):
                context = browser.new_context(viewport={"width": 390, "height": 844})
                page = context.new_page()
                fallback_errors: list[str] = []
                page.on("pageerror", lambda error: fallback_errors.append(str(error)))
                page.goto(f"{BASE_URL}/{suite}.html", wait_until="domcontentloaded")
                page.add_style_tag(content="html body * { font-family: Arial, sans-serif !important; }")
                page.wait_for_timeout(300)
                checks = {
                    "fallback_font_forced": "Arial" in page.locator("h1").evaluate("el => getComputedStyle(el).fontFamily"),
                    "no_horizontal_overflow": page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
                    "headline_contained": page.locator("h1").evaluate("el => el.getBoundingClientRect().right <= innerWidth && el.getBoundingClientRect().left >= 0"),
                    "primary_cta_visible": page.locator('.hero-actions .button').first.is_visible(),
                    "page_errors_clean": not fallback_errors,
                }
                results.append({
                    "label": f"{suite}-390x844-forced-fallback-font",
                    "passed": all(checks.values()),
                    "assertions": checks,
                })
                page.screenshot(path=str(OUTPUT / f"{suite}-390x844-forced-fallback-font.png"), full_page=False)
                context.close()

            context = browser.new_context(viewport={"width": 390, "height": 844})
            page = context.new_page()
            page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
            page.wait_for_timeout(300)
            launcher = {
                "label": "launcher-390x844",
                "passed": page.locator('.suite-card').count() == 2
                and page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
                "assertions": {
                    "two_suite_links": page.locator('.suite-card').count() == 2,
                    "no_horizontal_overflow": page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
                },
            }
            page.screenshot(path=str(OUTPUT / "launcher-390x844.png"), full_page=True)
            results.append(launcher)
            context.close()

            site_root = BASE_URL.rsplit('/showcase', 1)[0]
            for width, height in ((1440, 900), (390, 844)):
                context = browser.new_context(viewport={"width": width, "height": height})
                page = context.new_page()
                errors: list[str] = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(f"{site_root}/ara.html", wait_until="domcontentloaded")
                page.wait_for_timeout(300)
                checks = {
                    "showcase_entry_present": page.get_by_role("link", name="Open the product showcase").count() == 1,
                    "no_horizontal_overflow": page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
                    "page_errors_clean": not errors,
                }
                results.append({
                    "label": f"ara-entry-{width}x{height}",
                    "passed": all(checks.values()),
                    "assertions": checks,
                })
                context.close()
        finally:
            browser.close()

    report = {
        "base_url": BASE_URL,
        "total": len(results),
        "passed": sum(1 for result in results if result["passed"]),
        "failed": [result["label"] for result in results if not result["passed"]],
        "results": results,
    }
    (OUTPUT / "report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps({"total": report["total"], "passed": report["passed"], "failed": report["failed"]}, indent=2))
    if report["failed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
