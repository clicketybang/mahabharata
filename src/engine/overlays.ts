/* Overlays: a character's story (Rule 6), the Sources & tellings drawer, the note modal and the toast. */
import { story, progress, ui } from "./state";
import { headSVG, placeBadge, placeName } from "./badges";
import { openMaps } from "./maps";
import { $, $opt } from "./util";

/* ---------- SOUL — one character's story, in order, marked where you were ---------- */
export function openSoul(pid: string, fromId: string): void {
  const p = story.people[pid], from = story.node[fromId];
  const mine = story.timeline.filter(n => n.cast.includes(pid));
  // the moment that matches where the reader was in the overall story
  const here = mine.find(n => n.id === fromId) || (from ? mine.find(n => n.t >= from.t) : null) || null;
  const hereNote = here && from && here.id !== fromId ? (here.t > from.t ? "next for them after where you were" : "") : "you are here in the story";
  let html = `<div class="shead" style="--c:${p.line}"><div class="face">${headSVG(pid)}</div><div><h3>${p.n}</h3><div class="dev">${p.dev}</div><p>${p.bio}</p>
    <div class="acts"><button class="kbtn" id="soulRiver">Their river in Kāla</button>${from ? `<button class="kbtn" id="soulBack">↩ Back to ${from.title.split(" —")[0]}</button>` : ""}</div></div>
    <button class="sclose" id="soulClose">×</button></div><div class="sbody" id="sbody"><div class="sline" style="--c:${p.line}">`;
  let era = "";
  mine.forEach(n => {
    if (n.era !== era) { era = n.era; html += `<div class="sera">${era}</div>`; }
    const unw = n.status === "unwritten", isHere = here && n.id === here.id, seen = progress.visited.has(n.id);
    const others = n.cast.filter(c => c !== pid);
    html += `<button class="smo ${unw ? "unw" : ""} ${isHere ? "here" : ""}" ${unw ? "disabled" : `data-go="${n.id}"`} id="smo-${n.id}" style="--c:${p.line}">
      <span class="pin">${placeBadge(n.place)}</span>${seen ? `<span class="tick">✓ walked</span>` : ""}
      <b>${n.title}${story.assembly.has(n.id) ? ` <span class="cert" title="Every thread passes through this moment">✦ assembly</span>` : ""}</b><div class="meta">${placeName(n.place)}${others.length ? " · with " + others.map(c => story.people[c].n).join(", ") : " · alone"}</div>
      ${isHere ? `<span class="youare">◉ ${hereNote}</span>` : ""}${unw ? `<div class="meta" style="font-family:Kalam">not yet painted</div>` : ""}</button>`;
  });
  if (p.death != null) html += `<div class="sdeath">✦ Here ${p.n}’s thread ends.</div>`;
  html += `</div></div>`;
  const el = $("#soul"); el.innerHTML = html; el.classList.add("on");
  $("#soulClose").onclick = () => el.classList.remove("on");
  const back = $opt("#soulBack"); if (back) back.onclick = () => el.classList.remove("on");
  $("#soulRiver").onclick = () => { el.classList.remove("on"); ui.kalaHL = pid; ui.kalaPlace = null; openMaps("kala"); };
  if (here) requestAnimationFrame(() => document.getElementById("smo-" + here.id)?.scrollIntoView({ block: "center" }));
}

/* ---------- SOURCES & TELLINGS ---------- */
export function openSources(id: string): void {
  const m = story.meta[id], n = story.node[id], cert = story.cert[n.place] || "textual";
  $("#drawer").innerHTML = `<button class="x" id="drawerClose" aria-label="Close">×</button><h4>Sources & tellings</h4><div style="color:var(--muted)">${n.title}</div>
   <div class="row"><div class="lab">Critical Edition reference</div><div>${m?.ce || "—"}<span class="unv">unverified</span></div></div>
   <div class="row"><div class="lab">Which layer of the text</div>${story.tiers.map((t, i) => `<span class="tier ${i === (m?.tier ?? 0) ? "on" : ""}">${t}</span>`).join("")}</div>
   ${m?.debate ? `<div class="row"><div class="lab">Where scholars and tellings differ</div><div>${m.debate}</div></div>` : ""}
   <div class="row"><div class="lab">Who is telling this</div><div>${m?.narr || "—"}</div><div style="font-size:14px;color:var(--muted);margin-top:4px">The whole epic is told by Ugraśravas to the sages of the Naimiṣa forest, retelling Vaiśampāyana’s recital to King Janamejaya.</div></div>
   <div class="row"><div class="lab">Place</div><div>${story.places[n.place].n}<span class="cert">${cert}</span></div></div>
   <div class="row"><div class="lab">Other tellings</div><div style="font-size:15px;color:var(--muted)">Comparison drawer (Tamil, Telugu, Pandavani, Rajasthani, Wayang) arrives in Sprint 7.</div></div>`;
  $("#drawerClose").onclick = () => $("#drawer").classList.remove("on");
  $("#drawer").classList.add("on");
}

/* ---------- note modal and toast ---------- */
let modalCb: ((note: string) => void) | null = null;
export function ask(title: string, sub: string, cb: (note: string) => void, ok = "Continue"): void {
  $("#mTitle").textContent = title; $("#mSub").textContent = sub; $<HTMLTextAreaElement>("#mText").value = ""; $("#mOk").textContent = ok;
  modalCb = cb; $("#modal").classList.add("on"); setTimeout(() => $("#mText").focus(), 50);
}
export function closeModal(save: boolean): void {
  $("#modal").classList.remove("on");
  modalCb?.(save ? $<HTMLTextAreaElement>("#mText").value.trim() : "");
}

let toastTimer = 0;
export function toast(t: string): void {
  const x = $("#toast"); x.textContent = t; x.classList.add("on");
  clearTimeout(toastTimer); toastTimer = window.setTimeout(() => x.classList.remove("on"), 2200);
}
