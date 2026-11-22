#!/usr/bin/env node
/* Picks identity colours for people whose colour is the placeholder #000000 (Sprint 4 helper; run once when
   people are added, then commit the result). The check itself stays in identity-colours.mjs.
   For each new person, in order (principals, then supporting, then one-scene figures), it chooses the candidate that
   - meets every pair rule identity-colours.mjs enforces (principals; same line + same scene), with a safety margin;
   - then is as far as possible from everyone this person shares a scene with (soft: easier to tell apart on the page),
     preferring the muted, earthy end of the range unless a vivid colour is needed.
   Usage: node scripts/pick-identity-colours.mjs [--dry] */
import fs from "node:fs";
import { readStory } from "./validate.mjs";
import { contrast, minDE, deNormal, MIN_SAME, MIN_DIFF } from "./identity-colours.mjs";

const BANDS = ["#f6ecd8", "#eedfc0"], PLACEHOLDER = "#000000", MARGIN = 1;
const { people, moments } = readStory("src/content");

/* candidates: an HSL grid, kept if ≥ 3.2:1 against both Kāla bands */
const hsl = (h, s, l) => { const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return "#" + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join(""); };
const cands = [];
for (let h = 0; h < 360; h += 4) for (const s of [.3, .42, .54, .66, .78]) for (const l of [.26, .31, .36, .41, .46, .5]) {
  const c = hsl(h, s, l); if (Math.min(...BANDS.map(b => contrast(c, b))) >= 3.2) cands.push({ c, vivid: s > .55 });
}

const together = new Map();
for (const m of moments) {
  const ids = [...new Set((m.data.cast || []).map(c => c.id))];
  for (const a of ids) { if (!together.has(a)) together.set(a, new Set()); for (const b of ids) if (a !== b) together.get(a).add(b); }
}
const rank = p => (p.principal ? 0 : p.minor ? 2 : 1);
const todo = people.filter(p => p.identity_colour === PLACEHOLDER).sort((a, b) => rank(a) - rank(b));
for (const p of todo) {
  const done = people.filter(q => q !== p && q.identity_colour !== PLACEHOLDER);
  const hard = p.minor ? [] : done.filter(q => !q.minor && ((p.principal && q.principal) || (q.family === p.family && together.get(p.id)?.has(q.id))));
  const soft = done.filter(q => together.get(p.id)?.has(q.id));
  let best = null;
  for (const { c, vivid } of cands) {
    let ok = true;
    for (const q of hard) { const need = (q.family === p.family ? MIN_SAME : MIN_DIFF) + MARGIN; if (minDE(c, q.identity_colour)[1] < need) { ok = false; break; } }
    if (!ok) continue;
    const score = Math.min(99, ...soft.map(q => deNormal(c, q.identity_colour)), ...done.map(q => deNormal(c, q.identity_colour) * 1.6)) - (vivid ? 8 : 0); // Kalamkari is earthy: vivid only when needed
    if (!best || score > best.score) best = { c, score };
  }
  if (!best) { console.error(`no colour satisfies the rules for ${p.name}`); process.exit(1); }
  p.identity_colour = best.c;
  console.log(`${p.name.padEnd(14)} ${best.c}  (closest scene-mate ΔE ${best.score.toFixed(1)})`);
}
if (!process.argv.includes("--dry")) {
  const raw = JSON.parse(fs.readFileSync("src/content/people.json", "utf8"));
  const by = Object.fromEntries(people.map(p => [p.id, p.identity_colour]));
  raw.forEach(p => { p.identity_colour = by[p.id]; });
  fs.writeFileSync("src/content/people.json", "[\n" + raw.map(p => "  " + JSON.stringify(p)).join(",\n") + "\n]\n");
}
