// @ts-nocheck — faithful port of prototype v6; typed in a later refactor.
/* Horses, chariots, soldiers, elephants, crowds, arrows, tents. */
import { C, S } from "./palette";
import { rosette } from "./motifs";

export function horse(x, y, s = 1, o = {}) {
  const body = o.color || C.white, cap = o.cap || C.madder;
  return `<g transform="translate(${x} ${y}) scale(${s})">
   <path d="M-60 -60 C-80 -50 -84 -20 -92 -6" fill="none" stroke="${C.iron}" stroke-width="7" stroke-linecap="round"/><path d="M-60 -60 C-80 -50 -84 -20 -92 -6" fill="none" stroke="${body}" stroke-width="3"/>
   <path d="M-50 -40 L-66 0 M-38 -40 L-46 0 M30 -42 L48 -2 M40 -44 L66 -14" stroke="${C.iron}" stroke-width="9" stroke-linecap="round"/><path d="M-50 -40 L-66 0 M-38 -40 L-46 0 M30 -42 L48 -2 M40 -44 L66 -14" stroke="${body}" stroke-width="5" stroke-linecap="round"/>
   <path d="M-62 -66 C -60 -90 30 -96 46 -70 C 52 -50 40 -36 20 -36 L -46 -36 C -62 -38 -66 -52 -62 -66Z" fill="${body}" stroke="${C.iron}" stroke-width="${S}"/>
   <path d="M30 -82 C 40 -110 52 -128 70 -132 L 92 -112 C 96 -104 90 -98 82 -102 L 66 -108 C 60 -94 56 -78 46 -70Z" fill="${body}" stroke="${C.iron}" stroke-width="${S}"/>
   <path d="M44 -96 C 50 -116 58 -128 70 -134" fill="none" stroke="${C.iron}" stroke-width="5"/><circle cx="76" cy="-120" r="2.4" fill="${C.iron}"/>
   <path d="M66 -134 C 60 -160 74 -168 80 -152" fill="${C.madder}" stroke="${C.iron}" stroke-width="1.5"/>
   <path d="M-30 -92 C -10 -98 18 -98 34 -86 L 28 -46 L -36 -46Z" fill="${cap}" stroke="${C.iron}" stroke-width="2"/><path d="M-30 -92 C -10 -98 18 -98 34 -86 L 28 -46 L -36 -46Z" fill="url(#clothPat)"/>
   <path d="M-36 -46 L28 -46" stroke="${C.ochre}" stroke-width="5"/></g>`;
}

export function chariot(o) {
  const id = o.id ? `id="${o.id}"` : "", flip = o.face === "left" ? " scale(-1 1)" : "";
  let spokes = "";
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; spokes += `<line x1="0" y1="0" x2="${(44 * Math.cos(a)).toFixed(1)}" y2="${(44 * Math.sin(a)).toFixed(1)}" stroke="${C.iron}" stroke-width="2.4"/>`; }
  const banner = o.banner === "hanuman" ? `<path d="M-46 -380 L30 -366 L-46 -326Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="2"/><circle cx="-24" cy="-356" r="11" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.8"/><circle cx="-20" cy="-358" r="2" fill="${C.iron}"/>`
    : `<path d="M-46 -380 L30 -366 L-46 -326Z" fill="${C.indigo}" stroke="${C.iron}" stroke-width="2"/><circle cx="-24" cy="-356" r="10" fill="none" stroke="${C.ochreL}" stroke-width="3"/>`;
  return `<g ${id} transform="translate(${o.x} ${o.y})${flip}"><g ${o.id ? `id="${o.id}-body"` : ""}>
   ${o.horses !== false ? horse(150, 0, 1.05, { cap: o.cap }) + horse(205, 4, 1.0, { cap: o.cap2 || o.cap }) : ""}
   <path d="M60 -70 C 110 -60 160 -60 210 -86" fill="none" stroke="${C.iron}" stroke-width="7"/><path d="M60 -70 C 110 -60 160 -60 210 -86" fill="none" stroke="${C.ochre}" stroke-width="3"/>
   <path d="M-46 -340 L -46 -96" stroke="${C.iron}" stroke-width="7"/><path d="M-46 -340 L -46 -96" stroke="${C.ochre}" stroke-width="3"/>${banner}
   <path d="M-70 -96 L70 -96 L84 -40 L-80 -40Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-70 -96 L70 -96 L84 -40 L-80 -40Z" fill="url(#clothPat)"/>
   <path d="M-62 -90 h126 M-70 -50 h148" stroke="${C.ochre}" stroke-width="4"/>${[-50, -20, 10, 40].map(x => rosette(x, -68, 9, C.ochre, C.indigoL)).join("")}
   <path d="M70 -96 C 96 -120 96 -150 74 -158" fill="none" stroke="${C.iron}" stroke-width="6"/></g>
   <g ${o.id ? `id="${o.id}-wheel"` : ""} transform="translate(-10 -40)"><circle r="48" fill="${C.ochre}" stroke="${C.iron}" stroke-width="${S}"/><circle r="40" fill="${C.white}" stroke="${C.iron}" stroke-width="2"/>${spokes}<circle r="9" fill="${C.madder}" stroke="${C.iron}" stroke-width="2"/></g></g>`;
}

