/* The figure library (design v2, owner 2026-11-22: "baby, teen, adult, old for male and female; different jewellery,
   crowns, hair styles, clothes, patterns"). Every person in the story is drawn by this one function, in the manner of
   a Srikalahasti Kalamkari cloth: iron-black outlines, madder / indigo / ochre / leaf fills, patterned textiles.

   The figure faces right with its feet at y = 0 and is ~210 units tall as an adult. Options:
   - who:      skin, female, age (baby | child | teen | adult | old)
   - hair:     topknot | jata (matted, ascetic) | long | curls (child side-locks) | shaved (with śikhā) | bun | braid | loose
               hairColor (defaults: black; white when old)
   - head:     crown (kirita | krishna | mukuta | tiara | diadem | turban | female | topknot | none), halo,
               beard (true | "short" | "long"), mustache, tilak ("v" vertical | "h" ash lines | "none"), blind, veiled
   - body:     garb (dhoti | short | valkala | loin | sari | lehenga | widow), upper (bare | uttariya), armour,
               cloth, cloth2 (the colours), pattern (dots | stripes | checks | buti | plain), jewels (ascetic | simple | royal)
   - pose:     seated | kneel | walk; weapon / gesture: bow | mace | reins | dice | point | plead | fist | grab | none |
               namaste | bless | mourn | cradle | staff | sword | spear | discus | conch | garland | pot | basket
   - place:    x, y, s, face ("left" mirrors), id (built scenes animate #<id>-arm and #<id>-arrow)
   Older call sites (seated, loose, beard: true, crown: "female" …) keep working unchanged. */
import { C, S } from "./palette";

export type Crown = "kirita" | "krishna" | "mukuta" | "female" | "topknot" | "tiara" | "diadem" | "turban" | "jata" | "none";
export type Weapon = "bow" | "mace" | "reins" | "dice" | "point" | "plead" | "fist" | "grab" | "none"
  | "namaste" | "bless" | "mourn" | "cradle" | "staff" | "sword" | "spear" | "discus" | "conch" | "garland" | "pot" | "basket";
export type Age = "baby" | "child" | "teen" | "adult" | "old";
export type Hair = "topknot" | "jata" | "long" | "curls" | "shaved" | "bun" | "braid" | "loose";
export type Garb = "dhoti" | "short" | "valkala" | "loin" | "sari" | "lehenga" | "widow";
export type Pattern = "dots" | "stripes" | "checks" | "buti" | "plain";
export type Jewels = "ascetic" | "simple" | "royal";
export interface FigureOpts {
  skin: string; cloth?: string; cloth2?: string; face?: "left" | "right";
  seated?: boolean; kneel?: boolean; walk?: boolean; female?: boolean; loose?: boolean; crown?: Crown; weapon?: Weapon;
  halo?: boolean; armour?: boolean; beard?: boolean | "short" | "long"; mustache?: boolean; blind?: boolean; veiled?: boolean; arrow?: boolean;
  age?: Age; hair?: Hair; hairColor?: string; garb?: Garb; upper?: "bare" | "uttariya"; pattern?: Pattern; jewels?: Jewels; tilak?: "v" | "h" | "none";
  detail?: boolean; id?: string; x?: number; y?: number; s?: number;
}

const I = C.iron;
const SKIN_BABY = "#e6bd92", BARK = "#8a6a3a", BARK2 = "#6e5230", PEARL = "#fbf4e4", GOLD = C.ochre, GOLDL = C.ochreL;
const PAT: Record<Pattern, string> = { dots: "url(#clothPat)", stripes: "url(#patStripes)", checks: "url(#patChecks)", buti: "url(#patButi)", plain: "none" };

