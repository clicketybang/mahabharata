/* DESIGN TRIAL — "Detailed" pictures. Kalamkari-style scenery for the 900×300 vignettes, chosen by the
   place's icon: palace interiors with cusped arches and a toraṇa, forests of flowering trees, hermitages,
   rivers with lotuses and fish, mountains, and battlefields with banners. Every scene sits between two
   register bands, as on a painted cloth. Ink outlines, madder/ochre/indigo/leaf fills, no gradients. */
import { C } from "./palette";
import { scatter, filler, sun, bird } from "./motifs";
import { tent } from "./objects";
import { placeIcon } from "./places";

const I = C.iron, W = 2.2;
const rnd = (seed: number) => { let k = seed; return () => { k = (k * 9301 + 49297) % 233280; return k / 233280; }; };

/** a register band: a ruled strip of repeating lotus buds and dots (top or bottom of the cloth) */
export function register(y: number, flip = false): string {
  let s = `<rect x="0" y="${y}" width="900" height="22" fill="${C.madder}"/><path d="M0 ${y + 1.5} H900 M0 ${y + 20.5} H900" stroke="${I}" stroke-width="3"/>`;
  for (let x = 12; x < 900; x += 30) {
    s += flip
      ? `<path d="M${x} ${y + 4} q -7 8 0 14 q 7 -6 0 -14z" fill="${C.ochre}" stroke="${I}" stroke-width="1.2"/><circle cx="${x + 15}" cy="${y + 11}" r="2.2" fill="${C.white}"/>`
      : `<path d="M${x} ${y + 18} q -7 -8 0 -14 q 7 6 0 14z" fill="${C.ochre}" stroke="${I}" stroke-width="1.2"/><circle cx="${x + 15}" cy="${y + 11}" r="2.2" fill="${C.white}"/>`;
  }
  return s;
}

/** the Kalamkari "tree of life": a curving trunk, spiralling branches, veined leaves and rosette flowers */
export function kTree(x: number, y: number, s = 1, seed = 3): string {
  const r = rnd(seed);
  let br = "";
  for (let k = 0; k < 7; k++) {
    const side = k % 2 ? 1 : -1, by = -40 - k * 18, len = 30 + r() * 22;
    br += `<path d="M0 ${by} q ${side * len * .5} -14 ${side * len} -8" fill="none" stroke="${I}" stroke-width="3.2" stroke-linecap="round"/>`;
    br += `<path d="M${side * len} ${by - 8} q ${side * 10} -14 ${side * 2} -26 q ${-side * 12} 8 ${-side * 2} 26z" fill="${C.leaf}" stroke="${I}" stroke-width="1.4"/><path d="M${side * len} ${by - 8} l ${side * 1} -22" stroke="${C.white}" stroke-width=".8" opacity=".6"/>`;
    if (k % 2 === 0) br += `<g transform="translate(${side * len * .55} ${by - 12})"><circle r="6" fill="${C.madder}" stroke="${I}" stroke-width="1.2"/><circle r="2.2" fill="${C.ochreL}"/></g>`;
  }
  const crown = `<g transform="translate(0 -172)"><circle r="16" fill="${C.leaf}" stroke="${I}" stroke-width="1.6"/>${[0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="5" ry="9" transform="rotate(${a}) translate(0 -14)" fill="${C.madder}" stroke="${I}" stroke-width="1"/>`).join("")}<circle r="5" fill="${C.ochreL}" stroke="${I}"/></g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 0 C -2 -50 -12 -110 0 -165 C 8 -110 4 -50 9 0Z" fill="${C.ochre}" stroke="${I}" stroke-width="${W}"/><path d="M0 -10 V-150" stroke="${I}" stroke-width=".9" stroke-dasharray="3 5" opacity=".6"/>${br}${crown}</g>`;
}

