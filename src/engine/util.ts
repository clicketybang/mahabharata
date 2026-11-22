export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v));
export const ease = (t: number): number => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
/* the engine's DOM shell is rendered by Reader.tsx, so these elements always exist once started */
export const $ = <T extends Element = HTMLElement>(s: string): T => document.querySelector(s) as T;
export const $$ = <T extends Element = HTMLElement>(s: string): T[] => [...document.querySelectorAll<T>(s)];
export const $opt = <T extends Element = HTMLElement>(s: string): T | null => document.querySelector<T>(s);
