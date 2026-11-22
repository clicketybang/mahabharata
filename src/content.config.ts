/* Story graph schema v2 (roadmap §3) as Astro content collections.
   Moments are MDX (facts in frontmatter, beats as prose). People, places, edges and tellings are JSON.
   Graph rules (chronology, branches, references) are enforced by scripts/validate.mjs. */
import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const POSES = ["bow", "mace", "reins", "dice", "point", "plead", "fist", "grab", "none", "namaste", "bless", "mourn", "cradle", "staff", "sword", "spear", "discus", "conch", "garland", "pot", "basket"] as const;
const AGES = ["baby", "child", "teen", "adult", "old"] as const;
const id = z.string().regex(/^[a-z0-9-]+$/, "ids are lowercase-kebab");

const moments = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/moments" }),
  schema: z.object({
    t_story: z.number(),
    t_narration: z.number().optional(),
    narrator_chain: z.array(z.string()).default([]), // [teller, listener] of the innermost frame
    narration_note: z.string().optional(),
    place_id: id,
    // pose / seated: how the figure is drawn in this moment's picture (design v2); optional
    cast: z.array(z.object({ id, role: z.enum(["present", "mentioned", "divine"]).default("present"), pose: z.enum(POSES).optional(), seated: z.boolean().optional() })).min(1),
    title: z.string(),
    status: z.enum(["built", "drafted", "unwritten"]),
    era: z.string(),
    parva: z.string(),
    dev: z.string().optional(),
    ce_ref: z.object({
      parva: z.number().int().min(1).max(18),
      adhyaya: z.string(),
      label: z.string(),
      verified: z.boolean().default(false),
    }),
    variant_tier: z.number().int().min(0).max(3).default(0),
    debate_note: z.string().optional(),
    content_notes: z.array(z.string()).default([]),
    assembly: z.boolean().default(false),
    absent: z.array(z.object({ id, reason: z.string().min(8) })).default([]), // assembly moments: principals alive but not here, and why (A1)
    quiet: z.boolean().optional(),
    dilemma: z.string().optional(),
    gita_links: z.array(z.string()).default([]),
    sources: z.array(z.string()).default([]),
    branches: z.array(z.tuple([z.enum(["character", "place"]), id])).default([]),
    // built (scroll-animated) scenes
    intro: z.string().optional(),
    len: z.number().optional(),
    day: z.string().optional(),
    cams: z.array(z.tuple([z.number(), z.number(), z.number(), z.number()])).optional(),
    anchors: z.record(z.string(), z.number()).optional(),
    // drafted scenes
    art: z.string().optional(),
    art_alt: z.string().optional(), // what the vignette shows, for screen readers (required for drafted moments; validator)
  }),
});

const people = defineCollection({
  loader: file("src/content/people.json"),
  schema: z.object({
    name: z.string(),
    dev: z.string(),
    bio: z.string(),
    identity_colour: z.string().regex(/^#[0-9a-f]{6}$/i), // the individual (A7: never moral); checked by scripts/identity-colours.mjs
    family: id, // birth line → the line pattern in Kāla
    principal: z.boolean().default(false), // a main thread: must be at every assembly moment while alive, or absent with a reason (A1)
    minor: z.boolean().default(false), // a one-scene figure: no line in Kāla
    home: id,
    returns_home: z.boolean().default(false),
    death_t: z.number().optional(),
    amsha: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    figure: z.record(z.string(), z.union([z.string(), z.boolean()])), // the adult look (src/art/figure.ts options)
    // life stages (design v2): from story time `from`, draw this person at `age`, with any figure options overridden
    stages: z.array(z.object({ from: z.number(), age: z.enum(AGES) }).catchall(z.union([z.string(), z.boolean()]))).default([]),
  }),
});

const places = defineCollection({
  loader: file("src/content/places.json"),
  schema: z.object({
    name: z.string(),
    short: z.string().optional(),
    parent_id: id.nullable().default(null),
    level: z.enum(["realm", "site", "spot"]),
    certainty: z.enum(["textual", "traditional", "conjectural"]),
    certainty_note: z.string(), // one line: why this certainty (unverified until scholarly review)
    map_xy: z.tuple([z.number(), z.number()]),
    r: z.number().optional(), // realms: radius of the soft region on Deśa
    desc: z.string().optional(),
    icon: z.string(),
    band: z.number().optional(), // sites: row order in the Kāla chart (spots use their site's row)
  }),
});

/* family lines: the line pattern every member shares in Kāla (Sprint 3, D4) */
const families = defineCollection({
  loader: file("src/content/families.json"),
  schema: z.object({ name: z.string(), pattern: z.string().min(1), note: z.string() }),
});

const edges = defineCollection({
  loader: file("src/content/edges.json"),
  schema: z.object({
    from: id,
    to: id,
    type: z.enum(["next_by_character", "next_by_place", "memory", "omen", "tale_told", "curse_fulfilment", "boon_fulfilment"]),
    note: z.string().optional(),
  }),
});

const tellings = defineCollection({
  loader: file("src/content/tellings.json"),
  schema: z.object({
    name: z.string(),
    region: z.string(),
    tier: z.number().int().min(0).max(3),
  }),
});

export const collections = { moments, people, places, families, edges, tellings };
