"""Accessibility audit (Sprint 2): runs axe-core (WCAG 2.2 A/AA rules) on every reader state.

States: home, gate, built scene, drafted scene, each map tab, character story, sources drawer.
Fails on any serious or critical violation. Usage: npm run build && python3 tests/a11y/axe_check.py [--json out.json]
"""
import http.server, socketserver, threading, functools, sys, os, json
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, "..", "..", "dist")
AXE = open(os.path.join(HERE, "..", "..", "node_modules", "axe-core", "axe.min.js")).read()
PORT = 4332
OUT = sys.argv[sys.argv.index("--json") + 1] if "--json" in sys.argv else None


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

report, bad = {}, 0


def audit(page, state, include=None):
    global bad
    page.wait_for_timeout(1100)  # let the unroll animation finish
    page.add_script_tag(content=AXE)
    res = page.evaluate("""inc => axe.run(inc ? { include: [inc] } : document, {
        runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] } })""", include)
    v = [{"id": x["id"], "impact": x["impact"], "nodes": len(x["nodes"]), "help": x["help"],
          "sample": x["nodes"][0]["target"] if x["nodes"] else None} for x in res["violations"]]
    report[state] = v
    serious = [x for x in v if x["impact"] in ("serious", "critical")]
    bad += len(serious)
    print(f"{state:16} {len(v)} violations ({len(serious)} serious/critical)")
    for x in v:
        print(f"   - [{x['impact']}] {x['id']} ×{x['nodes']}: {x['help']}  e.g. {x['sample']}")


with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    page = b.new_page(viewport={"width": 1280, "height": 800})
    base = f"http://127.0.0.1:{PORT}/"
    page.goto(base); audit(page, "home")
    page.click("[data-go='dice-hall']"); audit(page, "gate")
    page.click("#gateYes"); audit(page, "built-scene")
    page.evaluate("document.querySelector('.choices').scrollIntoView()"); audit(page, "built-choices")
    page.click("[data-src='dice-hall']"); audit(page, "sources-drawer", "#drawer"); page.keyboard.press("Escape")
    page.goto(base + "#exile"); page.reload(); audit(page, "drafted-scene")
    page.click(".scene-head .med[data-soul='draupadi']"); audit(page, "character-story", "#soul"); page.keyboard.press("Escape")
    page.click("#mapBtn")
    for tab in ["kala", "desha", "patra", "marga", "smriti"]:
        page.click(f".mtab[data-t='{tab}']"); audit(page, f"map-{tab}", "#maps")
    b.close()
httpd.shutdown()
if OUT:
    json.dump(report, open(OUT, "w"), indent=2)
print(f"\n{bad} serious/critical violations")
sys.exit(1 if bad else 0)
