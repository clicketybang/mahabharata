/* Kalamkari motifs: rosettes, creeper sprigs, the sun, birds, stars, scatter fill. */
import { C, S } from "./palette";

export function rosette(x: number, y: number, r: number, c1: string = C.madder, c2: string = C.ochre): string {
  let s = `<g transform="translate(${x} ${y})">`;
  for (let i = 0; i < 8; i++) s += `<ellipse rx="${r * .32}" ry="${r * .62}" cy="${-r * .55}" transform="rotate(${i * 45})" fill="${i % 2 ? c2 : c1}" stroke="${C.iron}" stroke-width="1.2"/>`;
  return s + `<circle r="${r * .3}" fill="${C.iron}"/><circle r="${r * .14}" fill="${C.ochreL}"/></g>`;
}

/* used in night skies (the victors' and Kaurava camps) */
export function star(x: number, y: number, r: number): string {
  return `<path transform="translate(${x} ${y})" d="M0 ${-r} L${r * .25} ${-r * .25} L${r} 0 L${r * .25} ${r * .25} L0 ${r} L${-r * .25} ${r * .25} L${-r} 0 L${-r * .25} ${-r * .25}Z" fill="${C.ochreL}" opacity=".8"/>`;
}

export function leafSprig(x: number, y: number, s = 1, rot = 0): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C 10 -20 10 -40 0 -60" fill="none" stroke="${C.iron}" stroke-width="2"/>
 ${[-15, -30, -45].map((yy, i) => `<path d="M${i % 2 ? 1 : -1} ${yy} q ${i % 2 ? 16 : -16} -6 ${i % 2 ? 20 : -20} -18 q ${i % 2 ? -14 : 14} 2 ${i % 2 ? -20 : 20} 18z" fill="${C.leaf}" stroke="${C.iron}" stroke-width="1.4"/>`).join("")}
 <circle cy="-62" r="5" fill="${C.madder}" stroke="${C.iron}" stroke-width="1.4"/></g>`;
}

/* Kalamkari filler: rosettes and creeper sprigs */
export function filler(x: number, y: number, r: number): string {
  return r > .6 ? rosette(x, y, 8 + r * 6) : leafSprig(x, y + 40, .5 + r * .4, (r - .5) * 40);
}

export function sun(x: number, y: number, r: number): string {
  let s = `<g transform="translate(${x} ${y})">`;
  for (let i = 0; i < 24; i++) s += `<path d="M0 ${-r - 4} L6 ${-r - 26} L-6 ${-r - 26}Z" transform="rotate(${i * 15})" fill="${i % 2 ? C.madder : C.ochre}" stroke="${C.iron}" stroke-width="1.5"/>`;
  s += `<circle r="${r}" fill="${C.madderL}" stroke="${C.iron}" stroke-width="${S}"/><circle r="${r * .78}" fill="none" stroke="${C.ochreL}" stroke-width="3" stroke-dasharray="4 5"/>
   <path d="M${-r * .4} ${-r * .12} q ${r * .18} -${r * .14} ${r * .32} 0 q -${r * .16} ${r * .08} -${r * .32} 0z M${r * .08} ${-r * .12} q ${r * .18} -${r * .14} ${r * .32} 0 q -${r * .16} ${r * .08} -${r * .32} 0z" fill="#fff" stroke="${C.iron}" stroke-width="1.5"/>
   <circle cx="${-r * .24}" cy="${-r * .13}" r="2.5" fill="${C.iron}"/><circle cx="${r * .24}" cy="${-r * .13}" r="2.5" fill="${C.iron}"/>
   <path d="M0 ${-r * .05} l -5 ${r * .25} h 8" fill="none" stroke="${C.iron}" stroke-width="1.6"/><path d="M${-r * .2} ${r * .35} q ${r * .2} ${r * .14} ${r * .4} 0" fill="none" stroke="${C.iron}" stroke-width="2"/></g>`;
  return s;
}

export function bird(x: number, y: number, s = 1): string {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M-14 0 q 7 -9 14 0 q 7 -9 14 0" fill="none" stroke="${C.iron}" stroke-width="2.2"/>`;
}

/* deterministic pseudo-random scatter (seeded so every render paints the same cloth) */
export type ScatterFn = (x: number, y: number, r: number) => string;
export function scatter(n: number, x0: number, x1: number, y0: number, y1: number, fn: ScatterFn, seed = 7): string {
  let s = "", k = seed;
  const R = () => { k = (k * 9301 + 49297) % 233280; return k / 233280; };
  for (let i = 0; i < n; i++) s += fn(x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), R());
  return s;
}