/* ---------- small parts ---------- */
const ln = (x1: number, y1: number, x2: number, y2: number, c: string, w: number) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
/** a limb: shoulder → (elbow) → hand, inked; with optional armlet and bangle */
function limb(skin: string, pts: number[], w = 9, j?: { armlet?: boolean; bangle?: boolean }): string {
  let s = "";
  for (let k = 0; k + 3 < pts.length; k += 2) s += ln(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], I, w + 4.5);
  for (let k = 0; k + 3 < pts.length; k += 2) s += ln(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], skin, w);
  const n = pts.length, hx = pts[n - 2], hy = pts[n - 1];
  if (j?.armlet) { const ax = pts[0] + (pts[2] - pts[0]) * .4, ay = pts[1] + (pts[3] - pts[1]) * .4; s += `<circle cx="${ax}" cy="${ay}" r="5.4" fill="${GOLD}" stroke="${I}" stroke-width="1.3"/><circle cx="${ax}" cy="${ay}" r="1.8" fill="${C.madder}"/>`; }
  if (j?.bangle) { const bx = pts[n - 4] + (hx - pts[n - 4]) * .82, by = pts[n - 3] + (hy - pts[n - 3]) * .82; s += `<circle cx="${bx}" cy="${by}" r="4.4" fill="${GOLD}" stroke="${I}" stroke-width="1.2"/>`; }
  return s;
}
const palm = (x: number, y: number, skin: string, r = 5.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${skin}" stroke="${I}" stroke-width="1.8"/>`;
function baby(skin: string, cloth: string, x = 0, y = 0, s = 1, inBasket = false): string {
  const basket = inBasket ? `<path d="M-44 -6 q 44 26 88 0 l -8 -18 h-72z" fill="${GOLD}" stroke="${I}" stroke-width="2"/>${[-30, -15, 0, 15, 30].map(dx => `<path d="M${dx} -22 v16" stroke="${I}" stroke-width="1"/>`).join("")}<path d="M-40 -14 q 40 14 80 0" fill="none" stroke="${I}" stroke-width="1.2"/>` : "";
  return `<g transform="translate(${x} ${y}) scale(${s})">${inBasket ? `<path d="M-60 6 q 30 -8 60 0 t 60 0" fill="none" stroke="${C.river}" stroke-width="4"/>` : ""}
    <path d="M-30 -16 q 0 -26 30 -26 q 26 0 30 16 q 2 14 -12 18 h-40 q -8 0 -8 -8z" fill="${cloth}" stroke="${I}" stroke-width="2"/><path d="M-30 -16 q 0 -26 30 -26 q 26 0 30 16 q 2 14 -12 18 h-40 q -8 0 -8 -8z" fill="url(#clothPat)"/>
    <circle cx="30" cy="-34" r="15" fill="${skin}" stroke="${I}" stroke-width="2"/><path d="M22 -46 q 8 -8 16 -2" fill="none" stroke="${I}" stroke-width="3"/><circle cx="36" cy="-36" r="1.8" fill="${I}"/><path d="M38 -28 q 3 1 5 -1" stroke="${C.madder}" stroke-width="1.5" fill="none"/>
    <circle cx="26" cy="-30" r="2.6" fill="${GOLD}" stroke="${I}" stroke-width=".8"/>${basket}</g>`;
}

/* ---------- the figure ---------- */
export function fig(o: FigureOpts): string {
  const age: Age = o.age ?? "adult";
  const skin = o.skin, cloth = o.cloth || C.madder, cloth2 = o.cloth2 || C.ochre, id = o.id ? `id="${o.id}"` : "";
  const flip = o.face === "left" ? " scale(-1 1)" : "";
  if (age === "baby") return `<g ${id} transform="translate(${o.x || 0} ${o.y || 0}) scale(${(o.s || 1) * .9})${flip}">${baby(skin, cloth, 0, 0, 1, o.weapon === "basket")}</g>`;

  const fem = !!o.female, old = age === "old", young = age === "child" || age === "teen";
  const crownIn: Crown = o.crown ?? (fem ? "female" : "none");
  const hair: Hair = o.hair ?? (crownIn === "jata" ? "jata" : fem ? (o.loose ? "loose" : "bun") : crownIn === "topknot" ? "topknot" : young ? "curls" : "long");
  const crown: Crown = crownIn === "female" || crownIn === "topknot" || crownIn === "jata" ? "none" : crownIn;
  const hc = o.hairColor ?? (old ? "#efe6d4" : I);
  const garb: Garb = o.garb ?? (fem ? "sari" : "dhoti");
  const pattern: Pattern = o.pattern ?? (garb === "widow" || garb === "valkala" ? "plain" : "dots");
  const jewels: Jewels = o.jewels ?? (garb === "valkala" || garb === "loin" || garb === "widow" ? "ascetic" : crown === "kirita" || crown === "krishna" || crown === "mukuta" || crown === "tiara" || crown === "turban" ? "royal" : "simple");
  const royal = jewels === "royal", asc = jewels === "ascetic";
  const beard = o.beard === true ? "short" : o.beard || null;
  const w = o.weapon ?? "none";
  const fabric = garb === "valkala" ? BARK : garb === "widow" ? C.white : cloth;
  const pat = PAT[pattern];

  /* legs and lower garment */
  let legs: string, upperY = 0;
  const hem = (d: string) => `<path d="${d}" fill="${cloth2}" stroke="${I}" stroke-width="1.4"/><path d="${d}" fill="url(#patZig)"/>`;
  if (o.seated) {
    upperY = 58;
    legs = `<path d="M-38 -6 Q-30 -46 0 -48 Q36 -46 44 -6 Q0 10 -38 -6Z" fill="${fabric}" stroke="${I}" stroke-width="${S}"/><path d="M-38 -6 Q-30 -46 0 -48 Q36 -46 44 -6 Q0 10 -38 -6Z" fill="${pat}"/>
      <path d="M-36 -8 Q0 6 42 -8" fill="none" stroke="${cloth2}" stroke-width="4"/><ellipse cx="34" cy="-8" rx="11" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/>${royal ? `<path d="M26 -9 h10" stroke="${GOLD}" stroke-width="3"/>` : ""}`;
  } else if (o.kneel) {
    upperY = 34;
    legs = `<path d="M-24 -38 L22 -38 L40 -4 L22 -2 L8 -18 L-6 -2 L-30 -4Z" fill="${fabric}" stroke="${I}" stroke-width="${S}" stroke-linejoin="round"/><path d="M-24 -38 L22 -38 L40 -4 L22 -2 L8 -18 L-6 -2 L-30 -4Z" fill="${pat}"/>
      <ellipse cx="-20" cy="-1" rx="15" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/><ellipse cx="38" cy="-2" rx="12" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/>`;
  } else if (fem && (garb === "sari" || garb === "widow" || garb === "lehenga")) {
    const flare = garb === "lehenga" ? 44 : 34;
    legs = `<path d="M-20 -72 L20 -72 L${flare} 0 L-${flare} 0Z" fill="${fabric}" stroke="${I}" stroke-width="${S}"/><path d="M-20 -72 L20 -72 L${flare} 0 L-${flare} 0Z" fill="${pat}"/>
      ${garb === "lehenga" ? `<path d="M-30 -24 H30 M-26 -46 H26" stroke="${cloth2}" stroke-width="4"/>` : [-22, -8, 6, 20].map(x => `<path d="M${x * .6} -70 L${x} -10" stroke="${I}" stroke-width="1.1" opacity=".8"/>`).join("")}
      ${garb === "widow" ? `<path d="M-${flare} 0 L${flare} 0 L${flare - 2} -6 L-${flare - 2} -6Z" fill="${C.white}" stroke="${I}" stroke-width="1.2"/>` : hem(`M-${flare} 0 L${flare} 0 L${flare - 2} -11 L-${flare - 2} -11Z`)}
      <ellipse cx="-12" cy="1" rx="11" ry="4" fill="${skin}" stroke="${I}" stroke-width="1.6"/><ellipse cx="16" cy="1" rx="11" ry="4" fill="${skin}" stroke="${I}" stroke-width="1.6"/>
      ${royal || jewels === "simple" ? `<path d="M-20 -2 h14 M8 -2 h16" stroke="${GOLD}" stroke-width="2.6" stroke-dasharray="2 2"/>` : ""}`;
  } else if (garb === "short" || garb === "loin") {
    const knee = garb === "loin" ? -54 : -36;
    legs = `${limb(skin, [-12, -70, -14, -2], 10)}${limb(skin, [12, -70, 16, -2], 10)}
      <path d="M-22 -74 L22 -74 L24 ${knee} L4 ${knee + 4} L0 ${knee - 10} L-4 ${knee + 4} L-24 ${knee}Z" fill="${fabric}" stroke="${I}" stroke-width="${S}" stroke-linejoin="round"/><path d="M-22 -74 L22 -74 L24 ${knee} L4 ${knee + 4} L0 ${knee - 10} L-4 ${knee + 4} L-24 ${knee}Z" fill="${pat}"/>
      <ellipse cx="-16" cy="-1" rx="13" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/><ellipse cx="20" cy="-1" rx="13" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/>`;
  } else {
    const st = o.walk ? 8 : 0;
    const d = `M-22 -72 L22 -72 L${30 + st} -4 L${8 + st} -4 L1 -42 L${-6 - st} -4 L${-30 - st} -4Z`;
    legs = `<path d="${d}" fill="${fabric}" stroke="${I}" stroke-width="${S}" stroke-linejoin="round"/><path d="${d}" fill="${pat}"/>
      ${garb === "valkala" ? [-60, -46, -32, -18].map(y => `<path d="M-20 ${y} q 10 -3 20 0 t 20 0" fill="none" stroke="${BARK2}" stroke-width="1.6"/>`).join("") : `<path d="M1 -70 l -4 30 l 8 0 z" fill="${cloth2}" stroke="${I}" stroke-width="1.2"/><path d="M-12 -68 L-18 -8 M12 -68 L20 -8" stroke="${I}" stroke-width="1" opacity=".55"/>`}
      ${garb === "valkala" ? "" : hem(`M${-30 - st} -4 h22 v-7 h-22z M${8 + st} -4 h22 v-7 h-22z`)}
      <ellipse cx="${-14 - st}" cy="-1" rx="15" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/><ellipse cx="${22 + st}" cy="-1" rx="15" ry="5" fill="${skin}" stroke="${I}" stroke-width="1.8"/>
      ${royal ? `<path d="M${-24 - st} -4 h16 M${12 + st} -4 h18" stroke="${GOLD}" stroke-width="2.6" stroke-dasharray="2 2"/>` : ""}`;
  }

  /* torso, upper garment, belt */
  const torsoD = fem ? "M-17 -72 C-22 -96 -20 -116 -15 -128 L15 -128 C20 -116 22 -96 17 -72Z" : "M-19 -72 C-24 -96 -22 -116 -16 -128 L16 -128 C22 -116 24 -96 19 -72Z";
  let torso = `<path d="${torsoD}" fill="${skin}" stroke="${I}" stroke-width="${S}"/>`;
  if (fem) {
    torso += `<path d="M-15 -124 Q0 -116 15 -124 L16 -100 Q0 -94 -16 -100Z" fill="${cloth2}" stroke="${I}" stroke-width="1.6"/><path d="M-15 -124 Q0 -116 15 -124 L16 -100 Q0 -94 -16 -100Z" fill="url(#dotsK)"/>`;
    if (garb !== "lehenga") torso += `<path d="M-16 -128 C -4 -118 12 -98 20 -76 L 10 -72 C 2 -92 -10 -112 -19 -120Z" fill="${fabric}" stroke="${I}" stroke-width="1.6"/><path d="M-16 -128 C -4 -118 12 -98 20 -76 L 10 -72 C 2 -92 -10 -112 -19 -120Z" fill="${pat}"/>`
      + `<path d="M-14 -126 C -30 -110 -32 -80 -38 -54" fill="none" stroke="${fabric}" stroke-width="9" stroke-linecap="round"/>`;
  } else if (garb === "valkala" || garb === "loin") {
    torso += garb === "valkala" ? `<path d="M-14 -128 L18 -84 L10 -80 L-20 -118Z" fill="${BARK}" stroke="${I}" stroke-width="1.6"/>` : "";
    torso += `<path d="M-14 -126 L12 -80" stroke="${C.white}" stroke-width="2"/>`; // sacred thread
  } else {
    torso += `<path d="M-14 -126 L12 -80" stroke="${C.white}" stroke-width="2"/>`; // sacred thread (yajñopavīta)
    if (o.upper !== "bare") torso += `<path d="M-17 -126 C -28 -104 -30 -86 -34 -64" fill="none" stroke="${I}" stroke-width="10.5" stroke-linecap="round"/><path d="M-17 -126 C -28 -104 -30 -86 -34 -64" fill="none" stroke="${cloth2}" stroke-width="7.5" stroke-linecap="round"/>`
      + `<path d="M-16 -126 Q0 -108 16 -126" fill="none" stroke="${cloth2}" stroke-width="5"/>`;
  }
  if (o.armour) torso += `<path d="M-17 -118 h34 v30 h-34z" fill="${GOLD}" stroke="${I}" stroke-width="1.8"/><path d="M-17 -118 h34 v30 h-34z" fill="url(#patScale)"/><path d="M-17 -88 h34" stroke="${I}" stroke-width="2"/>`;
  const belt = asc ? `<path d="M-21 -72 Q0 -66 21 -72" fill="none" stroke="${BARK2}" stroke-width="4"/>`
    : `<path d="M-22 -74 Q0 -64 22 -74 L24 -66 Q0 -56 -24 -66Z" fill="${cloth2}" stroke="${I}" stroke-width="1.8"/>${royal ? `<path d="M-20 -68 Q0 -60 20 -68" fill="none" stroke="${GOLD}" stroke-width="3" stroke-dasharray="3 3"/>${[-10, 0, 10].map(x => `<path d="M${x} -62 l -3 8 h6z" fill="${GOLD}" stroke="${I}" stroke-width=".8"/>`).join("")}` : ""}`;

  /* necklaces */
  let neck = "";
  if (asc) neck = `<path d="M-12 -126 Q0 -106 12 -126" fill="none" stroke="${BARK2}" stroke-width="3.4" stroke-dasharray="3 2.4"/>`;
  else {
    neck = `<path d="M-12 -126 Q0 -108 12 -126" fill="none" stroke="${GOLD}" stroke-width="3.6"/>`;
    if (royal) neck += `<path d="M-14 -126 Q0 -100 14 -126" fill="none" stroke="${PEARL}" stroke-width="2.6" stroke-dasharray="1.5 2.6"/><path d="M-15 -126 Q0 -92 15 -126" fill="none" stroke="${C.madder}" stroke-width="2.2"/><path d="M0 -98 l -4 6 l 4 6 l 4 -6z" fill="${C.madder}" stroke="${I}" stroke-width="1"/>`;
  }

  /* head: face, eyes, beard, tilak, ear jewel */
  const eye = o.blind ? `<path d="M3 -149 q 6 3 11 0" fill="none" stroke="${I}" stroke-width="2"/>`
    : o.veiled ? `<path d="M-12 -152 H18" stroke="${C.indigoL}" stroke-width="7"/>`
    : `<path d="M1 -149 Q8 -155 15 -149 Q8 -145 1 -149Z" fill="#fff" stroke="${I}" stroke-width="1.8"/><circle cx="10" cy="-149.5" r="2.1" fill="${I}"/><path d="M1 -149 L-${fem ? 9 : 6} -${fem ? 151 : 147}" stroke="${I}" stroke-width="1.6"/>`;
  const brow = o.veiled ? "" : `<path d="M2 -154 q 7 -4 13 0" fill="none" stroke="${old ? hc : I}" stroke-width="${old ? 2.2 : 1.6}"/>`;
  const wrinkles = old ? `<path d="M-1 -146 q -3 2 -2 5 M9 -140 q 3 4 0 7" fill="none" stroke="${I}" stroke-width="1" opacity=".7"/>` : "";
  const beardSvg = beard === "long"
    ? `<path d="M-8 -134 C -8 -104 4 -92 14 -96 C 16 -110 18 -124 12 -132 C 6 -130 -2 -131 -8 -134Z" fill="${old ? hc : I}" stroke="${I}" stroke-width="1.6"/>${old ? `<path d="M-2 -128 q 2 14 8 26 M4 -130 q 2 12 6 22" stroke="${I}" stroke-width=".8" fill="none" opacity=".5"/>` : ""}`
    : beard === "short" ? `<path d="M-6 -132 C -4 -116 10 -110 14 -124 C 12 -130 6 -132 -6 -132Z" fill="${old ? hc : "#f7efdc"}" stroke="${I}" stroke-width="1.8"/>` : "";
  const must = o.mustache || beard ? `<path d="M8 -137 q 6 -2 10 2 q -5 -1 -10 0" fill="${old ? hc : I}" stroke="${old ? I : "none"}" stroke-width=".6"/>` : "";
  const tilak = o.tilak === "h" ? `<path d="M3 -159 h11 M3 -156.5 h12 M4 -154 h10" stroke="${C.white}" stroke-width="1.4"/><circle cx="9" cy="-156.5" r="1.4" fill="${C.madder}"/>`
    : o.tilak === "none" ? "" : fem ? `<circle cx="14" cy="-157" r="1.9" fill="${C.madder}"/>` : `<path d="M14 -160 v 7" stroke="${C.madder}" stroke-width="2.5"/>`;
  const earJ = asc ? `<circle cx="-4" cy="-141" r="2.6" fill="${BARK2}" stroke="${I}" stroke-width="1"/>`
    : fem ? `<path d="M-4 -142 v4" stroke="${GOLD}" stroke-width="1.6"/><path d="M-9 -134 q 5 -8 10 0z" fill="${GOLD}" stroke="${I}" stroke-width="1"/>${[-7, -4, -1].map(x => `<circle cx="${x}" cy="-132.5" r="1" fill="${PEARL}"/>`).join("")}`
    : royal ? `<circle cx="-4" cy="-139" r="6.5" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="-4" cy="-133" r="2.4" fill="${C.madder}" stroke="${I}" stroke-width=".8"/>`
    : `<circle cx="-4" cy="-141" r="4" fill="${GOLD}" stroke="${I}" stroke-width="1.3"/><circle cx="-4" cy="-141" r="1.4" fill="${C.madder}"/>`;
  const femJ = fem && !asc ? `<circle cx="17" cy="-140" r="3.4" fill="none" stroke="${GOLD}" stroke-width="1.6"/>${royal ? `<path d="M2 -164 Q6 -160 9 -158" stroke="${GOLD}" stroke-width="1.6" fill="none"/><path d="M9 -160 l -2.5 4 l 2.5 3 l 2.5 -3z" fill="${C.madder}" stroke="${I}" stroke-width=".7"/>` : ""}` : "";
  const face = `<path d="M-10 -130 C-15 -142 -13 -158 0 -162 C11 -164 17 -156 17 -150 L21 -145 L17 -143 C18 -138 15 -133 9 -131 C4 -129 -4 -128 -10 -130Z" fill="${skin}" stroke="${I}" stroke-width="${S}"/>
    ${eye}${brow}${wrinkles}<path d="M10 -136 q 4 1 6 -1" fill="none" stroke="${C.madder}" stroke-width="2"/>${tilak}${beardSvg}${must}${earJ}${femJ}`;

  /* hair, behind and on top of the head */
  let hairBack = "", hairTop = "";
  if (hair === "loose") hairBack = `<path d="M-14 -150 C -30 -152 -30 -126 -20 -112 C -26 -96 -22 -80 -26 -66" fill="none" stroke="${hc}" stroke-width="7" stroke-linecap="round"/><path d="M-16 -150 C -40 -120 -36 -90 -44 -60 M-12 -150 C -30 -116 -24 -96 -34 -70" stroke="${hc}" stroke-width="5" fill="none"/><circle cx="-16" cy="-150" r="9" fill="${hc}"/>`;
  else if (hair === "bun") hairBack = `<path d="M-12 -158 C -22 -156 -24 -138 -14 -130 L-6 -140Z" fill="${hc}"/><circle cx="-18" cy="-146" r="10" fill="${hc}" stroke="${I}" stroke-width="1"/>${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="${-18 + 11 * Math.cos(a * Math.PI / 180)}" cy="${-146 + 11 * Math.sin(a * Math.PI / 180)}" r="2.6" fill="#fff" stroke="${I}" stroke-width=".7"/>`).join("")}`;
  else if (hair === "braid") hairBack = `<path d="M-12 -156 C -22 -154 -22 -138 -16 -128" fill="none" stroke="${hc}" stroke-width="8"/>${Array.from({ length: 8 }, (_, k) => `<ellipse cx="${-18 - k * .6}" cy="${-124 + k * 8}" rx="4.6" ry="5" fill="${hc}" stroke="${old ? I : C.muted}" stroke-width=".8"/>`).join("")}<path d="M-23 -60 l -3 12 h8z" fill="${C.madder}" stroke="${I}" stroke-width="1"/>`;
  else if (hair === "long") hairBack = `<path d="M-12 -158 C -24 -150 -26 -126 -22 -108 Q -16 -104 -10 -112 L-6 -132Z" fill="${hc}"/>`;
  else if (hair === "jata") { hairBack = `<path d="M-12 -154 C -26 -146 -28 -120 -24 -100 M-10 -152 C -20 -140 -20 -120 -18 -104" fill="none" stroke="${hc}" stroke-width="5" stroke-linecap="round"/>`; hairTop = `<path d="M-12 -160 C -14 -176 -6 -190 2 -194 C 10 -190 16 -176 14 -160Z" fill="${hc}" stroke="${I}" stroke-width="1.6"/><path d="M-10 -170 q 12 -4 22 0 M-8 -180 q 10 -4 18 0" stroke="${old ? I : C.muted}" stroke-width="1" fill="none"/><path d="M-11 -162 h24" stroke="${BARK2}" stroke-width="3"/>`; }
  else if (hair === "curls") { hairBack = `<path d="M-12 -132 C -22 -136 -24 -116 -16 -112 L-8 -126Z" fill="${hc}"/>`; hairTop = `<circle cx="-6" cy="-150" r="5" fill="${hc}"/><circle cx="-2" cy="-161" r="6" fill="${hc}"/><path d="M-6 -146 c -6 4 -6 12 0 14" fill="none" stroke="${hc}" stroke-width="3"/>`; }
  else if (hair === "shaved") hairTop = `<path d="M-6 -160 q -6 -10 -14 -8" fill="none" stroke="${hc}" stroke-width="2.6"/>`;
  else hairBack = `<path d="M-12 -132 C -22 -136 -24 -116 -16 -112 L-8 -126Z" fill="${hc}"/>`;
  if (hair === "topknot") hairTop = `<ellipse cx="-2" cy="-166" rx="9" ry="7" fill="${hc}"/><path d="M-6 -166 h 8" stroke="${GOLD}" stroke-width="2"/>`;
  const capHair = hair === "shaved" || hair === "jata" || crown !== "none" ? "" : `<path d="M-11 -150 C -10 -164 8 -168 16 -156 C 6 -160 -4 -158 -11 -150Z" fill="${hc}"/>`;

  /* crowns */
  let crownSvg = "";
  if (crown === "kirita" || crown === "krishna") {
    crownSvg = `<path d="M-13 -158 L16 -158 L11 -188 L5 -200 L1 -192 L-4 -200 L-9 -188Z" fill="${GOLD}" stroke="${I}" stroke-width="${S}" stroke-linejoin="round"/><path d="M-12 -166 H15 M-10 -176 H13 M-8 -186 H11" stroke="${C.madder}" stroke-width="2.2"/><path d="M-11 -171 H14" stroke="${PEARL}" stroke-width="2" stroke-dasharray="1.5 3"/><circle cx="1" cy="-183" r="3" fill="${C.madder}" stroke="${I}"/><path d="M-13 -158 q -8 6 -6 16" fill="none" stroke="${GOLD}" stroke-width="3"/>`;
    if (crown === "krishna") crownSvg = `<g transform="translate(-10 -186) rotate(-28)"><path d="M0 0 C -8 -18 -6 -38 0 -48 C 6 -38 8 -18 0 0Z" fill="${C.leaf}" stroke="${I}" stroke-width="1.6"/><ellipse cy="-36" rx="5" ry="7" fill="${C.indigoL}" stroke="${I}" stroke-width="1.3"/><circle cy="-36" r="2.5" fill="${GOLDL}"/></g>` + crownSvg;
  } else if (crown === "mukuta") crownSvg = `<path d="M-12 -158 L15 -158 L12 -176 Q2 -186 -9 -176Z" fill="${GOLD}" stroke="${I}" stroke-width="${S}"/><path d="M-11 -166 H14" stroke="${C.madder}" stroke-width="2.4"/><circle cx="2" cy="-172" r="2.4" fill="${C.madder}" stroke="${I}" stroke-width=".8"/>`;
  else if (crown === "tiara") crownSvg = `<path d="M-12 -158 Q2 -166 16 -158 L14 -164 L9 -162 L6 -172 L2 -164 L-3 -170 L-6 -163 L-11 -165Z" fill="${GOLD}" stroke="${I}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="6" cy="-166" r="2" fill="${C.madder}"/>`;
  else if (crown === "diadem") crownSvg = `<path d="M-11 -158 Q2 -164 16 -157" fill="none" stroke="${GOLD}" stroke-width="4"/><path d="M8 -162 l -3 -6 h6z" fill="${C.madder}" stroke="${I}" stroke-width=".8"/>`;
  else if (crown === "turban") crownSvg = `<path d="M-14 -156 C -16 -176 12 -182 18 -160 Q2 -150 -14 -156Z" fill="${cloth2}" stroke="${I}" stroke-width="${S}"/><path d="M-12 -164 Q4 -158 17 -166 M-10 -172 Q4 -166 15 -173" fill="none" stroke="${I}" stroke-width="1.2"/><circle cx="8" cy="-168" r="3" fill="${GOLD}" stroke="${I}"/><path d="M8 -171 q 4 -14 -4 -20" fill="none" stroke="${C.white}" stroke-width="3"/>`;

  const halo = o.halo ? `<circle cx="2" cy="-150" r="36" fill="${GOLDL}" stroke="${I}" stroke-width="${S}"/><circle cx="2" cy="-150" r="30" fill="none" stroke="${C.madder}" stroke-width="2" stroke-dasharray="3 4"/>${Array.from({ length: 16 }, (_, k) => { const a = k * Math.PI / 8; return `<path d="M${2 + 36 * Math.cos(a)} ${-150 + 36 * Math.sin(a)} L${2 + 42 * Math.cos(a)} ${-150 + 42 * Math.sin(a)}" stroke="${I}" stroke-width="1.6"/>`; }).join("")}` : "";
  const veil = fem && (o.veiled || garb === "widow") ? `<path d="M-16 -164 C -2 -172 16 -168 18 -156 L 12 -150 C 4 -160 -8 -160 -14 -150 C -22 -130 -24 -100 -26 -80 L-34 -84 C -30 -110 -30 -150 -16 -164Z" fill="${garb === "widow" ? C.white : fabric}" stroke="${I}" stroke-width="1.6"/>` : "";

  /* arms and gestures (shoulders at (-10,-120) back and (12,-120) front) */
  const J = { armlet: royal, bangle: !asc };
  let back = "", arms = "", held = "";
  const A = (pts: number[], j = J, wd = fem || young ? 8 : 9) => limb(skin, pts, wd, j);
  switch (w) {
    case "bow":
      back = A([-10, -120, -2, -106, 4, -114], { ...J, armlet: false }, 8);
      arms = A([12, -120, 52, -114]) + `<g><path d="M52 -176 C 82 -150 82 -78 52 -52" fill="none" stroke="${I}" stroke-width="8" stroke-linecap="round"/><path d="M52 -176 C 82 -150 82 -78 52 -52" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/><path d="M60 -168 l 4 4 M68 -150 l 4 2 M68 -80 l 4 -2 M60 -60 l 4 -4" stroke="${C.madder}" stroke-width="2.4"/>
         <path d="M52 -176 L4 -114 L52 -52" fill="none" stroke="${I}" stroke-width="1.4"/><g ${o.id ? `id="${o.id}-arrow"` : ""} opacity="${o.arrow ? 1 : 0}"><path d="M4 -114 L96 -114" stroke="${I}" stroke-width="3"/><path d="M96 -114 l -12 -6 v12z" fill="${GOLDL}" stroke="${I}" stroke-width="1.6"/><path d="M8 -114 l -6 -5 M8 -114 l -6 5" stroke="${C.madder}" stroke-width="2"/></g></g>`;
      break;
    case "mace":
      back = A([-10, -120, -22, -90]);
      arms = `<g ${o.id ? `id="${o.id}-arm"` : ""}>${A([12, -120, 24, -160])}<path d="M24 -158 L30 -228" stroke="${I}" stroke-width="8" stroke-linecap="round"/><path d="M24 -158 L30 -228" stroke="${GOLD}" stroke-width="4"/>
        <ellipse cx="31" cy="-246" rx="17" ry="24" fill="${GOLD}" stroke="${I}" stroke-width="${S}"/><path d="M17 -246 h28 M19 -236 h24 M19 -256 h24" stroke="${C.madder}" stroke-width="2.4"/><circle cx="32" cy="-272" r="4" fill="${C.madder}" stroke="${I}"/></g>`;
      break;
    case "reins":
      back = A([-10, -120, 4, -100]);
      arms = A([12, -120, 48, -106]) + `<path d="M48 -106 C 90 -100 130 -96 170 -110" fill="none" stroke="${I}" stroke-width="1.6"/><path d="M48 -108 L60 -150" stroke="${I}" stroke-width="2.4"/>`;
      break;
    case "dice": back = A([-10, -120, -6, -92]); arms = A([12, -120, 40, -94]) + `<rect x="38" y="-100" width="7" height="7" fill="${C.white}" stroke="${I}" stroke-width="1"/>`; break;
    case "point": back = A([-10, -120, -20, -88]); arms = A([12, -120, 58, -140]); break;
    case "plead": back = A([-10, -120, 18, -150]); arms = A([12, -120, 30, -150]); break;
    case "fist": back = A([-10, -120, -22, -88]); arms = `<g ${o.id ? `id="${o.id}-arm"` : ""}>${A([12, -120, 30, -176])}${palm(31, -180, skin, 8)}</g>`; break;
    case "grab": back = A([-10, -120, -18, -90]); arms = A([12, -120, 60, -128]); break;
    case "namaste": back = A([-10, -120, 2, -100, 14, -112]); arms = A([12, -120, 24, -102, 18, -114]) + `<path d="M16 -106 q 4 -14 0 -20 q -4 8 0 20z" fill="${skin}" stroke="${I}" stroke-width="1.6"/>`; break;
    case "bless": back = A([-10, -120, -16, -90]); arms = A([12, -120, 32, -100, 36, -136]) + `<path d="M31 -134 q 1 -14 6 -16 q 5 2 5 16z" fill="${skin}" stroke="${I}" stroke-width="1.6"/><circle cx="36" cy="-142" r="2" fill="${C.madder}"/>`; break;
    case "mourn": back = A([-10, -120, 4, -128, 10, -146]); arms = A([12, -120, 22, -128, 16, -148]); break;
    case "cradle": back = A([-10, -120, 6, -96, 26, -100]); held = baby(SKIN_BABY, C.white, 26, -96, .62); arms = A([12, -120, 30, -104, 44, -110]); break;
    case "staff": back = A([-10, -120, -18, -90]); arms = A([12, -120, 36, -100]) + `<path d="M38 -160 L42 0" stroke="${I}" stroke-width="6" stroke-linecap="round"/><path d="M38 -160 L42 0" stroke="${BARK}" stroke-width="3"/>`; break;
    case "sword": back = A([-10, -120, -20, -92]); arms = A([12, -120, 30, -134, 36, -150]) + `<path d="M34 -150 L74 -204" stroke="${I}" stroke-width="7" stroke-linecap="round"/><path d="M34 -150 L74 -204" stroke="${PEARL}" stroke-width="3.4"/><path d="M28 -156 l 14 10" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>`; break;
    case "spear": back = A([-10, -120, 6, -110]); arms = A([12, -120, 44, -118]) + `<path d="M-30 -104 L120 -132" stroke="${I}" stroke-width="5"/><path d="M-30 -104 L120 -132" stroke="${BARK}" stroke-width="2.4"/><path d="M120 -132 l -16 -6 l 2 12z" fill="${PEARL}" stroke="${I}" stroke-width="1.4"/>`; break;
    case "discus": back = A([-10, -120, -16, -90]); arms = A([12, -120, 32, -102, 38, -140]) + `<g transform="translate(40 -156)"><circle r="12" fill="${GOLDL}" stroke="${I}" stroke-width="1.8"/>${Array.from({ length: 12 }, (_, k) => `<path d="M0 -12 l 3 -6 l 3 6" transform="rotate(${k * 30})" fill="${GOLD}" stroke="${I}" stroke-width=".8"/>`).join("")}<circle r="4" fill="${C.madder}"/></g>`; break;
    case "conch": back = A([-10, -120, -16, -90]); arms = A([12, -120, 30, -122, 20, -138]) + `<path d="M18 -140 q 12 -8 22 2 q -6 8 -18 6 z" fill="${PEARL}" stroke="${I}" stroke-width="1.6"/><path d="M22 -138 q 6 -3 12 0" stroke="${I}" stroke-width=".8" fill="none"/>`; break;
    case "garland": back = A([-10, -120, 8, -110, 22, -126]); arms = A([12, -120, 40, -118, 52, -132]) + `<path d="M22 -128 q 15 34 30 -4" fill="none" stroke="${C.leaf}" stroke-width="7" stroke-dasharray="2 5" stroke-linecap="round"/><path d="M22 -128 q 15 34 30 -4" fill="none" stroke="${C.madder}" stroke-width="3" stroke-dasharray="1 8" stroke-linecap="round"/>`; break;
    case "pot": back = A([-10, -120, -18, -90]); arms = A([12, -120, 30, -100, 38, -112]) + `<path d="M30 -112 q -4 -14 8 -16 h4 q 12 2 8 16 q -10 8 -20 0z" fill="${GOLD}" stroke="${I}" stroke-width="1.6"/><path d="M34 -128 h12" stroke="${I}" stroke-width="2"/>`; break;
    default: back = A([-10, -120, -18, -84]); arms = A([12, -120, 22, -84]);
  }

  /* assemble: age scales the whole body and enlarges the head; old age stoops a little */
  const bodyScale = age === "child" ? .62 : age === "teen" ? .86 : old ? .97 : 1;
  const headScale = age === "child" ? 1.34 : age === "teen" ? 1.1 : 1;
  const headGroup = `<g transform="translate(0 -128) scale(${headScale}) translate(0 128)">${hairBack}${face}${capHair}${hairTop}${crownSvg}${veil}</g>`;
  const upper = `<g transform="translate(0 ${upperY})${old && !o.seated ? " rotate(6 0 -72)" : ""}">${halo}${back}${torso}${belt}${neck}${headGroup}${arms}${held}</g>`;
  return `<g ${id} transform="translate(${o.x || 0} ${o.y || 0}) scale(${(o.s || 1) * bodyScale})${flip}">${legs}${upper}</g>`;
}

