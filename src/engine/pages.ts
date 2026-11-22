/* Page markup: the title page, scene pages (built and drafted), generated choices and the path note. */
import { C, SK, defs } from "../art/palette";
import { sun, bird, scatter, filler, leafSprig } from "../art/motifs";
import { fig } from "../art/figure";
import { chariot } from "../art/objects";
import { BANDS } from "../art/tiles";
import { vignette } from "../art/vignettes";
import { setLooks } from "../art/looks";
import { story, progress, ui } from "./state";
import { figureFor } from "./data";
import type { FigureOpts } from "../art/figure";
import { headSVG, placeBadge, placeName, choicesFor } from "./badges";
import { $$ } from "./util";
import type { Choice, BuiltScene, DraftedScene } from "./types";

export const SUB = "painted in the Kalamkari of Srikalahasti";

/** a tappable portrait (Rule 6): opens that person's story */
export const med = (id: string, extra = "", t?: number): string =>
  `<div class="med" data-soul="${id}" data-tip="${story.people[id].n}" role="button" tabindex="0" aria-label="Open ${story.people[id].n}’s story"${extra}>${headSVG(id, t)}</div>`;

export function meds(ids: string[], t?: number): string {
  return `<div class="meds">${ids.map(id => med(id, "", t)).join("")}</div>`;
}

export function renderHome(): string {
  return `<section class="page on"><div class="home"><div class="kframe">${BANDS}<div class="home-inner">
   <div class="dev big">महाभारत</div><h1>Mahābhārata</h1><div class="sub">${SUB}</div>
   <svg class="home-art" viewBox="0 0 760 330" role="img" aria-label="Arjuna and Kṛṣṇa in their chariot beneath the sun, drawn in the manner of a Srikalahasti Kalamkari cloth">${defs()}<rect width="760" height="330" fill="${C.sky}"/><rect y="250" width="760" height="80" fill="${C.ground}"/>
     ${sun(640, 80, 40)}${bird(140, 70)}${scatter(16, 20, 740, 20, 220, (x, y, r) => filler(x, y, r * .8), 4)}
     <g transform="translate(-40 -40) scale(.95)">${chariot({ x: 300, y: 330, banner: "hanuman", cap: C.madder, cap2: C.indigo })}
     ${fig({ x: 352, y: 234, s: .92, skin: SK.krishna, cloth: C.ochre, cloth2: C.madder, crown: "krishna", weapon: "reins", halo: true })}
     ${fig({ x: 272, y: 234, s: 1.02, skin: SK.arjuna, cloth: C.indigo, cloth2: C.ochre, crown: "kirita", weapon: "bow", armour: true, arrow: true })}</g>${leafSprig(40, 310, 1.3)}${leafSprig(720, 310, 1.3, 6)}</svg>
   <p class="lead">Each scene is a painted page. Scroll, and the camera moves through it. When a scene ends, follow a soul or go to a place — always onward in time.</p>
   <div class="start-btns"><button class="kbtn primary" data-go="dice-hall">Begin at the Dice Hall</button><button class="kbtn" data-go="day-17">Enter Day 17</button><button class="kbtn" data-map="kala">Open the Maps</button></div>
   <div class="rule"><span style="font-size:26px">⟶</span><span><b>The rule of the river:</b> choices move only forward in time, by character or by place. The past and future are reached through memories <b>↺</b> and omens <b>⟳</b> in the text.</span></div>
  </div></div></div></section>`;
}

function choiceCard(c: Choice, i: number): string {
  const n = c.to, seen = progress.visited.has(n.id), dis = n.status === "unwritten";
  const icon = c.by === "character" ? headSVG(c.ref, n.t) : placeBadge(c.ref);
  const label = c.by === "character" ? `Follow ${story.people[c.ref].n}` : `Go to ${story.places[c.ref].n.split(",")[0]}`;
  return `<button class="choice" data-choose="${i}" ${dis ? "disabled" : ""}>${seen ? `<span class="seen">✓ walked</span>` : ""}
    <div class="big">${icon}</div><div class="by">${label}</div><h3>${n.title}</h3><div class="when">${dis ? "not yet painted" : placeName(n.place)}</div></button>`;
}

function choicesHTML(id: string): string {
  const cs = choicesFor(id); if (!cs.length) return "";
  return `<section class="choices"><div class="hand">— the river divides —</div><h2>Whom will you follow?</h2><div class="why">Every path leads forward in time.</div>
   <div class="choice-grid">${cs.map(choiceCard).join("")}</div></section>`;
}

const headButtons = (id: string): string => `<div class="headbtns"><button class="kbtn" data-src="${id}">Sources & tellings</button></div>`;

