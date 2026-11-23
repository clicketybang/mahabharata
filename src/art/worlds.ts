/* Painted worlds for the built (scroll-animated) scenes, with their scroll choreography.
   Keyed by moment id. Camera keyframes live in the moment's MDX frontmatter (`cams`). */
import { C, S, defs } from "./palette";
import { rosette, sun, bird, scatter, filler } from "./motifs";
import { who } from "./looks";
import { fig } from "./figure";
import { chariot, elephant, crowdRow, arrowShape, tent } from "./objects";
import { clamp, ease } from "../engine/util";

/* attribute setter that accepts numbers (SVG attributes are strings) */
const set = (el: Element | null, name: string, v: string | number) => el?.setAttribute(name, String(v));
const q = (w: SVGSVGElement, s: string): Element | null => w.querySelector(s);

export interface WorldArt { world: () => string; animate: (p: number, w: SVGSVGElement) => void }

function worldDay17(): string {
  return `${defs()}<g id="cam"><g id="paint">
   <rect x="-3000" y="-3000" width="8400" height="3640" fill="${C.sky}"/>
   <rect x="-3000" y="620" width="8400" height="4000" fill="${C.ground}"/>
   <path d="M-3000 620 H5400" stroke="${C.iron}" stroke-width="3"/>
   ${sun(1980, 190, 62)}${bird(700, 160, 1.2)}${bird(760, 130)}${bird(1300, 210, .9)}
   ${scatter(26, -200, 2600, 40, 520, (x, y, r) => filler(x, y, r), 3)}
   ${crowdRow(-200, 2600, 600, .8, C.indigoL, 40, 2)}
   ${elephant(300, 612, .7, 1)}${elephant(1050, 612, .7, -1, C.leaf)}${elephant(2300, 612, .7, -1)}
   ${crowdRow(-150, 2600, 660, .95, C.madder, 48, 5)}
   ${tent(110, 700, 1.3)}
   ${scatter(30, -400, 2700, 760, 1180, (x, y, r) => r > .55 ? rosette(x, y, 6 + r * 5) : "", 11)}
   <g>${fig(who("bhima", { id: "bhima", x: 420, y: 930, s: 1.45, weapon: "mace" }))}
     <g id="dush">${fig(who("dushasana", { x: 640, y: 930, s: 1.4, face: "left", weapon: "none" }))}</g>
     <g id="blood" opacity="0">${scatter(14, 560, 720, 760, 900, (x, y, r) => `<circle cx="${x}" cy="${y}" r="${3 + r * 6}" fill="${C.madder}" stroke="${C.iron}" stroke-width="1"/>`, 5)}</g></g>
   ${chariot({ id: "arjCh", x: 1260, y: 930, banner: "hanuman", cap: C.madder, cap2: C.indigo })}
   ${fig(who("krishna", { x: 1312, y: 834, s: .92, weapon: "reins" }))}
   ${fig(who("arjuna", { id: "arjuna", x: 1232, y: 834, s: 1.02, weapon: "bow" }))}
   <g>${chariot({ id: "karCh", x: 2200, y: 930, face: "left", banner: "elephant", cap: C.indigo, cap2: C.leaf })}
   ${fig(who("shalya", { x: 2148, y: 834, s: .92, face: "left", weapon: "reins" }))}</g>
   <g id="karnaFig">${fig(who("karna", { x: 2226, y: 834, s: 1.02, face: "left", weapon: "bow" }))}</g>
   ${Array.from({ length: 8 }, (_, i) => arrowShape("ar" + i)).join("")}
   <g id="anjalika" opacity="0"><circle cx="1330" cy="733" r="70" fill="url(#lampG)"/><path d="M1240 733 L1420 733" stroke="${C.iron}" stroke-width="5"/><path d="M1420 733 l -22 -12 v24z" fill="${C.madderL}" stroke="${C.iron}" stroke-width="2"/></g>
   <path id="dust" d="M2090 935 q 40 -30 80 0 q 40 -30 80 0" fill="none" stroke="${C.iron}" stroke-width="3" opacity="0"/>
  </g></g>`;
}

