/* Kalamkari creeper border tiles (horizontal, vertical) and the cotton-weave background.
   Creeper borders appear only at thresholds (title page; anything reached by memory, omen or index). */

export function tiles(): [string, string, string] {
  const h = `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22' viewBox='0 0 44 22'><rect width='44' height='22' fill='#f6ecd8'/><rect width='44' height='2.5' fill='#2b2018'/><rect y='19.5' width='44' height='2.5' fill='#2b2018'/><path d='M0 11 Q11 4 22 11 T44 11' fill='none' stroke='#5b7a46' stroke-width='1.6'/><path d='M11 11 q -5 -6 0 -8.5 q 5 2.5 0 8.5z' fill='#a63a2b' stroke='#2b2018' stroke-width='.8'/><path d='M33 11 q -5 6 0 8.5 q 5 -2.5 0 -8.5z' fill='#5b7a46' stroke='#2b2018' stroke-width='.8'/><circle cx='22' cy='11' r='1.8' fill='#c9973a'/></svg>`;
  const v = `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='44' viewBox='0 0 22 44'><rect width='22' height='44' fill='#f6ecd8'/><rect width='2.5' height='44' fill='#2b2018'/><rect x='19.5' width='2.5' height='44' fill='#2b2018'/><path d='M11 0 Q4 11 11 22 T11 44' fill='none' stroke='#5b7a46' stroke-width='1.6'/><path d='M11 11 q -6 -5 -8.5 0 q 2.5 5 8.5 0z' fill='#a63a2b' stroke='#2b2018' stroke-width='.8'/><path d='M11 33 q 6 -5 8.5 0 q -2.5 5 -8.5 0z' fill='#5b7a46' stroke='#2b2018' stroke-width='.8'/></svg>`;
  const texture = "radial-gradient(ellipse at 18% 0%, rgba(201,151,58,.14), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(166,58,43,.07), transparent 50%), repeating-linear-gradient(0deg, rgba(43,32,24,.022) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(43,32,24,.022) 0 1px, transparent 1px 3px)";
  return [h, v, texture];
}

export const BANDS = `<div class="band t"></div><div class="band b"></div><div class="band l"></div><div class="band r"></div>`;
