/* Small shared renderers: portrait heads, place badges, place names, and the generated choices. */
import { C, defs } from "../art/palette";
import { fig } from "../art/figure";
import { placeIcon } from "../art/places";
import { choicesFor as ruleChoices } from "./rule.js";
import { figureFor } from "./data";
import { story } from "./state";
import type { Choice } from "./types";

export function placeBadge(pid: string): string {
  const p = story.places[pid];
  return `<svg viewBox="-40 -40 80 80" aria-hidden="true">${defs()}<rect x="-40" y="-40" width="80" height="80" fill="${C.paper2}"/>${placeIcon(p.icon, 0, 2, 1.2)}</svg>`;
}

/** a head-and-shoulders portrait. With t, the person is shown at their age then (a baby is shown as a child). */
export function headSVG(pid: string, t?: number): string {
  const p = story.people[pid]; if (!p) return "";
  const f = figureFor(pid, t), age = f.age === "baby" ? "child" : f.age ?? "adult";
  const o = { ...f, x: 0, y: 0, s: 1, weapon: "none" as const, seated: false, kneel: false, age };
  // frame the head wherever the age puts it (figure.ts: body scale b, head scale h about the neck; the old stoop a little)
  const b = age === "child" ? .62 : age === "teen" ? .86 : age === "old" ? .97 : 1, h = age === "child" ? 1.34 : age === "teen" ? 1.1 : 1;
  const x0 = -36 * h * b + (age === "old" ? 8 : 0), y0 = (-128 - 78 * h) * b, wv = 76 * h * b, hv = 96 * h * b;
  return `<svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${wv.toFixed(1)} ${hv.toFixed(1)}" aria-hidden="true">${defs()}<rect x="${x0 - 10}" y="${y0 - 10}" width="${wv + 20}" height="${hv + 20}" fill="${C.paper2}"/>${fig(o)}</svg>`;
}

export const placeName = (p: string): string => story.places[p].n.split(",")[0];

/** the rule, in code (shared with the validator) */
export function choicesFor(id: string): Choice[] {
  const { choices, violations } = ruleChoices(story.node[id], story.scenes[id].branches, story.timeline);
  violations.forEach(v => console.error("Rule violation:", id, v.message));
  return choices as Choice[];
}
