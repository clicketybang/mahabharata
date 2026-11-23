/* Who looks like what, for the hand-drawn pictures and the painted scenes (design v2).
   The engine registers a lookup (a person's figure at the current moment's story time) before drawing a page;
   hand-drawn art then asks for people by id and only says where they stand and what they do. */
import type { FigureOpts } from "./figure";

let lookup: ((pid: string) => FigureOpts | undefined) | null = null;
export function setLooks(fn: (pid: string) => FigureOpts | undefined): void { lookup = fn; }

/** a person's figure options, with placement and gesture laid over their look */
export function who(pid: string, o: Partial<FigureOpts>): FigureOpts {
  const base = lookup?.(pid) ?? ({ skin: "#d9ab80" } as FigureOpts);
  const { age: _a, ...look } = base; // pictures set their own scale; a stage's age still applies below
  return { ...look, ...(base.age && base.age !== "baby" ? { age: base.age } : {}), ...o } as FigureOpts;
}
