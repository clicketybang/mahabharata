/* Story graph schema v2 (roadmap §3) as Astro content collections.
   Moments are MDX (facts in frontmatter, beats as prose). People, places, edges and tellings are JSON.
   Graph rules (chronology, branches, references) are enforced by scripts/validate.mjs. */
import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const id = z.string().regex(/^[a-z0-9-]+$/, "ids are lowercase-kebab");

const moments = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/moments" }),
  schema: z.object({
    t_story: z.number(),
    t_narration: z.number().optional(),
    narrator_chain: z.array(z.string()).default([]), // [teller, listener] of the innermost frame
    narration_note: z.string().optional(),
    place_id: id,
    cast: z.array(z.object({ id, role: z.enum(["present", "mentioned", "divine"]).default("present") })).min(1),
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
    identity_colour: z.string().regex(/^#[0-9a-f]{6}$/i),
    line_pattern: z.string(), // SVG dash pattern; "" = solid
    home: id,
    returns_home: z.boolean().default(false),
    death_t: z.number().optional(),
    amsha: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    figure: z.record(z.string(), z.union([z.string(), z.boolean()])),
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
    map_xy: z.tuple([z.number(), z.number()]),
    desc: z.string().optional(),
    icon: z.string(),
    band: z.number().optional(), // row order in the Kāla chart
    landmark: z.boolean().default(false), // shown fogged on Deśa; not yet a story setting
  }),
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

export const collections = { moments, people, places, edges, tellings };
