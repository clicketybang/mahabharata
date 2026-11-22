/* Types for the reader engine.
   "…Data" types are what the page passes in from the content collections (see src/content.config.ts).
   The others are the engine's runtime shapes. */
import type { FigureOpts } from "../art/figure";
import type { WorldArt } from "../art/worlds";

/* ---------- from the content collections ---------- */
export type Certainty = "textual" | "traditional" | "conjectural";
export type BranchBy = "character" | "place";
export type Branch = [BranchBy, string];
export type Status = "built" | "drafted" | "unwritten";

export type PlaceLevel = "realm" | "site" | "spot";
export interface PlaceData {
  id: string; name: string; short?: string; parent_id: string | null; level: PlaceLevel;
  certainty: Certainty; certainty_note: string; map_xy: [number, number]; r?: number; desc?: string; icon: string; band?: number;
}
export interface PersonData {
  id: string; name: string; dev: string; bio: string; identity_colour: string; line_pattern: string;
  home: string; returns_home: boolean; death_t?: number; aliases: string[];
  figure: Record<string, string | boolean>;
}
export interface MomentData {
  id: string; t_story: number; place_id: string; cast: { id: string; role: string }[];
  title: string; status: Status; era: string; parva: string; dev?: string;
  narrator_chain: string[]; narration_note?: string;
  ce_ref: { parva: number; adhyaya: string; label: string; verified: boolean };
  variant_tier: number; debate_note?: string; content_notes: string[]; assembly: boolean;
  branches: Branch[];
  intro?: string; len?: number; day?: string; cams?: Cam[]; anchors?: Record<string, number>;
  art?: string; art_alt?: string;
}
export interface ReaderData { places: PlaceData[]; people: PersonData[]; moments: MomentData[]; tiers: string[] }

/* ---------- runtime ---------- */
/** [scroll progress, centre x, centre y, view width] */
export type Cam = [number, number, number, number];

export interface Place {
  n: string; short?: string; d?: string; icon: string; map: [number, number];
  level: PlaceLevel; parent: string | null; note: string; r?: number; band?: number;
}
export interface Person {
  n: string; dev: string; bio: string; line: string; dash: string; home: string;
  returnsHome: boolean; death?: number; f: FigureOpts;
}
/** a moment on the timeline (the shape the rule works on) */
export interface Node { id: string; t: number; place: string; cast: string[]; title: string; status: Status; era: string }

export interface Beat { from: number; to: number; title: string; dev: string; html: string; warn: string | null; cast: string[]; alt: string }

interface SceneBase { parva: string; dev?: string; branches: Branch[] }
export interface BuiltScene extends SceneBase, WorldArt {
  kind: "built"; len: number; day?: string; intro?: string; cams: Cam[]; anchors: Record<string, number>; beats: Beat[];
}
export interface DraftedScene extends SceneBase { kind: "drafted"; art?: string; artAlt: string; text: string }
export type Scene = BuiltScene | DraftedScene;

export interface Meta { narr: string | null; ce: string; tier: number; debate?: string }

export interface Choice { by: BranchBy; ref: string; to: Node }
export interface PathStep { from: string; to: string; by: BranchBy; ref: string; note: string; noted?: boolean; t: number }
export interface Mark { id: string; p: number; where: string; note: string; t: number }
export interface ReturnPoint { id: string; y: number; title: string }

export interface Story {
  /** every place: realms, sites and spots. bandOrder = the sites that get a Kāla row, top to bottom */
  places: Record<string, Place>; cert: Record<string, Certainty>; bandOrder: string[];
  people: Record<string, Person>; timeline: Node[]; node: Record<string, Node>;
  scenes: Record<string, Scene>; meta: Record<string, Meta>; assembly: Set<string>; tiers: string[];
}
