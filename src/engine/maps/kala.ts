/* KĀLA — the river of lives: one line per person through places (rows) and moments (columns). */
import { C, defs } from "../../art/palette";
import { placeIcon } from "../../art/places";
import { story, progress, ui } from "../state";
import { headSVG, placeName } from "../badges";
import { $ } from "../util";
import { nodeInfo, placeInfo, showInfo } from "./index";

/** per column: the place this person is in, or null once their thread has ended */
function lifeAt(pid: string): (string | null)[] {
  const p = story.people[pid]; let last = p.home;
  return story.timeline.map(n => {
    if (p.death != null && n.t > p.death) return null;
    if (n.cast.includes(pid)) { last = n.place; return n.place; }
    if (p.returnsHome) last = p.home;
    return last;
  });
}

export function renderKala(): void {
  const TL = story.timeline, BAND_ORDER = story.bandOrder, PEOPLE = story.people, NODE = story.node;
  const avail = $("#kalaScroll").clientHeight || 700, colW = innerWidth < 700 ? 96 : 118, x0 = 70, y0 = 64;
  const bandH = Math.max(38, Math.min(74, (avail - y0 - 18) / BAND_ORDER.length)), W = x0 * 2 + colW * (TL.length - 1), H = y0 + bandH * BAND_ORDER.length + 30;
  const X = (i: number) => x0 + i * colW, BY = (pl: string) => y0 + BAND_ORDER.indexOf(pl) * bandH + bandH / 2;
  const order = Object.keys(PEOPLE);
  const lives = Object.fromEntries(order.map(p => [p, lifeAt(p)]));
  const pos = (pid: string, i: number): [number, number] | null => {
    const pl = lives[pid][i]; if (!pl) return null;
    const here = order.filter(q => lives[q][i] === pl), k = here.indexOf(pid);
    return [X(i), BY(pl) + (k - (here.length - 1) / 2) * 9];
  };
  const curIdx = TL.findIndex(n => n.id === ui.current);
  let s = `${defs()}<rect width="${W}" height="${H}" fill="${C.paper}"/>`;
  // bands
  BAND_ORDER.forEach((pl, b) => { s += `<rect x="0" y="${y0 + b * bandH}" width="${W}" height="${bandH}" fill="${pl === ui.kalaPlace ? C.ochreL : (b % 2 ? C.paper2 : C.paper)}" opacity="${pl === ui.kalaPlace ? .45 : .6}"/>`; });
  // eras ribbon
  const eras: { e: string; a: number; b: number }[] = [];
  TL.forEach((n, i) => { const last = eras.at(-1); if (!last || last.e !== n.era) eras.push({ e: n.era, a: i, b: i }); else last.b = i; });
  eras.forEach((r, k) => { const a = X(r.a) - colW / 2 + 6, b = X(r.b) + colW / 2 - 6; s += `<path d="M${a} 26 H${b}" stroke="${k % 2 ? C.gold : C.rose}" stroke-width="10" stroke-linecap="round" opacity=".55"/><text x="${(a + b) / 2}" y="50" text-anchor="middle" font-family="Kalam" font-size="15" fill="${C.ink}" opacity=".8">${r.e}</text>`; });
  // "now" lamp
  if (curIdx >= 0) s += `<line class="pulse" x1="${X(curIdx)}" x2="${X(curIdx)}" y1="${y0}" y2="${y0 + bandH * BAND_ORDER.length}" stroke="${C.ochreL}" stroke-width="2" stroke-dasharray="3 6"/><g transform="translate(${X(curIdx)} ${y0 - 4})"><circle r="16" fill="url(#lampG)"/><path d="M-9 0 h18 q-2 7 -9 7 q-7 0 -9 -7z" fill="${C.madder}" stroke="${C.iron}"/><path d="M0 -1 q-5 -7 0 -14 q5 7 0 14z" fill="${C.ochreL}"/></g>`;
  // lines: dim base, then identity colour + pattern where walked
  const curve = (a: number[], b: number[]) => `M${a[0]} ${a[1]} C ${a[0] + colW * .5} ${a[1]}, ${b[0] - colW * .5} ${b[1]}, ${b[0]} ${b[1]}`;
  let base = "", lit = "";
  const focusSet = new Set(NODE[ui.current]?.cast || order);
  order.forEach(pid => {
    const col = PEOPLE[pid].line, hl = !ui.kalaHL || ui.kalaHL === pid;
    const seenIdx = TL.map((n, i) => progress.visited.has(n.id) && n.cast.includes(pid) ? i : -1).filter(i => i >= 0), lo = Math.min(...seenIdx), hi = Math.max(...seenIdx);
    seenIdx.forEach(i => { const p = pos(pid, i); if (p) lit += `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${col}" opacity="${hl ? .9 : .1}" filter="url(#glow)"/>`; });
    for (let i = 0; i < TL.length - 1; i++) {
      const a = pos(pid, i), b = pos(pid, i + 1); if (!a || !b) continue;
      base += `<path class="kline" d="${curve(a, b)}" fill="none" stroke="${C.muted}" stroke-width="3" stroke-linecap="round" opacity="${hl ? .95 : .15}"/>`;
      if (seenIdx.length && i >= lo && i < hi) lit += `<path d="${curve(a, b)}" fill="none" stroke="${col}" stroke-width="${ui.kalaHL === pid ? 6 : 4.5}" stroke-linecap="${PEOPLE[pid].dash ? "butt" : "round"}" ${PEOPLE[pid].dash ? `stroke-dasharray="${PEOPLE[pid].dash}"` : ""} opacity="${hl ? (focusSet.has(pid) || ui.kalaHL ? 1 : .4) : .12}"/>`;
    }
    if (PEOPLE[pid].death != null) {
      const li = lives[pid].map(Boolean).lastIndexOf(true), d = pos(pid, li);
      if (d) lit += `<g opacity="${hl ? 1 : .15}"><path d="M${d[0] + 10} ${d[1] - 6} l 10 6 l -10 6" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${d[0] + 26}" cy="${d[1]}" r="4" fill="${C.madder}" stroke="${C.ink}" stroke-width="1"/></g>`;
    }
  });
  s += base + lit;
  // moments
  TL.forEach((n, i) => {
    const ps = n.cast.map(c => pos(c, i)).filter((p): p is [number, number] => !!p); if (!ps.length) return;
    const ys = ps.map(p => p[1]), top = Math.min(...ys) - 12, bot = Math.max(...ys) + 12, seen = progress.visited.has(n.id), cur = n.id === ui.current;
    const fill = n.status === "unwritten" ? "none" : seen ? C.gold : C.paper2, dash = n.status === "drafted" ? "5 4" : n.status === "unwritten" ? "2 5" : "";
    s += `<g class="knode" data-node="${n.id}" opacity="${ui.kalaPlace && n.place !== ui.kalaPlace ? .3 : 1}"><rect x="${X(i) - 15}" y="${top}" width="30" height="${bot - top}" rx="15" fill="${fill}" fill-opacity="${seen ? .35 : .7}" stroke="${n.status === "unwritten" ? C.muted : C.gold}" stroke-width="${cur ? 4 : 2}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>
      ${ps.map((p, k) => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${PEOPLE[n.cast[k]] ? PEOPLE[n.cast[k]].line : C.ink}" stroke="${C.iron}" stroke-width="1"/>`).join("")}
      ${story.assembly.has(n.id) ? `<g transform="translate(${X(i)} ${top - 14})"><path d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="1"/></g>` : n.status === "built" ? `<circle cx="${X(i)}" cy="${top - 10}" r="5" fill="${C.ochreL}" stroke="${C.iron}"/>` : ""}
      <title>${n.title}</title></g>`;
  });
  // portrait medallions at the start of each line
  order.forEach(pid => {
    const first = lives[pid].findIndex(Boolean), p = pos(pid, first); if (!p) return;
    s += `<g data-person="${pid}" style="cursor:pointer" opacity="${!ui.kalaHL || ui.kalaHL === pid ? 1 : .25}"><circle cx="${p[0] - 40}" cy="${p[1]}" r="17" fill="${PEOPLE[pid].line}"/><svg x="${p[0] - 56}" y="${p[1] - 16}" width="32" height="32">${headSVG(pid).replace("<svg ", "<svg width='32' height='32' ")}</svg><circle cx="${p[0] - 40}" cy="${p[1]}" r="16" fill="none" stroke="${PEOPLE[pid].line}" stroke-width="3"/></g>`;
  });
  $("#kalaScroll").innerHTML = `<svg id="kalaSvg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  // fixed place labels
  const LW = innerWidth < 700 ? 46 : 132;
  let L = `<svg width="${LW}" height="${H}">${defs()}<rect width="${LW}" height="${H}" fill="${C.paper}"/>`;
  BAND_ORDER.forEach((pl, b) => {
    const y = y0 + b * bandH + bandH / 2;
    L += `<g data-kplace="${pl}" style="cursor:pointer"><rect x="0" y="${y0 + b * bandH}" width="${LW}" height="${bandH}" fill="${pl === ui.kalaPlace ? C.ochreL : (b % 2 ? C.paper2 : C.paper)}" opacity="${pl === ui.kalaPlace ? .8 : .6}"/>${placeIcon(story.places[pl].icon, 24, y, .62)}${LW < 60 ? "" : `<text x="44" y="${y + 5}" font-family="Kalam" font-size="13" fill="${C.ink}">${story.places[pl].short || placeName(pl)}</text>`}</g>`;
  });
  $("#kalaLabels").innerHTML = L + "</svg>";
  $("#kalaLabels").onclick = e => {
    const g = (e.target as Element).closest<SVGGElement>("[data-kplace]"); if (!g) return;
    const pl = g.dataset.kplace ?? ""; ui.kalaPlace = ui.kalaPlace === pl ? null : pl; renderKala(); if (ui.kalaPlace) placeInfo(pl);
  };
  const sc = $("#kalaScroll"), lb = $("#kalaLabels");
  sc.onscroll = () => { lb.scrollTop = sc.scrollTop; };
  dragScroll(sc);
  if (curIdx >= 0) sc.scrollLeft = Math.max(0, X(curIdx) - sc.clientWidth / 2);
  $("#kalaSvg").addEventListener("click", e => {
    const t = e.target as Element;
    const n = t.closest<SVGGElement>("[data-node]"); if (n) { nodeInfo(n.dataset.node ?? ""); return; }
    const p = t.closest<SVGGElement>("[data-person]"); if (p) { ui.kalaHL = ui.kalaHL === p.dataset.person ? null : p.dataset.person ?? null; renderKala(); }
  });
  if (ui.kalaHL) showInfo(`<div class="ic">${headSVG(ui.kalaHL)}</div><div class="tx"><b>${PEOPLE[ui.kalaHL].n}</b><span class="hand" style="color:var(--muted)">their river through time — tap a moment</span></div><button class="kbtn" data-soul="${ui.kalaHL}">Their story</button>`);
}

/** mouse drag-to-pan (touch uses native scrolling) */
function dragScroll(el: HTMLElement): void {
  let d: { x: number; y: number; l: number; t: number; m: boolean } | null = null;
  el.onpointerdown = e => { if (e.pointerType !== "mouse") return; d = { x: e.clientX, y: e.clientY, l: el.scrollLeft, t: el.scrollTop, m: false }; };
  el.onpointermove = e => {
    if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) { d.m = true; el.classList.add("drag"); }
    el.scrollLeft = d.l - dx; el.scrollTop = d.t - dy;
  };
  el.onpointerup = el.onpointerleave = () => { el.classList.remove("drag"); setTimeout(() => { d = null; }, 0); };
  el.addEventListener("click", e => { if (d && d.m) { e.stopPropagation(); e.preventDefault(); } }, true);
}
