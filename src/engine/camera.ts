/* The scroll camera: scene progress (0–1) from native scroll, keyframed camera, beat captions. */
import { story, ui } from "./state";
import { clamp, ease, $, $$, $opt } from "./util";
import type { Cam } from "./types";

export function camAt(cams: Cam[], p: number): [number, number, number] {
  let i = 0; while (i < cams.length - 1 && cams[i + 1][0] <= p) i++;
  const a = cams[i], b = cams[Math.min(i + 1, cams.length - 1)], t = b[0] === a[0] ? 0 : ease(clamp((p - a[0]) / (b[0] - a[0])));
  return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
}

export function sceneP(): number | null {
  const s = $opt("#scrolly"); if (!s) return null;
  const r = s.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight));
}

export function scrollToP(p: number): void {
  const s = $opt("#scrolly"); if (!s) { scrollTo(0, 0); return; }
  scrollTo(0, s.offsetTop + p * (s.offsetHeight - innerHeight) + 2);
}

/** index of the beat showing at progress p */
export function beatAt(p: number): number {
  const sc = story.scenes[ui.current]; if (!sc || sc.kind !== "built") return -1;
  const i = sc.beats.findIndex(b => p >= b.from && p < b.to);
  return i < 0 ? sc.beats.length - 1 : i;
}

export function frame(): void {
  const sc = story.scenes[ui.current]; if (!sc || sc.kind !== "built") return;
  let p = sceneP(); if (p == null) return;
  const caps = $$(".cap"), dots = $$(".prog i"), beat = beatAt(p);
  sc.beats.forEach((_, i) => { caps[i].classList.toggle("on", i === beat); dots[i].classList.toggle("on", i === beat); dots[i].setAttribute("aria-selected", String(i === beat)); });
  const svg = $<SVGSVGElement>("#world");
  if (ui.reduced) { // reduce motion: hold a still frame per beat, cross-fade between beats
    const b = sc.beats[beat]; p = Math.min(b.to, 1) - .001;
    if (beat !== ui.lastBeat) { svg.classList.remove("fade"); void svg.getBoundingClientRect(); svg.classList.add("fade"); }
  }
  ui.lastBeat = beat;
  const stage = $("#stage"), sw = stage.clientWidth, sh = stage.clientHeight;
  let [cx, cy, w] = camAt(sc.cams, p);
  if (sw < 700) w *= .62;
  const s = sw / w, capH = caps[beat]?.offsetHeight || 140; cy += capH * .5 / s;
  svg.setAttribute("viewBox", `0 0 ${sw} ${sh}`);
  $("#cam").setAttribute("transform", `translate(${sw / 2} ${sh / 2}) scale(${s}) translate(${-cx} ${-cy})`);
  sc.animate(p, svg);
}
