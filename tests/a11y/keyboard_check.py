"""Keyboard and reduce-motion walk-through (Sprint 2, tasks 3–4).

Drives the reader with the keyboard only: gate → scene → portraits → beats → jumps → choices → maps →
info strip → bookmark modal, checking where focus lands and that it returns when overlays close.
Then checks the device "reduce motion" setting holds the camera still within a beat.
Usage: npm run build && python3 tests/a11y/keyboard_check.py
"""
import http.server, socketserver, threading, functools, sys, os
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "dist")
PORT = 4333
results, errors = [], []


def check(name, ok, detail=""):
    results.append(bool(ok))
    print(("PASS " if ok else "FAIL ") + name + (f" — {detail}" if detail else ""))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{PORT}/"

ACTIVE = """(() => { const a = document.activeElement; if (!a) return '';
  return (a.id ? '#' + a.id + ' ' : '') + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 60); })()"""


def active(page):
    return page.evaluate(ACTIVE)


def tab_to(page, predicate_js, limit=80, shift=False):
    """press Tab until document.activeElement matches predicate_js; returns True if found"""
    for _ in range(limit):
        page.keyboard.press("Shift+Tab" if shift else "Tab")
        if page.evaluate(f"(() => {{ const a = document.activeElement; return !!a && ({predicate_js}); }})()"):
            return True
    return False


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(BASE); page.wait_for_selector(".home h1"); page.wait_for_timeout(300)

    # gate
    check("Tab reaches 'Begin at the Dice Hall'", tab_to(page, "a.dataset.go === 'dice-hall'"))
    page.keyboard.press("Enter"); page.wait_for_timeout(200)
    check("Enter opens the 21+ gate with focus on 'I am 21+'", page.is_visible("#gate.on") and "#gateYes" in active(page), active(page))
    page.keyboard.press("Tab"); page.keyboard.press("Tab"); page.keyboard.press("Tab")
    check("Tab stays inside the gate", page.evaluate("document.querySelector('#gate').contains(document.activeElement)"))
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    check("Esc on the gate = 'Not now'; focus returns to the button", not page.is_visible("#gate.on") and "Begin at the Dice Hall" in active(page), active(page))
    page.keyboard.press("Enter"); page.wait_for_timeout(200)
    page.focus("#gateYes"); page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check("Entering a scene moves focus to its title", active(page).startswith("The Game of Dice"), active(page))

    # portraits → character story → back
    check("Tab reaches a header portrait", tab_to(page, "a.matches('.scene-head .med[data-soul]')"))
    who = page.evaluate("document.activeElement.dataset.soul")
    page.keyboard.press("Enter"); page.wait_for_timeout(300)
    check("Enter on a portrait opens that person's story, focus inside", page.is_visible("#soul.on") and page.evaluate("document.querySelector('#soul').contains(document.activeElement)"))
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    check("Esc closes the story; focus returns to the same portrait", not page.is_visible("#soul.on") and page.evaluate("document.activeElement.dataset.soul") == who)

    # beats via progress dots
    check("Tab reaches the progress dots", tab_to(page, "a.matches('.prog i')"))
    page.keyboard.press("Tab"); page.keyboard.press("Tab"); page.keyboard.press("Tab")
    page.keyboard.press("Enter"); page.wait_for_timeout(500)
    on = page.inner_text(".cap.on b")
    check("Enter on the 4th dot shows the 4th beat", on == "Draupadī’s Question", on)
    hidden_links = page.evaluate("[...document.querySelectorAll('.cap:not(.on) a.jump')].filter(a => getComputedStyle(a).visibility !== 'hidden').length")
    check("Links in hidden beats are out of the tab order", hidden_links == 0, f"{hidden_links} reachable")

    # memory jump via keyboard, then return
    page.evaluate("(() => { const s=document.querySelector('#scrolly'); scrollTo(0, s.offsetTop + .72*(s.offsetHeight-innerHeight) + 2); })()"); page.wait_for_timeout(500)
    page.focus(".cap.on a.jump"); page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check("Enter on a memory link opens it, focus on its title", active(page).startswith("The Brahmin’s Curse"), active(page))
    page.focus("#crumbs .ret"); page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check("Return button works from the keyboard", page.inner_text(".scene-head h1") == "The Game of Dice")

    # choices
    page.evaluate("document.querySelector('.choices').scrollIntoView()")
    page.focus(".choice[data-choose='1']"); page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check("Enter on a choice follows it; focus on the new title", active(page).startswith("Jackals at the Fire"), active(page))

    # maps
    page.focus("#mapBtn"); page.keyboard.press("Enter"); page.wait_for_timeout(500)
    check("Maps open with focus on the active tab", page.is_visible("#maps.on") and "KĀLA" in active(page), active(page))
    page.keyboard.press("ArrowRight"); page.wait_for_timeout(300)
    check("Arrow keys move between map tabs", page.evaluate("document.querySelector('.mtab.on').dataset.t") == "desha" and "DEŚA" in active(page))
    check("Tab from the tabs reaches the Deśa map (after Close)", tab_to(page, "a.id === 'desha'", limit=4), active(page))
    check("Tab reaches a place on the Deśa map", tab_to(page, "a.matches('.dplace')"))
    page.keyboard.press("Enter"); page.wait_for_timeout(300)
    check("Enter on a place opens its info strip", page.is_visible("#info.on"))
    page.focus(".mtab.on"); page.keyboard.press("ArrowLeft"); page.wait_for_timeout(300)
    check("Tab reaches a moment on the Kāla chart", tab_to(page, "a.matches('.knode')"))
    page.keyboard.press("Enter"); page.wait_for_timeout(300)
    check("Enter on a moment opens the info strip, focus on its action", page.is_visible("#info.on") and page.evaluate("document.querySelector('#info').contains(document.activeElement)"), active(page))
    check("Kāla has a text version for screen readers", "Kāla, the river of time, as a list" in page.inner_text("#kalaText") if page.query_selector("#kalaText") else False)
    page.keyboard.press("Escape"); page.wait_for_timeout(300)
    check("Esc closes the maps; focus returns to the Maps button", not page.is_visible("#maps.on") and "#mapBtn" in active(page), active(page))

    # bookmark modal
    page.focus("#bmBtn"); page.keyboard.press("Enter"); page.wait_for_timeout(300)
    check("Bookmark opens the note box with focus in it", "#mText" in active(page), active(page))
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    check("Esc closes the note box; focus returns to Bookmark", "#bmBtn" in active(page), active(page))

    # visible focus ring on a map-style control
    ring = page.evaluate("getComputedStyle(document.querySelector('#bmBtn')).outlineStyle")
    check("Focused controls show a visible outline", ring != "none", ring)
    ctx.close()

    # reduce motion
    ctx = browser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
    page = ctx.new_page()
    page.goto(BASE); page.evaluate("localStorage.setItem('m6.consent','true'); localStorage.setItem('m5.coached','true')")
    page.goto(BASE + "#dice-hall"); page.reload(); page.wait_for_selector("#scrolly")
    def cam_at(p):
        page.evaluate(f"(() => {{ const s=document.querySelector('#scrolly'); scrollTo(0, s.offsetTop + {p}*(s.offsetHeight-innerHeight) + 2); }})()")
        page.wait_for_timeout(300)
        return page.get_attribute("#cam", "transform")
    a, b, c = cam_at(.16), cam_at(.30), cam_at(.45)
    check("Reduce motion: camera holds still within a beat", a == b)
    check("Reduce motion: camera changes between beats", b != c)
    check("Reduce motion: beats cross-fade", "fade" in (page.get_attribute("#world", "class") or ""))
    anim = page.evaluate("getComputedStyle(document.querySelector('.page.on')).animationName")
    check("Reduce motion: the page 'unroll' animation is off", anim == "none", anim)
    ctx.close()

    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    page = ctx.new_page()
    page.goto(BASE); page.evaluate("localStorage.setItem('m6.consent','true')")
    page.goto(BASE + "#dice-hall"); page.reload(); page.wait_for_selector("#scrolly")
    a, b = cam_at(.16), cam_at(.30)
    check("Full motion (default): camera moves within a beat", a != b)
    browser.close()

httpd.shutdown()
for e in errors:
    print("ERROR " + e)
print(f"\n{sum(results)}/{len(results)} checks passed, {len(errors)} page errors"); [print("  page error:", e[:300]) for e in errors]
sys.exit(0 if all(results) and not errors else 1)
