// @ts-nocheck — faithful port of prototype v6 (Sprint 1, decision D1); typed and split in a later refactor.
/* The reader: scene pages, scroll camera, generated choices, return stack, the five maps,
   character stories, sources drawer, bookmarks and the 21+ gate.
   All story data arrives from the content collections (see src/pages/index.astro). */
import { C, SK, defs } from "../art/palette";
import { sun, bird, scatter, filler, leafSprig } from "../art/motifs";
import { fig } from "../art/figure";
import { chariot } from "../art/objects";
import { placeIcon } from "../art/places";
import { tiles, BANDS } from "../art/tiles";
import { vignette } from "../art/vignettes";
import { WORLDS } from "../art/worlds";
import { choicesFor as ruleChoices } from "./rule.js";
import { clamp, ease, $, $$ } from "./util";

const SUB = "painted in the Kalamkari of Srikalahasti";

/* ---------- data (filled by startReader) ---------- */
let PLACES = {}, CERT = {}, BAND_ORDER = [], LANDMARKS = [], PEOPLE = {}, TL = [], NODE = {}, SCENES = {}, META = {}, ASSEMBLY = new Set(), TIERS = [];

/* ---------- badges ---------- */
function placeBadge(pid) { const p = PLACES[pid]; return `<svg viewBox="-40 -40 80 80">${defs()}<rect x="-40" y="-40" width="80" height="80" fill="${C.paper2}"/>${placeIcon(p.icon, 0, 2, 1.2)}</svg>`; }
function headSVG(pid) {
  const p = PEOPLE[pid]; if (!p) return "";
  const o = Object.assign({ x: 0, y: 0, s: 1, weapon: "none" }, p.f);
  return `<svg viewBox="-36 -206 76 96">${defs()}<rect x="-40" y="-210" width="90" height="110" fill="${C.paper2}"/>${fig(o)}</svg>`;
}

/* the rule, in code (shared with the validator) */
function choicesFor(id) {
  const { choices, violations } = ruleChoices(NODE[id], SCENES[id].branches, TL);
  violations.forEach(v => console.error("Rule violation:", id, v.message));
  return choices;
}

/* =====================================================================
   STATE
   ===================================================================== */
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
let st;
const save = () => { store.set("m2.visited", [...st.visited]); store.set("m2.trail", st.trail); store.set("m2.path", st.path); store.set("m2.marks", st.marks); };
let current = "home", returnStack = [], mapTab = "kala", kalaHL = null, kalaPlace = null, soulId = null, soulFrom = null;
function toast(t) { const x = $("#toast"); x.textContent = t; x.classList.add("on"); clearTimeout(x._t); x._t = setTimeout(() => x.classList.remove("on"), 2200); }

function applyKalamkari() {
  const [h, v, tex] = tiles(); const r = document.documentElement.style;
  r.setProperty("--tile-h", `url("data:image/svg+xml,${encodeURIComponent(h)}")`); r.setProperty("--tile-v", `url("data:image/svg+xml,${encodeURIComponent(v)}")`); r.setProperty("--texture", tex);
  $("#themeName").textContent = SUB;
}

/* =====================================================================
   PAGES
   ===================================================================== */
function meds(ids) { return `<div class="meds">${ids.map(id => `<div class="med" data-soul="${id}" title="${PEOPLE[id].n} — open their story">${headSVG(id)}</div>`).join("")}</div>`; }
function renderHome() {
  return `<section class="page on"><div class="home"><div class="kframe">${BANDS}<div class="home-inner">
   <div class="dev big">महाभारत</div><h1>Mahābhārata</h1><div class="sub">${SUB}</div>
   <svg class="home-art" viewBox="0 0 760 330">${defs()}<rect width="760" height="330" fill="${C.sky}"/><rect y="250" width="760" height="80" fill="${C.ground}"/>
     ${sun(640, 80, 40)}${bird(140, 70)}${scatter(16, 20, 740, 20, 220, (x, y, r) => filler(x, y, r * .8), 4)}
     <g transform="translate(-40 -40) scale(.95)">${chariot({ x: 300, y: 330, banner: "hanuman", cap: C.madder, cap2: C.indigo })}
     ${fig({ x: 352, y: 234, s: .92, skin: SK.krishna, cloth: C.ochre, cloth2: C.madder, crown: "krishna", weapon: "reins", halo: true })}
     ${fig({ x: 272, y: 234, s: 1.02, skin: SK.arjuna, cloth: C.indigo, cloth2: C.ochre, crown: "kirita", weapon: "bow", armour: true, arrow: true })}</g>${leafSprig(40, 310, 1.3)}${leafSprig(720, 310, 1.3, 6)}</svg>
   <p class="lead">Each scene is a painted page. Scroll, and the camera moves through it. When a scene ends, follow a soul or go to a place — always onward in time.</p>
   <div class="start-btns"><button class="kbtn primary" data-go="dice-hall">Begin at the Dice Hall</button><button class="kbtn" data-go="day-17">Enter Day 17</button><button class="kbtn" data-map="kala">Open the Maps</button></div>
   <div class="rule"><span style="font-size:26px">⟶</span><span><b>The rule of the river:</b> choices move only forward in time, by character or by place. The past and future are reached through memories <b>↺</b> and omens <b>⟳</b> in the text.</span></div>
  </div></div></div></section>`;
}
function choiceCard(c, i) {
  const n = c.to, seen = st.visited.has(n.id), dis = n.status === "unwritten";
  const icon = c.by === "character" ? headSVG(c.ref) : placeBadge(c.ref);
  const label = c.by === "character" ? `Follow ${PEOPLE[c.ref].n}` : `Go to ${PLACES[c.ref].n.split(",")[0]}`;
  return `<button class="choice" data-choose="${i}" ${dis ? "disabled" : ""}>${seen ? `<span class="seen">✓ walked</span>` : ""}
    <div class="big">${icon}</div><div class="by">${label}</div><h4>${n.title}</h4><div class="when">${dis ? "not yet painted" : placeName(n.place)}</div></button>`;
}
const placeName = p => PLACES[p].n.split(",")[0];
function choicesHTML(id) {
  const cs = choicesFor(id); if (!cs.length) return "";
  return `<section class="choices"><div class="hand">— the river divides —</div><h3>Whom will you follow?</h3><div class="why">Every path leads forward in time.</div>
   <div class="choice-grid">${cs.map(choiceCard).join("")}</div></section>`;
}
function headButtons(id) { return `<div class="headbtns"><button class="kbtn" data-src="${id}">Sources & tellings</button></div>`; }
function pathNoteHTML(id) {
  const last = st.path.at(-1); if (!last || last.to !== id || last.note || last.noted) return "";
  const who = last.by === "character" ? `You followed ${PEOPLE[last.ref].n}.` : `You went to ${placeName(last.ref)}.`;
  return `<div class="pathnote"><span>${who} Why?</span><input id="pnInput" placeholder="optional note for your path…" aria-label="Why did you choose this path? (optional)"><button id="pnSave">Save</button></div>`;
}
function ribbon() { return `<div class="thr-ribbon" role="note">${arrivedVia === "memory" ? "↺ You have stepped into a memory" : arrivedVia === "omen" ? "⟳ You are glimpsing what is to come" : "◈ Opened from the index"}${returnStack.length ? ` — from “${returnStack.at(-1).title}”` : ""}</div>`; }

