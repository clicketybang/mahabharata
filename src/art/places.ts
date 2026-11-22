// @ts-nocheck — faithful port of prototype v6; typed in a later refactor.
/* Place icons for the maps, choice cards and badges. */
import { C } from "./palette";

export function placeIcon(kind, x = 0, y = 0, s = 1) {
  const f = C.ochre, i = C.iron;
  const m = {
    palace: `<path d="M-26 14 V-6 H-16 V-16 H-6 V-6 H6 V-16 H16 V-6 H26 V14Z" fill="${C.madder}" stroke="${i}" stroke-width="2"/><path d="M-6 -16 L0 -30 L6 -16Z" fill="${f}" stroke="${i}" stroke-width="2"/><path d="M-6 14 V2 Q0 -6 6 2 V14" fill="${i}"/>`,
    hall: `<path d="M-28 14 H28 V-4 L0 -24 L-28 -4Z" fill="${f}" stroke="${i}" stroke-width="2"/>${[-18, -6, 6, 18].map(x => `<path d="M${x} 14 V-2" stroke="${i}" stroke-width="3"/>`).join("")}<circle cy="-10" r="4" fill="${C.madder}"/>`,
    trees: `${[-14, 0, 14].map((x, k) => `<path d="M${x} 14 V${2 - k % 2 * 4}" stroke="${i}" stroke-width="3"/><circle cx="${x}" cy="${-4 - k % 2 * 6}" r="11" fill="${C.leaf}" stroke="${i}" stroke-width="2"/>`).join("")}`,
    mountain: `<path d="M-30 14 L-8 -22 L4 -6 L14 -20 L32 14Z" fill="${C.indigoL}" stroke="${i}" stroke-width="2"/><path d="M-14 -12 L-8 -22 L-2 -12 Z M10 -14 L14 -20 L18 -14Z" fill="${C.white}"/>`,
    hut: `<path d="M-30 14 L-10 -18 L10 14Z" fill="${C.indigoL}" stroke="${i}" stroke-width="2"/><path d="M2 14 V0 L16 -10 L30 0 V14Z" fill="${f}" stroke="${i}" stroke-width="2"/>`,
    waves: `<path d="M-28 -6 q 7 -8 14 0 t 14 0 t 14 0 t 14 0 M-28 6 q 7 -8 14 0 t 14 0 t 14 0 t 14 0" fill="none" stroke="${C.river}" stroke-width="4"/>`,
    fort: `<path d="M-26 14 V-10 H-18 V-4 H-10 V-10 H-2 V-4 H6 V-10 H14 V-4 H22 V-10 H26 V14Z" fill="${f}" stroke="${i}" stroke-width="2"/><path d="M-4 14 V4 Q2 -2 8 4 V14" fill="${i}"/>`,
    sea: `<path d="M-24 4 V-12 H-14 V-22 H14 V-12 H24 V4Z" fill="${f}" stroke="${i}" stroke-width="2"/><path d="M-30 10 q 7 -6 14 0 t 15 0 t 15 0 t 15 0" fill="none" stroke="${C.river}" stroke-width="4"/>`,
    tentP: `<path d="M-26 14 L0 -20 L26 14Z" fill="${C.white}" stroke="${i}" stroke-width="2"/><path d="M0 -20 V-30" stroke="${i}" stroke-width="2"/><path d="M0 -30 l 12 4 l -12 4z" fill="${C.leaf}"/>`,
    tentK: `<path d="M-26 14 L0 -20 L26 14Z" fill="${C.white}" stroke="${i}" stroke-width="2"/><path d="M0 -20 V-30" stroke="${i}" stroke-width="2"/><path d="M0 -30 l 12 4 l -12 4z" fill="${C.madder}"/>`,
    field: `<path d="M-20 16 L18 -20 M20 16 L-18 -20" stroke="${i}" stroke-width="6"/><path d="M-20 16 L18 -20 M20 16 L-18 -20" stroke="${f}" stroke-width="3"/><circle r="6" fill="${C.madder}" stroke="${i}" stroke-width="2"/>`,
    lake: `<ellipse rx="28" ry="12" fill="${C.river}" stroke="${i}" stroke-width="2"/><path d="M-8 -2 q 8 -14 16 0" fill="${C.rose}" stroke="${i}"/>`,
  };
  return `<g transform="translate(${x} ${y}) scale(${s})">${m[kind] || m.palace}</g>`;
}
