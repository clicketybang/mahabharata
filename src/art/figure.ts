/* The human figure, drawn facing right with feet at y=0 (~210 units tall).
   Options: skin, cloth, cloth2, face ("left" flips), seated, female, loose (hair), crown
   (kirita | krishna | mukuta | female | topknot), weapon (bow | mace | reins | dice | point |
   plead | fist | grab), halo, armour, beard, mustache, blind, veiled, arrow, id, x, y, s. */
import { C, S } from "./palette";

export type Crown = "kirita" | "krishna" | "mukuta" | "female" | "topknot";
export type Weapon = "bow" | "mace" | "reins" | "dice" | "point" | "plead" | "fist" | "grab" | "none";
export interface FigureOpts {
  skin: string; cloth?: string; cloth2?: string; face?: "left" | "right";
  seated?: boolean; female?: boolean; loose?: boolean; crown?: Crown; weapon?: Weapon;
  halo?: boolean; armour?: boolean; beard?: boolean; mustache?: boolean; blind?: boolean; veiled?: boolean; arrow?: boolean;
  id?: string; x?: number; y?: number; s?: number;
}

export function fig(o: FigureOpts): string {
  const skin = o.skin, cloth = o.cloth || C.madder, cloth2 = o.cloth2 || C.ochre, id = o.id ? `id="${o.id}"` : "";
  const flip = o.face === "left" ? " scale(-1 1)" : "";
  let legs: string, upperY = 0;
  if (o.seated) {
    upperY = 58;
    legs = `<path d="M-38 -6 Q-30 -46 0 -48 Q36 -46 44 -6 Q0 10 -38 -6Z" fill="${cloth}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-38 -6 Q-30 -46 0 -48 Q36 -46 44 -6 Q0 10 -38 -6Z" fill="url(#clothPat)"/>
          <ellipse cx="34" cy="-8" rx="11" ry="5" fill="${skin}" stroke="${C.iron}" stroke-width="1.8"/>`;
  } else if (o.female) {
    legs = `<path d="M-20 -72 L20 -72 L34 0 L-34 0Z" fill="${cloth}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-20 -72 L20 -72 L34 0 L-34 0Z" fill="url(#clothPat)"/>
          <path d="M-34 0 L34 0 L32 -10 L-32 -10Z" fill="${cloth2}" stroke="${C.iron}" stroke-width="1.6"/>${[-22, -8, 6, 20].map(x => `<path d="M${x * .6} -70 L${x} -10" stroke="${C.iron}" stroke-width="1.2"/>`).join("")}`;
  } else {
    legs = `<path d="M-22 -72 L22 -72 L30 -4 L8 -4 L1 -42 L-6 -4 L-30 -4Z" fill="${cloth}" stroke="${C.iron}" stroke-width="${S}" stroke-linejoin="round"/><path d="M-22 -72 L22 -72 L30 -4 L8 -4 L1 -42 L-6 -4 L-30 -4Z" fill="url(#clothPat)"/>
          <path d="M-30 -4 h22 v-6 h-22z M8 -4 h22 v-6 h-22z" fill="${cloth2}" stroke="${C.iron}" stroke-width="1.4"/>
          <ellipse cx="-14" cy="-1" rx="15" ry="5" fill="${skin}" stroke="${C.iron}" stroke-width="1.8"/><ellipse cx="22" cy="-1" rx="15" ry="5" fill="${skin}" stroke="${C.iron}" stroke-width="1.8"/>`;
  }
  const sash = `<path d="M-22 -74 Q0 -64 22 -74 L24 -66 Q0 -56 -24 -66Z" fill="${cloth2}" stroke="${C.iron}" stroke-width="1.8"/><path d="M-6 -62 q -4 20 -2 36 l 8 0 q -2 -16 2 -36z" fill="${cloth2}" stroke="${C.iron}" stroke-width="1.6"/>`;
  const torso = `<path d="M-19 -72 C-24 -96 -22 -116 -16 -128 L16 -128 C22 -116 24 -96 19 -72Z" fill="${skin}" stroke="${C.iron}" stroke-width="${S}"/>
    <path d="M-12 -126 Q0 -104 12 -126" fill="none" stroke="${C.ochre}" stroke-width="4"/><path d="M-15 -126 Q0 -92 15 -126" fill="none" stroke="${C.madder}" stroke-width="2.4"/><circle cy="-100" r="3.5" fill="${C.madder}" stroke="${C.iron}"/>
    ${o.female ? `<path d="M-19 -120 L18 -84 L22 -92 L-12 -128Z" fill="${cloth2}" stroke="${C.iron}" stroke-width="1.8"/><path d="M-19 -120 L18 -84 L22 -92 L-12 -128Z" fill="url(#dotsK)"/>` : ""}
    ${o.armour ? `<path d="M-17 -118 h34 v28 h-34z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.8"/><path d="M-17 -118 h34 v28 h-34z" fill="url(#stripes)"/>` : ""}`;
  const eye = o.blind ? `<path d="M3 -149 q 6 3 11 0" fill="none" stroke="${C.iron}" stroke-width="2"/>`
    : o.veiled ? `<path d="M-12 -152 H18" stroke="${C.indigoL}" stroke-width="7"/>`
    : `<path d="M1 -149 Q8 -155 15 -149 Q8 -145 1 -149Z" fill="#fff" stroke="${C.iron}" stroke-width="1.8"/><circle cx="10" cy="-149.5" r="2.1" fill="${C.iron}"/><path d="M1 -149 L-6 -147" stroke="${C.iron}" stroke-width="1.6"/>`;
  const head = `<path d="M-12 -132 C -22 -136 -24 -116 -16 -112 L-8 -126Z" fill="${C.iron}"/>
    <path d="M-10 -130 C-15 -142 -13 -158 0 -162 C11 -164 17 -156 17 -150 L21 -145 L17 -143 C18 -138 15 -133 9 -131 C4 -129 -4 -128 -10 -130Z" fill="${skin}" stroke="${C.iron}" stroke-width="${S}"/>
    ${eye}${o.veiled ? "" : `<path d="M2 -154 q 7 -4 13 0" fill="none" stroke="${C.iron}" stroke-width="1.6"/>`}
    <path d="M10 -136 q 4 1 6 -1" fill="none" stroke="${C.madder}" stroke-width="2"/><path d="M14 -160 v 7" stroke="${C.madder}" stroke-width="2.5"/>
    ${o.beard ? `<path d="M-6 -132 C -4 -116 10 -110 14 -124 C 12 -130 6 -132 -6 -132Z" fill="#f7efdc" stroke="${C.iron}" stroke-width="1.8"/>` : ""}
    ${o.mustache ? `<path d="M8 -137 q 6 -2 10 2 q -5 -1 -10 0" fill="${C.iron}"/>` : ""}
    <circle cx="-4" cy="-141" r="4.5" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.4"/><circle cx="-4" cy="-141" r="1.6" fill="${C.madder}"/>`;
  let crown = "";
  if (o.crown === "kirita" || o.crown === "krishna") {
    crown = `<path d="M-13 -158 L16 -158 L11 -188 L5 -200 L1 -192 L-4 -200 L-9 -188Z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="${S}" stroke-linejoin="round"/><path d="M-12 -166 H15 M-10 -176 H13" stroke="${C.madder}" stroke-width="2.4"/><circle cx="1" cy="-183" r="3" fill="${C.madder}" stroke="${C.iron}"/>`;
    if (o.crown === "krishna") crown = `<g transform="translate(-10 -186) rotate(-28)"><path d="M0 0 C -8 -18 -6 -38 0 -48 C 6 -38 8 -18 0 0Z" fill="${C.leaf}" stroke="${C.iron}" stroke-width="1.6"/><ellipse cy="-36" rx="5" ry="7" fill="${C.indigoL}" stroke="${C.iron}" stroke-width="1.3"/><circle cy="-36" r="2.5" fill="${C.ochreL}"/></g>` + crown;
  } else if (o.crown === "mukuta") {
    crown = `<path d="M-12 -158 L15 -158 L12 -176 Q2 -186 -9 -176Z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="${S}"/><path d="M-11 -166 H14" stroke="${C.madder}" stroke-width="2.4"/>`;
  } else if (o.crown === "female") {
    crown = `<path d="M-14 -150 C -30 -152 -30 -126 -20 -112 C -26 -96 -22 -80 -26 -66" fill="none" stroke="${C.iron}" stroke-width="${o.loose ? 7 : 5}" stroke-linecap="round"/><circle cx="-16" cy="-150" r="9" fill="${C.iron}"/>
      ${o.loose ? `<path d="M-16 -150 C -40 -120 -36 -90 -44 -60 M-12 -150 C -30 -116 -24 -96 -34 -70" stroke="${C.iron}" stroke-width="5" fill="none"/>` : `<circle cx="-22" cy="-150" r="3" fill="#fff" stroke="${C.iron}"/><circle cx="-14" cy="-157" r="3" fill="#fff" stroke="${C.iron}"/>`}
      <path d="M-11 -160 Q2 -168 15 -160" fill="none" stroke="${C.ochre}" stroke-width="4"/>`;
  } else if (o.crown === "topknot") {
    crown = `<ellipse cx="-2" cy="-166" rx="9" ry="7" fill="${C.iron}"/><path d="M-6 -166 h 8" stroke="${C.ochre}" stroke-width="2"/>`;
  }
  const halo = o.halo ? `<circle cx="2" cy="-150" r="36" fill="${C.ochreL}" stroke="${C.iron}" stroke-width="${S}"/><circle cx="2" cy="-150" r="30" fill="none" stroke="${C.madder}" stroke-width="2" stroke-dasharray="3 4"/>` : "";
  const arm = (x1: number, y1: number, x2: number, y2: number, w = 9) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.iron}" stroke-width="${w + 4.5}" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${skin}" stroke-width="${w}" stroke-linecap="round"/>`;
  const bangle = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.3"/>`;
  let arms = "", back = ""; const w = o.weapon;
  if (w === "bow") {
    back = arm(-10, -120, -2, -106) + arm(-2, -106, 4, -114, 8);
    arms = arm(12, -120, 52, -114) + bangle(46, -115) + `<g><path d="M52 -176 C 82 -150 82 -78 52 -52" fill="none" stroke="${C.iron}" stroke-width="8" stroke-linecap="round"/><path d="M52 -176 C 82 -150 82 -78 52 -52" fill="none" stroke="${C.ochre}" stroke-width="4" stroke-linecap="round"/>
       <path d="M52 -176 L4 -114 L52 -52" fill="none" stroke="${C.iron}" stroke-width="1.4"/><g ${o.id ? `id="${o.id}-arrow"` : ""} opacity="${o.arrow ? 1 : 0}"><path d="M4 -114 L96 -114" stroke="${C.iron}" stroke-width="3"/><path d="M96 -114 l -12 -6 v12z" fill="${C.ochreL}" stroke="${C.iron}" stroke-width="1.6"/></g></g>`;
  } else if (w === "mace") {
    back = arm(-10, -120, -22, -90);
    arms = `<g ${o.id ? `id="${o.id}-arm"` : ""}>${arm(12, -120, 24, -160)}${bangle(22, -156)}<path d="M24 -158 L30 -228" stroke="${C.iron}" stroke-width="8" stroke-linecap="round"/><path d="M24 -158 L30 -228" stroke="${C.ochre}" stroke-width="4"/>
      <ellipse cx="31" cy="-246" rx="17" ry="24" fill="${C.ochre}" stroke="${C.iron}" stroke-width="${S}"/><path d="M17 -246 h28 M19 -236 h24 M19 -256 h24" stroke="${C.madder}" stroke-width="2.4"/><circle cx="32" cy="-272" r="4" fill="${C.madder}" stroke="${C.iron}"/></g>`;
  } else if (w === "reins") {
    back = arm(-10, -120, 4, -100);
    arms = arm(12, -120, 48, -106) + bangle(44, -107) + `<path d="M48 -106 C 90 -100 130 -96 170 -110" fill="none" stroke="${C.iron}" stroke-width="1.6"/><path d="M48 -108 L60 -150" stroke="${C.iron}" stroke-width="2.4"/>`;
  } else if (w === "dice") { back = arm(-10, -120, -6, -92); arms = arm(12, -120, 40, -94) + bangle(36, -96);
  } else if (w === "point") { back = arm(-10, -120, -20, -88); arms = arm(12, -120, 58, -140) + bangle(52, -137);
  } else if (w === "plead") { back = arm(-10, -120, 18, -150); arms = arm(12, -120, 30, -150);
  } else if (w === "fist") { back = arm(-10, -120, -22, -88); arms = `<g ${o.id ? `id="${o.id}-arm"` : ""}>${arm(12, -120, 30, -176)}<circle cx="31" cy="-180" r="8" fill="${skin}" stroke="${C.iron}" stroke-width="${S}"/></g>`;
  } else if (w === "grab") { back = arm(-10, -120, -18, -90); arms = arm(12, -120, 60, -128) + bangle(54, -127);
  } else { back = arm(-10, -120, -18, -84); arms = arm(12, -120, 22, -84) + bangle(20, -90); }
  return `<g ${id} transform="translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})${flip}">${legs}<g transform="translate(0 ${upperY})">${halo}${back}${torso}${sash}${head}${crown}${arms}</g></g>`;
}