function renderScene(id) {
  const sc = SCENES[id], n = NODE[id], m = META[id] || {};
  if (n.status !== "built") return `<section class="page on">${ribbon()}<div class="stub"><div class="kframe">${BANDS}<div class="stub-inner">
     ${vignette(sc.art)}<div class="scene-head" style="padding:18px 0 0"><div class="parva">${sc.parva} · ${placeName(n.place)}</div><h2>${n.title}</h2><div class="dev" lang="sa">${sc.dev}</div>${meds(n.cast)}${headButtons(id)}</div>
     ${pathNoteHTML(id)}<p class="text">${sc.text}</p><div class="unwritten">✎ Drafted. The painted, scroll-animated version of this page comes in a later sprint.</div>
   </div></div></div>${choicesHTML(id)}</section>`;
  const caps = sc.caps;
  return `<section class="page on">${ribbon()}
   <header class="scene-head"><div class="parva">${sc.parva} · ${placeName(n.place)}</div><h2>${n.title}</h2><div class="dev" lang="sa">${sc.dev}</div>
     <p class="intro">${sc.intro}</p>${meds(n.cast)}${headButtons(id)}${pathNoteHTML(id)}<div class="scrollhint">scroll ↓ to unroll · scroll ↑ to go back</div></header>
   <div class="scrolly" id="scrolly" style="height:${sc.len * 100}vh"><div class="sticky"><div class="stage kframe" id="stage">${BANDS}
     <svg class="world" id="world" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="capLive">${sc.world()}</svg>
     ${sc.day ? `<div class="daylabel">${sc.day}</div>` : ""}<div class="prog" role="tablist" aria-label="Scene beats"><span class="updown" aria-hidden="true">↑↓</span>${caps.map((c, i) => `<i role="tab" tabindex="0" aria-label="Go to: ${c[2]}" data-beat="${i}"></i>`).join("")}</div>
     <div class="captions" id="capLive" aria-live="polite">${caps.map(c => `<div class="cap"><div class="ch"><b>${c[2]}</b><span class="dev" lang="sa">${c[3]}</span>${m.narr ? `<span class="who" title="Who is telling this">🗣 ${m.narr}</span>` : ""}${c[6] ? `<span class="capcast">${c[6].map(id => `<div class="med" data-soul="${id}" tabindex="0" role="button" aria-label="Open ${PEOPLE[id].n}’s story">${headSVG(id)}</div>`).join("")}</span>` : ""}</div><p>${c[4]}</p></div>`).join("")}</div>
   </div></div></div>${choicesHTML(id)}</section>`;
}
/* mark inline jumps as memory (past) or omen (future) */
function decorateJumps() {
  const t = NODE[current]?.t ?? 0;
  $$("a.jump").forEach(a => {
    const to = NODE[a.dataset.to]; if (!to || a.querySelector(".kind")) return;
    a.insertAdjacentHTML("beforeend", `<span class="kind">${to.t < t ? "↺ memory" : "⟳ omen"}</span>`);
  });
}
let arrivedVia = null, reduced = false, lastBeat = -1;
let pendingGo = null;
function go(id, opts = {}) {
  if (!SCENES[id] && id !== "home") id = "home";
  if (id !== "home" && !store.get("m6.consent", false)) { pendingGo = [id, opts]; $("#gate").classList.add("on"); setTimeout(() => $("#gateYes").focus(), 50); if (current !== "home" || !$("#app").innerHTML) go("home"); return; }
  arrivedVia = opts.via || null; current = id; lastBeat = -1; document.body.classList.remove("reading");
  $("#app").innerHTML = id === "home" ? renderHome() : renderScene(id);
  document.body.classList.toggle("threshold", !!arrivedVia && returnStack.length > 0);
  $("#bmBtn").style.display = id === "home" ? "none" : "flex";
  if (id !== "home") { st.visited.add(id); if (st.trail[st.trail.length - 1] !== id) st.trail.push(id); save(); }
  if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
  decorateJumps(); updateReturn(); wireScene();
  requestAnimationFrame(() => { coach(); if (opts.at != null) scrollToP(opts.at); else if (opts.y != null) scrollTo(0, opts.y); else scrollTo(0, 0); frame(); });
}
function scrollToP(p) { const s = $("#scrolly"); if (!s) { scrollTo(0, 0); return; } scrollTo(0, s.offsetTop + p * (s.offsetHeight - innerHeight) + 2); }

/* camera engine */
function camAt(cams, p) { let i = 0; while (i < cams.length - 1 && cams[i + 1][0] <= p) i++; const a = cams[i], b = cams[Math.min(i + 1, cams.length - 1)], t = b[0] === a[0] ? 0 : ease(clamp((p - a[0]) / (b[0] - a[0]))); return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t]; }
function sceneP() { const s = $("#scrolly"); if (!s) return null; const r = s.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); }
function frame() {
  const sc = SCENES[current]; if (!sc || !sc.world || document.body.classList.contains("reading")) return; let p = sceneP(); if (p == null) return;
  const caps = $$(".cap"), dots = $$(".prog i"); let beat = sc.caps.findIndex(c => p >= c[0] && p < c[1]); if (beat < 0) beat = sc.caps.length - 1;
  sc.caps.forEach((c, i) => { caps[i].classList.toggle("on", i === beat); dots[i].classList.toggle("on", i === beat); dots[i].setAttribute("aria-selected", i === beat); });
  const svg = $("#world");
  if (reduced) { const c = sc.caps[beat]; p = Math.min(c[1], 1) - .001; if (beat !== lastBeat) { svg.classList.remove("fade"); void svg.offsetWidth; svg.classList.add("fade"); } }
  lastBeat = beat;
  const stage = $("#stage"), sw = stage.clientWidth, sh = stage.clientHeight; let [cx, cy, w] = camAt(sc.cams, p);
  if (sw < 700) w *= .62; const s = sw / w; const capH = (caps[beat]?.offsetHeight || 140); cy += capH * .5 / s;
  svg.setAttribute("viewBox", `0 0 ${sw} ${sh}`);
  $("#cam").setAttribute("transform", `translate(${sw / 2} ${sh / 2}) scale(${s}) translate(${-cx} ${-cy})`);
  sc.animate && sc.animate(p, svg);
}

