/* The five maps (Rule 5): Kāla (time), Deśa (land), Pātra (souls), Mārga (path), Smṛti (bookmarks),
   plus the shared info strip. */
import { C } from "../../art/palette";
import { story, progress, ui, type MapTab } from "../state";
import { headSVG, placeBadge } from "../badges";
import { med } from "../pages";
import { openOverlay } from "../focus";
import { $, $$ } from "../util";
import { siteOf, placePath } from "../data";
import { renderKala } from "./kala";
import { renderDesha } from "./desha";
import { renderPatra, renderMarga, renderSmriti } from "./panels";

export function openMaps(tab?: string): void {
  if (tab && tab !== "1") ui.mapTab = tab as MapTab;
  renderMaps(); openOverlay($("#maps"), ".mtab.on");
}

export function renderMaps(): void {
  $$(".mtab").forEach(b => { const on = b.dataset.t === ui.mapTab; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  $$(".mview").forEach(v => v.classList.toggle("on", v.id === ui.mapTab));
  hideInfo();
  ({ kala: renderKala, desha: renderDesha, patra: renderPatra, marga: renderMarga, smriti: renderSmriti })[ui.mapTab]();
}

export function hideInfo(): void { $("#info").classList.remove("on"); }

export function showInfo(html: string): void {
  const i = $("#info");
  i.innerHTML = `<button class="x" aria-label="Close">×</button>` + html;
  i.querySelector<HTMLButtonElement>(".x")!.onclick = hideInfo;
  i.classList.add("on");
  // keyboard users land on the strip's main action
  (i.querySelector<HTMLElement>(".kbtn, button.chip, .med") ?? i.querySelector<HTMLElement>(".x"))?.focus({ preventScroll: true });
}

export function nodeInfo(id: string): void {
  const n = story.node[id], open = n.status !== "unwritten";
  showInfo(`<div class="ic">${placeBadge(n.place)}</div><div class="tx"><b>${n.title}</b><div class="row">${n.cast.map(c => med(c)).join("")}</div></div>
   ${open ? `<button class="kbtn primary" data-go="${id}">${progress.visited.has(id) ? "Revisit" : "Enter"}</button>` : `<span class="hand" style="color:var(--muted)">unpainted</span>`}`);
}

/** a site's info strip: certainty and why, its realm, and its moments grouped by spot (D1) */
export function placeInfo(id: string): void {
  const P = story.places, site = siteOf(id), p = P[site];
  const realm = placePath(site).slice(1).map(r => P[r].n).join(" › ");
  const chip = (nid: string) => {
    const n = story.node[nid];
    return n.status === "unwritten" ? `<span class="chip dim">${n.title}</span>`
      : `<button class="chip" data-go="${n.id}" style="${progress.visited.has(n.id) ? `border-color:${C.gold};color:${C.gold}` : ""}">${n.title}</button>`;
  };
  const here = story.timeline.filter(n => siteOf(n.place) === site);
  const groups = [site, ...Object.keys(P).filter(k => P[k].parent === site)]
    .map(pl => ({ pl, ms: here.filter(n => n.place === pl) })).filter(g => g.ms.length);
  const list = groups.map(g => `${g.pl === site ? "" : `<div class="spot">${P[g.pl].short || P[g.pl].n.split(",")[0]}</div>`}<div class="chips">${g.ms.map(n => chip(n.id)).join("")}</div>`).join("")
    || `<div class="chips"><span class="chip dim">no moments here yet</span></div>`;
  showInfo(`<div class="ic">${placeBadge(site)}</div><div class="tx"><b>${p.n}<span class="cert" title="${p.note}">${story.cert[site]} location</span></b>${realm ? `<div class="realm">in ${realm}</div>` : ""}<div style="font-size:15px;line-height:1.35;margin-top:2px">${p.d ?? ""}</div><div class="certnote">${p.note}</div>${list}</div>`);
}