export function soldier(x, y, s, c) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0 L-6 -30 L6 -30 L8 0Z" fill="${c}" stroke="${C.iron}" stroke-width="2"/><circle cy="-38" r="8" fill="${C.ochreL}" stroke="${C.iron}" stroke-width="2"/><path d="M-6 -44 L0 -54 L6 -44Z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.5"/><path d="M10 6 L14 -70" stroke="${C.iron}" stroke-width="2.5"/><ellipse cx="-9" cy="-18" rx="7" ry="12" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.6"/></g>`;
}

export function elephant(x, y, s, face = 1, cap = C.madder) {
  return `<g transform="translate(${x} ${y}) scale(${s * face} ${s})"><path d="M-70 -20 C -78 -70 -40 -100 10 -96 C 50 -96 70 -76 72 -50 C 84 -40 86 -10 80 10 L 70 10 C 70 -6 66 -18 60 -22 L 56 0 L 40 0 L 38 -24 L -30 -24 L -32 0 L -48 0 L -50 -22 C -60 -18 -66 -16 -70 -20Z" fill="${C.indigoL}" stroke="${C.iron}" stroke-width="2.6"/><circle cx="52" cy="-70" r="2.5" fill="${C.iron}"/><path d="M-40 -92 L 16 -92 L 18 -46 L -44 -46Z" fill="${cap}" stroke="${C.iron}" stroke-width="2"/><path d="M-40 -92 L 16 -92 L 18 -46 L -44 -46Z" fill="url(#clothPat)"/></g>`;
}

export function crowdRow(x0, x1, y, s, color, step = 46, seed = 1) {
  let r = "", k = seed;
  for (let x = x0; x < x1; x += step) { k = (k * 9301 + 49297) % 233280; const j = k / 233280; r += soldier(x + j * 14, y + j * 8, s, color); }
  return r;
}

export function arrowShape(id) {
  return `<g id="${id}" opacity="0"><path d="M-40 0 L 30 0" stroke="${C.iron}" stroke-width="3.2"/><path d="M30 0 l -12 -6 v12z" fill="${C.ochreL}" stroke="${C.iron}" stroke-width="1.5"/><path d="M-40 0 l -8 -6 M-40 0 l -8 6" stroke="${C.madder}" stroke-width="2"/></g>`;
}

export function tent(x, y, s, c) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0 L0 -80 L60 0Z" fill="${c || C.white}" stroke="${C.iron}" stroke-width="2.5"/><path d="M-60 0 L0 -80 L60 0Z" fill="url(#stripes)"/><path d="M-14 0 L0 -40 L14 0Z" fill="${C.iron}"/><path d="M0 -80 V-120" stroke="${C.iron}" stroke-width="3"/><path d="M0 -120 l 24 7 l -24 7z" fill="${C.madder}" stroke="${C.iron}"/></g>`;
}