function updateReturn() {
  const b = $("#crumbs"); if (!returnStack.length) { b.classList.remove("on"); return; }
  const short = t => t.split(" —")[0], st3 = returnStack.slice(-3), off = returnStack.length - st3.length;
  b.innerHTML = (off ? `<span class="c">…</span><span class="sep">›</span>` : "") + st3.map((r, i) => `<button class="c" data-crumb="${off + i}">${short(r.title)}</button><span class="sep">›</span>`).join("") + `<span class="c cur">${short(NODE[current]?.title || "")}</span><button class="ret" data-crumb="${returnStack.length - 1}">↩ Return to ${short(returnStack.at(-1).title)}</button>`;
  b.classList.add("on");
}
let modalCb = null;
function ask(title, sub, cb, ok = "Continue") { $("#mTitle").textContent = title; $("#mSub").textContent = sub; $("#mText").value = ""; $("#mOk").textContent = ok; modalCb = cb; $("#modal").classList.add("on"); setTimeout(() => $("#mText").focus(), 50); }

/* =====================================================================
   MAPS
   ===================================================================== */
function openMaps(tab) { if (tab && tab !== "1") mapTab = tab; $("#maps").classList.add("on"); renderMaps(); }
function renderMaps() {
  $$(".mtab").forEach(b => b.classList.toggle("on", b.dataset.t === mapTab)); $$(".mview").forEach(v => v.classList.toggle("on", v.id === mapTab)); hideInfo();
  ({ kala: renderKala, desha: renderDesha, patra: renderPatra, marga: renderMarga, smriti: renderSmriti })[mapTab]();
}
function hideInfo() { $("#info").classList.remove("on"); }
function showInfo(html) { const i = $("#info"); i.innerHTML = `<button class="x" onclick="this.parentNode.classList.remove('on')">×</button>` + html; i.classList.add("on"); }
function nodeInfo(id) {
  const n = NODE[id]; const open = n.status !== "unwritten";
  showInfo(`<div class="ic">${placeBadge(n.place)}</div><div class="tx"><b>${n.title}</b><div class="row">${n.cast.map(c => `<div class="med" data-soul="${c}">${headSVG(c)}</div>`).join("")}</div></div>
   ${open ? `<button class="kbtn primary" data-go="${id}">${st.visited.has(id) ? "Revisit" : "Enter"}</button>` : `<span class="hand" style="color:var(--muted)">unpainted</span>`}`);
}
function placeInfo(id) {
  const list = TL.filter(n => n.place === id);
  showInfo(`<div class="ic">${placeBadge(id)}</div><div class="tx"><b>${PLACES[id].n}<span class="cert">${CERT[id]} location</span></b><div style="font-size:15px;line-height:1.35;margin-top:2px">${PLACES[id].d}</div><div class="chips">${list.map(n => n.status === "unwritten" ? `<span class="chip dim">${n.title}</span>` : `<button class="chip" data-go="${n.id}" style="${st.visited.has(n.id) ? `border-color:${C.gold};color:${C.gold}` : ""}">${n.title}</button>`).join("")}</div></div>`);
}
/* ---- KĀLA: the river of lives ---- */
function lifeAt(pid) { // per column: place or null
  const p = PEOPLE[pid]; let last = p.home; return TL.map(n => {
    if (p.death != null && n.t > p.death) return null;
    if (n.cast.includes(pid)) { last = n.place; return n.place; }
    if (p.returnsHome) last = p.home; return last;
  });
}
function renderKala() {
  const avail = $("#kalaScroll").clientHeight || 700, colW = innerWidth < 700 ? 96 : 118, x0 = 70, y0 = 64, bandH = Math.max(38, Math.min(74, (avail - y0 - 18) / BAND_ORDER.length)), W = x0 * 2 + colW * (TL.length - 1), H = y0 + bandH * BAND_ORDER.length + 30;
  const X = i => x0 + i * colW, BY = pl => y0 + BAND_ORDER.indexOf(pl) * bandH + bandH / 2;
  const lives = Object.fromEntries(Object.keys(PEOPLE).map(p => [p, lifeAt(p)]));
  const order = Object.keys(PEOPLE);
  const pos = (pid, i) => { const pl = lives[pid][i]; if (!pl) return null; const here = order.filter(q => lives[q][i] === pl); const k = here.indexOf(pid); return [X(i), BY(pl) + (k - (here.length - 1) / 2) * 9]; };
  const curIdx = TL.findIndex(n => n.id === current);
  let s = `${defs()}<rect width="${W}" height="${H}" fill="${C.paper}"/>`;
  // bands
  BAND_ORDER.forEach((pl, b) => { s += `<rect x="0" y="${y0 + b * bandH}" width="${W}" height="${bandH}" fill="${pl === kalaPlace ? C.ochreL : (b % 2 ? C.paper2 : C.paper)}" opacity="${pl === kalaPlace ? .45 : .6}"/>`; });
  // eras ribbon
  let eras = []; TL.forEach((n, i) => { if (!eras.length || eras.at(-1).e !== n.era) eras.push({ e: n.era, a: i, b: i }); else eras.at(-1).b = i; });
  eras.forEach((r, k) => { const a = X(r.a) - colW / 2 + 6, b = X(r.b) + colW / 2 - 6; s += `<path d="M${a} 26 H${b}" stroke="${k % 2 ? C.gold : C.rose}" stroke-width="10" stroke-linecap="round" opacity=".55"/><text x="${(a + b) / 2}" y="50" text-anchor="middle" font-family="Kalam" font-size="15" fill="${C.ink}" opacity=".8">${r.e}</text>`; });
  // "now" column
  if (curIdx >= 0) s += `<line class="pulse" x1="${X(curIdx)}" x2="${X(curIdx)}" y1="${y0}" y2="${y0 + bandH * BAND_ORDER.length}" stroke="${C.ochreL}" stroke-width="2" stroke-dasharray="3 6"/><g transform="translate(${X(curIdx)} ${y0 - 4})"><circle r="16" fill="url(#lampG)"/><path d="M-9 0 h18 q-2 7 -9 7 q-7 0 -9 -7z" fill="${C.madder}" stroke="${C.iron}"/><path d="M0 -1 q-5 -7 0 -14 q5 7 0 14z" fill="${C.ochreL}"/></g>`;
  // lines: dim base then coloured where lived
  const curve = (a, b) => `M${a[0]} ${a[1]} C ${a[0] + colW * .5} ${a[1]}, ${b[0] - colW * .5} ${b[1]}, ${b[0]} ${b[1]}`;
  let base = "", lit = "";
  const focusSet = new Set(NODE[current]?.cast || order);
  order.forEach(pid => {
    const col = PEOPLE[pid].line, hl = !kalaHL || kalaHL === pid;
    const seenIdx = TL.map((n, i) => st.visited.has(n.id) && n.cast.includes(pid) ? i : -1).filter(i => i >= 0), lo = Math.min(...seenIdx), hi = Math.max(...seenIdx);
    seenIdx.forEach(i => { const p = pos(pid, i); if (p) lit += `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${col}" opacity="${hl ? .9 : .1}" filter="url(#glow)"/>`; });
    for (let i = 0; i < TL.length - 1; i++) {
      const a = pos(pid, i), b = pos(pid, i + 1); if (!a || !b) continue;
      base += `<path class="kline" d="${curve(a, b)}" fill="none" stroke="${C.muted}" stroke-width="3" stroke-linecap="round" opacity="${hl ? .95 : .15}"/>`;
      if (seenIdx.length && i >= lo && i < hi) lit += `<path d="${curve(a, b)}" fill="none" stroke="${col}" stroke-width="${kalaHL === pid ? 6 : 4.5}" stroke-linecap="${PEOPLE[pid].dash ? "butt" : "round"}" ${PEOPLE[pid].dash ? `stroke-dasharray="${PEOPLE[pid].dash}"` : ""} opacity="${hl ? (focusSet.has(pid) || kalaHL ? 1 : .4) : .12}"/>`;
    }
    // death mark
    if (PEOPLE[pid].death != null) { const li = lives[pid].map(Boolean).lastIndexOf(true), d = pos(pid, li); if (d) lit += `<g opacity="${hl ? 1 : .15}"><path d="M${d[0] + 10} ${d[1] - 6} l 10 6 l -10 6" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${d[0] + 26}" cy="${d[1]}" r="4" fill="${C.madder}" stroke="${C.ink}" stroke-width="1"/></g>`; }
  });
  s += base + lit;
  // nodes (moments)
  TL.forEach((n, i) => {
    const ps = n.cast.map(c => pos(c, i)).filter(Boolean); if (!ps.length) return;
    const ys = ps.map(p => p[1]), top = Math.min(...ys) - 12, bot = Math.max(...ys) + 12, seen = st.visited.has(n.id), cur = n.id === current;
    const fill = n.status === "unwritten" ? "none" : seen ? C.gold : C.paper2, dash = n.status === "drafted" ? "5 4" : n.status === "unwritten" ? "2 5" : "";
    s += `<g class="knode" data-node="${n.id}" opacity="${kalaPlace && n.place !== kalaPlace ? .3 : 1}"><rect x="${X(i) - 15}" y="${top}" width="30" height="${bot - top}" rx="15" fill="${fill}" fill-opacity="${seen ? .35 : .7}" stroke="${n.status === "unwritten" ? C.muted : C.gold}" stroke-width="${cur ? 4 : 2}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>
      ${ps.map((p, k) => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${PEOPLE[n.cast[k]] ? PEOPLE[n.cast[k]].line : C.ink}" stroke="${C.iron}" stroke-width="1"/>`).join("")}
      ${ASSEMBLY.has(n.id) ? `<g transform="translate(${X(i)} ${top - 14})"><path d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="1"/></g>` : n.status === "built" ? `<circle cx="${X(i)}" cy="${top - 10}" r="5" fill="${C.ochreL}" stroke="${C.iron}"/>` : ""}
      <title>${n.title}</title></g>`;
  });
  // character medallions at left edge of their line
  order.forEach(pid => {
    const first = lives[pid].findIndex(Boolean), p = pos(pid, first); if (!p) return;
    s += `<g data-person="${pid}" style="cursor:pointer" opacity="${!kalaHL || kalaHL === pid ? 1 : .25}"><circle cx="${p[0] - 40}" cy="${p[1]}" r="17" fill="${PEOPLE[pid].line}"/><svg x="${p[0] - 56}" y="${p[1] - 16}" width="32" height="32">${headSVG(pid).replace("<svg ", "<svg width='32' height='32' ")}</svg><circle cx="${p[0] - 40}" cy="${p[1]}" r="16" fill="none" stroke="${PEOPLE[pid].line}" stroke-width="3"/></g>`;
  });
  $("#kalaScroll").innerHTML = `<svg id="kalaSvg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  // fixed place labels
  const LW = innerWidth < 700 ? 46 : 132; let L = `<svg width="${LW}" height="${H}">${defs()}<rect width="${LW}" height="${H}" fill="${C.paper}"/>`;
  BAND_ORDER.forEach((pl, b) => { const y = y0 + b * bandH + bandH / 2; L += `<g data-kplace="${pl}" style="cursor:pointer"><rect x="0" y="${y0 + b * bandH}" width="${LW}" height="${bandH}" fill="${pl === kalaPlace ? C.ochreL : (b % 2 ? C.paper2 : C.paper)}" opacity="${pl === kalaPlace ? .8 : .6}"/>${placeIcon(PLACES[pl].icon, 24, y, .62)}${LW < 60 ? "" : `<text x="44" y="${y + 5}" font-family="Kalam" font-size="13" fill="${C.ink}">${PLACES[pl].short || placeName(pl)}</text>`}</g>`; });
  $("#kalaLabels").innerHTML = L + "</svg>";
  $("#kalaLabels").onclick = e => { const g = e.target.closest("[data-kplace]"); if (!g) return; const pl = g.dataset.kplace; kalaPlace = kalaPlace === pl ? null : pl; renderKala(); if (kalaPlace) placeInfo(pl); };
  // sync vertical scroll & drag
  const sc = $("#kalaScroll"), lb = $("#kalaLabels"); sc.onscroll = () => { lb.scrollTop = sc.scrollTop; };
  dragScroll(sc);
  if (curIdx >= 0) sc.scrollLeft = Math.max(0, X(curIdx) - sc.clientWidth / 2);
  $("#kalaSvg").addEventListener("click", e => {
    const n = e.target.closest("[data-node]"); if (n) { nodeInfo(n.dataset.node); return; }
    const p = e.target.closest("[data-person]"); if (p) { kalaHL = kalaHL === p.dataset.person ? null : p.dataset.person; renderKala(); }
  });
  if (kalaHL) showInfo(`<div class="ic">${headSVG(kalaHL)}</div><div class="tx"><b>${PEOPLE[kalaHL].n}</b><span class="hand" style="color:var(--muted)">their river through time — tap a moment</span></div><button class="kbtn" data-soul="${kalaHL}">Their story</button>`);
}
function dragScroll(el) {
  let d = null; el.onpointerdown = e => { if (e.pointerType !== "mouse") return; d = { x: e.clientX, y: e.clientY, l: el.scrollLeft, t: el.scrollTop, m: false }; };
  el.onpointermove = e => { if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 5) { d.m = true; el.classList.add("drag"); } el.scrollLeft = d.l - dx; el.scrollTop = d.t - dy; };
  el.onpointerup = el.onpointerleave = () => { el.classList.remove("drag"); setTimeout(() => d = null, 0); };
  el.addEventListener("click", e => { if (d && d.m) { e.stopPropagation(); e.preventDefault(); } }, true);
}

