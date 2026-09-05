#!/usr/bin/env python3
"""Headless interaction, persistence and responsive QA for ARA product workspaces."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from playwright.sync_api import Page, sync_playwright  # type: ignore[import-not-found]
from suite_profiles import CONFIGS, READY_SUITES, selector_contract

BASE_URL = os.environ.get("ARA_SHOWCASE_URL", "http://127.0.0.1:8765/showcase")
OUTPUT = Path(os.environ.get("ARA_PRODUCT_QA_OUTPUT", "/tmp/ara-product-qa"))
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
OUTPUT.mkdir(parents=True, exist_ok=True)

VIEWS = (
    "overview", "onboarding", "diagnostic", "truth", "scorecard", "actions",
    "outcomes", "connectors", "team", "recovery", "billing", "audit",
)
def visible_views(page: Page) -> list[str]:
    return page.locator("[data-view]").evaluate_all(
        "els => els.filter(el => !el.hidden && getComputedStyle(el).display !== 'none').map(el => el.dataset.view)"
    )


def listen(page: Page) -> tuple[list[str], list[str], list[str]]:
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
    return console_errors, page_errors, failed_requests


def confirm_dialog(page: Page) -> None:
    assert page.locator("#product-dialog").evaluate("el => el.open")
    page.locator("[data-dialog-confirm]").click()
    page.wait_for_timeout(40)


def download_json(page: Page, selector: str) -> tuple[str, dict[str, Any]]:
    candidates = page.locator(selector)
    visible = next(candidates.nth(index) for index in range(candidates.count()) if candidates.nth(index).is_visible())
    with page.expect_download(timeout=5000) as info:
        visible.click()
    download = info.value
    path = download.path()
    assert path is not None
    return download.suggested_filename, json.loads(Path(path).read_text())


def check_product(page: Page, profile: dict[str, Any], width: int, height: int, reduced: bool) -> dict[str, Any]:
    suite = profile["slug"]
    console_errors, page_errors, failed_requests = listen(page)
    page.goto(f"{BASE_URL}/{profile['workspace']}", wait_until="networkidle")
    page.wait_for_timeout(180)
    assertions: dict[str, bool] = {}

    metrics = page.evaluate(
        """() => ({
          suite: document.body.dataset.suite,
          suiteLabel: document.body.dataset.suiteLabel,
          productContract: document.body.dataset.productContract,
          productBoot: document.body.dataset.productBoot,
          nav: document.querySelectorAll('[data-view-target]').length,
          views: document.querySelectorAll('[data-view]').length,
          h1: document.querySelectorAll('h1').length,
          dialogs: document.querySelectorAll('dialog').length,
          innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
          boundary: document.body.innerText.toLowerCase().includes('synthetic')
            && document.body.innerText.toLowerCase().includes('customer data')
        })"""
    )
    assertions["correct_suite"] = metrics["suite"] == suite
    assertions["suite_contract_ready"] = (
        metrics["suiteLabel"] == profile["label"]
        and metrics["productContract"] == "v1"
        and metrics["productBoot"] == "ready"
        and profile["label"] in page.title()
    )
    assertions["twelve_views"] = metrics["views"] == len(VIEWS)
    assertions["twelve_navigation_controls"] = metrics["nav"] == len(VIEWS)
    assertions["one_visible_view"] = visible_views(page) == ["overview"]
    assertions["one_h1"] = metrics["h1"] == 1
    assertions["one_labelled_dialog"] = metrics["dialogs"] == 1 and page.locator("dialog[aria-labelledby]").count() == 1
    assertions["no_horizontal_overflow"] = metrics["scrollWidth"] <= metrics["innerWidth"] + 1
    assertions["synthetic_boundary_visible"] = metrics["boundary"]
    assertions["motion_mode"] = metrics["reduced"] is reduced
    assertions["controls_named"] = page.evaluate(
        """() => [...document.querySelectorAll('button,a,input')].every(el => {
          const label = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
          const wrapped = el.closest('label');
          return Boolean(label || wrapped || (el.textContent || '').trim() || el.value);
        })"""
    )

    page.keyboard.press("Tab")
    assertions["skip_link_first"] = page.evaluate("document.activeElement.classList.contains('skip-link')")

    identity = profile["identity"]
    assertions["registered_product_identity"] = selector_contract(
        page, identity["productRequired"], identity["productForbidden"]
    )
    if profile["capabilities"]["kineticMotion"]:
        if reduced:
            assertions["suite_reduced_motion"] = (
                page.locator("[data-motion-toggle]").is_disabled()
                and page.locator("[data-motion-toggle]").inner_text().lower() == "motion reduced"
                and page.locator("body").get_attribute("data-motion-reduced") == "true"
            )
        else:
            page.locator("[data-motion-toggle]").click()
            assertions["suite_motion_pause"] = page.locator("body").get_attribute("data-motion-paused") == "true"
            page.locator("[data-motion-toggle]").click()

    for view in VIEWS:
        page.locator(f'[data-view-target="{view}"]').click()
        page.wait_for_timeout(20)
        assertions[f"view_{view}"] = (
            visible_views(page) == [view]
            and page.locator("body").get_attribute("data-current-view") == view
            and page.url.endswith(f"#{view}")
        )

    page.locator('[data-view-target="onboarding"]').click()
    for _ in range(3):
        page.locator("[data-onboarding-next]").click()
    assertions["onboarding_complete"] = (
        page.locator("[data-onboarding-step].is-complete").count() == 7
        and page.locator("[data-onboarding-next]").is_disabled()
        and "7" in page.locator("[data-onboarding-progress]").inner_text()
    )

    page.locator('[data-view-target="diagnostic"]').click()
    page.locator("[data-diagnostic-reset]").click()
    page.locator("[data-diagnostic-start]").click()
    page.wait_for_function("document.body.dataset.diagnosticState === 'released'", timeout=7000)
    assertions["diagnostic_released"] = (
        page.locator("body").get_attribute("data-diagnostic-state") == "released"
        and page.locator("[data-diagnostic-stage].is-complete").count() == 5
        and "no provider" in page.locator("[data-diagnostic-copy]").inner_text().lower()
    )
    page.locator('[data-view-target="scorecard"]').click()
    assertions["scorecard_fresh"] = page.locator("[data-scorecard-fresh]").get_attribute("data-fresh") == "true"

    page.locator('[data-view-target="truth"]').click()
    page.locator("[data-fact-propose]").click()
    assertions["dialog_escape"] = page.locator("#product-dialog").evaluate("el => el.open")
    page.locator("#product-dialog").press("Escape")
    assertions["dialog_escape"] = assertions["dialog_escape"] and not page.locator("#product-dialog").evaluate("el => el.open")
    page.locator("[data-fact-propose]").click()
    confirm_dialog(page)
    assertions["fact_proposed"] = (
        page.locator("body").get_attribute("data-fact-state") == "review_required"
        and not page.locator("[data-fact-approve]").is_disabled()
        and "not published" in page.locator("[data-fact-receipt]").inner_text().lower()
    )
    page.locator("[data-fact-approve]").click()
    confirm_dialog(page)
    assertions["fact_approved"] = page.locator("body").get_attribute("data-fact-state") == "current"

    page.locator('[data-view-target="actions"]').click()
    page.locator("[data-action-prepare]").click(); confirm_dialog(page)
    page.locator("[data-action-review]").click(); confirm_dialog(page)
    page.locator("[data-action-approve]").click(); confirm_dialog(page)
    assertions["action_lifecycle"] = (
        page.locator("body").get_attribute("data-action-state") == "accepted_for_demo_queue"
        and "no message" in page.locator("[data-action-receipt]").inner_text().lower()
        and "customer commitment" in page.locator("[data-action-receipt]").inner_text().lower()
    )

    page.locator('[data-view-target="connectors"]').click()
    page.locator('[data-connector-state="degraded"]').click()
    assertions["connector_degraded_closed"] = (
        page.locator("body").get_attribute("data-connector-state") == "degraded"
        and "fail closed" in page.locator("[data-connector-status]").inner_text().lower()
    )
    page.locator("[data-connector-revoke]").click(); confirm_dialog(page)
    assertions["connector_revoked"] = (
        page.locator("body").get_attribute("data-connector-state") == "revoked"
        and "blocked" in page.locator("[data-connector-copy]").inner_text().lower()
    )
    page.locator("[data-connector-consent]").click(); confirm_dialog(page)
    assertions["connector_reconsented"] = page.locator("body").get_attribute("data-connector-state") == "active"

    page.locator('[data-view-target="team"]').click()
    page.locator('[data-role="reviewer"]').click()
    assertions["reviewer_restricted"] = (
        page.locator("[data-invite-prepare]").is_disabled()
        and page.locator("[data-transfer-start]").is_disabled()
        and page.locator("[data-action-prepare]").is_disabled()
    )
    page.locator('[data-role="owner"]').click()
    page.locator("[data-invite-prepare]").click(); confirm_dialog(page)
    assertions["invitation_receipt"] = "no message" in page.locator("[data-team-receipt]").inner_text().lower()
    page.locator("[data-transfer-start]").click(); confirm_dialog(page)
    assertions["transfer_receipt"] = (
        "72-hour" in page.locator("[data-team-receipt]").inner_text().lower()
        and "no authority" in page.locator("[data-team-receipt]").inner_text().lower()
    )

    page.locator('[data-view-target="recovery"]').click()
    page.locator('[data-recovery-filter="all"]').click()
    points = page.locator("[data-recovery-point]")
    assertions["four_recovery_points"] = points.count() == 4 and all(points.nth(i).is_visible() for i in range(4))
    checks = page.locator('[data-recovery-point] input[type="checkbox"]')
    checks.nth(0).check(); checks.nth(1).check()
    assertions["compare_exactly_two"] = not page.locator("[data-recovery-compare]").is_disabled()
    page.locator("[data-recovery-compare]").click()
    page.locator("[data-recovery-restore]").first.click(); confirm_dialog(page)
    assertions["restore_with_undo"] = page.locator("[data-recovery-undo]").is_visible()
    page.locator("[data-recovery-undo]").click()
    page.locator("[data-recovery-delete]").first.click(); confirm_dialog(page)
    assertions["deletion_pending"] = page.locator("body").get_attribute("data-pending-deletion") == "true"
    page.locator("[data-recovery-undo]").click()
    assertions["deletion_undo"] = page.locator("body").get_attribute("data-pending-deletion") == "false"

    page.locator('[data-view-target="billing"]').click()
    page.locator('[data-plan="action"]').click()
    page.locator('[data-billing-state="restricted"]').click()
    assertions["billing_preview"] = (
        page.locator("body").get_attribute("data-selected-plan") == "action"
        and page.locator("body").get_attribute("data-billing-state") == "restricted"
        and "no charge" in page.locator("[data-billing-banner]").inner_text().lower()
    )
    page.locator("[data-checkout-preview]").click(); confirm_dialog(page)

    page.locator('[data-view-target="outcomes"]').click()
    page.locator('[data-outcome-filter="assisted"]').click()
    assertions["outcome_filter"] = page.locator('[data-outcome-row="assisted"]').is_visible() and not page.locator('[data-outcome-row="direct"]').is_visible()
    page.locator('[data-outcome-open="assisted"]').click()
    assertions["outcome_evidence"] = (
        "confidence" in page.locator("[data-dialog-details]").inner_text().lower()
        and "separately" in page.locator("[data-dialog-details]").inner_text().lower()
    )
    confirm_dialog(page)
    proof_name, proof = download_json(page, "[data-proof-export]")
    assertions["proof_download"] = (
        proof_name == f"ara-{suite}-synthetic-proof.json"
        and proof.get("suite") == suite
        and proof.get("boundary", {}).get("production") is False
        and proof.get("organisation", {}).get("fictional") is True
    )

    page.locator('[data-view-target="audit"]').click()
    audit_name, audit = download_json(page, "[data-audit-export]")
    assertions["audit_download"] = (
        audit_name == f"ara-{suite}-synthetic-audit.json"
        and audit.get("boundary", {}).get("production") is False
        and len(audit.get("events", [])) >= 14
        and all(set(event) == {"id", "event", "label", "timestamp", "externalEffect"} for event in audit.get("events", []))
    )
    assertions["audit_live"] = int(page.locator("[data-audit-count]").first.inner_text()) >= 14

    page.reload(wait_until="networkidle")
    assertions["state_persists"] = (
        page.locator("body").get_attribute("data-selected-plan") == "action"
        and page.locator("body").get_attribute("data-billing-state") == "restricted"
        and page.locator("body").get_attribute("data-action-state") == "accepted_for_demo_queue"
    )
    page.locator("[data-reset-demo]").click(); confirm_dialog(page)
    assertions["reset_restores_defaults"] = (
        page.locator("body").get_attribute("data-current-view") == "overview"
        and page.locator("body").get_attribute("data-action-state") == "not_prepared"
        and page.locator("body").get_attribute("data-selected-plan") == "proof"
        and page.locator("body").get_attribute("data-billing-state") == "active"
    )
    if profile["capabilities"]["mobileCommandDock"] and width <= 760:
        page.wait_for_timeout(420)
        page.evaluate(
            """() => {
              document.documentElement.style.scrollBehavior = 'auto';
              window.scrollTo(0, document.documentElement.scrollHeight);
            }"""
        )
        page.wait_for_timeout(80)
        assertions["bottom_dock_clearance"] = page.evaluate(
            """() => {
              const last = document.querySelector('[data-view="overview"] .workspace-boundary');
              const dock = document.querySelector('.command-rail');
              return Boolean(last && dock && last.getBoundingClientRect().bottom <= innerHeight - dock.getBoundingClientRect().height + 1);
            }"""
        )
        page.evaluate("window.scrollTo(0, 0)")

    assertions["final_no_horizontal_overflow"] = page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    assertions["console_clean"] = not console_errors
    assertions["page_errors_clean"] = not page_errors
    assertions["requests_clean"] = not failed_requests

    label = f"{suite}-product-{width}x{height}{'-reduced' if reduced else ''}"
    page.locator("[data-toast]").evaluate("el => el.classList.remove('is-visible')")
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(80)
    page.screenshot(path=str(OUTPUT / f"{label}-overview.png"), full_page=False)
    if width >= 1000 and not reduced:
        for view in ("diagnostic", "truth", "actions", "outcomes", "team", "recovery", "billing"):
            page.locator(f'[data-view-target="{view}"]').click()
            page.wait_for_timeout(420)
            page.screenshot(path=str(OUTPUT / f"{label}-{view}.png"), full_page=False)
        page.locator('[data-view-target="overview"]').click()

    return {
        "label": label,
        "metrics": metrics,
        "assertions": assertions,
        "console_errors": console_errors,
        "page_errors": page_errors,
        "failed_requests": failed_requests,
        "passed": all(assertions.values()),
    }


def fallback_font_check(browser: Any, profile: dict[str, Any]) -> dict[str, Any]:
    suite = profile["slug"]
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.goto(f"{BASE_URL}/{profile['workspace']}", wait_until="networkidle")
    page.add_style_tag(content="html body * { font-family: Arial, sans-serif !important; }")
    page.wait_for_timeout(80)
    checks = {
        "fallback_applied": "Arial" in page.locator("h1").evaluate("el => getComputedStyle(el).fontFamily"),
        "no_horizontal_overflow": page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),
        "navigation_visible": page.locator("[data-product-nav]").is_visible(),
        "active_view_visible": page.locator('[data-view="overview"]').is_visible(),
    }
    page.screenshot(path=str(OUTPUT / f"{suite}-product-390x844-fallback.png"), full_page=False)
    context.close()
    return {"label": f"{suite}-product-390x844-fallback", "assertions": checks, "passed": all(checks.values())}


def storage_namespace_check(browser: Any) -> dict[str, Any]:
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    defaults_isolated = True
    for index, profile in enumerate(READY_SUITES):
        page.goto(f"{BASE_URL}/{profile['workspace']}", wait_until="networkidle")
        defaults_isolated = defaults_isolated and page.locator("body").get_attribute("data-selected-plan") == "proof"
        if index == 0:
            page.locator('[data-view-target="billing"]').click()
            page.locator('[data-plan="action"]').click()
    first = READY_SUITES[0]
    page.goto(f"{BASE_URL}/{first['workspace']}", wait_until="networkidle")
    first_persisted = page.locator("body").get_attribute("data-selected-plan") == "action"
    keys = page.evaluate("Object.keys(localStorage).filter(key => key.startsWith('ara-showcase-product:')).sort()")
    expected_keys = sorted(f"ara-showcase-product:{profile['slug']}:v1" for profile in READY_SUITES)
    context.close()
    checks = {
        "every_other_suite_stayed_default": defaults_isolated,
        "first_suite_retained_own_state": first_persisted,
        "separate_storage_keys": keys == expected_keys,
    }
    return {"label": "cross-suite-storage-isolation", "assertions": checks, "passed": all(checks.values())}


def main() -> None:
    results: list[dict[str, Any]] = []
    with sync_playwright() as playwright:
        launch: dict[str, Any] = {"headless": True}
        if CHROME.exists():
            launch["executable_path"] = str(CHROME)
        browser = playwright.chromium.launch(**launch)
        try:
            for profile, width, height, reduced in CONFIGS:
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    reduced_motion="reduce" if reduced else "no-preference",
                    color_scheme=profile["colorScheme"],
                    accept_downloads=True,
                )
                results.append(check_product(context.new_page(), profile, width, height, reduced))
                context.close()
            results.extend(fallback_font_check(browser, profile) for profile in READY_SUITES)
            results.append(storage_namespace_check(browser))
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
