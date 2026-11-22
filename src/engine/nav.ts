/* Navigation: going to a moment (with the 21+ gate), the breadcrumb return stack, per-scene wiring. */
import { story, progress, ui, store, type GoOptions } from "./state";
import { renderHome, renderScene, decorateJumps } from "./pages";
import { frame, scrollToP } from "./camera";
import { openOverlay } from "./focus";
import { iconReturn } from "../art/icons";
import { $, $$, $opt } from "./util";

export function go(id: string, opts: GoOptions = {}): void {
  if (!story.scenes[id] && id !== "home") id = "home";
  if (id !== "home" && !store.get("m6.consent", false)) {
    ui.pendingGo = [id, opts]; openOverlay($("#gate"), "#gateYes");
    if (ui.current !== "home" || !$("#app").innerHTML) go("home");
    return;
  }
  ui.arrivedVia = opts.via || null; ui.current = id; ui.lastBeat = -1;
  $("#app").innerHTML = id === "home" ? renderHome() : renderScene(id);
  document.body.classList.toggle("threshold", !!ui.arrivedVia && ui.returnStack.length > 0);
  $("#bmBtn").style.display = id === "home" ? "none" : "flex";
  if (id !== "home") {
    progress.visited.add(id);
    if (progress.trail[progress.trail.length - 1] !== id) progress.trail.push(id);
    progress.save();
  }
  if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
  decorateJumps(); updateReturn(); wireScene();
  requestAnimationFrame(() => {
    // move focus to the new page's title so screen readers announce it (keyboard users start there)
    if (!document.querySelector("#gate.on")) $opt<HTMLElement>("#app h1")?.focus({ preventScroll: true });
    coach();
    if (opts.at != null) scrollToP(opts.at); else if (opts.y != null) scrollTo(0, opts.y); else scrollTo(0, 0);
    frame();
  });
}

export function updateReturn(): void {
  const b = $("#crumbs"), rs = ui.returnStack;
  if (!rs.length) { b.classList.remove("on"); return; }
  const short = (t: string) => t.split(" —")[0], st3 = rs.slice(-3), off = rs.length - st3.length;
  b.innerHTML = (off ? `<span class="c">…</span><span class="sep">›</span>` : "")
    + st3.map((r, i) => `<button class="c" data-crumb="${off + i}">${short(r.title)}</button><span class="sep">›</span>`).join("")
    + `<span class="c cur">${short(story.node[ui.current]?.title || "")}</span><button class="ret" data-crumb="${rs.length - 1}">${iconReturn} Return to ${short(rs.at(-1)!.title)}</button>`;
  b.classList.add("on");
}

function wireScene(): void {
  const sc = story.scenes[ui.current];
  $$(".prog i").forEach(d => {
    const go2 = () => { if (sc?.kind !== "built") return; const b = sc.beats[+(d.dataset.beat ?? 0)]; scrollToP((b.from + Math.min(b.to, 1)) / 2); };
    d.onclick = go2;
    d.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go2(); } };
  });
  const ps = $opt("#pnSave");
  if (ps) ps.onclick = () => {
    const last = progress.path.at(-1); if (!last) return;
    last.note = $<HTMLInputElement>("#pnInput").value.trim(); last.noted = true; progress.save();
    $(".pathnote").innerHTML = `<span>Noted in your path ✓</span>`;
  };
}

/** first-visit hint: "Tap a face to follow their story" */
function coach(): void {
  if (ui.current === "home" || store.get("m5.coached", false)) return;
  const m = $opt(".scene-head .med"); if (!m) return;
  const r = m.getBoundingClientRect(), c = document.createElement("div");
  c.className = "coach"; c.textContent = "Tap a face to follow their story";
  const a = $("#app").getBoundingClientRect();
  c.style.left = (r.left + r.width / 2 - a.left) + "px"; c.style.top = (r.top - a.top - 46) + "px"; c.style.transform = "translateX(-50%)";
  $("#app").appendChild(c);
  const done = () => { c.remove(); store.set("m5.coached", true); removeEventListener("scroll", done); };
  setTimeout(() => addEventListener("scroll", done, { once: true }), 400); setTimeout(done, 7000);
}
