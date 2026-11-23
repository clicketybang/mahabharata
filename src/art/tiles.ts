/* Kalamkari creeper border tiles (horizontal, vertical) and the cotton-weave background.
   Creeper borders appear only at thresholds (title page; anything reached by memory, omen or index). */

export function tiles(): [string, string, string] {
  const h = `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22' viewBox='0 0 44 22'><rect width='44' height='22' fill='#f6ecd8'/><rect width='44' height='2.5' fill='#2b2018'/><rect y='19.5' width='44' height='2.5' fill='#2b2018'/><path d='M0 11 Q11 4 22 11 T44 11' fill='none' stroke='#5b7a46' stroke-width='1.6'/><path d='M11 11 q -5 -6 0 -8.5 q 5 2.5 0 8.5z' fill='#a63a2b' stroke='#2b2018' stroke-width='.8'/><path d='M33 11 q -5 6 0 8.5 q 5 -2.5 0 -8.5z' fill='#5b7a46' stroke='#2b2018' stroke-width='.8'/><circle cx='22' cy='11' r='1.8' fill='#c9973a'/></svg>`;
  const v = `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='44' viewBox='0 0 22 44'><rect width='22' height='44' fill='#f6ecd8'/><rect width='2.5' height='44' fill='#2b2018'/><rect x='19.5' width='2.5' height='44' fill='#2b2018'/><path d='M11 0 Q4 11 11 22 T11 44' fill='none' stroke='#5b7a46' stroke-width='1.6'/><path d='M11 11 q -6 -5 -8.5 0 q 2.5 5 8.5 0z' fill='#a63a2b' stroke='#2b2018' stroke-width='.8'/><path d='M11 33 q 6 -5 8.5 0 q -2.5 5 -8.5 0z' fill='#5b7a46' stroke='#2b2018' stroke-width='.8'/></svg>`;
  const texture = "radial-gradient(ellipse at 18% 0%, rgba(201,151,58,.14), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(166,58,43,.07), transparent 50%), repeating-linear-gradient(0deg, rgba(43,32,24,.022) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(43,32,24,.022) 0 1px, transparent 1px 3px)";
  return [h, v, texture];
}

/** the corner ornament of the plain (non-threshold) frame: a rosette with creeper sprigs running along both edges.
    Drawn for the top-left corner; the other three are the same art rotated. */
export function corners(): [string, string, string, string] {
  const art = `<path d='M6 6 H62 M6 6 V62' stroke='#2b2018' stroke-width='2'/><path d='M14 14 Q30 10 50 16 M14 14 Q10 30 16 50' fill='none' stroke='#5b7a46' stroke-width='1.6'/>`
    + `<path d='M34 13 q 4 -7 9 -3 q -3 6 -9 3z M13 34 q -7 4 -3 9 q 6 -3 3 -9z' fill='#5b7a46' stroke='#2b2018' stroke-width='.7'/>`
    + `<path d='M50 16 q 5 -6 10 -1 q -5 6 -10 1z M16 50 q -6 5 -1 10 q 6 -5 1 -10z' fill='#a63a2b' stroke='#2b2018' stroke-width='.7'/>`
    + `<g transform='translate(15 15)'>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse rx='3.2' ry='7' transform='rotate(${a}) translate(0 -6.5)' fill='${a % 90 ? "#c9973a" : "#a63a2b"}' stroke='#2b2018' stroke-width='.7'/>`).join("")}<circle r='4.2' fill='#f6ecd8' stroke='#2b2018' stroke-width='.8'/><circle r='1.8' fill='#2e4377'/></g>`;
  const at = (r: number) => `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><g transform='rotate(${r} 32 32)'>${art}</g></svg>`;
  return [at(0), at(90), at(180), at(270)]; // top-left, top-right, bottom-right, bottom-left
}

export const BANDS = `<div class="band t"></div><div class="band b"></div><div class="band l"></div><div class="band r"></div>`;
