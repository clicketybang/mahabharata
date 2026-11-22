"""Mobile performance check (Sprint 2, D3: measure first).

Emulates a mid-range phone (390x844, 4x CPU slowdown) in Chrome and, for each built scene:
- scrolls through the whole scene in small steps, recording frame times and long tasks;
- taps the progress dots and opens the maps, recording interaction latency (Event Timing API).
Usage: npm run build && python3 tests/perf/perf_check.py [--json out.json]
"""
import http.server, socketserver, threading, functools, sys, os, json, statistics
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "dist")
PORT = 4331
OUT = sys.argv[sys.argv.index("--json") + 1] if "--json" in sys.argv else None


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

INSTRUMENT = """
window.__perf = { frames: [], long: [], events: [] };
(function loop(last){ requestAnimationFrame(t => { if (last) __perf.frames.push(t - last); loop(t); }); })();
new PerformanceObserver(l => l.getEntries().forEach(e => __perf.long.push(e.duration))).observe({ type: 'longtask', buffered: true });
new PerformanceObserver(l => l.getEntries().forEach(e => __perf.events.push({ name: e.name, d: e.duration }))).observe({ type: 'event', durationThreshold: 16, buffered: true });
"""

results = {}
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    cdp = ctx.new_cdp_session(page)
    page.goto(f"http://127.0.0.1:{PORT}/")
    page.evaluate("localStorage.setItem('m6.consent','true'); localStorage.setItem('m5.coached','true')")
    for scene in ["dice-hall", "day-17"]:
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 1})
        page.goto(f"http://127.0.0.1:{PORT}/#{scene}")
        page.reload()
        page.wait_for_selector("#scrolly")
        page.wait_for_timeout(500)
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        page.evaluate(INSTRUMENT)
        page.wait_for_timeout(300)
        page.evaluate("window.__perf.frames = []")
        # scroll the whole scene: ~120 steps, like a slow finger
        h = page.evaluate("(() => { const s = document.querySelector('#scrolly'); return { top: s.offsetTop, len: s.offsetHeight - innerHeight }; })()")
        for i in range(121):
            page.mouse.wheel(0, 0)
            page.evaluate(f"scrollTo(0, {h['top'] + h['len'] * i / 120})")
            page.wait_for_timeout(33)
        page.wait_for_timeout(300)
        # interactions: tap 3 progress dots, open + close maps
        for b in [1, 3, 5]:
            page.click(f".prog i[data-beat='{b}']")
            page.wait_for_timeout(250)
        page.click("#mapBtn"); page.wait_for_timeout(600)
        page.click("#mapClose"); page.wait_for_timeout(300)
        p = page.evaluate("window.__perf")
        frames = [f for f in p["frames"] if f > 0]
        ev = [e["d"] for e in p["events"]]
        r = {
            "frames": len(frames),
            "frame_median_ms": round(statistics.median(frames), 1) if frames else None,
            "frame_p95_ms": round(sorted(frames)[int(len(frames) * .95) - 1], 1) if frames else None,
            "janky_frames_pct": round(100 * sum(f > 50 for f in frames) / max(1, len(frames)), 1),
            "long_tasks": len(p["long"]),
            "long_task_max_ms": round(max(p["long"]), 0) if p["long"] else 0,
            "interaction_max_ms": round(max(ev), 0) if ev else 0,
            "svg_nodes": page.evaluate("document.querySelectorAll('#world *').length"),
        }
        results[scene] = r
        print(scene, json.dumps(r))
    browser.close()
httpd.shutdown()
if OUT:
    json.dump(results, open(OUT, "w"), indent=2)
