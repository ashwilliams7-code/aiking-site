"""Validated suite registry shared by ARA showcase QA lanes."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

SHOWCASE_ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = SHOWCASE_ROOT / "suite-registry.json"
SLUG_PATTERN = re.compile(r"^[a-z][a-z0-9-]{0,31}$")
VIEWPORTS = (
    (1440, 900, False),
    (1280, 720, False),
    (390, 844, False),
    (320, 568, False),
    (390, 844, True),
)


def _selector_map(value: Any, field: str) -> dict[str, int]:
    assert isinstance(value, dict), f"{field} must be an object"
    result: dict[str, int] = {}
    for selector, count in value.items():
        assert isinstance(selector, str) and selector, f"{field} contains an invalid selector"
        assert isinstance(count, int) and count >= 1, f"{field}.{selector} must be a positive integer"
        result[selector] = count
    return result


def load_registry() -> dict[str, Any]:
    registry = json.loads(REGISTRY_PATH.read_text())
    assert registry.get("schemaVersion") == 1, "Unsupported suite registry schema"
    assert registry.get("productContract") == "v1", "Unsupported product contract"

    ready = registry.get("readySuites")
    reserved = registry.get("reservedDesignSlots")
    assert isinstance(ready, list) and len(ready) >= 2, "At least two review-ready suites are required"
    assert isinstance(reserved, list) and reserved, "At least one future design slot must remain reserved"

    slugs: list[str] = []
    for profile in ready:
        slug = profile.get("slug")
        assert isinstance(slug, str) and SLUG_PATTERN.fullmatch(slug), f"Invalid ready-suite slug: {slug!r}"
        slugs.append(slug)
        assert isinstance(profile.get("label"), str) and profile["label"].strip(), f"{slug} needs a label"
        assert profile.get("colorScheme") in {"dark", "light", "no-preference"}, f"{slug} color scheme"
        for route_field in ("landing", "workspace"):
            route = profile.get(route_field)
            assert isinstance(route, str) and route.endswith(".html"), f"{slug} {route_field} route"
            assert (SHOWCASE_ROOT / route).is_file(), f"Missing {slug} {route_field}: {route}"
        capabilities = profile.get("capabilities")
        assert isinstance(capabilities, dict), f"{slug} capabilities"
        assert isinstance(capabilities.get("kineticMotion"), bool), f"{slug} kineticMotion"
        assert isinstance(capabilities.get("mobileCommandDock"), bool), f"{slug} mobileCommandDock"
        identity = profile.get("identity")
        assert isinstance(identity, dict), f"{slug} identity"
        _selector_map(identity.get("landingRequired"), f"{slug}.landingRequired")
        _selector_map(identity.get("productRequired"), f"{slug}.productRequired")
        for field in ("landingForbidden", "productForbidden"):
            selectors = identity.get(field)
            assert isinstance(selectors, list), f"{slug}.{field} must be a list"
            assert all(isinstance(selector, str) and selector for selector in selectors), f"{slug}.{field} selectors"

    for slot in reserved:
        slug = slot.get("slug")
        assert isinstance(slug, str) and SLUG_PATTERN.fullmatch(slug), f"Invalid reserved slug: {slug!r}"
        slugs.append(slug)
        assert slot.get("status") == "reserved", f"{slug} must remain explicitly reserved"
        assert not slot.get("landing") and not slot.get("workspace"), f"{slug} cannot claim routes before implementation"
        assert isinstance(slot.get("rule"), str) and slot["rule"].strip(), f"{slug} needs an originality rule"

    assert len(slugs) == len(set(slugs)), "Suite and slot slugs must be unique"
    return registry


REGISTRY = load_registry()
READY_SUITES: tuple[dict[str, Any], ...] = tuple(REGISTRY["readySuites"])
RESERVED_SLOTS: tuple[dict[str, Any], ...] = tuple(REGISTRY["reservedDesignSlots"])
PROFILES_BY_SLUG = {profile["slug"]: profile for profile in READY_SUITES}
CONFIGS = tuple(
    (profile, width, height, reduced)
    for profile in READY_SUITES
    for width, height, reduced in VIEWPORTS
)


def selector_contract(page: Any, expected: dict[str, int], forbidden: list[str]) -> bool:
    return all(page.locator(selector).count() == count for selector, count in expected.items()) and all(
        page.locator(selector).count() == 0 for selector in forbidden
    )
