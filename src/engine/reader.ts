/* The reader: boots the engine and wires global events.
   Modules: state · data · pages · camera · nav · overlays · maps/{index,kala,desha,panels} · badges · rule.
   All story data arrives from the content collections (see src/pages/index.astro). */
import { tiles } from "../art/tiles";
import { story, progress, ui, store } from "./state";
import { loadData, readBodies } from "./data";
import { SUB } from "./pages";
import { frame, sceneP, scrollToP, beatAt } from "./camera";
import { go } from "./nav";
import { choicesFor } from "./badges";
import { openSoul, openSources, ask, closeModal, toast } from "./overlays";
import { openMaps, renderMaps } from "./maps";
import { installKeyboard, closeOverlay, dismissOverlay } from "./focus";
import type { MapTab } from "./state";
import type { ReaderData } from "./types";
import { $, $$ } from "./util";

function applyKalamkari(): void {
  const [h, v, tex] = tiles(), r = document.documentElement.style;
  r.setProperty("--tile-h", `url("data:image/svg+xml,${encodeURIComponent(h)}")`);
  r.setProperty("--tile-v", `url("data:image/svg+xml,${encodeURIComponent(v)}")`);
  r.setProperty("--texture", tex);
  $("#themeName").textContent = SUB;
}

function onClick(e: MouseEvent): void {
  const t = e.target as Element;
  const so = t.closest<HTMLElement>("[data-soul]");
  if (so) { e.preventDefault(); e.stopPropagation(); openSoul(so.dataset.soul ?? "", ui.current); return; }
  const g = t.closest<HTMLElement>("[data-go]");
  if (g) {
    const fromOverlay = $("#maps").classList.contains("on") || $("#soul").classList.contains("on");
    dismissOverlay($("#maps")); dismissOverlay($("#soul"));
    const to = g.dataset.go ?? "home", cur = story.node[ui.current];
    if (fromOverlay && cur && to !== ui.current) ui.returnStack.push({ id: ui.current, y: scrollY, title: cur.title });
    go(to, fromOverlay && ui.returnStack.length ? { via: "index" } : {});
    return;
  }
  const m = t.closest<HTMLElement>("[data-map]");
  if (m) { openMaps(m.dataset.map); return; }
  const j = t.closest<HTMLAnchorElement>("a.jump");
  if (j) {
    e.preventDefault();
    ui.returnStack.push({ id: ui.current, y: scrollY, title: story.node[ui.current].title });
    const to = j.dataset.to ?? "", sc = story.scenes[to];
    const at = j.dataset.anchor && sc?.kind === "built" ? sc.anchors[j.dataset.anchor] : (j.dataset.at != null ? +j.dataset.at : null);
    const via = story.node[to].t < story.node[ui.returnStack.at(-1)!.id].t ? "memory" : "omen";
    go(to, { at, via });
    return;
  }
  const c = t.closest<HTMLButtonElement>("[data-choose]");
  if (c && !c.disabled) {
    const ch = choicesFor(ui.current)[+(c.dataset.choose ?? 0)];
    progress.path.push({ from: ui.current, to: ch.to.id, by: ch.by, ref: ch.ref, note: "", t: Date.now() });
    progress.save(); ui.returnStack = []; go(ch.to.id);
    return;
  }
  const src = t.closest<HTMLElement>("[data-src]");
  if (src) { openSources(src.dataset.src ?? ""); return; }
  const rc = t.closest<HTMLElement>("[data-capjump]");
  if (rc) { scrollToP(+(rc.dataset.capjump ?? 0)); return; }
  const cr = t.closest<HTMLElement>("[data-crumb]");
  if (cr) { const k = +(cr.dataset.crumb ?? 0), r = ui.returnStack[k]; ui.returnStack = ui.returnStack.slice(0, k); go(r.id, { y: r.y }); }
}

function bookmark(): void {
  const sc = story.scenes[ui.current], p = sceneP();
  const where = sc?.kind === "built" && p != null ? sc.beats[beatAt(p)].title : story.node[ui.current].title;
  ask(`Bookmark · ${where}`, "What do you want to remember about this moment?", note => {
    progress.marks.push({ id: ui.current, p: p ?? 0, where, note, t: Date.now() }); progress.save(); toast("Bookmarked");
  }, "Save");
}

let started = false;
export function startReader(data: ReaderData): void {
  if (started) return; started = true;
  loadData(data, readBodies());
  progress.load();

  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
  addEventListener("resize", frame);
  addEventListener("popstate", () => { const id = location.hash.slice(1) || "home"; if (id !== ui.current) go(id); });
  document.addEventListener("click", onClick);
  installKeyboard(() => $("#gateNo").click());

  // Sprint 2, D1: follow the device's "reduce motion" setting (no in-app toggle)
  const rm = matchMedia("(prefers-reduced-motion: reduce)");
  ui.reduced = rm.matches;
  rm.addEventListener("change", () => { ui.reduced = rm.matches; ui.lastBeat = -1; frame(); });

  $("#brand").onclick = () => go("home");
  $("#mOk").onclick = () => closeModal(true);
  $("#mCancel").onclick = () => closeModal(false);
  $("#bmBtn").onclick = bookmark;
  $("#mapBtn").onclick = () => openMaps();
  $("#mapClose").onclick = () => closeOverlay($("#maps"));
  const tabs = $$(".mtab");
  const pickTab = (b: HTMLElement) => {
    ui.mapTab = b.dataset.t as MapTab;
    if (ui.mapTab !== "kala") { ui.kalaHL = null; ui.kalaPlace = null; }
    renderMaps(); b.focus();
  };
  tabs.forEach((b, i) => {
    b.onclick = () => pickTab(b);
    b.onkeydown = e => { // arrow keys move between tabs (ARIA tabs pattern)
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); pickTab(tabs[(i + d + tabs.length) % tabs.length]); }
    };
  });
  $("#gateYes").onclick = () => {
    store.set("m6.consent", true); dismissOverlay($("#gate"));
    if (ui.pendingGo) { const [i, o] = ui.pendingGo; ui.pendingGo = null; go(i, o); }
  };
  $("#gateNo").onclick = () => { closeOverlay($("#gate")); ui.pendingGo = null; };

  applyKalamkari();
  const h = location.hash.slice(1);
  go(h && story.scenes[h] ? h : "home");
}
