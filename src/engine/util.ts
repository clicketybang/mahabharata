// @ts-nocheck — faithful port of prototype v6; typed in a later refactor.
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