export const lotus = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 q 14 6 28 0" fill="${C.leaf}" stroke="${I}" stroke-width="1.4"/>${[-28, -10, 10, 28].map(a => `<path d="M0 0 q -6 -12 0 -20 q 6 8 0 20z" transform="rotate(${a})" fill="${C.rose}" stroke="${I}" stroke-width="1.2"/>`).join("")}<path d="M0 0 q -5 -14 0 -24 q 5 10 0 24z" fill="${C.madderL}" stroke="${I}" stroke-width="1.2"/></g>`;
export const fish = (x: number, y: number, s = 1, f = 1) => `<g transform="translate(${x} ${y}) scale(${s * f} ${s})"><path d="M-16 0 q 14 -12 28 0 q -14 12 -28 0z M12 0 l 9 -7 v14z" fill="${C.ochre}" stroke="${I}" stroke-width="1.4"/><circle cx="-8" cy="-1.5" r="1.6" fill="${I}"/><path d="M-2 -6 v12 M4 -5 v10" stroke="${I}" stroke-width=".8"/></g>`;
export const deer = (x: number, y: number, s = 1, f = 1) => `<g transform="translate(${x} ${y}) scale(${s * f} ${s})"><path d="M-26 -20 q 4 -10 30 -8 q 8 -10 12 -22 l 6 2 q -2 12 -6 20 l 6 2 q -2 8 -10 6 q 0 16 -6 20 l 0 20 h-5 l -1 -18 h-18 l -3 18 h-5 l 0 -20 q -10 -6 -10 -20z" fill="${C.ochreL}" stroke="${I}" stroke-width="1.6" stroke-linejoin="round"/>${[[-16, -14], [-6, -16], [-12, -6], [0, -8]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.8" fill="${C.white}" stroke="${I}" stroke-width=".6"/>`).join("")}<path d="M16 -48 l -4 -12 M16 -48 l 6 -10 M20 -54 l 6 -4" stroke="${I}" stroke-width="1.6" stroke-linecap="round"/></g>`;
export const banner = (x: number, y: number, c: string, h = 120) => `<g transform="translate(${x} ${y})"><path d="M0 0 V-${h}" stroke="${I}" stroke-width="3"/><path d="M0 -${h} h 34 l -8 12 l 8 12 h-34z" fill="${c}" stroke="${I}" stroke-width="1.6"/><path d="M4 -${h - 6} h 20" stroke="${C.white}" stroke-width="1.2" stroke-dasharray="2 3"/><circle cy="-${h + 4}" r="4" fill="${C.ochre}" stroke="${I}"/></g>`;
const lampStand = (x: number, y: number) => `<g transform="translate(${x} ${y})"><path d="M-14 0 h28 l -8 -8 h-12z M-2 -8 v-50 h4 v50z" fill="${C.ochre}" stroke="${I}" stroke-width="1.6"/>${[-14, 0, 14].map(dx => `<path d="M${dx - 6} -58 h12 q -2 6 -6 6 q -4 0 -6 -6z" fill="${C.madder}" stroke="${I}" stroke-width="1.2"/><path d="M${dx} -60 q -4 -7 0 -12 q 4 5 0 12z" fill="${C.ochreL}" stroke="${I}" stroke-width=".8"/>`).join("")}</g>`;
const fireAltar = (x: number, y: number) => `<g transform="translate(${x} ${y})"><path d="M-30 0 h60 l -6 -14 h-48z" fill="${C.madder}" stroke="${I}" stroke-width="1.8"/><path d="M-26 -14 h52" stroke="${C.ochre}" stroke-width="3"/>${[-12, 0, 12].map((dx, k) => `<path d="M${dx} -14 q ${-8 + k * 3} -18 0 -${30 + k % 2 * 10} q ${10 - k * 2} 16 0 ${30 + k % 2 * 10}z" fill="${k === 1 ? C.ochreL : C.madderL}" stroke="${I}" stroke-width="1.2"/>`).join("")}</g>`;

function interior(): string {
  // cusped arches on pillars, a toraṇa of hanging leaves, lamps, patterned floor
  let s = `<rect width="900" height="300" fill="${C.wall}"/>`;
  for (let k = 0; k < 6; k++) {
    const x = 20 + k * 150;
    s += `<path d="M${x + 14} 236 V120 q 0 -46 61 -62 q 61 16 61 62 V236" fill="${C.paper2}" stroke="${I}" stroke-width="${W}"/>`
      + `<path d="M${x + 24} 236 V124 q 6 -10 14 -8 q 4 -16 18 -14 q 8 -14 19 -12 q 11 -2 19 12 q 14 -2 18 14 q 8 -2 14 8 V236" fill="none" stroke="${C.madder}" stroke-width="2"/>`
      + `<rect x="${x + 4}" y="96" width="14" height="140" fill="${C.ochre}" stroke="${I}" stroke-width="1.8"/><rect x="${x + 4}" y="96" width="14" height="140" fill="url(#stripes)"/>`
      + `<path d="M${x} 96 h22 l -4 -8 h-14z M${x} 236 h22 l -3 -8 h-16z" fill="${C.madder}" stroke="${I}" stroke-width="1.4"/>`;
  }
  s += `<rect x="0" y="44" width="900" height="16" fill="${C.ochre}" stroke="${I}" stroke-width="2"/>`;
  for (let x = 6; x < 900; x += 22) s += `<path d="M${x} 60 q 8 22 16 0z" fill="${(x / 22) % 2 < 1 ? C.leaf : C.madder}" stroke="${I}" stroke-width="1.1"/><path d="M${x + 8} 60 v-6" stroke="${I}"/>`;
  s += `<rect y="236" width="900" height="64" fill="url(#floor)"/><path d="M0 236 H900" stroke="${I}" stroke-width="2.4"/>`;
  return s + lampStand(90, 236) + lampStand(810, 236);
}
function forest(seed = 5): string {
  const r = rnd(seed);
  let s = `<rect width="900" height="300" fill="${C.sky}"/>${sun(820, 80, 26)}<rect y="226" width="900" height="74" fill="${C.ground}"/>`;
  s += [60, 200, 690, 840].map((x, k) => kTree(x, 232, .9 + r() * .25, seed + k)).join("");
  s += bird(320, 70, .8) + bird(560, 54, .7) + deer(760, 268, .8, -1);
  s += scatter(18, 0, 900, 236, 290, (x, y, rr) => `<path d="M${x} ${y} q 3 -10 6 0 q 3 -8 6 0" fill="none" stroke="${C.leaf}" stroke-width="1.6"/>`, seed + 9);
  return s;
}
function hermitage(): string {
  return `<rect width="900" height="300" fill="${C.sky}"/>${sun(140, 76, 26)}<rect y="226" width="900" height="74" fill="${C.ground}"/>${kTree(60, 232, .95, 11)}${kTree(860, 232, 1, 12)}${placeIcon("hut", 740, 206, 2.6)}${fireAltar(620, 250)}${deer(120, 270, .7)}${bird(420, 60, .7)}`;
}
function water(): string {
  // the river runs behind; the people stand on the near bank
  let s = `<rect width="900" height="300" fill="${C.sky}"/>${sun(760, 64, 26)}<rect y="150" width="900" height="80" fill="url(#waves)"/><path d="M0 150 q 450 -14 900 0" fill="none" stroke="${I}" stroke-width="2.2"/><path d="M0 230 q 450 10 900 0 V300 H0z" fill="${C.ground}" stroke="${I}" stroke-width="2.2"/>`;
  s += kTree(46, 236, .8, 21) + kTree(862, 236, .78, 22);
  s += [150, 330, 560, 740].map((x, k) => lotus(x, 196 + (k % 2) * 18, .75)).join("") + fish(250, 214, .8) + fish(650, 180, .75, -1) + bird(420, 60, .8);
  return s;
}
function mountains(): string {
  let s = `<rect width="900" height="300" fill="${C.sky}"/>${sun(150, 70, 24)}`;
  [[180, 210, 2.6], [460, 190, 3.4], [760, 200, 2.9]].forEach(([x, y, sc]) => { s += placeIcon("mountain", x, y, sc); });
  s += `<rect y="230" width="900" height="70" fill="${C.ground}"/>`;
  for (let x = 0; x < 900; x += 40) s += `<path d="M${x} 230 q 20 -12 40 0" fill="none" stroke="${I}" stroke-width="1.4" opacity=".5"/>`;
  return s + kTree(840, 236, .7, 31) + bird(620, 80, .7);
}
function battle(): string {
  const r = rnd(41);
  let s = `<rect width="900" height="300" fill="${C.sky}"/>${sun(450, 62, 22)}<rect y="214" width="900" height="86" fill="${C.ground2}"/><rect y="214" width="900" height="86" fill="url(#stripes)" opacity=".25"/>`;
  const cols = [C.madder, C.indigo, C.leaf, C.ochre];
  for (let k = 0; k < 9; k++) s += banner(30 + k * 100 + r() * 30, 226, cols[k % 4], 110 + r() * 40);
  for (let k = 0; k < 14; k++) { const x = 40 + k * 64 + r() * 20, y = 90 + r() * 80; s += `<path d="M${x} ${y} l 34 -8" stroke="${I}" stroke-width="1.6"/><path d="M${x + 34} ${y - 8} l -7 -3 l 1 7z" fill="${I}"/>`; }
  return s + tent(70, 232, 1.1) + tent(830, 232, 1.1, C.madder);
}

/** detailed scenery for a place icon, between two register bands */
export function scenery(icon: string): string {
  const body = ({ palace: interior, hall: interior, fort: interior, trees: forest, hut: hermitage, waves: water, sea: water, lake: water,
    mountain: mountains, field: battle, tentP: battle, tentK: battle } as Record<string, () => string>)[icon] ?? forest;
  const fill = body === interior || body === battle ? "" : `<g opacity=".7">${scatter(10, 0, 900, 70, 200, (x, y, r) => filler(x, y, r * .55), 13)}</g>`;
  return body() + fill + register(0) + register(278, true);
}
