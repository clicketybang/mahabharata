#!/usr/bin/env node
/* =====================================================================
   STORY GRAPH VALIDATOR — the chronology guard (Sprint 1, task 3).
   Fails (exit 1) if the content breaks base-rules Rule 1 or the schema v2
   graph invariants. Runs in CI on every pull request.

   Usage: node scripts/validate.mjs [contentDir]   (default: src/content)

   Each error carries a stable `code` (tested by scripts/validate.test.mjs):
     missing-field            a moment lacks t_story, place_id, cast or ce_ref
     duplicate-time           two moments share a t_story ("next moment" would be ambiguous)
     unknown-place            a moment, person home, branch or place parent names a place that doesn't exist
     unknown-person           a cast entry, <Beat cast> or branch names a person who doesn't exist
     branch-type              a branch is not by "character" or "place"
     branch-absent-character  a "follow <character>" branch names someone not present in the scene
     choice-not-next          a generated choice goes backward, or skips the next moment of what it follows
     unknown-moment           an edge or <Jump> points to a moment that doesn't exist
     unknown-anchor           a <Jump anchor> names an anchor the target moment doesn't declare
     edge-direction           a memory edge points forward, or an omen/fulfilment edge points backward
     place-certainty          a place lacks a certainty flag (textual | traditional | conjectural)
     built-incomplete         a built (scroll-animated) moment lacks camera keyframes, length or beats
   Warnings (do not fail): branch-thread-ends — a branch has no later moment, so no choice is shown.
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { choicesFor } from "../src/engine/rule.js";

const CERTAINTY = new Set(["textual", "traditional", "conjectural"]);

function readJSON(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
}

function parseMDX(file) {
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  return { data: YAML.parse(m[1]) || {}, body: m[2] };
}

function bodyRefs(body) {
  const beats = [...body.matchAll(/<Beat\b([^>]*)>/g)].map(b => {
    const cast = b[1].match(/cast=\{(\[[^\]]*\])\}/);
    return { cast: cast ? JSON.parse(cast[1]) : [] };
  });
  const jumps = [...body.matchAll(/<Jump\b([^>]*)>/g)].map(j => ({
    to: j[1].match(/to="([^"]+)"/)?.[1],
    anchor: j[1].match(/anchor="([^"]+)"/)?.[1],
  }));
  return { beats, jumps };
}

/* `opts.rule` lets the tests swap in a deliberately broken rule, to prove the independent re-check catches it. */
export function validate(contentDir, opts = {}) {
  const ruleChoices = opts.rule || choicesFor;
  const errors = [], warnings = [];
  const err = (code, where, message) => errors.push({ code, where, message });

  const people = readJSON(path.join(contentDir, "people.json"));
  const places = readJSON(path.join(contentDir, "places.json"));
  const edges = readJSON(path.join(contentDir, "edges.json"));
  const personIds = new Set(people.map(p => p.id));
  const placeIds = new Set(places.map(p => p.id));

  const dir = path.join(contentDir, "moments");
  const moments = fs.readdirSync(dir).filter(f => f.endsWith(".mdx")).sort().map(f => {
    const { data, body } = parseMDX(path.join(dir, f));
    return { id: f.replace(/\.mdx$/, ""), data, ...bodyRefs(body) };
  });
  const byId = Object.fromEntries(moments.map(m => [m.id, m]));

  /* places */
  for (const p of places) {
    if (!CERTAINTY.has(p.certainty)) err("place-certainty", `place:${p.id}`, `certainty must be textual | traditional | conjectural (got ${JSON.stringify(p.certainty)})`);
    if (p.parent_id && !placeIds.has(p.parent_id)) err("unknown-place", `place:${p.id}`, `parent_id "${p.parent_id}" is not a place`);
  }
  /* people */
  for (const p of people) {
    if (p.home && !placeIds.has(p.home)) err("unknown-place", `person:${p.id}`, `home "${p.home}" is not a place`);
  }

  /* moments: required fields and references */
  const seenT = new Map();
  for (const m of moments) {
    const d = m.data, at = `moment:${m.id}`;
    if (typeof d.t_story !== "number") err("missing-field", at, "t_story (story time) is required and must be a number");
    if (typeof d.place_id !== "string" || !d.place_id) err("missing-field", at, "exactly one place_id is required");
    if (!Array.isArray(d.cast) || d.cast.length === 0) err("missing-field", at, "a non-empty cast is required");
    if (!d.ce_ref || typeof d.ce_ref.parva !== "number" || !d.ce_ref.label) err("missing-field", at, "ce_ref (Critical Edition reference: parva, adhyaya, label) is required");

    if (typeof d.t_story === "number") {
      if (seenT.has(d.t_story)) err("duplicate-time", at, `t_story ${d.t_story} is also used by "${seenT.get(d.t_story)}"`);
      else seenT.set(d.t_story, m.id);
    }
    if (typeof d.place_id === "string" && d.place_id && !placeIds.has(d.place_id)) err("unknown-place", at, `place_id "${d.place_id}" is not a place`);
    for (const c of d.cast || []) if (!personIds.has(c.id)) err("unknown-person", at, `cast member "${c.id}" is not a person`);
    m.beats.forEach((b, i) => b.cast.forEach(c => { if (!personIds.has(c)) err("unknown-person", `${at} beat ${i + 1}`, `"${c}" is not a person`); }));
    for (const j of m.jumps) {
      if (!byId[j.to]) { err("unknown-moment", at, `<Jump to="${j.to}"> points to no moment`); continue; }
      if (j.anchor && !(byId[j.to].data.anchors && j.anchor in byId[j.to].data.anchors)) err("unknown-anchor", at, `<Jump anchor="${j.anchor}"> is not declared by "${j.to}"`);
    }
    if (d.status === "built") {
      if (!Array.isArray(d.cams) || d.cams.length < 2 || typeof d.len !== "number" || m.beats.length === 0)
        err("built-incomplete", at, "a built scene needs cams (≥2 keyframes), len and at least one <Beat>");
    }
  }

  /* the rule of the river: branches and generated choices */
  const timeline = moments
    .filter(m => typeof m.data.t_story === "number")
    .map(m => ({ id: m.id, t: m.data.t_story, place: m.data.place_id, cast: (m.data.cast || []).map(c => c.id), status: m.data.status }))
    .sort((a, b) => a.t - b.t);
  const node = Object.fromEntries(timeline.map(n => [n.id, n]));
  for (const m of moments) {
    const n = node[m.id], at = `moment:${m.id}`; if (!n) continue;
    const branches = m.data.branches || [];
    for (const [by, ref] of branches) {
      if (by === "character" && !personIds.has(ref)) err("unknown-person", at, `branch follows "${ref}", who is not a person`);
      if (by === "place" && !placeIds.has(ref)) err("unknown-place", at, `branch goes to "${ref}", which is not a place`);
    }
    const { choices, violations } = ruleChoices(n, branches, timeline);
    violations.forEach(v => err(v.code, at, v.message));
    // independent re-check: each choice must be strictly later, and the FIRST later moment for what it follows
    for (const c of choices) {
      const matches = x => (c.by === "character" ? x.cast.includes(c.ref) : x.place === c.ref);
      const first = timeline.filter(x => x.t > n.t && matches(x))[0];
      if (!(c.to.t > n.t) || !first || first.id !== c.to.id)
        err("choice-not-next", at, `choice "${c.by} ${c.ref}" leads to "${c.to.id}", but the next moment is "${first?.id ?? "none"}"`);
    }
    for (const [by, ref] of branches) {
      if ((by === "character" || by === "place") && !choices.some(c => c.by === by && c.ref === ref) && !violations.length)
        warnings.push({ code: "branch-thread-ends", where: at, message: `no later moment for ${by} "${ref}"; no choice is shown` });
    }
  }

  /* typed edges */
  for (const e of edges) {
    const at = `edge:${e.id}`;
    const a = node[e.from], b = node[e.to];
    if (!a) err("unknown-moment", at, `from "${e.from}" is not a moment`);
    if (!b) err("unknown-moment", at, `to "${e.to}" is not a moment`);
    if (!a || !b) continue;
    if (e.type === "memory" && !(b.t < a.t)) err("edge-direction", at, "a memory must point back in time");
    if (["omen", "curse_fulfilment", "boon_fulfilment", "next_by_character", "next_by_place"].includes(e.type) && !(b.t > a.t))
      err("edge-direction", at, `a ${e.type} edge must point forward in time`);
  }

  return { errors, warnings, counts: { moments: moments.length, people: people.length, places: places.length, edges: edges.length } };
}

/* CLI */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = process.argv[2] || "src/content";
  const { errors, warnings, counts } = validate(dir);
  for (const w of warnings) console.log(`warn  ${w.code.padEnd(24)} ${w.where} — ${w.message}`);
  for (const e of errors) console.log(`ERROR ${e.code.padEnd(24)} ${e.where} — ${e.message}`);
  console.log(`\nStory graph: ${counts.moments} moments, ${counts.people} people, ${counts.places} places, ${counts.edges} edges · ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}