function pathNoteHTML(id: string): string {
  const last = progress.path.at(-1); if (!last || last.to !== id || last.note || last.noted) return "";
  const who = last.by === "character" ? `You followed ${story.people[last.ref].n}.` : `You went to ${placeName(last.ref)}.`;
  return `<div class="pathnote"><span>${who} Why?</span><input id="pnInput" placeholder="optional note for your path…" aria-label="Why did you choose this path? (optional)"><button id="pnSave">Save</button></div>`;
}

function ribbon(): string {
  const via = ui.arrivedVia === "memory" ? "↺ You have stepped into a memory" : ui.arrivedVia === "omen" ? "⟳ You are glimpsing what is to come" : "◈ Opened from the index";
  return `<div class="thr-ribbon" role="note">${via}${ui.returnStack.length ? ` — from “${ui.returnStack.at(-1)!.title}”` : ""}</div>`;
}

function renderDrafted(id: string, sc: DraftedScene): string {
  const n = story.node[id];
  setLooks(pid => (story.people[pid] ? figureFor(pid, n.t) : undefined));
  return `<section class="page on">${ribbon()}<div class="stub"><div class="kframe">${BANDS}<div class="stub-inner">
     ${vignette(sc.art, sc.artAlt, { icon: story.places[n.place].icon, names: n.cast.map(c => story.people[c].n), figs: n.cast.map(c => ({ ...figureFor(c, n.t), ...(n.look[c]?.weapon ? { weapon: n.look[c].weapon as FigureOpts["weapon"] } : {}), ...(n.look[c]?.seated ? { seated: true } : {}) })) })}<div class="scene-head" style="padding:18px 0 0"><div class="parva">${sc.parva} · ${placeName(n.place)}</div><h1 tabindex="-1">${n.title}</h1><div class="dev" lang="sa">${sc.dev}</div>${meds(n.cast, n.t)}${headButtons(id)}</div>
     ${pathNoteHTML(id)}<p class="text">${sc.text}</p><div class="unwritten">✎ Drafted. The painted, scroll-animated version of this page comes in a later sprint.</div>
   </div></div></div>${choicesHTML(id)}</section>`;
}

function renderBuilt(id: string, sc: BuiltScene): string {
  const n = story.node[id], m = story.meta[id];
  setLooks(pid => (story.people[pid] ? figureFor(pid, n.t) : undefined));
  const beats = sc.beats;
  return `<section class="page on">${ribbon()}
   <header class="scene-head"><div class="parva">${sc.parva} · ${placeName(n.place)}</div><h1 tabindex="-1">${n.title}</h1><div class="dev" lang="sa">${sc.dev}</div>
     <p class="intro">${sc.intro}</p>${meds(n.cast, n.t)}${headButtons(id)}${pathNoteHTML(id)}<div class="scrollhint">scroll ↓ to unroll · scroll ↑ to go back</div></header>
   <div class="scrolly" id="scrolly" style="height:${sc.len * 100}vh"><div class="sticky"><div class="stage kframe" id="stage">${BANDS}
     <svg class="world" id="world" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sc.world()}</svg>
     ${sc.day ? `<div class="daylabel">${sc.day}</div>` : ""}<div class="prog" role="tablist" aria-label="Scene beats"><span class="updown" aria-hidden="true">↑↓</span>${beats.map((b, i) => `<i role="tab" tabindex="0" aria-label="Go to: ${b.title}" data-beat="${i}"></i>`).join("")}</div>
     <div class="captions" id="capLive" aria-live="polite">${beats.map(b => `<div class="cap"><div class="ch"><b>${b.title}</b><span class="dev" lang="sa">${b.dev}</span>${m.narr ? `<span class="who" title="Who is telling this">🗣 ${m.narr}</span>` : ""}${b.cast.length ? `<span class="capcast">${b.cast.map(id => med(id)).join("")}</span>` : ""}</div><p>${b.html}</p><p class="sr-only">In the painting: ${b.alt}</p></div>`).join("")}</div>
   </div></div></div>${choicesHTML(id)}</section>`;
}

export function renderScene(id: string): string {
  const sc = story.scenes[id];
  return sc.kind === "built" ? renderBuilt(id, sc) : renderDrafted(id, sc);
}

/** mark inline jumps as memory (past) or omen (future) */
export function decorateJumps(): void {
  const t = story.node[ui.current]?.t ?? 0;
  $$<HTMLAnchorElement>("a.jump").forEach(a => {
    const to = story.node[a.dataset.to ?? ""]; if (!to || a.querySelector(".kind")) return;
    a.insertAdjacentHTML("beforeend", `<span class="kind">${to.t < t ? "↺ memory" : "⟳ omen"}</span>`);
  });
}
