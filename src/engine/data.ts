/* Loads the story from the content collections into the engine's runtime shapes.
   Frontmatter arrives as JSON (ReaderData); MDX bodies arrive pre-rendered in <template data-moment>. */
import { C, SK } from "../art/palette";
import type { FigureOpts } from "../art/figure";
import { WORLDS } from "../art/worlds";
import { story } from "./state";
import type { ReaderData, Beat, Scene, Person } from "./types";

interface Body { beats: Beat[]; text: string }

/** read the MDX bodies that Astro rendered into the page */
export function readBodies(): Record<string, Body> {
  const bodies: Record<string, Body> = {};
  document.querySelectorAll<HTMLTemplateElement>("template[data-moment]").forEach(tpl => {
    const frag = tpl.content;
    const beats: Beat[] = [...frag.querySelectorAll<HTMLElement>(".beat-src")].map(b => ({
      from: +(b.dataset.from ?? 0), to: +(b.dataset.to ?? 1),
      title: b.dataset.title ?? "", dev: b.dataset.dev ?? "", warn: b.dataset.warn || null,
      cast: JSON.parse(b.dataset.cast || "[]") as string[],
      alt: b.dataset.alt ?? "",
      html: [...b.querySelectorAll("p")].map(p => p.innerHTML).join(" ") || b.innerHTML.trim(),
    }));
    const text = beats.length ? "" : [...frag.querySelectorAll("p")].map(p => p.innerHTML).join(" ");
    bodies[tpl.dataset.moment ?? ""] = { beats, text };
  });
  return bodies;
}

/** how a person looks at story time t: their adult look, with the latest life stage that has begun by t laid over it.
    Without t (maps, the souls panel) people are drawn as adults. */
export function figureFor(pid: string, t?: number): FigureOpts {
  const p = story.people[pid];
  const st = t == null ? undefined : p.stages.filter(s => s.from <= t).at(-1);
  return { ...p.f, ...(st?.f ?? {}) };
}

/** the site a place belongs to: a spot's parent site, or the place itself */
export function siteOf(pid: string): string {
  const p = story.places[pid];
  return p?.level === "spot" && p.parent ? p.parent : pid;
}

/** "Assembly Hall › Hastināpura › Kuru" */
export function placePath(pid: string): string[] {
  const out: string[] = [];
  for (let p: string | null = pid; p && story.places[p]; p = story.places[p].parent) out.push(p);
  return out;
}

const lookup = (table: Record<string, string>, k: unknown): string =>
  (typeof k === "string" && table[k]) || String(k);

export function loadData(data: ReaderData, bodies: Record<string, Body>): void {
  story.places = {}; story.cert = {};
  data.places.forEach(p => {
    story.places[p.id] = { n: p.name, short: p.short, d: p.desc, icon: p.icon, map: p.map_xy,
      level: p.level, parent: p.parent_id, note: p.certainty_note, r: p.r, band: p.band };
    story.cert[p.id] = p.certainty;
  });

  story.families = Object.fromEntries(data.families.map(f => [f.id, f]));
  story.people = {};
  data.people.forEach(p => {
    const colours = (raw: Record<string, unknown>): Partial<FigureOpts> => {
      const o = { ...raw } as Record<string, unknown>;
      if (o.skin) o.skin = lookup(SK, o.skin);
      for (const k of ["cloth", "cloth2", "hairColor"]) if (o[k]) o[k] = lookup(C, o[k]);
      return o as Partial<FigureOpts>;
    };
    const f = colours(p.figure) as FigureOpts;
    const stages = (p.stages || []).map(({ from, ...rest }) => ({ from, f: colours(rest) })).sort((a, b) => a.from - b.from);
    const person: Person = {
      n: p.name, dev: p.dev, bio: p.bio, line: p.identity_colour, dash: story.families[p.family]?.pattern ?? "", family: p.family, principal: p.principal, minor: p.minor, home: p.home,
      returnsHome: p.returns_home, death: p.death_t, f, stages,
    };
    story.people[p.id] = person;
  });

  story.tiers = data.tiers;
  story.timeline = data.moments
    .map(m => ({ id: m.id, t: m.t_story, place: m.place_id, cast: m.cast.map(c => c.id), title: m.title, status: m.status, era: m.era,
      look: Object.fromEntries(m.cast.map(c => [c.id, { weapon: c.pose, seated: c.seated }])) }))
    .sort((a, b) => a.t - b.t);
  story.node = Object.fromEntries(story.timeline.map(n => [n.id, n]));
  // Kāla rows (Sprint 3, D1): one per site that a moment or a person's home falls in
  const used = new Set([...story.timeline.map(n => siteOf(n.place)), ...Object.values(story.people).map(p => siteOf(p.home))]);
  story.bandOrder = [...used].sort((a, b) => (story.places[a].band ?? 0) - (story.places[b].band ?? 0));
  story.assembly = new Set(data.moments.filter(m => m.assembly).map(m => m.id));

  story.meta = {}; story.scenes = {};
  data.moments.forEach(m => {
    if (m.status === "unwritten") return;
    const narr = m.narrator_chain.length
      ? `${m.narrator_chain[0]} tells ${m.narrator_chain[1]}${m.narration_note ? ` (${m.narration_note})` : ""}`
      : null;
    story.meta[m.id] = { narr, ce: m.ce_ref.label, tier: m.variant_tier, debate: m.debate_note, absent: m.absent };
    const body = bodies[m.id] || { beats: [], text: "" };
    const base = { parva: m.parva, dev: m.dev, branches: m.branches };
    let scene: Scene;
    if (m.status === "built") {
      const art = WORLDS[m.id];
      if (!art || !m.cams || !m.len) throw new Error(`built moment "${m.id}" needs a world, cams and len`);
      scene = { ...base, kind: "built", world: art.world, animate: art.animate, len: m.len, day: m.day, intro: m.intro,
        cams: m.cams, anchors: m.anchors || {}, beats: body.beats };
    } else {
      scene = { ...base, kind: "drafted", art: m.art, artAlt: m.art_alt ?? "", text: body.text };
    }
    story.scenes[m.id] = scene;
  });
}
