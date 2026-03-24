#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

from playwright.sync_api import Error, Page, sync_playwright


VIEWPORTS = [
    {"name": "desktop", "width": 1440, "height": 1100},
    {"name": "mobile", "width": 393, "height": 852},
]

PAGES = [
    {"name": "overview", "tab": "项目概况", "wait_for": "项目概况"},
    {"name": "settings", "tab": "经营设置", "wait_for": "经营设置"},
    {"name": "analysis", "tab": "敏感度分析", "wait_for": "敏感度分析"},
    {"name": "analysis-glossary", "tab": "敏感度分析", "wait_for": "术语解释", "open_glossary": True},
]


def wait_for_shell(page: Page) -> None:
    page.wait_for_load_state("domcontentloaded")
    page.locator(".rilo-app-shell").wait_for(state="visible")
    page.locator(".rilo-app-nav").wait_for(state="visible")


def open_tab(page: Page, label: str) -> None:
    button = page.locator(".rilo-app-nav button").filter(has_text=label).first
    button.wait_for(state="visible")
    button.click()


def capture_state(page: Page, output_path: Path, page_name: str) -> None:
    if page_name == "analysis-glossary":
        page.evaluate("window.RiloUI && window.RiloUI.openDefinitionsDrawer && window.RiloUI.openDefinitionsDrawer(null, 'glossary')")
        page.get_by_role("dialog", name="计算面板").wait_for(state="visible")

    page.screenshot(path=str(output_path), full_page=True)


def collect(url: str, output_dir: Path, browser_name: str) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    summary = {"url": url, "browser": browser_name, "viewports": VIEWPORTS, "pages": [item["name"] for item in PAGES], "console": []}

    with sync_playwright() as playwright:
        browser_launcher = getattr(playwright, browser_name)
        browser = browser_launcher.launch()

        for viewport in VIEWPORTS:
            viewport_dir = output_dir / viewport["name"]
            viewport_dir.mkdir(parents=True, exist_ok=True)

            context = browser.new_context(viewport={"width": viewport["width"], "height": viewport["height"]})
            page = context.new_page()

            def on_console(message, viewport_name=viewport["name"]):
                entry = {
                    "viewport": viewport_name,
                    "type": message.type,
                    "text": message.text,
                    "location": message.location,
                }
                summary["console"].append(entry)

            def on_page_error(error, viewport_name=viewport["name"]):
                summary["console"].append({
                    "viewport": viewport_name,
                    "type": "pageerror",
                    "text": str(error),
                })

            page.on("console", on_console)
            page.on("pageerror", on_page_error)

            page.goto(url, wait_until="domcontentloaded")
            wait_for_shell(page)

            for item in PAGES:
                page.goto(url, wait_until="domcontentloaded")
                wait_for_shell(page)
                open_tab(page, item["tab"])
                page.get_by_text(item["wait_for"], exact=False).first.wait_for(state="visible")
                capture_state(page, viewport_dir / f"{item['name']}.png", item["name"])

            context.close()

        browser.close()

    console_path = output_dir / "console.json"
    console_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Capture deterministic visual acceptance screenshots for Rilo Analysis.")
    parser.add_argument("--url", default="http://127.0.0.1:4173/index.html", help="Preview URL to capture.")
    parser.add_argument("--output", default="tmp/visual-acceptance/latest", help="Output directory for screenshots and console log.")
    parser.add_argument("--browser", default="chromium", choices=["chromium", "firefox", "webkit"], help="Browser engine.")
    args = parser.parse_args()

    output_dir = Path(args.output)

    try:
        collect(args.url, output_dir, args.browser)
    except Error as error:
        print(f"visual acceptance failed: {error}")
        return 1

    print(f"visual acceptance saved to {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
