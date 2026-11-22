#!/usr/bin/env node
/* =====================================================================
   END-TO-END TRAVERSAL (Sprint 4, task 5). Walks the story the way a reader can:
   only through generated end-of-scene choices (Rule 1), from the first moment.
   Reports:
     dead ends            moments (not the last) with no choice onward
     unreachable          moments no path of choices reaches from the first moment
     broken threads       principals whose last moment can't be reached from their first
     intense runs         more than MAX_INTENSE non-quiet moments in a row on the timeline
     assembly gaps        the longest stretch of moments between assembly moments
   Usage: node scripts/traverse.mjs [contentDir] [--strict]
   Without --strict it only reports (exit 0); with --strict any finding fails (exit 1).
   ===================================================================== */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readStory } from "./validate.mjs";
import { choicesFor } from "../src/engine/rule.js";

export const MAX_INTENSE = 3;

export function traverse(contentDir) {
  const { people, moments, timeline } = readStory(contentDir);
  const byId = Object.fromEntries(moments.map(m => [m.id, m]));
  const next = {};
  for (const n of timeline) next[n.id] = choicesFor(n, byId[n.id].data.branches || [], timeline).choices.map(c => c.to.id);
  const reach = from => { const seen = new Set([from]), q = [from]; while (q.length) for (const t of next[q.shift()]) if (!seen.has(t)) { seen.add(t); q.push(t); } return seen; };

  const first = timeline[0], last = timeline.at(-1);
  const fromStart = first ? reach(first.id) : new Set();
  const deadEnds = timeline.filter(n => n !== last && next[n.id].length === 0).map(n => n.id);
  const unreachable = timeline.filter(n => !fromStart.has(n.id)).map(n => n.id);

  const brokenThreads = [];
  for (const p of people.filter(p => p.principal)) {
    const mine = timeline.filter(n => n.cast.includes(p.id));
    if (mine.length > 1 && !reach(mine[0].id).has(mine.at(-1).id)) brokenThreads.push(`${p.id}: ${mine[0].id} ↛ ${mine.at(-1).id}`);
  }

  let run = [], worstRun = [];
  for (const n of timeline) {
    if (byId[n.id].data.quiet || byId[n.id].data.status === "unwritten") run = []; else run.push(n.id);
    if (run.length > worstRun.length) worstRun = run.slice();
  }
  let gap = 0, worstGap = 0, gapFrom = null, worstFrom = null;
  for (const n of timeline) { if (byId[n.id].data.assembly) { if (gap > worstGap) { worstGap = gap; worstFrom = gapFrom; } gap = 0; gapFrom = n.id; } else gap++; }
  if (gap > worstGap) { worstGap = gap; worstFrom = gapFrom; }

  return {
    moments: timeline.length, deadEnds, unreachable, brokenThreads,
    intenseRun: worstRun, assemblyGap: { length: worstGap, after: worstFrom },
    findings: deadEnds.length + unreachable.length + brokenThreads.length + (worstRun.length > MAX_INTENSE ? 1 : 0),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const strict = process.argv.includes("--strict");
  const dir = process.argv.slice(2).find(a => !a.startsWith("--")) || "src/content";
  const r = traverse(dir);
  const list = (label, xs) => console.log(`${label.padEnd(16)} ${xs.length}${xs.length ? "  " + xs.join(", ") : ""}`);
  console.log(`Traversal of ${r.moments} moments (${strict ? "strict" : "report only"})`);
  list("dead ends", r.deadEnds);
  list("unreachable", r.unreachable);
  list("broken threads", r.brokenThreads);
  console.log(`${"intense run".padEnd(16)} ${r.intenseRun.length} (max ${MAX_INTENSE})${r.intenseRun.length > MAX_INTENSE ? "  " + r.intenseRun.join(" → ") : ""}`);
  console.log(`${"assembly gap".padEnd(16)} ${r.assemblyGap.length} moments${r.assemblyGap.after ? ` after ${r.assemblyGap.after}` : ""}`);
  process.exit(strict && r.findings ? 1 : 0);
}
