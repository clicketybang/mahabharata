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

const lookup = (table: Record<string, string>, k: unknown): string =>
  (typeof k === "string" && table[k]) || String(k);

export function loadData(data: ReaderData, bodies: Record<string, Body>): void {
  const real = data.places.filter(p => !p.landmark).sort((a, b) => (a.band ?? 0) - (b.band ?? 0));
  story.places = {}; story.cert = {};
  real.forEach(p => {
    story.places[p.id] = { n: p.name, short: p.short, d: p.desc, icon: p.icon, map: p.map_xy };
    story.cert[p.id] = p.certainty;
  });
  story.bandOrder = real.map(p => p.id);
  story.landmarks = data.places.filter(p => p.landmark).map(p => ({ n: p.name, map: p.map_xy, icon: p.icon }));

  story.people = {};
  data.people.forEach(p => {
    const f = { ...p.figure } as unknown as FigureOpts;
    f.skin = lookup(SK, p.figure.skin);
    if (p.figure.cloth) f.cloth = lookup(C, p.figure.cloth);
    const person: Person = {
      n: p.name, dev: p.dev, bio: p.bio, line: p.identity_colour, dash: p.line_pattern, home: p.home,
      returnsHome: p.returns_home, death: p.death_t, f,
    };
    story.people[p.id] = person;
  });

  story.tiers = data.tiers;
  story.timeline = data.moments
    .map(m => ({ id: m.id, t: m.t_story, place: m.place_id, cast: m.cast.map(c => c.id), title: m.title, status: m.status, era: m.era }))
    .sort((a, b) => a.t - b.t);
  story.node = Object.fromEntries(story.timeline.map(n => [n.id, n]));
  story.assembly = new Set(data.moments.filter(m => m.assembly).map(m => m.id));

  story.meta = {}; story.scenes = {};
  data.moments.forEach(m => {
    if (m.status === "unwritten") return;
    const narr = m.narrator_chain.length
      ? `${m.narrator_chain[0]} tells ${m.narrator_chain[1]}${m.narration_note ? ` (${m.narration_note})` : ""}`
      : null;
    story.meta[m.id] = { narr, ce: m.ce_ref.label, tier: m.variant_tier, debate: m.debate_note };
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