function animateDay17(p: number, w: SVGSVGElement): void {
  const a = clamp((p - .08) / .24), on = p > .08 && p < .34;
  for (let i = 0; i < 8; i++) {
    const g = q(w, "#ar" + i); if (!on) { set(g, "opacity", 0); continue; }
    const f = ((a * 6) + i / 8) % 1, dir = i % 2 ? -1 : 1, x0 = dir > 0 ? 1330 : 2120, x1 = dir > 0 ? 2120 : 1330, y = 720 + ((i * 37) % 60) - 30, x = x0 + (x1 - x0) * f, yy = y - Math.sin(f * Math.PI) * 90;
    set(g, "transform", `translate(${x} ${yy}) ${dir > 0 ? "" : "scale(-1 1)"}`); set(g, "opacity", f < .05 || f > .95 ? 0 : 1);
  }
  const m = ease(clamp((p - .5) / .08)), arm = q(w, "#bhima-arm"); set(arm, "transform", `rotate(${-50 + m * 120} 12 -120)`);
  set(q(w, "#dush"), "transform", `rotate(${ease(clamp((p - .56) / .06)) * 78} 610 930)`);
  set(q(w, "#blood"), "opacity", clamp((p - .62) / .04));
  const k = ease(clamp((p - .76) / .06)); set(q(w, "#karCh-wheel"), "transform", `translate(-10 ${-40 + k * 34})`);
  set(q(w, "#karCh-body"), "transform", `rotate(${k * -5} 0 -40) translate(0 ${k * 14})`);
  set(q(w, "#dust"), "opacity", k * (1 - clamp((p - .86) / .04)));
  const d = ease(clamp((p - .8) / .05)); set(q(w, "#karnaFig"), "transform", `translate(${d * -40} ${d * 96})`);
  set(q(w, "#anjalika"), "opacity", ease(clamp((p - .88) / .05)));
  const ar = q(w, "#arjuna-arrow"); set(ar, "opacity", p > .88 ? 1 : 0);
}

