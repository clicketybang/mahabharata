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
    $("#maps").classList.remove("on"); $("#soul").classList.remove("on");
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
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { $("#drawer").classList.remove("on"); $("#soul").classList.remove("on"); $("#maps").classList.remove("on"); }
  });

  $("#brand").onclick = () => go("home");
  $("#mOk").onclick = () => closeModal(true);
  $("#mCancel").onclick = () => closeModal(false);
  $("#bmBtn").onclick = bookmark;
  $("#mapBtn").onclick = () => openMaps();
  $("#mapClose").onclick = () => $("#maps").classList.remove("on");
  $$(".mtab").forEach(b => b.onclick = () => {
    ui.mapTab = b.dataset.t as MapTab;
    if (ui.mapTab !== "kala") { ui.kalaHL = null; ui.kalaPlace = null; }
    renderMaps();
  });
  $("#gateYes").onclick = () => {
    store.set("m6.consent", true); $("#gate").classList.remove("on");
    if (ui.pendingGo) { const [i, o] = ui.pendingGo; ui.pendingGo = null; go(i, o); }
  };
  $("#gateNo").onclick = () => { $("#gate").classList.remove("on"); ui.pendingGo = null; };

  applyKalamkari();
  const h = location.hash.slice(1);
  go(h && story.scenes[h] ? h : "home");
}
