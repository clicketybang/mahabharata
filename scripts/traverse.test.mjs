import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { traverse } from "./traverse.mjs";

const BASE = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "tests", "validator", "base");

test("traversal follows only generated choices from the first moment", () => {
  const r = traverse(BASE);
  assert.deepEqual(r.unreachable, ["b"]);   // b is never a choice's destination from a
  assert.deepEqual(r.deadEnds, []);         // every moment but the last has a way on
  assert.deepEqual(r.brokenThreads, []);    // karna: a → c → d reachable
});
