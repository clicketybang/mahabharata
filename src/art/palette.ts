/* Srikalahasti Kalamkari palette. Drives the painted art (C) and the skin tones (SK).
   The Madhubani and Pichwai explorations live in /explorations, not in the shipped site. */

export const C = {
  sky: "#f5e9cf", sky2: "#efdfbd", ground: "#e8d3a2", ground2: "#dcc28c", wall: "#f1e2c2",
  floorA: "#ead6a6", floorB: "#a63a2b", madder: "#a63a2b", madderL: "#c4553c", indigo: "#2e4377", indigoL: "#5873a8",
  ochre: "#c9973a", ochreL: "#e3bd6a", iron: "#2b2018", leaf: "#5b7a46", rose: "#d8907c", white: "#fbf4e4",
  paper: "#f6ecd8", paper2: "#eedfc0", ink: "#2b2018", gold: "#a63a2b", muted: "#d3c4a2", river: "#4f73a3",
  sea: "#d3e0d8", land: "#f3e6c6",
};
export type ColourName = keyof typeof C;

/* Natural human skin tones; Kṛṣṇa is indigo by convention. Hue never encodes good or evil. */
export const SK = {
  krishna: "#34528f", arjuna: "#c99566", bhima: "#b97a45", karna: "#e0b25f", dush: "#c08a5c", shalya: "#d6a271", yudhi: "#e2b383",
  draupadi: "#8b5a3c", shakuni: "#c99a6c", duryo: "#cf9a68", elder: "#e8c9a0", dhrit: "#dcae80", gandhari: "#e6c29a", abhi: "#e6bd92",
  nakula: "#d7a676", sahadeva: "#c99a6a", kunti: "#d9ab80", warm: "#c78d5c", deep: "#8f5e3e", fair: "#e9c7a0", monkey: "#b88346",
};
export type SkinName = keyof typeof SK;

/* standard stroke width */
export const S = 2.4;

/* shared SVG <defs>: patterns, glow filter, lamp gradient */
export function defs(): string {
  return `<defs>
 <pattern id="clothPat" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.1" fill="#f7efdc" opacity=".85"/></pattern>
 <pattern id="dotsW" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.1" fill="#f7efdc" opacity=".85"/></pattern>
 <pattern id="dotsK" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.1" fill="#1b1410" opacity=".55"/></pattern>
 <pattern id="patStripes" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="1.6" height="6" fill="#f7efdc" opacity=".8"/></pattern>
 <pattern id="patChecks" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0 H10 M0 0 V10" stroke="#f7efdc" stroke-width="1.4" opacity=".75"/><circle cx="5" cy="5" r="1.2" fill="#1b1410" opacity=".4"/></pattern>
 <pattern id="patButi" width="14" height="14" patternUnits="userSpaceOnUse"><g transform="translate(7 7)" opacity=".9"><circle r="1.6" fill="#c9973a"/><ellipse rx="1.3" ry="3" transform="translate(0 -3.2)" fill="#f7efdc"/><ellipse rx="1.3" ry="3" transform="rotate(120) translate(0 -3.2)" fill="#f7efdc"/><ellipse rx="1.3" ry="3" transform="rotate(240) translate(0 -3.2)" fill="#f7efdc"/></g></pattern>
 <pattern id="patZig" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 6 L2 2 L4 6 L6 2 L8 6" fill="none" stroke="#f7efdc" stroke-width="1.1"/></pattern>
 <pattern id="patScale" width="8" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 Q4 0 8 6" fill="none" stroke="#2b2018" stroke-width=".9"/></pattern>
 <pattern id="stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="3" height="8" fill="#1b1410" opacity=".25"/></pattern>
 <pattern id="floor" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="${C.floorA}"/><path d="M0 40 L40 0 L80 40 L40 80Z" fill="none" stroke="${C.floorB}" stroke-opacity=".4" stroke-width="2"/><circle cx="40" cy="40" r="5" fill="${C.floorB}" opacity=".4"/></pattern>
 <pattern id="waves" width="60" height="24" patternUnits="userSpaceOnUse"><rect width="60" height="24" fill="${C.sea}"/><path d="M0 14 q 15 -10 30 0 t 30 0" fill="none" stroke="${C.river}" stroke-opacity=".6" stroke-width="2"/></pattern>
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <radialGradient id="lampG"><stop offset="0" stop-color="${C.ochreL}" stop-opacity=".9"/><stop offset="1" stop-color="${C.ochreL}" stop-opacity="0"/></radialGradient>
</defs>`;
}
