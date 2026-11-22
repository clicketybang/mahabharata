// @ts-nocheck — faithful port of prototype v6; typed in a later refactor.
/* Painted worlds for the built (scroll-animated) scenes, with their scroll choreography.
   Keyed by moment id. Camera keyframes live in the moment's MDX frontmatter (`cams`). */
import { C, SK, S, defs } from "./palette";
import { rosette, sun, bird, scatter, filler } from "./motifs";
import { fig } from "./figure";
import { chariot, elephant, crowdRow, arrowShape, tent } from "./objects";
import { clamp, ease } from "../engine/util";

function worldDay17() {
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
   <g>${fig({ id: "bhima", x: 420, y: 930, s: 1.45, skin: SK.bhima, cloth: C.indigo, cloth2: C.madder, crown: "mukuta", weapon: "mace", mustache: true })}
     <g id="dush">${fig({ x: 640, y: 930, s: 1.4, face: "left", skin: SK.dush, cloth: C.leaf, cloth2: C.ochre, crown: "mukuta", weapon: "none", mustache: true })}</g>
     <g id="blood" opacity="0">${scatter(14, 560, 720, 760, 900, (x, y, r) => `<circle cx="${x}" cy="${y}" r="${3 + r * 6}" fill="${C.madder}" stroke="${C.iron}" stroke-width="1"/>`, 5)}</g></g>
   ${chariot({ id: "arjCh", x: 1260, y: 930, banner: "hanuman", cap: C.madder, cap2: C.indigo })}
   ${fig({ x: 1312, y: 834, s: .92, skin: SK.krishna, cloth: C.ochre, cloth2: C.madder, crown: "krishna", weapon: "reins", halo: true })}
   ${fig({ id: "arjuna", x: 1232, y: 834, s: 1.02, skin: SK.arjuna, cloth: C.indigo, cloth2: C.ochre, crown: "kirita", weapon: "bow", armour: true })}
   <g>${chariot({ id: "karCh", x: 2200, y: 930, face: "left", banner: "elephant", cap: C.indigo, cap2: C.leaf })}
   ${fig({ x: 2148, y: 834, s: .92, face: "left", skin: SK.shalya, cloth: C.leaf, cloth2: C.ochre, crown: "mukuta", weapon: "reins", beard: true })}</g>
   <g id="karnaFig">${fig({ x: 2226, y: 834, s: 1.02, face: "left", skin: SK.karna, cloth: C.madder, cloth2: C.indigo, crown: "kirita", weapon: "bow" })}</g>
   ${Array.from({ length: 8 }, (_, i) => arrowShape("ar" + i)).join("")}
   <g id="anjalika" opacity="0"><circle cx="1330" cy="733" r="70" fill="url(#lampG)"/><path d="M1240 733 L1420 733" stroke="${C.iron}" stroke-width="5"/><path d="M1420 733 l -22 -12 v24z" fill="${C.madderL}" stroke="${C.iron}" stroke-width="2"/></g>
   <path id="dust" d="M2090 935 q 40 -30 80 0 q 40 -30 80 0" fill="none" stroke="${C.iron}" stroke-width="3" opacity="0"/>
  </g></g>`;
}

function animateDay17(p, w) {
  const a = clamp((p - .08) / .24), on = p > .08 && p < .34;
  for (let i = 0; i < 8; i++) {
    const g = w.querySelector("#ar" + i); if (!on) { g.setAttribute("opacity", 0); continue; }
    const f = ((a * 6) + i / 8) % 1, dir = i % 2 ? -1 : 1, x0 = dir > 0 ? 1330 : 2120, x1 = dir > 0 ? 2120 : 1330, y = 720 + ((i * 37) % 60) - 30, x = x0 + (x1 - x0) * f, yy = y - Math.sin(f * Math.PI) * 90;
    g.setAttribute("transform", `translate(${x} ${yy}) ${dir > 0 ? "" : "scale(-1 1)"}`); g.setAttribute("opacity", f < .05 || f > .95 ? 0 : 1);
  }
  const m = ease(clamp((p - .5) / .08)), arm = w.querySelector("#bhima-arm"); arm && arm.setAttribute("transform", `rotate(${-50 + m * 120} 12 -120)`);
  w.querySelector("#dush").setAttribute("transform", `rotate(${ease(clamp((p - .56) / .06)) * 78} 610 930)`);
  w.querySelector("#blood").setAttribute("opacity", clamp((p - .62) / .04));
  const k = ease(clamp((p - .76) / .06)); w.querySelector("#karCh-wheel").setAttribute("transform", `translate(-10 ${-40 + k * 34})`);
  w.querySelector("#karCh-body").setAttribute("transform", `rotate(${k * -5} 0 -40) translate(0 ${k * 14})`);
  w.querySelector("#dust").setAttribute("opacity", k * (1 - clamp((p - .86) / .04)));
  const d = ease(clamp((p - .8) / .05)); w.querySelector("#karnaFig").setAttribute("transform", `translate(${d * -40} ${d * 96})`);
  w.querySelector("#anjalika").setAttribute("opacity", ease(clamp((p - .88) / .05)));
  const ar = w.querySelector("#arjuna-arrow"); ar && ar.setAttribute("opacity", p > .88 ? 1 : 0);
}

function worldDice() {
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
   ${fig({ x: 1200, y: 830, s: 1.1, skin: SK.dhrit, cloth: C.indigo, cloth2: C.ochre, crown: "kirita", weapon: "none", blind: true, seated: true })}
   ${fig({ x: 420, y: 950, s: 1.1, skin: SK.elder, cloth: C.white, cloth2: C.ochre, crown: "mukuta", weapon: "none", beard: true, seated: true })}
   ${fig({ x: 580, y: 950, s: 1.1, skin: SK.elder, cloth: C.ochre, cloth2: C.madder, crown: "topknot", weapon: "none", beard: true, seated: true })}
   ${fig({ x: 740, y: 950, s: 1.05, skin: SK.yudhi, cloth: C.white, cloth2: C.indigo, crown: "topknot", weapon: "none", seated: true })}
   ${fig({ id: "bhima", x: 880, y: 1010, s: 1.35, skin: SK.bhima, cloth: C.indigo, cloth2: C.madder, crown: "mukuta", weapon: "fist", mustache: true })}
   ${fig({ x: 780, y: 1030, s: 1.2, skin: SK.arjuna, cloth: C.indigo, cloth2: C.ochre, crown: "kirita", weapon: "none" })}
   <g transform="translate(1200 1010)"><ellipse rx="150" ry="28" fill="${C.indigo}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-110 0 H110 M0 -20 V20" stroke="${C.ochreL}" stroke-width="5"/>
     <g id="die1" transform="translate(-30 -10)"><rect x="-10" y="-10" width="20" height="20" fill="${C.white}" stroke="${C.iron}" stroke-width="2"/><circle r="2.5" fill="${C.madder}"/></g>
     <g id="die2" transform="translate(30 -6)"><rect x="-10" y="-10" width="20" height="20" fill="${C.white}" stroke="${C.iron}" stroke-width="2"/><circle cx="-4" cy="-4" r="2.2" fill="${C.iron}"/><circle cx="4" cy="4" r="2.2" fill="${C.iron}"/></g></g>
   ${fig({ x: 1010, y: 1060, s: 1.15, skin: SK.yudhi, cloth: C.ochre, cloth2: C.indigo, crown: "kirita", weapon: "dice", seated: true })}
   ${fig({ x: 1390, y: 1060, s: 1.15, face: "left", skin: SK.shakuni, cloth: C.leaf, cloth2: C.madder, crown: "mukuta", weapon: "dice", beard: true, seated: true })}
   ${fig({ x: 1560, y: 1010, s: 1.3, face: "left", skin: SK.duryo, cloth: C.madder, cloth2: C.ochre, crown: "kirita", weapon: "point", mustache: true })}
   ${fig({ x: 1700, y: 1000, s: 1.25, face: "left", skin: SK.karna, cloth: C.indigo, cloth2: C.ochre, crown: "kirita", weapon: "none" })}
   <g transform="translate(2150 950)"><path d="M-110 0 V-420 C -110 -520 110 -520 110 -420 V0Z" fill="${C.iron}" opacity=".85"/><path d="M-110 0 V-420 C -110 -520 110 -520 110 -420 V0" fill="none" stroke="${C.ochre}" stroke-width="10"/></g>
   <g id="drag">${fig({ x: 2010, y: 1030, s: 1.25, face: "left", skin: SK.dush, cloth: C.leaf, cloth2: C.ochre, crown: "mukuta", weapon: "grab", mustache: true })}
     ${fig({ x: 2100, y: 1030, s: 1.22, face: "left", skin: SK.draupadi, cloth: C.madder, cloth2: C.ochre, crown: "female", female: true, loose: true, weapon: "plead" })}</g>
  </g></g>`;
}

function animateDice(p, w) {
  const t = clamp((p - .14) / .2);
  if (t > 0 && t < 1) {
    w.querySelector("#die1").setAttribute("transform", `translate(${-30 + Math.sin(t * 20) * 30} ${-10 - Math.abs(Math.sin(t * 14)) * 60}) rotate(${t * 900})`);
    w.querySelector("#die2").setAttribute("transform", `translate(${30 + Math.cos(t * 18) * 30} ${-6 - Math.abs(Math.cos(t * 12)) * 50}) rotate(${-t * 800})`);
  }
  w.querySelector("#drag").setAttribute("transform", `translate(${(1 - ease(clamp((p - .36) / .14))) * 360} 0)`);
  const a = w.querySelector("#bhima-arm"); a && a.setAttribute("transform", `rotate(${-40 + ease(clamp((p - .8) / .06)) * 40} 12 -120)`);
}

export const WORLDS = {
  "dice-hall": { world: worldDice, animate: animateDice },
  "day-17": { world: worldDay17, animate: animateDay17 },
};
