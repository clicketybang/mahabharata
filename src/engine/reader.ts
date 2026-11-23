/* The reader: boots the engine and wires global events.
   Modules: state · data · pages · camera · nav · overlays · maps/{index,kala,desha,panels} · badges · rule.
   All story data arrives from the content collections (see src/pages/index.astro). */
import { tiles, corners } from "../art/tiles";
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
  corners().forEach((c, i) => r.setProperty(`--corner-${["tl", "tr", "br", "bl"][i]}`, `url("data:image/svg+xml,${encodeURIComponent(c)}")`));
  $("#themeName").textContent = SUB;
}

/** names on hover and focus (owner, 2026-11-22): any element with data-tip shows a small label beside it */
function installTips(): void {
  const tip = document.createElement("div");
  tip.id = "tip"; tip.setAttribute("aria-hidden", "true"); document.body.appendChild(tip);
  let cur: Element | null = null;
  const show = (el: Element, x?: number, y?: number) => {
    const t = el.getAttribute("data-tip"); if (!t) return;
    cur = el; tip.textContent = t; tip.classList.add("on");
    const r = el.getBoundingClientRect(), px = x ?? r.left + r.width / 2, py = y ?? r.top;
    const w = tip.offsetWidth, left = Math.min(innerWidth - w - 6, Math.max(6, px - w / 2));
    tip.style.left = `${left}px`; tip.style.top = `${Math.max(6, py - tip.offsetHeight - 12)}px`;
  };
  const hide = () => { cur = null; tip.classList.remove("on"); };
  document.addEventListener("pointerover", e => { if (e.pointerType === "touch") return; const el = (e.target as Element).closest("[data-tip]"); if (el) show(el, e.clientX, e.clientY); else hide(); });
  document.addEventListener("pointermove", e => { if (cur && e.pointerType !== "touch") show(cur, e.clientX, e.clientY); });
  document.addEventListener("pointerleave", hide);
  document.addEventListener("focusin", e => { const el = (e.target as Element).closest?.("[data-tip]"); if (el) show(el); else hide(); });
  document.addEventListener("focusout", hide);
  addEventListener("scroll", hide, { passive: true });
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
  installTips();
  const h = location.hash.slice(1);
  go(h && story.scenes[h] ? h : "home");
}
