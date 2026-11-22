/* KĀLA — the river of lives: one line per person through places (rows) and moments (columns). */
import { C, defs } from "../../art/palette";
import { placeIcon } from "../../art/places";
import { story, progress, ui } from "../state";
import { headSVG, placeName } from "../badges";
import { $ } from "../util";
import { siteOf } from "../data";
import { nodeInfo, placeInfo, showInfo } from "./index";

/** per column: the site (Kāla row) this person is in, or null once their thread has ended */
function lifeAt(pid: string): (string | null)[] {
  const p = story.people[pid], home = siteOf(p.home); let last = home;
  return story.timeline.map(n => {
    if (p.death != null && n.t > p.death) return null;
    if (n.cast.includes(pid)) { last = siteOf(n.place); return last; }
    if (p.returnsHome) last = home;
    return last;
  });
}

export function renderKala(): void {
  const TL = story.timeline, BAND_ORDER = story.bandOrder, PEOPLE = story.people, NODE = story.node;
  const avail = $("#kalaScroll").clientHeight || 700, colW = innerWidth < 700 ? 96 : 118, x0 = 70, y0 = 64;
  const bandH = Math.max(38, Math.min(74, (avail - y0 - 18) / BAND_ORDER.length)), W = x0 * 2 + colW * (TL.length - 1), H = y0 + bandH * BAND_ORDER.length + 30;
  const X = (i: number) => x0 + i * colW, BY = (pl: string) => y0 + BAND_ORDER.indexOf(pl) * bandH + bandH / 2;
  const order = Object.keys(PEOPLE).filter(p => !PEOPLE[p].minor); // one-scene figures get no line
  const lives = Object.fromEntries(order.map(p => [p, lifeAt(p)]));
  // every line's position per column, computed once (Sprint 4: ~110 columns × ~40 lines)
  const P: Record<string, ([number, number] | null)[]> = Object.fromEntries(order.map(p => [p, TL.map(() => null)]));
  TL.forEach((_, i) => {
    const bySite = new Map<string, string[]>();
    order.forEach(p => { const pl = lives[p][i]; if (pl) { if (!bySite.has(pl)) bySite.set(pl, []); bySite.get(pl)!.push(p); } });
    bySite.forEach((here, pl) => here.forEach((p, k) => { P[p][i] = [X(i), BY(pl) + (k - (here.length - 1) / 2) * 9]; }));
  });
  const pos = (pid: string, i: number): [number, number] | null => P[pid]?.[i] ?? null; // one-scene figures have no line
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
    // D6 (Sprint 4): the current cast in colour, everyone else faint, until Sprint 6's focus+context
    const col = PEOPLE[pid].line, hl = !ui.kalaHL || ui.kalaHL === pid, inFocus = focusSet.has(pid) || !!ui.kalaHL;
    const seenIdx = TL.map((n, i) => progress.visited.has(n.id) && n.cast.includes(pid) ? i : -1).filter(i => i >= 0), lo = Math.min(...seenIdx), hi = Math.max(...seenIdx);
    seenIdx.forEach(i => { const p = pos(pid, i); if (p) lit += `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${col}" opacity="${hl && inFocus ? .9 : .1}" filter="url(#glow)"/>`; });
    // one path per person (not one per segment): far fewer DOM nodes at this scale
    let dBase = "", dLit = "";
    for (let i = 0; i < TL.length - 1; i++) {
      const a = pos(pid, i), b = pos(pid, i + 1); if (!a || !b) continue;
      dBase += curve(a, b) + " ";
      if (seenIdx.length && i >= lo && i < hi) dLit += curve(a, b) + " ";
    }
    if (dBase) base += `<path class="kline" d="${dBase}" fill="none" stroke="${C.muted}" stroke-width="3" stroke-linecap="round" opacity="${hl ? (inFocus ? .95 : .3) : .15}"/>`;
    if (dLit) lit += `<path d="${dLit}" fill="none" stroke="${col}" stroke-width="${ui.kalaHL === pid ? 6 : 4.5}" stroke-linecap="${PEOPLE[pid].dash ? "butt" : "round"}" ${PEOPLE[pid].dash ? `stroke-dasharray="${PEOPLE[pid].dash}"` : ""} opacity="${hl ? (inFocus ? 1 : .12) : .12}"/>`;
    if (PEOPLE[pid].death != null) {
      const li = lives[pid].map(Boolean).lastIndexOf(true), d = pos(pid, li);
      if (d) lit += `<g opacity="${hl ? 1 : .15}"><path d="M${d[0] + 10} ${d[1] - 6} l 10 6 l -10 6" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${d[0] + 26}" cy="${d[1]}" r="4" fill="${C.madder}" stroke="${C.ink}" stroke-width="1"/></g>`;
    }
  });
  s += base + lit;
  // moments (each person's presence dots are drawn as ONE path per person, after the pills)
  const dotD: Record<string, string> = {};
  TL.forEach((n, i) => {
    const dots = n.cast.map(c => [c, pos(c, i)] as const).filter((d): d is readonly [string, [number, number]] => !!d[1]), ps = dots.map(d => d[1]);
    if (!ps.length) return;
    dots.forEach(([c, p]) => { dotD[c] = (dotD[c] ?? "") + `M${p[0] - 4.5} ${p[1]}a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0`; });
    const ys = ps.map(p => p[1]), top = Math.min(...ys) - 12, bot = Math.max(...ys) + 12, seen = progress.visited.has(n.id), cur = n.id === ui.current;
    const fill = n.status === "unwritten" ? "none" : seen ? C.gold : C.paper2, dash = n.status === "drafted" ? "5 4" : n.status === "unwritten" ? "2 5" : "";
    s += `<g class="knode" data-node="${n.id}" role="button" tabindex="0" aria-label="${n.title}, ${placeName(n.place)} — ${n.status === "unwritten" ? "not yet painted" : seen ? "walked" : n.status}" opacity="${ui.kalaPlace && siteOf(n.place) !== ui.kalaPlace ? .3 : 1}"><rect x="${X(i) - 15}" y="${top}" width="30" height="${bot - top}" rx="15" fill="${fill}" fill-opacity="${seen ? .35 : .7}" stroke="${n.status === "unwritten" ? C.muted : C.gold}" stroke-width="${cur ? 4 : 2}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>
      ${story.assembly.has(n.id) ? `<g transform="translate(${X(i)} ${top - 14})"><path d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="1"/></g>` : n.status === "built" ? `<circle cx="${X(i)}" cy="${top - 10}" r="5" fill="${C.ochreL}" stroke="${C.iron}"/>` : ""}
      <title>${n.title} · ${placeName(n.place)}</title></g>`;
  });
  s += `<g pointer-events="none">${Object.entries(dotD).map(([c, d]) => `<path d="${d}" fill="${PEOPLE[c].line}" stroke="${C.iron}" stroke-width="1"/>`).join("")}</g>`;
  // portrait medallions at the start of each line
  order.forEach(pid => {
    const first = lives[pid].findIndex(Boolean), p = pos(pid, first); if (!p) return;
    const medOp = ui.kalaHL ? (ui.kalaHL === pid ? 1 : .25) : focusSet.has(pid) ? 1 : .45;
    // D6 at scale: full portraits for the current cast (or the followed life); an initial for everyone else, to keep the chart light
    const full = ui.kalaHL ? ui.kalaHL === pid : focusSet.has(pid);
    s += `<g data-person="${pid}" role="button" tabindex="0" aria-label="${ui.kalaHL === pid ? "Show all lives" : `Follow ${PEOPLE[pid].n}’s river`}" style="cursor:pointer" opacity="${medOp}"><circle cx="${p[0] - 40}" cy="${p[1]}" r="17" fill="${PEOPLE[pid].line}"/>${full ? `<svg x="${p[0] - 56}" y="${p[1] - 16}" width="32" height="32">${headSVG(pid).replace("<svg ", "<svg width='32' height='32' ")}</svg>` : `<text x="${p[0] - 40}" y="${p[1] + 5}" text-anchor="middle" font-family="Kalam" font-size="15" fill="${C.paper}">${PEOPLE[pid].n.charAt(0)}</text>`}<circle cx="${p[0] - 40}" cy="${p[1]}" r="16" fill="none" stroke="${PEOPLE[pid].line}" stroke-width="3"/></g>`;
  });
  $("#kalaScroll").innerHTML = `<svg id="kalaSvg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  // fixed place labels
  const LW = innerWidth < 700 ? 46 : 132;
  let L = `<svg width="${LW}" height="${H}">${defs()}<rect width="${LW}" height="${H}" fill="${C.paper}"/>`;
  BAND_ORDER.forEach((pl, b) => {
    const y = y0 + b * bandH + bandH / 2;
    L += `<g data-kplace="${pl}" role="button" tabindex="0" aria-label="${story.places[pl].n}: show moments here" style="cursor:pointer"><rect x="0" y="${y0 + b * bandH}" width="${LW}" height="${bandH}" fill="${pl === ui.kalaPlace ? C.ochreL : (b % 2 ? C.paper2 : C.paper)}" opacity="${pl === ui.kalaPlace ? .8 : .6}"/>${placeIcon(story.places[pl].icon, 24, y, .62)}${LW < 60 ? "" : `<text x="44" y="${y + 5}" font-family="Kalam" font-size="13" fill="${C.ink}">${story.places[pl].short || placeName(pl)}</text>`}</g>`;
  });
  $("#kalaLabels").innerHTML = L + "</svg>";
  // safety net: a label that still doesn't fit its column is narrowed to fit, never cut off
  const room = LW - 48;
  $("#kalaLabels").querySelectorAll<SVGTextElement>("text").forEach(t => {
    if (t.getComputedTextLength() > room) { t.setAttribute("textLength", String(room)); t.setAttribute("lengthAdjust", "spacingAndGlyphs"); }
  });
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
  $("#kalaText").innerHTML = kalaText();
  $("#kalaLegend").innerHTML = legend();
  if (ui.kalaHL) showInfo(`<div class="ic">${headSVG(ui.kalaHL)}</div><div class="tx"><b>${PEOPLE[ui.kalaHL].n}</b><span class="hand" style="color:var(--muted)">their river through time — tap a moment</span></div><button class="kbtn" data-soul="${ui.kalaHL}">Their story</button>`);
}

/** family lines (D4): every member of a family shares a line pattern; colour is the individual */
function legend(): string {
  const used = [...new Set(Object.values(story.people).map(p => p.family))];
  return `<div class="lg-t">line pattern = family line · colour = the person</div>` + used.map(f => {
    const fam = story.families[f]; if (!fam) return "";
    return `<div class="lg-r"><svg width="44" height="10"><path d="M2 5 H42" stroke="${C.iron}" stroke-width="3.5" stroke-dasharray="${fam.pattern}"/></svg><span>${fam.name}</span></div>`;
  }).join("");
}

/** the same chart as text, for screen readers: each person's moments in story order */
function kalaText(): string {
  const PEOPLE = story.people;
  return `<h2>Kāla, the river of time, as a list</h2><p>Each person’s moments in story order. ✦ marks an assembly moment, where every thread meets.</p>`
    + Object.keys(PEOPLE).map(pid => {
      const mine = story.timeline.filter(n => n.cast.includes(pid));
      const ended = PEOPLE[pid].death != null ? ` Their thread ends after “${mine.at(-1)?.title}”.` : "";
      return `<h3>${PEOPLE[pid].n} (${story.families[PEOPLE[pid].family]?.name ?? ""})</h3><ol>${mine.map(n => `<li>${story.assembly.has(n.id) ? "✦ " : ""}${n.title}, ${story.places[n.place].n}${progress.visited.has(n.id) ? " (walked)" : n.status === "unwritten" ? " (not yet painted)" : ""}</li>`).join("")}</ol><p>${ended}</p>`;
    }).join("");
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
