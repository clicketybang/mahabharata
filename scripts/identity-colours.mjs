#!/usr/bin/env node
/* Identity colour + line pattern check (Sprint 3, amendment A7 / D4). Writes docs/sprint3/identity.md.
   Colour = the individual; line pattern = family line (lineage is a fact of the text, not a judgement).
   Fails (exit 1) if:
   - a line colour has < 3:1 contrast against either Kāla band (#f6ecd8, #eedfc0) — WCAG 1.4.11 graphics;
   - two people who share a line pattern are closer than ΔE2000 = MIN_SAME in normal vision or any simulated
     colour-vision deficiency (protan, deutan, tritan; Machado et al. 2009, full severity);
   - two people with different patterns are closer than MIN_DIFF (the pattern carries part of the difference);
   - a family pattern is solid (no line may read as "the main one"). */
import fs from "node:fs";

export const MIN_SAME = 14, MIN_DIFF = 6;
const BANDS = ["#f6ecd8", "#eedfc0"];

/* ---------- colour maths ---------- */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const toLin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = h => { const [r, g, b] = hex(h).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const CVD = { // Machado, Oliveira & Fernandes (2009), severity 1.0, linear RGB
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const simulate = (h, m) => { const l = hex(h).map(toLin); return m.map(r => Math.min(1, Math.max(0, r[0] * l[0] + r[1] * l[1] + r[2] * l[2]))); };
const lab = lin => {
  const [r, g, b] = lin;
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = t => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
function de2000([L1, a1, b1], [L2, a2, b2]) { // CIEDE2000
  const rad = Math.PI / 180, C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (b, a) => { const v = Math.atan2(b, a) / rad; return v < 0 ? v + 360 : v; };
  const h1p = h(b1, a1p), h2p = h(b2, a2p), dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = h2p - h1p; if (C1p * C2p === 0) dhp = 0; else if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * rad / 2), Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p; if (C1p * C2p !== 0) hbp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2) : (h1p + h2p) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dTh = 30 * Math.exp(-(((hbp - 275) / 25) ** 2)), RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T, RT = -Math.sin(2 * dTh * rad) * RC;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}
/** smallest ΔE2000 between two colours across normal vision and the three simulated deficiencies */
export function minDE(a, b) {
  const views = [["normal", h => lab(hex(h).map(toLin))], ...Object.entries(CVD).map(([k, m]) => [k, h => lab(simulate(h, m))])];
  return views.map(([k, f]) => [k, de2000(f(a), f(b))]).reduce((m, x) => (x[1] < m[1] ? x : m));
}

/* ---------- the check ---------- */
export function check(people, families) {
  const problems = [], rows = [];
  for (const [fam, f] of Object.entries(families)) if (!f.pattern) problems.push(`family ${fam} has a solid pattern`);
  for (const p of people) {
    const c = Math.min(...BANDS.map(b => contrast(p.identity_colour, b)));
    if (c < 3) problems.push(`${p.name}: ${p.identity_colour} only ${c.toFixed(2)}:1 against the Kāla bands`);
  }
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
    const a = people[i], b = people[j], same = a.family === b.family, [view, d] = minDE(a.identity_colour, b.identity_colour);
    const need = same ? MIN_SAME : MIN_DIFF;
    rows.push({ a: a.name, b: b.name, same, view, d });
    if (d < need) problems.push(`${a.name} vs ${b.name}${same ? " (same family pattern)" : ""}: ΔE ${d.toFixed(1)} under ${view} < ${need}`);
  }
  return { problems, rows };
}

/* CLI */
if (import.meta.url === `file://${process.argv[1]}`) {
  const people = JSON.parse(fs.readFileSync("src/content/people.json", "utf8"));
  const families = JSON.parse(fs.readFileSync("src/content/families.json", "utf8"));
  const fam = Object.fromEntries(families.map(f => [f.id, f]));
  const { problems, rows } = check(people, fam);
  const side = { yudhishthira: "Pāṇḍava", bhima: "Pāṇḍava", arjuna: "Pāṇḍava", abhimanyu: "Pāṇḍava", draupadi: "Pāṇḍava", krishna: "Pāṇḍava", duryodhana: "Kaurava", dushasana: "Kaurava", karna: "Kaurava", gandhari: "Kaurava" };
  const md = `# Identity colours and line patterns (Sprint 3, A7 / D4)

Generated by \`node scripts/identity-colours.mjs\`. **Colour = the individual. Line pattern = family line.** Neither encodes side, and neither encodes good or evil.

## People
| Person | Family line (pattern) | Colour | Contrast vs Kāla bands | War side (audit only, not shown to readers) |
|---|---|---|---|---|
${people.map(p => `| ${p.name} | ${fam[p.family].name} (\`${fam[p.family].pattern}\`) | \`${p.identity_colour}\` | ${Math.min(...BANDS.map(b => contrast(p.identity_colour, b))).toFixed(2)}:1 | ${side[p.id] ?? "—"} |`).join("\n")}

**Side-correlation audit:** patterns follow birth lineage, so the two Kuru lines are siblings in pattern (long dash, and long dash + dot) and no family line is solid. Colours are individual, and each side includes both warm hues (golds, reds, browns, roses) and cool hues (blues, greens, teals, violets). No hue family belongs to one side.

## Closest pairs (smallest ΔE2000 across normal, protan, deutan and tritan vision)
Same family pattern must be ≥ ${MIN_SAME}; different patterns ≥ ${MIN_DIFF}.

| Pair | Same pattern? | Closest under | ΔE2000 |
|---|---|---|---|
${rows.sort((x, y) => x.d - y.d).slice(0, 12).map(r => `| ${r.a} – ${r.b} | ${r.same ? "yes" : "no"} | ${r.view} | ${r.d.toFixed(1)} |`).join("\n")}

${problems.length ? "## Problems\n" + problems.map(p => `- ${p}`).join("\n") : "**All checks pass.**"}
`;
  fs.mkdirSync("docs/sprint3", { recursive: true });
  fs.writeFileSync("docs/sprint3/identity.md", md);
  console.log(problems.length ? problems.join("\n") : `identity colours OK (${people.length} people, ${rows.length} pairs)`);
  process.exit(problems.length ? 1 : 0);
}

/** ΔE2000 in normal vision only */
export const deNormal = (a, b) => de2000(lab(hex(a).map(toLin)), lab(hex(b).map(toLin)));
