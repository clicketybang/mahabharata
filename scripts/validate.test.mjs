/* Validator fixtures: a small valid story graph (tests/validator/base) must pass, and each
   deliberate break below must FAIL with its own error code. Run: npm run test:validator */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { validate } from "./validate.mjs";
import { nextMoment } from "../src/engine/rule.js";

const BASE = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "tests", "validator", "base");

/* copy the base fixture to a temp dir, apply edits { "relative/file": (text) => text }, validate */
function run(edits = {}, opts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mbh-fixture-"));
  fs.cpSync(BASE, dir, { recursive: true });
  for (const [file, fn] of Object.entries(edits)) {
    const p = path.join(dir, file);
    fs.writeFileSync(p, fn(fs.readFileSync(p, "utf8")));
  }
  try { return validate(dir, opts); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const codes = r => r.errors.map(e => e.code);
const chain = (...fns) => text => fns.reduce((t, f) => f(t), text);
const sub = (from, to) => text => { assert.ok(text.includes(from), `fixture edit target not found: ${from}`); return text.replace(from, to); };

test("the base fixture is valid", () => {
  const r = run();
  assert.deepEqual(r.errors, []);
});

const FIXTURES = [
  ["missing-field", "a moment without a story time", { "moments/b.mdx": sub("t_story: 2\n", "") }],
  ["missing-field", "a moment without a place", { "moments/b.mdx": sub("place_id: dvaraka\n", "") }],
  ["missing-field", "a moment with an empty cast", { "moments/b.mdx": chain(sub("cast: [{ id: krishna }]", "cast: []"), sub("branches: [[character, krishna]]\n", "")) }],
  ["missing-field", "a moment without a ce_ref", { "moments/c.mdx": sub('ce_ref: { parva: 8, adhyaya: "1", label: "Karṇa 8.1" }\n', "") }],
  ["duplicate-time", "two moments at the same story time", { "moments/c.mdx": sub("t_story: 3", "t_story: 2") }],
  ["unknown-place", "a moment set in a place that doesn't exist", { "moments/b.mdx": sub("place_id: dvaraka", "place_id: lanka") }],
  ["unknown-person", "a cast member who doesn't exist", { "moments/c.mdx": sub("cast: [{ id: karna }, { id: krishna }]", "cast: [{ id: karna }, { id: shakuni }]") }],
  ["unknown-person", "a <Beat> portrait of someone who doesn't exist", { "moments/a.mdx": sub('cast={["arjuna", "karna"]}', 'cast={["arjuna", "vidura"]}') }],
  ["branch-type", "a branch by era instead of character or place", { "moments/a.mdx": sub("branches: [[character, karna], [place, field]]", "branches: [[character, karna], [era, war]]") }],
  ["branch-absent-character", "following someone not present in the scene", { "moments/b.mdx": sub("branches: [[character, krishna]]", "branches: [[character, karna]]") }],
  ["unknown-moment", "a <Jump> to a moment that doesn't exist", { "moments/a.mdx": sub('<Jump to="c">', '<Jump to="z">') }],
  ["unknown-moment", "an edge to a moment that doesn't exist", { "edges.json": sub('"to": "d"', '"to": "z"') }],
  ["unknown-anchor", "a <Jump> to an anchor the target doesn't declare", { "moments/c.mdx": sub('anchor="start"', 'anchor="nope"') }],
  ["edge-direction", "an omen pointing backward in time", { "edges.json": sub('"from": "a", "to": "d"', '"from": "d", "to": "a"') }],
  ["edge-direction", "a memory pointing forward in time", { "edges.json": sub('"type": "omen"', '"type": "memory"') }],
  ["place-certainty", "a place without a certainty flag", { "places.json": sub('"parent_id": "kuru", "certainty": "textual", "certainty_note": "The field."', '"parent_id": "kuru", "certainty_note": "The field."') }],
  ["place-certainty", "a place without a reason for its certainty", { "places.json": sub('"certainty": "textual", "certainty_note": "The field."', '"certainty": "textual"') }],
  ["place-level", "a spot with no site above it", { "places.json": sub('"level": "spot", "parent_id": "city"', '"level": "spot", "parent_id": "kuru"') }],
  ["place-level", "a realm inside a site", { "places.json": sub('"id": "naimisha", "name": "Naimiṣa", "level": "site", "parent_id": null', '"id": "naimisha", "name": "Naimiṣa", "level": "realm", "parent_id": "city"') }],
  ["moment-at-realm", "a moment set in a whole realm", { "moments/b.mdx": sub("place_id: dvaraka", "place_id: kuru") }],
  ["missing-alt", "a <Beat> without alt text", { "moments/a.mdx": sub('alt="Two warriors face each other." ', "") }],
  ["missing-alt", "a drafted moment without art_alt", { "moments/b.mdx": sub('art_alt: "A figure."\n', "") }],
  ["built-incomplete", "a built scene without camera keyframes", { "moments/a.mdx": sub("cams: [[0, 0, 0, 100], [1, 0, 0, 100]]\n", "") }],
];

for (const [code, what, edits] of FIXTURES) {
  test(`fails with ${code}: ${what}`, () => {
    const r = run(edits);
    assert.deepEqual([...new Set(codes(r))], [code], `expected only ${code}, got ${JSON.stringify(codes(r))}`);
  });
}

/* a loop in the hierarchy always breaks the nesting too, so both codes are expected */
test("fails with place-cycle: a place that is its own ancestor", () => {
  const r = run({ "places.json": sub('"id": "kuru", "name": "Kuru", "level": "realm", "parent_id": null', '"id": "kuru", "name": "Kuru", "level": "realm", "parent_id": "city"') });
  assert.deepEqual([...new Set(codes(r))].sort(), ["place-cycle", "place-level"]);
});

/* If someone changes the engine's rule so that choices jump backward or skip ahead,
   the validator's independent re-check must still catch it. */
test("fails with choice-not-next: a rule that skips ahead to the LAST matching moment", () => {
  const skipping = (node, branches, timeline) => ({
    violations: [],
    choices: branches.map(([by, ref]) => {
      const later = timeline.filter(n => n.t > node.t && (by === "character" ? n.cast.includes(ref) : n.place === ref));
      return later.length ? { by, ref, to: later.at(-1) } : null;
    }).filter(Boolean),
  });
  assert.ok(codes(run({}, { rule: skipping })).includes("choice-not-next"));
});

test("fails with choice-not-next: a rule that jumps backward in time", () => {
  const backward = (node, branches, timeline) => ({
    violations: [],
    choices: branches.map(([by, ref]) => ({ by, ref, to: timeline[0] })).filter(c => c.to.id !== node.id),
  });
  assert.ok(codes(run({}, { rule: backward })).includes("choice-not-next"));
});

test("the shared rule returns the next moment strictly after now", () => {
  const tl = [{ id: "x", t: 1, place: "p", cast: ["a"] }, { id: "y", t: 2, place: "q", cast: ["a"] }, { id: "z", t: 3, place: "p", cast: ["b"] }];
  assert.equal(nextMoment(tl, "character", "a", 1).id, "y");
  assert.equal(nextMoment(tl, "place", "p", 1).id, "z");
  assert.equal(nextMoment(tl, "character", "a", 2), null);
});
