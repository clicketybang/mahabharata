"""Parity walk-through for the reader (Sprint 1 acceptance checklist).

Serves ./dist, drives Chrome through the v6 behaviours and fails on any mismatch or console error.
Usage:  npm run build && python3 tests/parity/parity_check.py [--shots DIR]
"""
import http.server, socketserver, threading, functools, sys, os, json
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "dist")
SHOTS = sys.argv[sys.argv.index("--shots") + 1] if "--shots" in sys.argv else None
PORT = 4329
results, errors = [], []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f" — {detail}" if detail else ""))


def shot(page, name):
    if SHOTS:
        os.makedirs(SHOTS, exist_ok=True)
        page.screenshot(path=os.path.join(SHOTS, name + ".png"))


MOMENTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "content", "moments")

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def scroll_scene_to(page, p):
    page.evaluate("""p => { const s=document.querySelector('#scrolly'); scrollTo(0, s.offsetTop + p*(s.offsetHeight-innerHeight) + 2); }""", p)
    page.wait_for_timeout(250)


def run(viewport, label):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        ctx = browser.new_context(viewport=viewport)
        page = ctx.new_page()
        page.on("console", lambda m: m.type == "error" and errors.append(f"[{label}] console: {m.text}"))
        page.on("pageerror", lambda e: errors.append(f"[{label}] pageerror: {e}"))
        page.goto(f"http://127.0.0.1:{PORT}/")
        page.wait_for_selector(".home h1")
        check(f"{label}: home renders with title and Kalamkari subtitle", page.inner_text(".home .sub") == "painted in the Kalamkari of Srikalahasti")
        check(f"{label}: no theme switcher in the page", page.query_selector("#themeBtn") is None and page.query_selector("#themeMenu") is None)
        shot(page, f"{label}-01-home")

        # 21+ gate, shown once
        page.click("[data-go='dice-hall']")
        check(f"{label}: 21+ gate appears before entering a scene", page.is_visible("#gate.on"))
        shot(page, f"{label}-02-gate")
        page.click("#gateYes")
        page.wait_for_selector(".scene-head h1")
        check(f"{label}: gate admits to the dice hall", page.inner_text(".scene-head h1") == "The Game of Dice")
        check(f"{label}: gate consent remembered", page.evaluate("localStorage.getItem('m6.consent')") == "true")

        # captions + who is speaking + portraits
        caps = page.query_selector_all(".cap")
        check(f"{label}: dice hall has 6 beats", len(caps) == 6, f"found {len(caps)}")
        check(f"{label}: 'who is speaking' chip present", "Vaiśampāyana tells Janamejaya" in page.inner_text(".cap .who"))
        check(f"{label}: header portraits = cast of 14", len(page.query_selector_all(".scene-head .med")) == 14)
        scroll_scene_to(page, 0.55)
        on = page.query_selector(".cap.on b")
        check(f"{label}: scrolling to 0.55 shows 'Draupadī’s Question'", on and on.inner_text() == "Draupadī’s Question", on.inner_text() if on else "none")
        shot(page, f"{label}-03-dice-mid")
        scroll_scene_to(page, 0.72)
        check(f"{label}: memory link tagged ↺", "↺ memory" in page.inner_text(".cap.on"))

        # memory jump + return stack + scroll restore
        y_before = page.evaluate("scrollY")
        page.click(".cap.on a.jump[data-to='karna-curse']")
        page.wait_for_timeout(300)
        check(f"{label}: jump opens the curse (drafted page)", page.inner_text(".scene-head h1") == "The Brahmin’s Curse")
        check(f"{label}: threshold ribbon says memory", "stepped into a memory" in page.inner_text(".thr-ribbon"))
        check(f"{label}: breadcrumb return bar visible", page.is_visible("#crumbs.on"))
        shot(page, f"{label}-04-memory")
        page.click("#crumbs .ret")
        page.wait_for_timeout(400)
        y_after = page.evaluate("scrollY")
        check(f"{label}: return restores the dice hall and scroll position", page.inner_text(".scene-head h1") == "The Game of Dice" and abs(y_after - y_before) < 4, f"{y_before} → {y_after}")

        # generated choices
        page.evaluate("document.querySelector('.choices').scrollIntoView()")
        page.wait_for_timeout(200)
        titles = [e.inner_text() for e in page.query_selector_all(".choice h3")]
        check(f"{label}: dice hall choices generated forward in time", titles == ["The Blind King’s Boons", "Jackals at the Fire", "The Blind King’s Boons", "Into the Forest"], json.dumps(titles, ensure_ascii=False))
        shot(page, f"{label}-05-choices")
        page.click(".choice[data-choose='1']")
        page.wait_for_timeout(300)
        check(f"{label}: choosing 'Go to Inner Palace' opens the omens", page.inner_text(".scene-head h1") == "Jackals at the Fire")
        check(f"{label}: inline path note offered", page.is_visible(".pathnote"))
        page.fill("#pnInput", "to hear the omens")
        page.click("#pnSave")

        # Sprint 4: every moment is drafted, so no destination is disabled any more
        page.goto(f"http://127.0.0.1:{PORT}/#kcamp-night")
        page.reload(); page.wait_for_selector(".scene-head h1")
        dis = page.query_selector_all(".choice[disabled]")
        check(f"{label}: no destination is 'not yet painted' once the spine is drafted", len(dis) == 0 and len(page.query_selector_all(".choice")) >= 2)

        # Day 17 omen/anchor jump into the dice hall vow
        page.goto(f"http://127.0.0.1:{PORT}/#day-17"); page.reload(); page.wait_for_selector("#scrolly")
        check(f"{label}: day label shown", page.inner_text(".daylabel") == "Day 17 of 18")
        scroll_scene_to(page, 0.5)
        page.click(".cap.on a.jump[data-to='dice-hall']")
        page.wait_for_timeout(400)
        on = page.query_selector(".cap.on b")
        check(f"{label}: anchor jump lands on Bhīma’s Vow", on and on.inner_text() == "Bhīma’s Vow", on.inner_text() if on else "none")
        shot(page, f"{label}-06-anchor")

        # portraits open a character's story with "you are here"
        page.click(".scene-head .med[data-soul='karna']")
        page.wait_for_selector("#soul.on")
        here = page.query_selector(".smo.here")
        check(f"{label}: Karṇa's story opens with 'you are here' on the dice hall", here and "The Game of Dice" in here.inner_text())
        shot(page, f"{label}-07-soul")
        page.click("#soulClose")

        # sources drawer
        page.click("[data-src='dice-hall']")
        page.wait_for_selector("#drawer.on")
        check(f"{label}: sources drawer shows CE ref marked unverified", "Sabhā Parva 2.43–2.65" in page.inner_text("#drawer") and page.is_visible("#drawer .unv"))
        page.click("#drawerClose")

        # bookmark persists across reload
        scroll_scene_to(page, 0.55)
        page.click("#bmBtn"); page.fill("#mText", "the unanswered question"); page.click("#mOk")
        page.reload(); page.wait_for_selector(".scene-head h1")

        # maps
        page.click("#mapBtn"); page.wait_for_selector("#maps.on")
        for tab in ["kala", "desha", "patra", "marga", "smriti"]:
            page.click(f".mtab[data-t='{tab}']"); page.wait_for_timeout(250)
            filled = page.evaluate(f"document.getElementById('{tab}').innerHTML.length")
            check(f"{label}: map tab {tab} renders", filled > 50)
            shot(page, f"{label}-08-map-{tab}")
        check(f"{label}: bookmark survived reload", "the unanswered question" in page.inner_text("#smriti"))
        page.click(".mtab[data-t='marga']"); page.wait_for_timeout(200)
        check(f"{label}: path note survived reload", "to hear the omens" in page.inner_text("#marga"))
        page.click(".mtab[data-t='kala']"); page.wait_for_timeout(200)
        n_assembly = sum("\nassembly: true" in open(os.path.join(MOMENTS, f)).read() for f in os.listdir(MOMENTS))
        check(f"{label}: Kāla marks assembly moments (✦)", page.evaluate("document.querySelectorAll('#kalaSvg .knode path[d^=\"M0 -9\"]').length") == n_assembly, f"expected {n_assembly}")
        browser.close()


httpd = serve()
try:
    run({"width": 1280, "height": 800}, "desktop")
    run({"width": 390, "height": 844}, "mobile")
finally:
    httpd.shutdown()

for e in errors:
    print("ERROR " + e)
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} checks passed, {len(errors)} console errors")
sys.exit(1 if failed or errors else 0)
