/* DEŚA — the land, as a game map: fogged places light up as the reader walks them. */
import { C, defs } from "../../art/palette";
import { scatter } from "../../art/motifs";
import { placeIcon } from "../../art/places";
import { story, progress, ui } from "../state";
import { placeName } from "../badges";
import { $ } from "../util";
import { placeInfo } from "./index";

const LAND = "M120 60 C260 30 520 40 700 60 C820 74 900 120 960 200 C990 250 980 330 940 380 C900 430 880 470 900 520 C920 560 900 600 860 640 C800 700 720 760 660 860 L600 900 L520 900 C500 840 470 790 430 740 C390 700 330 690 280 680 C230 672 200 690 160 680 C110 668 60 650 50 615 C42 585 80 566 120 560 C170 556 190 530 180 500 C170 470 120 450 100 410 C70 350 60 260 70 180 C76 120 90 75 120 60Z";

export function renderDesha(): void {
  const NODE = story.node, PLACES = story.places;
  const visitedPlaces = new Set([...progress.visited].map(id => NODE[id]?.place).filter(Boolean));
  const cur = NODE[ui.current]?.place;
  let s = `${defs()}<rect width="1000" height="900" fill="url(#waves)"/>
   <path d="${LAND}" fill="${C.land}" stroke="${C.gold}" stroke-width="3"/>
   <path d="${LAND}" fill="none" stroke="${C.gold}" stroke-width="1" stroke-dasharray="2 6" transform="translate(0 6)" opacity=".5"/>`;
  // mountains
  for (let x = 200; x < 900; x += 46) { const h = 30 + ((x * 7) % 23); s += `<path d="M${x - 26} 150 L${x} ${150 - h} L${x + 26} 150Z" fill="${C.indigoL}" stroke="${C.iron}" stroke-width="2"/><path d="M${x - 8} ${150 - h + 14} L${x} ${150 - h} L${x + 8} ${150 - h + 14}Z" fill="${C.white}"/>`; }
  // rivers
  s += `<path d="M560 140 C 540 220 560 300 590 350 C 640 430 720 480 800 520 C 860 550 900 580 930 600" fill="none" stroke="${C.river}" stroke-width="7" stroke-linecap="round"/>
   <path d="M470 140 C 450 220 440 300 440 360 C 440 420 450 470 560 500 C 620 516 680 500 720 490" fill="none" stroke="${C.river}" stroke-width="5" stroke-linecap="round"/>
   <path d="M330 150 C 320 210 300 260 280 300 C 250 360 230 400 200 450" fill="none" stroke="${C.river}" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/>
   <text x="616" y="410" font-family="Kalam" font-size="15" fill="${C.ink}" opacity=".6" transform="rotate(32 616 410)">Gaṅgā</text>
   <text x="420" y="400" font-family="Kalam" font-size="14" fill="${C.ink}" opacity=".6" transform="rotate(-80 420 400)">Yamunā</text>
   <text x="228" y="380" font-family="Kalam" font-size="14" fill="${C.ink}" opacity=".5" transform="rotate(-60 228 380)">Sarasvatī</text>`;
  // terrain: desert dunes, Vindhya hills, forests, region names
  s += scatter(34, 110, 290, 400, 560, (x, y) => `<path d="M${x - 12} ${y} q 12 -9 24 0" fill="none" stroke="${C.ochre}" stroke-width="2" opacity=".55"/>`, 6);
  for (let x = 300; x < 780; x += 30) { const h = 12 + ((x * 13) % 9); s += `<path d="M${x - 18} ${600 - (x - 300) * .06} q 18 -${h * 2} 36 0" fill="${C.ochre}" opacity=".5" stroke="${C.iron}" stroke-width="1.2"/>`; }
  const tree = (x: number, y: number) => `<g transform="translate(${x} ${y})"><path d="M0 0 v8" stroke="${C.iron}" stroke-width="1.5"/><path d="M-7 2 L0 -12 L7 2Z" fill="${C.leaf}" stroke="${C.iron}" stroke-width="1"/></g>`;
  s += scatter(30, 170, 330, 260, 370, tree, 2) + scatter(12, 400, 470, 320, 390, tree, 4) + scatter(12, 600, 680, 280, 340, tree, 5) + scatter(18, 560, 760, 620, 760, tree, 8);
  const big = (t: string, x: number, y: number, r = 0, sz = 22) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Gotu" font-size="${sz}" letter-spacing="6" fill="${C.ink}" opacity=".18" transform="rotate(${r} ${x} ${y})">${t}</text>`;
  s += big("HIMAVAT", 680, 72, 0, 18) + big("MARUBHŪMI", 200, 520, -8) + big("VINDHYA", 540, 640, -4) + big("KURU", 470, 232, 0, 26) + big("PAŚCIMA SĀGARA", 34, 760, -80, 16) + big("PŪRVA SĀGARA", 960, 740, 80, 16);
  // sea life
  s += `<g opacity=".7"><path d="M60 780 q 20 -20 40 0 q -20 20 -40 0z M100 780 l 12 -8 v16z" fill="${C.river}"/><path d="M820 760 q 26 -24 52 0 q -26 24 -52 0z M872 760 l 14 -9 v18z" fill="${C.river}"/>
    <path d="M30 520 l 30 0 l -6 12 h -20z M44 520 v -26 l 14 16z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.5"/></g>`;
  // landmarks (fogged)
  story.landmarks.forEach(({ n, map: [x, y], icon }) => { s += `<g opacity=".35">${placeIcon(icon, x, y, .7)}<text x="${x}" y="${y + 28}" text-anchor="middle" font-family="Kalam" font-size="13" fill="${C.ink}">${n}</text></g>`; });
  // the reader's trail
  const pts: [number, number][] = [];
  progress.trail.forEach(id => { const pl = NODE[id]?.place; if (!pl) return; const p = PLACES[pl].map; if (!pts.length || pts.at(-1) !== p) pts.push(p); });
  if (pts.length > 1) {
    const d = pts.map((p, i) => i ? `Q ${(pts[i - 1][0] + p[0]) / 2} ${Math.min(pts[i - 1][1], p[1]) - 40} ${p[0]} ${p[1]}` : `M${p[0]} ${p[1]}`).join(" ");
    s += `<path d="${d}" fill="none" stroke="${C.iron}" stroke-width="6" opacity=".35"/><path class="trail" d="${d}" fill="none" stroke="${C.ochreL}" stroke-width="3.5" stroke-dasharray="10 10" filter="url(#glow)"/>`;
  }
  // story places
  Object.entries(PLACES).forEach(([id, p]) => {
    const [x, y] = p.map, lit = visitedPlaces.has(id);
    s += `<g class="dplace" data-place="${id}" role="button" tabindex="0" aria-label="${lit ? p.n : "Unexplored place"}">${lit ? `<circle cx="${x}" cy="${y}" r="30" fill="url(#lampG)"/>` : ""}
      <circle cx="${x}" cy="${y}" r="21" fill="${C.paper}" stroke="${lit ? C.gold : C.muted}" stroke-width="${lit ? 3 : 2}" ${story.cert[id] === "traditional" ? 'stroke-dasharray="6 4"' : ""}/>${placeIcon(p.icon, x, y + 1, .62)}
      ${lit ? "" : `<g opacity=".8">${[[-14, -6], [0, -12], [14, -6], [-6, 6], [10, 6]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="10" fill="#d9ccad"/>`).join("")}</g>`}
      ${lit ? `<text x="${x}" y="${y + 38}" text-anchor="middle" font-family="Kalam" font-size="14" font-weight="700" fill="${C.gold}">${placeName(id).replace("Kāmyaka & Dvaita Forests", "The Forests")}</text>` : ""}
      ${id === cur ? `<circle class="ring" cx="${x}" cy="${y}" r="14" fill="none" stroke="${C.ochreL}" stroke-width="3"/>` : ""}</g>`;
  });
  // compass + cartouche
  s += `<g transform="translate(860 800)"><circle r="44" fill="${C.paper}" stroke="${C.gold}" stroke-width="2"/>${[0, 90, 180, 270].map(a => `<path transform="rotate(${a})" d="M0 -40 L8 0 L0 6 L-8 0Z" fill="${a ? C.ochre : C.madder}" stroke="${C.iron}" stroke-width="1.2"/>`).join("")}<text y="-48" text-anchor="middle" font-family="Gotu" font-size="14" fill="${C.ink}">N</text></g>
   <g transform="translate(150 820)"><rect x="-110" y="-30" width="220" height="56" rx="8" fill="${C.paper}" stroke="${C.gold}" stroke-width="2"/><text y="-2" text-anchor="middle" font-family="Tiro Devanagari Sanskrit" font-size="24" fill="${C.gold}">भारतवर्ष</text><text y="18" text-anchor="middle" font-family="Kalam" font-size="13" fill="${C.ink}" opacity=".7">${visitedPlaces.size} lands walked</text></g>`;
  $("#deshaMap").innerHTML = `<svg id="deshaSvg" viewBox="0 0 1000 900" role="group" aria-label="Map of Bhāratavarṣa">${s}</svg>`;
  $("#deshaText").innerHTML = `<h2>Deśa, the land, as a list</h2><p>${visitedPlaces.size} lands walked.</p><ul>${Object.entries(PLACES).map(([id, p]) => {
    const here = story.timeline.filter(n => n.place === id);
    return `<li>${visitedPlaces.has(id) ? p.n : "An unexplored place"} (${story.cert[id]} location)${id === cur ? ", where you are now" : ""}: ${visitedPlaces.has(id) ? here.map(n => n.title).join("; ") : `${here.length} moment${here.length === 1 ? "" : "s"}`}</li>`;
  }).join("")}</ul>`;
  $("#deshaSvg").addEventListener("click", e => { const p = (e.target as Element).closest<SVGGElement>("[data-place]"); if (p) placeInfo(p.dataset.place ?? ""); });
  if (cur) {
    const box = $("#desha"), [x, y] = PLACES[cur].map, svg = $("#deshaSvg");
    requestAnimationFrame(() => { const k = svg.clientWidth / 1000; box.scrollLeft = x * k - box.clientWidth / 2; box.scrollTop = y * k - box.clientHeight / 2; });
  }
}
