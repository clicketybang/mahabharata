/* PĀTRA (souls), MĀRGA (the reader's path) and SMṚTI (bookmarks). */
import { story, progress } from "../state";
import { headSVG, placeBadge, placeName } from "../badges";
import { $ } from "../util";
import { openSoul } from "../overlays";
import { go } from "../nav";
import { ui } from "../state";

export function renderPatra(): void {
  const met = new Set([...progress.visited].flatMap(id => story.node[id]?.cast || []));
  $("#patra").innerHTML = `<div class="pgrid">${Object.entries(story.people).map(([id, p]) => {
    const seen = story.timeline.filter(n => n.cast.includes(id) && progress.visited.has(n.id)).length;
    return `<button class="pcard ${met.has(id) ? "" : "unmet"}" data-pp="${id}" style="--c:${p.line}"><div class="face">${headSVG(id)}</div><div class="nm">${met.has(id) ? p.n : "?"}</div><div style="font-size:12px;color:var(--muted)">${seen ? seen + " walked" : ""}</div></button>`;
  }).join("")}</div>`;
  $("#patra").onclick = e => { const c = (e.target as Element).closest<HTMLElement>("[data-pp]"); if (c) openSoul(c.dataset.pp ?? "", ui.current); };
}

export function renderMarga(): void {
  if (!progress.path.length) { $("#marga").innerHTML = `<div class="empty">Your path begins when you choose at the end of a scene.</div>`; return; }
  $("#marga").innerHTML = `<div class="journey">${progress.path.map(r => `<div class="jstep" data-go="${r.to}"><div class="dot">${r.by === "character" ? headSVG(r.ref) : placeBadge(r.ref)}</div>
    <span class="by">${r.by === "character" ? "followed " + story.people[r.ref].n : "went to " + placeName(r.ref)}</span><b>${story.node[r.from].title} → ${story.node[r.to].title}</b>${r.note ? `<div class="bubble">${r.note}</div>` : ""}</div>`).join("")}</div>`;
}

export function renderSmriti(): void {
  const marks = progress.marks;
  if (!marks.length) { $("#smriti").innerHTML = `<div class="empty">Bookmark a moment while reading — it will wait for you here.</div>`; return; }
  $("#smriti").innerHTML = `<div class="marks">${marks.slice().reverse().map((m, i) => `<button class="mark" data-mk="${marks.length - 1 - i}"><div class="ic">${placeBadge(story.node[m.id].place)}</div><div><b>${m.where}</b><small style="color:var(--muted)">${story.node[m.id].title}</small>${m.note ? `<div class="note">${m.note}</div>` : ""}</div></button>`).join("")}</div>`;
  $("#smriti").onclick = e => {
    const b = (e.target as Element).closest<HTMLElement>("[data-mk]"); if (!b) return;
    const m = marks[+(b.dataset.mk ?? 0)]; $("#maps").classList.remove("on"); go(m.id, { at: m.p });
  };
}