/* ---- DEŚA: the land, as a game map ---- */
function renderDesha() {
  const visitedPlaces = new Set([...st.visited].map(id => NODE[id]?.place).filter(Boolean));
  const cur = NODE[current]?.place;
  const land = "M120 60 C260 30 520 40 700 60 C820 74 900 120 960 200 C990 250 980 330 940 380 C900 430 880 470 900 520 C920 560 900 600 860 640 C800 700 720 760 660 860 L600 900 L520 900 C500 840 470 790 430 740 C390 700 330 690 280 680 C230 672 200 690 160 680 C110 668 60 650 50 615 C42 585 80 566 120 560 C170 556 190 530 180 500 C170 470 120 450 100 410 C70 350 60 260 70 180 C76 120 90 75 120 60Z";
  let s = `${defs()}<rect width="1000" height="900" fill="url(#waves)"/>
   <path d="${land}" fill="${C.land}" stroke="${C.gold}" stroke-width="3"/>
   <path d="${land}" fill="none" stroke="${C.gold}" stroke-width="1" stroke-dasharray="2 6" transform="translate(0 6)" opacity=".5"/>`;
  // mountains
  for (let x = 200; x < 900; x += 46) { const h = 30 + ((x * 7) % 23); s += `<path d="M${x - 26} 150 L${x} ${150 - h} L${x + 26} 150Z" fill="${C.indigoL}" stroke="${C.iron}" stroke-width="2"/><path d="M${x - 8} ${150 - h + 14} L${x} ${150 - h} L${x + 8} ${150 - h + 14}Z" fill="${C.white}"/>`; }
  // rivers
  s += `<path d="M560 140 C 540 220 560 300 590 350 C 640 430 720 480 800 520 C 860 550 900 580 930 600" fill="none" stroke="${C.river}" stroke-width="7" stroke-linecap="round"/>
   <path d="M470 140 C 450 220 440 300 440 360 C 440 420 450 470 560 500 C 620 516 680 500 720 490" fill="none" stroke="${C.river}" stroke-width="5" stroke-linecap="round"/>
   <path d="M330 150 C 320 210 300 260 280 300 C 250 360 230 400 200 450" fill="none" stroke="${C.river}" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/>
   <text x="616" y="410" font-family="Kalam" font-size="15" fill="${C.ink}" opacity=".6" transform="rotate(32 616 410)">Gaṅgā</text>
   <text x="420" y="400" font-family="Kalam" font-size="14" fill="${C.ink}" opacity=".6" transform="rotate(-80 420 400)">Yamunā</text>
   <text x="228" y="380" font-family="Kalam" font-size="14" fill="${C.ink}" opacity=".5" transform="rotate(-60 228 380)">Sarasvatī</text>`;
  // terrain: desert dunes, Vindhya hills, forests, region names
  s += scatter(34, 110, 290, 400, 560, (x, y, r) => `<path d="M${x - 12} ${y} q 12 -9 24 0" fill="none" stroke="${C.ochre}" stroke-width="2" opacity=".55"/>`, 6);
  for (let x = 300; x < 780; x += 30) { const h = 12 + ((x * 13) % 9); s += `<path d="M${x - 18} ${600 - (x - 300) * .06} q 18 -${h * 2} 36 0" fill="${C.ochre}" opacity=".5" stroke="${C.iron}" stroke-width="1.2"/>`; }
  const tree = (x, y, r) => `<g transform="translate(${x} ${y})"><path d="M0 0 v8" stroke="${C.iron}" stroke-width="1.5"/><path d="M-7 2 L0 -12 L7 2Z" fill="${C.leaf}" stroke="${C.iron}" stroke-width="1"/></g>`;
  s += scatter(30, 170, 330, 260, 370, (x, y, r) => tree(x, y, r), 2) + scatter(12, 400, 470, 320, 390, (x, y, r) => tree(x, y, r), 4) + scatter(12, 600, 680, 280, 340, (x, y, r) => tree(x, y, r), 5) + scatter(18, 560, 760, 620, 760, (x, y, r) => tree(x, y, r), 8);
  const big = (t, x, y, r = 0, sz = 22) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Gotu" font-size="${sz}" letter-spacing="6" fill="${C.ink}" opacity=".18" transform="rotate(${r} ${x} ${y})">${t}</text>`;
  s += big("HIMAVAT", 680, 72, 0, 18) + big("MARUBHŪMI", 200, 520, -8) + big("VINDHYA", 540, 640, -4) + big("KURU", 470, 232, 0, 26) + big("PAŚCIMA SĀGARA", 34, 760, -80, 16) + big("PŪRVA SĀGARA", 960, 740, 80, 16);
  // sea life
  s += `<g opacity=".7"><path d="M60 780 q 20 -20 40 0 q -20 20 -40 0z M100 780 l 12 -8 v16z" fill="${C.river}"/><path d="M820 760 q 26 -24 52 0 q -26 24 -52 0z M872 760 l 14 -9 v18z" fill="${C.river}"/>
    <path d="M30 520 l 30 0 l -6 12 h -20z M44 520 v -26 l 14 16z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.5"/></g>`;
  // landmarks (fogged)
  LANDMARKS.forEach(({ n, map: [x, y], icon }) => { s += `<g opacity=".35">${placeIcon(icon, x, y, .7)}<text x="${x}" y="${y + 28}" text-anchor="middle" font-family="Kalam" font-size="13" fill="${C.ink}">${n}</text></g>`; });
  // trail of the reader
  const pts = []; st.trail.forEach(id => { const pl = NODE[id]?.place; if (!pl) return; const p = PLACES[pl].map; if (!pts.length || pts.at(-1) !== p) pts.push(p); });
  if (pts.length > 1) {
    const d = pts.map((p, i) => i ? `Q ${(pts[i - 1][0] + p[0]) / 2} ${Math.min(pts[i - 1][1], p[1]) - 40} ${p[0]} ${p[1]}` : `M${p[0]} ${p[1]}`).join(" ");
    s += `<path d="${d}" fill="none" stroke="${C.iron}" stroke-width="6" opacity=".35"/><path class="trail" d="${d}" fill="none" stroke="${C.ochreL}" stroke-width="3.5" stroke-dasharray="10 10" filter="url(#glow)"/>`;
  }
  // story places
  Object.entries(PLACES).forEach(([id, p]) => {
    const [x, y] = p.map, lit = visitedPlaces.has(id);
    s += `<g class="dplace" data-place="${id}">${lit ? `<circle cx="${x}" cy="${y}" r="30" fill="url(#lampG)"/>` : ""}
      <circle cx="${x}" cy="${y}" r="21" fill="${C.paper}" stroke="${lit ? C.gold : C.muted}" stroke-width="${lit ? 3 : 2}" ${CERT[id] === "traditional" ? 'stroke-dasharray="6 4"' : ""}/>${placeIcon(p.icon, x, y + 1, .62)}
      ${lit ? "" : `<g opacity=".8">${[[-14, -6], [0, -12], [14, -6], [-6, 6], [10, 6]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="10" fill="#d9ccad"/>`).join("")}</g>`}
      ${lit ? `<text x="${x}" y="${y + 38}" text-anchor="middle" font-family="Kalam" font-size="14" font-weight="700" fill="${C.gold}">${placeName(id).replace("Kāmyaka & Dvaita Forests", "The Forests")}</text>` : ""}
      ${id === cur ? `<circle class="ring" cx="${x}" cy="${y}" r="14" fill="none" stroke="${C.ochreL}" stroke-width="3"/>` : ""}</g>`;
  });
  // compass + cartouche
  s += `<g transform="translate(860 800)"><circle r="44" fill="${C.paper}" stroke="${C.gold}" stroke-width="2"/>${[0, 90, 180, 270].map(a => `<path transform="rotate(${a})" d="M0 -40 L8 0 L0 6 L-8 0Z" fill="${a ? C.ochre : C.madder}" stroke="${C.iron}" stroke-width="1.2"/>`).join("")}<text y="-48" text-anchor="middle" font-family="Gotu" font-size="14" fill="${C.ink}">N</text></g>
   <g transform="translate(150 820)"><rect x="-110" y="-30" width="220" height="56" rx="8" fill="${C.paper}" stroke="${C.gold}" stroke-width="2"/><text y="-2" text-anchor="middle" font-family="Tiro Devanagari Sanskrit" font-size="24" fill="${C.gold}">भारतवर्ष</text><text y="18" text-anchor="middle" font-family="Kalam" font-size="13" fill="${C.ink}" opacity=".7">${visitedPlaces.size} lands walked</text></g>`;
  $("#desha").innerHTML = `<svg id="deshaSvg" viewBox="0 0 1000 900">${s}</svg>`;
  $("#deshaSvg").addEventListener("click", e => { const p = e.target.closest("[data-place]"); if (!p) return; placeInfo(p.dataset.place); });
  if (cur) { const box = $("#desha"), [x, y] = PLACES[cur].map, svg = $("#deshaSvg"); requestAnimationFrame(() => { const k = svg.clientWidth / 1000; box.scrollLeft = x * k - box.clientWidth / 2; box.scrollTop = y * k - box.clientHeight / 2; }); }
}

/* ---- PĀTRA: souls ---- */
function renderPatra() {
  const met = new Set([...st.visited].flatMap(id => NODE[id]?.cast || []));
  $("#patra").innerHTML = `<div class="pgrid">${Object.entries(PEOPLE).map(([id, p]) => {
    const seen = TL.filter(n => n.cast.includes(id) && st.visited.has(n.id)).length;
    return `<button class="pcard ${met.has(id) ? "" : "unmet"}" data-pp="${id}" style="--c:${p.line}"><div class="face">${headSVG(id)}</div><div class="nm">${met.has(id) ? p.n : "?"}</div><div style="font-size:12px;color:var(--muted)">${seen ? seen + " walked" : ""}</div></button>`;
  }).join("")}</div>`;
  $("#patra").onclick = e => { const c = e.target.closest("[data-pp]"); if (!c) return; openSoul(c.dataset.pp, current); };
}
/* ---- MĀRGA: my path ---- */
function renderMarga() {
  if (!st.path.length) { $("#marga").innerHTML = `<div class="empty">Your path begins when you choose at the end of a scene.</div>`; return; }
  $("#marga").innerHTML = `<div class="journey">${st.path.map(r => `<div class="jstep" data-go="${r.to}"><div class="dot">${r.by === "character" ? headSVG(r.ref) : placeBadge(r.ref)}</div>
    <span class="by">${r.by === "character" ? "followed " + PEOPLE[r.ref].n : "went to " + placeName(r.ref)}</span><b>${NODE[r.from].title} → ${NODE[r.to].title}</b>${r.note ? `<div class="bubble">${r.note}</div>` : ""}</div>`).join("")}</div>`;
}
/* ---- SMṚTI: bookmarks ---- */
function renderSmriti() {
  if (!st.marks.length) { $("#smriti").innerHTML = `<div class="empty">Bookmark a moment while reading — it will wait for you here.</div>`; return; }
  $("#smriti").innerHTML = `<div class="marks">${st.marks.slice().reverse().map((m, i) => `<button class="mark" data-mk="${st.marks.length - 1 - i}"><div class="ic">${placeBadge(NODE[m.id].place)}</div><div><b>${m.where}</b><small style="color:var(--muted)">${NODE[m.id].title}</small>${m.note ? `<div class="note">${m.note}</div>` : ""}</div></button>`).join("")}</div>`;
  $("#smriti").onclick = e => { const b = e.target.closest("[data-mk]"); if (!b) return; const m = st.marks[+b.dataset.mk]; $("#maps").classList.remove("on"); go(m.id, { at: m.p }); };
}

/* =====================================================================
   SOUL — one character's story, in order, marked where you were
   ===================================================================== */
function openSoul(pid, fromId) {
  soulId = pid; soulFrom = fromId; const p = PEOPLE[pid], from = NODE[fromId];
  const mine = TL.filter(n => n.cast.includes(pid));
  // the moment that matches where the reader was in the overall story
  let here = mine.find(n => n.id === fromId) || (from ? mine.find(n => n.t >= from.t) : null) || null;
  const hereNote = here && from && here.id !== fromId ? (here.t > from.t ? "next for them after where you were" : "") : "you are here in the story";
  let html = `<div class="shead" style="--c:${p.line}"><div class="face">${headSVG(pid)}</div><div><h3>${p.n}</h3><div class="dev">${p.dev}</div><p>${p.bio}</p>
    <div class="acts"><button class="kbtn" id="soulRiver">Their river in Kāla</button>${from ? `<button class="kbtn" id="soulBack">↩ Back to ${from.title.split(" —")[0]}</button>` : ""}</div></div>
    <button class="sclose" id="soulClose">×</button></div><div class="sbody" id="sbody"><div class="sline" style="--c:${p.line}">`;
  let era = "";
  mine.forEach(n => {
    if (n.era !== era) { era = n.era; html += `<div class="sera">${era}</div>`; }
    const unw = n.status === "unwritten", isHere = here && n.id === here.id, seen = st.visited.has(n.id);
    const others = n.cast.filter(c => c !== pid);
    html += `<button class="smo ${unw ? "unw" : ""} ${isHere ? "here" : ""}" ${unw ? "disabled" : `data-go="${n.id}"`} id="smo-${n.id}" style="--c:${p.line}">
      <span class="pin">${placeBadge(n.place)}</span>${seen ? `<span class="tick">✓ walked</span>` : ""}
      <b>${n.title}${ASSEMBLY.has(n.id) ? ` <span class="cert" title="Every thread passes through this moment">✦ assembly</span>` : ""}</b><div class="meta">${placeName(n.place)}${others.length ? " · with " + others.map(c => PEOPLE[c].n).join(", ") : " · alone"}</div>
      ${isHere ? `<span class="youare">◉ ${hereNote}</span>` : ""}${unw ? `<div class="meta" style="font-family:Kalam">not yet painted</div>` : ""}</button>`;
  });
  if (p.death != null) html += `<div class="sdeath">✦ Here ${p.n}’s thread ends.</div>`;
  html += `</div></div>`;
  const el = $("#soul"); el.innerHTML = html; el.classList.add("on");
  $("#soulClose").onclick = () => el.classList.remove("on");
  $("#soulBack") && ($("#soulBack").onclick = () => el.classList.remove("on"));
  $("#soulRiver").onclick = () => { el.classList.remove("on"); kalaHL = pid; kalaPlace = null; openMaps("kala"); };
  if (here) requestAnimationFrame(() => { const t = document.getElementById("smo-" + here.id); t && t.scrollIntoView({ block: "center" }); });
}

/* ---- helpers ---- */
function wireScene() {
  $$(".prog i").forEach(d => { const go2 = () => { const c = SCENES[current].caps[+d.dataset.beat]; scrollToP((c[0] + Math.min(c[1], 1)) / 2); }; d.onclick = go2; d.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go2(); } }; });
  const ps = $("#pnSave"); if (ps) ps.onclick = () => { const last = st.path.at(-1); last.note = $("#pnInput").value.trim(); last.noted = true; save(); $(".pathnote").innerHTML = `<span>Noted in your path ✓</span>`; };
  $$(".med[data-soul]").forEach(m => { if (!m.hasAttribute("tabindex")) { m.tabIndex = 0; m.setAttribute("role", "button"); } m.onkeydown = e => { if (e.key === "Enter") openSoul(m.dataset.soul, current); }; });
}
function coach() {
  if (current === "home" || store.get("m5.coached", false)) return; const m = $(".scene-head .med"); if (!m) return;
  const r = m.getBoundingClientRect(), c = document.createElement("div"); c.className = "coach"; c.textContent = "Tap a face to follow their story";
  c.style.left = (r.left + r.width / 2 + scrollX) + "px"; c.style.top = (r.top + scrollY - 46) + "px"; c.style.transform = "translateX(-50%)"; document.body.appendChild(c);
  const done = () => { c.remove(); store.set("m5.coached", true); removeEventListener("scroll", done); }; setTimeout(() => addEventListener("scroll", done, { once: true }), 400); setTimeout(done, 7000);
}
function openSources(id) {
  const m = META[id] || {}, n = NODE[id], cert = CERT[n.place] || "textual";
  $("#drawer").innerHTML = `<button class="x" id="drawerClose" aria-label="Close">×</button><h4>Sources & tellings</h4><div style="color:var(--muted)">${n.title}</div>
   <div class="row"><div class="lab">Critical Edition reference</div><div>${m.ce || "—"}<span class="unv">unverified</span></div></div>
   <div class="row"><div class="lab">Which layer of the text</div>${TIERS.map((t, i) => `<span class="tier ${i === (m.tier ?? 0) ? "on" : ""}">${t}</span>`).join("")}</div>
   ${m.debate ? `<div class="row"><div class="lab">Where scholars and tellings differ</div><div>${m.debate}</div></div>` : ""}
   <div class="row"><div class="lab">Who is telling this</div><div>${m.narr || "—"}</div><div style="font-size:14px;color:var(--muted);margin-top:4px">The whole epic is told by Ugraśravas to the sages of the Naimiṣa forest, retelling Vaiśampāyana’s recital to King Janamejaya.</div></div>
   <div class="row"><div class="lab">Place</div><div>${PLACES[n.place].n}<span class="cert">${cert}</span></div></div>
   <div class="row"><div class="lab">Other tellings</div><div style="font-size:15px;color:var(--muted)">Comparison drawer (Tamil, Telugu, Pandavani, Rajasthani, Wayang) arrives in Sprint 7.</div></div>`;
  $("#drawerClose").onclick = () => $("#drawer").classList.remove("on");
  $("#drawer").classList.add("on");
}

/* =====================================================================
   DATA LOADING — from the content collections rendered into the page
   ===================================================================== */
function loadData(data) {
  const resolve = (k, table) => (k && table[k]) || k;
  PLACES = {}; CERT = {};
  data.places.filter(p => !p.landmark).sort((a, b) => a.band - b.band).forEach(p => {
    PLACES[p.id] = { n: p.name, short: p.short, d: p.desc, icon: p.icon, map: p.map_xy };
    CERT[p.id] = p.certainty;
  });
  BAND_ORDER = data.places.filter(p => !p.landmark).sort((a, b) => a.band - b.band).map(p => p.id);
  LANDMARKS = data.places.filter(p => p.landmark).map(p => ({ n: p.name, map: p.map_xy, icon: p.icon }));
  PEOPLE = {};
  data.people.forEach(p => {
    const f = Object.assign({}, p.figure);
    f.skin = resolve(f.skin, SK); if (f.cloth) f.cloth = resolve(f.cloth, C);
    PEOPLE[p.id] = { n: p.name, dev: p.dev, bio: p.bio, line: p.identity_colour, dash: p.line_pattern, home: p.home, returnsHome: p.returns_home, death: p.death_t, f };
  });
  TIERS = data.tiers;
  TL = data.moments.map(m => ({ id: m.id, t: m.t_story, place: m.place_id, cast: m.cast.map(c => c.id), title: m.title, status: m.status, era: m.era })).sort((a, b) => a.t - b.t);
  NODE = Object.fromEntries(TL.map(n => [n.id, n]));
  ASSEMBLY = new Set(data.moments.filter(m => m.assembly).map(m => m.id));
  META = {}; SCENES = {};
  data.moments.forEach(m => {
    const narr = m.narrator_chain?.length ? `${m.narrator_chain[0]} tells ${m.narrator_chain[1]}${m.narration_note ? ` (${m.narration_note})` : ""}` : null;
    if (m.status !== "unwritten") META[m.id] = { narr, ce: m.ce_ref.label, tier: m.variant_tier, debate: m.debate_note };
    if (m.status === "unwritten") return;
    const body = data.bodies[m.id] || { beats: [], text: "" };
    const sc = { parva: m.parva, dev: m.dev, branches: m.branches };
    if (m.status === "built") {
      const art = WORLDS[m.id];
      Object.assign(sc, { world: art.world, animate: art.animate, len: m.len, day: m.day, intro: m.intro, note: m.content_notes?.[0], cams: m.cams, anchors: m.anchors || {},
        caps: body.beats.map(b => [b.from, b.to, b.title, b.dev, b.html, b.warn || null, b.cast]) });
    } else {
      Object.assign(sc, { art: m.art, text: body.text });
    }
    SCENES[m.id] = sc;
  });
}

/* read the MDX bodies, pre-rendered by Astro into <template data-moment> elements */
function readBodies() {
  const bodies = {};
  document.querySelectorAll("template[data-moment]").forEach(tpl => {
    const frag = tpl.content;
    const beats = [...frag.querySelectorAll(".beat-src")].map(b => ({
      from: +b.dataset.from, to: +b.dataset.to, title: b.dataset.title, dev: b.dataset.dev, warn: b.dataset.warn || null,
      cast: JSON.parse(b.dataset.cast || "[]"),
      html: [...b.querySelectorAll("p")].map(p => p.innerHTML).join(" ") || b.innerHTML.trim(),
    }));
    const text = beats.length ? "" : [...frag.querySelectorAll("p")].map(p => p.innerHTML).join(" ");
    bodies[tpl.dataset.moment] = { beats, text };
  });
  return bodies;
}

/* =====================================================================
   BOOT
   ===================================================================== */
let started = false;
export function startReader(data) {
  if (started) return; started = true;
  data.bodies = readBodies();
  loadData(data);
  st = { visited: new Set(store.get("m2.visited", [])), trail: store.get("m2.trail", []), path: store.get("m2.path", []), marks: store.get("m2.marks", []) };

  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
  addEventListener("resize", frame);

  /* interactions */
  document.addEventListener("click", e => {
    const so = e.target.closest("[data-soul]"); if (so) { e.preventDefault(); e.stopPropagation(); openSoul(so.dataset.soul, current); return; }
    const g = e.target.closest("[data-go]"); if (g) {
      const fromOverlay = $("#maps").classList.contains("on") || $("#soul").classList.contains("on");
      $("#maps").classList.remove("on"); $("#soul").classList.remove("on");
      if (fromOverlay && NODE[current] && g.dataset.go !== current) returnStack.push({ id: current, y: scrollY, title: NODE[current].title });
      go(g.dataset.go, fromOverlay && returnStack.length ? { via: "index" } : {}); return;
    }
    const m = e.target.closest("[data-map]"); if (m) { openMaps(m.dataset.map); return; }
    const j = e.target.closest("a.jump"); if (j) {
      e.preventDefault();
      returnStack.push({ id: current, y: scrollY, title: NODE[current].title });
      const to = j.dataset.to, at = j.dataset.anchor ? SCENES[to].anchors[j.dataset.anchor] : (j.dataset.at != null ? +j.dataset.at : null);
      const via = NODE[to].t < NODE[returnStack.at(-1).id].t ? "memory" : "omen"; go(to, { at, via }); return;
    }
    const c = e.target.closest("[data-choose]"); if (c && !c.disabled) {
      const ch = choicesFor(current)[+c.dataset.choose];
      st.path.push({ from: current, to: ch.to.id, by: ch.by, ref: ch.ref, note: "", t: Date.now() }); save(); returnStack = []; go(ch.to.id); return;
    }
    const src = e.target.closest("[data-src]"); if (src) { openSources(src.dataset.src); return; }
    const rc = e.target.closest("[data-capjump]"); if (rc) { scrollToP(+rc.dataset.capjump); return; }
    const cr = e.target.closest("[data-crumb]"); if (cr) { const k = +cr.dataset.crumb; const r = returnStack[k]; returnStack = returnStack.slice(0, k); go(r.id, { y: r.y }); return; }
  });
  $("#brand").onclick = () => go("home");
  addEventListener("popstate", () => { const id = location.hash.slice(1) || "home"; if (id !== current) go(id); });
  $("#mOk").onclick = () => { $("#modal").classList.remove("on"); modalCb && modalCb($("#mText").value.trim()); };
  $("#mCancel").onclick = () => { $("#modal").classList.remove("on"); modalCb && modalCb(""); };
  $("#bmBtn").onclick = () => {
    const sc = SCENES[current], p = sceneP(); const ci = sc.caps ? sc.caps.findIndex(c => p >= c[0] && p < c[1]) : -1; const where = ci >= 0 ? sc.caps[ci][2] : NODE[current].title;
    ask(`Bookmark · ${where}`, "What do you want to remember about this moment?", note => { st.marks.push({ id: current, p: p ?? 0, where, note, t: Date.now() }); save(); toast("Bookmarked"); }, "Save");
  };
  $("#mapBtn").onclick = () => openMaps(); $("#mapClose").onclick = () => $("#maps").classList.remove("on");
  $$(".mtab").forEach(b => b.onclick = () => { mapTab = b.dataset.t; if (mapTab !== "kala") { kalaHL = null; kalaPlace = null; } renderMaps(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { $("#drawer").classList.remove("on"); $("#soul").classList.remove("on"); $("#maps").classList.remove("on"); } });
  $("#gateYes").onclick = () => { store.set("m6.consent", true); $("#gate").classList.remove("on"); if (pendingGo) { const [i, o] = pendingGo; pendingGo = null; go(i, o); } };
  $("#gateNo").onclick = () => { $("#gate").classList.remove("on"); pendingGo = null; };

  applyKalamkari();
  go((location.hash.slice(1) && SCENES[location.hash.slice(1)]) ? location.hash.slice(1) : "home");
}
