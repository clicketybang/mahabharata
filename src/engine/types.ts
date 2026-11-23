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
  id: string; name: string; dev: string; bio: string; identity_colour: string; family: string; principal: boolean; minor: boolean;
  home: string; returns_home: boolean; death_t?: number; aliases: string[];
  figure: Record<string, string | boolean>;
  stages: ({ from: number; age: string } & Record<string, string | number | boolean>)[];
}
export interface MomentData {
  id: string; t_story: number; place_id: string; cast: { id: string; role: string; pose?: string; seated?: boolean }[];
  title: string; status: Status; era: string; parva: string; dev?: string;
  narrator_chain: string[]; narration_note?: string;
  ce_ref: { parva: number; adhyaya: string; label: string; verified: boolean };
  variant_tier: number; debate_note?: string; content_notes: string[]; assembly: boolean; absent: { id: string; reason: string }[];
  branches: Branch[];
  intro?: string; len?: number; day?: string; cams?: Cam[]; anchors?: Record<string, number>;
  art?: string; art_alt?: string;
}
export interface FamilyData { id: string; name: string; pattern: string; note: string }
export interface ReaderData { places: PlaceData[]; people: PersonData[]; families: FamilyData[]; moments: MomentData[]; tiers: string[] }

/* ---------- runtime ---------- */
/** [scroll progress, centre x, centre y, view width] */
export type Cam = [number, number, number, number];

export interface Place {
  n: string; short?: string; d?: string; icon: string; map: [number, number];
  level: PlaceLevel; parent: string | null; note: string; r?: number; band?: number;
}
export interface Person {
  n: string; dev: string; bio: string; line: string; dash: string; family: string; principal: boolean; minor: boolean; home: string;
  returnsHome: boolean; death?: number; f: FigureOpts;
  /** life stages, oldest last: from story time `from`, these figure options apply */
  stages: { from: number; f: Partial<FigureOpts> }[];
}
/** a moment on the timeline (the shape the rule works on) */
export interface Node { id: string; t: number; place: string; cast: string[]; title: string; status: Status; era: string;
  /** per cast member: how they are drawn here (pose, seated) */
  look: Record<string, { weapon?: string; seated?: boolean }> }

export interface Beat { from: number; to: number; title: string; dev: string; html: string; warn: string | null; cast: string[]; alt: string }

interface SceneBase { parva: string; dev?: string; branches: Branch[] }
export interface BuiltScene extends SceneBase, WorldArt {
  kind: "built"; len: number; day?: string; intro?: string; cams: Cam[]; anchors: Record<string, number>; beats: Beat[];
}
export interface DraftedScene extends SceneBase { kind: "drafted"; art?: string; artAlt: string; text: string }
export type Scene = BuiltScene | DraftedScene;

export interface Meta { narr: string | null; ce: string; tier: number; debate?: string; absent: { id: string; reason: string }[] }

export interface Choice { by: BranchBy; ref: string; to: Node }
export interface PathStep { from: string; to: string; by: BranchBy; ref: string; note: string; noted?: boolean; t: number }
export interface Mark { id: string; p: number; where: string; note: string; t: number }
export interface ReturnPoint { id: string; y: number; title: string }

export interface Story {
  /** every place: realms, sites and spots. bandOrder = the sites that get a Kāla row, top to bottom */
  places: Record<string, Place>; cert: Record<string, Certainty>; bandOrder: string[];
  people: Record<string, Person>; families: Record<string, FamilyData>; timeline: Node[]; node: Record<string, Node>;
  scenes: Record<string, Scene>; meta: Record<string, Meta>; assembly: Set<string>; tiers: string[];
}
