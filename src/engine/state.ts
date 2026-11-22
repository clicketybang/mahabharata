/* Shared engine state: the loaded story, the reader's saved progress (on this device only, D6),
   and the transient UI state. One mutable object per concern, imported by every module. */
import type { Story, PathStep, Mark, ReturnPoint } from "./types";

/* localStorage wrapper: never throws (private mode, storage full, sandboxed frames) */
export const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } },
  set(k: string, v: unknown): void { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};

export const story: Story = {
  places: {}, cert: {}, bandOrder: [], people: {}, timeline: [], node: {},
  scenes: {}, meta: {}, assembly: new Set(), tiers: [],
};

/** the reader's progress — keys kept from the prototype so existing readers keep their path */
export const progress = {
  visited: new Set<string>(), trail: [] as string[], path: [] as PathStep[], marks: [] as Mark[],
  load(): void {
    this.visited = new Set(store.get<string[]>("m2.visited", []));
    this.trail = store.get<string[]>("m2.trail", []);
    this.path = store.get<PathStep[]>("m2.path", []);
    this.marks = store.get<Mark[]>("m2.marks", []);
  },
  save(): void {
    store.set("m2.visited", [...this.visited]); store.set("m2.trail", this.trail);
    store.set("m2.path", this.path); store.set("m2.marks", this.marks);
  },
};

export type MapTab = "kala" | "desha" | "patra" | "marga" | "smriti";
export type Arrival = "memory" | "omen" | "index" | null;

export const ui = {
  current: "home",
  returnStack: [] as ReturnPoint[],
  arrivedVia: null as Arrival,
  lastBeat: -1,
  pendingGo: null as [string, GoOptions] | null,
  /** follows the device's "reduce motion" setting (Sprint 2, D1) */
  reduced: false,
  mapTab: "kala" as MapTab,
  kalaHL: null as string | null,
  kalaPlace: null as string | null,
};

export interface GoOptions { via?: Arrival; at?: number | null; y?: number }