function worldDice(): string {
  let arches = "";
  for (let i = 0; i < 7; i++) {
    const x = 150 + i * 350;
    arches += `<g transform="translate(${x} 0)"><rect x="-24" y="160" width="48" height="790" fill="${C.ochre}" stroke="${C.iron}" stroke-width="${S}"/><rect x="-24" y="160" width="48" height="790" fill="url(#stripes)"/><rect x="-34" y="140" width="68" height="28" fill="${C.madder}" stroke="${C.iron}" stroke-width="2"/></g>`;
    if (i < 6) arches += `<path d="M${x + 24} 330 C ${x + 60} 220 ${x + 120} 200 ${x + 175} 190 C ${x + 230} 200 ${x + 290} 220 ${x + 326} 330" fill="none" stroke="${C.iron}" stroke-width="5"/>
      ${[0.25, .5, .75].map(t => `<path d="M${x + 24 + t * 302} 330 v70" stroke="${C.iron}" stroke-width="1.5"/><circle cx="${x + 24 + t * 302}" cy="405" r="8" fill="${C.madder}" stroke="${C.iron}"/>`).join("")}
      <path d="M${x + 40} 160 Q ${x + 175} 230 ${x + 310} 160" fill="none" stroke="${C.leaf}" stroke-width="6"/>${[0, 1, 2, 3, 4].map(k => `<circle cx="${x + 60 + k * 58}" cy="${170 + Math.sin(k / 4 * Math.PI) * 45}" r="7" fill="${k % 2 ? C.madder : C.ochreL}" stroke="${C.iron}"/>`).join("")}`;
  }
  return `${defs()}<g id="cam"><g id="paint">
   <rect x="-3000" y="-3000" width="8400" height="3950" fill="${C.wall}"/>
   <rect x="-3000" y="950" width="8400" height="3000" fill="url(#floor)"/>
   <path d="M-3000 950 H5400" stroke="${C.iron}" stroke-width="4"/>
   <rect x="-3000" y="100" width="8400" height="40" fill="${C.madder}" stroke="${C.iron}" stroke-width="3"/>${Array.from({ length: 60 }, (_, i) => rosette(-600 + i * 70, 120, 10)).join("")}
   ${arches}
   <g transform="translate(1200 950)"><path d="M-120 0 L-120 -300 C -120 -380 120 -380 120 -300 L120 0Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-100 0 L-100 -290 C -100 -350 100 -350 100 -290 L100 0Z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="2"/>${rosette(0, -300, 22)}
     <rect x="-130" y="-120" width="260" height="120" fill="${C.indigo}" stroke="${C.iron}" stroke-width="${S}"/><rect x="-130" y="-120" width="260" height="120" fill="url(#clothPat)"/></g>
   ${fig(who("dhritarashtra", { x: 1200, y: 830, s: 1.1, weapon: "none", seated: true }))}
   ${fig(who("bhishma", { x: 420, y: 950, s: 1.1, weapon: "none", seated: true }))}
   ${fig(who("drona", { x: 580, y: 950, s: 1.1, weapon: "none", seated: true }))}
   ${fig(who("vidura", { x: 740, y: 950, s: 1.05, weapon: "none", seated: true }))}
   ${fig(who("bhima", { id: "bhima", x: 880, y: 1010, s: 1.35, weapon: "fist" }))}
   ${fig(who("arjuna", { x: 780, y: 1030, s: 1.2, weapon: "none" }))}
   <g transform="translate(1200 1010)"><ellipse rx="150" ry="28" fill="${C.indigo}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-110 0 H110 M0 -20 V20" stroke="${C.ochreL}" stroke-width="5"/>
     <g id="die1" transform="translate(-30 -10)"><rect x="-10" y="-10" width="20" height="20" fill="${C.white}" stroke="${C.iron}" stroke-width="2"/><circle r="2.5" fill="${C.madder}"/></g>
     <g id="die2" transform="translate(30 -6)"><rect x="-10" y="-10" width="20" height="20" fill="${C.white}" stroke="${C.iron}" stroke-width="2"/><circle cx="-4" cy="-4" r="2.2" fill="${C.iron}"/><circle cx="4" cy="4" r="2.2" fill="${C.iron}"/></g></g>
   ${fig(who("yudhishthira", { x: 1010, y: 1060, s: 1.15, weapon: "dice", seated: true }))}
   ${fig(who("shakuni", { x: 1390, y: 1060, s: 1.15, face: "left", weapon: "dice", seated: true }))}
   ${fig(who("duryodhana", { x: 1560, y: 1010, s: 1.3, face: "left", weapon: "point" }))}
   ${fig(who("karna", { x: 1700, y: 1000, s: 1.25, face: "left", weapon: "none" }))}
   <g transform="translate(2150 950)"><path d="M-110 0 V-420 C -110 -520 110 -520 110 -420 V0Z" fill="${C.iron}" opacity=".85"/><path d="M-110 0 V-420 C -110 -520 110 -520 110 -420 V0" fill="none" stroke="${C.ochre}" stroke-width="10"/></g>
   <g id="drag">${fig(who("dushasana", { x: 2010, y: 1030, s: 1.25, face: "left", weapon: "grab" }))}
     ${fig(who("draupadi", { x: 2100, y: 1030, s: 1.22, face: "left", weapon: "plead" }))}</g>
  </g></g>`;
}

function animateDice(p: number, w: SVGSVGElement): void {
  const t = clamp((p - .14) / .2);
  if (t > 0 && t < 1) {
    set(q(w, "#die1"), "transform", `translate(${-30 + Math.sin(t * 20) * 30} ${-10 - Math.abs(Math.sin(t * 14)) * 60}) rotate(${t * 900})`);
    set(q(w, "#die2"), "transform", `translate(${30 + Math.cos(t * 18) * 30} ${-6 - Math.abs(Math.cos(t * 12)) * 50}) rotate(${-t * 800})`);
  }
  set(q(w, "#drag"), "transform", `translate(${(1 - ease(clamp((p - .36) / .14))) * 360} 0)`);
  const a = q(w, "#bhima-arm"); set(a, "transform", `rotate(${-40 + ease(clamp((p - .8) / .06)) * 40} 12 -120)`);
}

export const WORLDS: Record<string, WorldArt> = {
  "dice-hall": { world: worldDice, animate: animateDice },
  "day-17": { world: worldDay17, animate: animateDay17 },
};
