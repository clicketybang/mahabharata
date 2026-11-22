/* Small shared renderers: portrait heads, place badges, place names, and the generated choices. */
import { C, defs } from "../art/palette";
import { fig } from "../art/figure";
import { placeIcon } from "../art/places";
import { choicesFor as ruleChoices } from "./rule.js";
import { story } from "./state";
import type { Choice } from "./types";

export function placeBadge(pid: string): string {
  const p = story.places[pid];
  return `<svg viewBox="-40 -40 80 80" aria-hidden="true">${defs()}<rect x="-40" y="-40" width="80" height="80" fill="${C.paper2}"/>${placeIcon(p.icon, 0, 2, 1.2)}</svg>`;
}

export function headSVG(pid: string): string {
  const p = story.people[pid]; if (!p) return "";
  const o = { x: 0, y: 0, s: 1, weapon: "none" as const, ...p.f };
  return `<svg viewBox="-36 -206 76 96" aria-hidden="true">${defs()}<rect x="-40" y="-210" width="90" height="110" fill="${C.paper2}"/>${fig(o)}</svg>`;
}

export const placeName = (p: string): string => story.places[p].n.split(",")[0];

/** the rule, in code (shared with the validator) */
export function choicesFor(id: string): Choice[] {
  const { choices, violations } = ruleChoices(story.node[id], story.scenes[id].branches, story.timeline);
  violations.forEach(v => console.error("Rule violation:", id, v.message));
  return choices as Choice[];
}
