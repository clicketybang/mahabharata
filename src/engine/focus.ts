/* Keyboard and focus handling (Sprint 2, task 3).
   - Overlays (gate, modal, drawer, character story, maps) take focus when they open, keep Tab inside,
     and give focus back to whatever opened them when they close.
   - Esc closes the topmost overlay only.
   - Enter / Space activate anything marked role="button" that isn't a real <button> (portraits, map nodes). */
import { $opt } from "./util";

const FOCUSABLE = 'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
/** topmost last; the gate is a hard stop and is not closable with Esc */
const ORDER = ["#gate", "#modal", "#drawer", "#soul", "#maps"];
const returnTo = new Map<Element, HTMLElement | null>();

const visible = (el: Element) => el.classList.contains("on");
export const topOverlay = (): HTMLElement | null =>
  ORDER.map(s => $opt(s)).find((el): el is HTMLElement => !!el && visible(el)) ?? null;

export function openOverlay(el: HTMLElement, focusSel?: string): void {
  if (!returnTo.has(el)) returnTo.set(el, document.activeElement as HTMLElement | null);
  el.classList.add("on");
  requestAnimationFrame(() => {
    const target = (focusSel && el.querySelector<HTMLElement>(focusSel)) || el.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus({ preventScroll: true });
  });
}

export function closeOverlay(el: HTMLElement): void {
  if (!visible(el)) return;
  el.classList.remove("on");
  const back = returnTo.get(el); returnTo.delete(el);
  if (back && document.contains(back)) back.focus({ preventScroll: true });
}

/** close without restoring focus (navigation away replaces the page) */
export function dismissOverlay(el: HTMLElement): void { el.classList.remove("on"); returnTo.delete(el); }

export function installKeyboard(onEscapeGate: () => void): void {
  document.addEventListener("keydown", e => {
    const top = topOverlay();
    if (e.key === "Escape" && top) {
      e.preventDefault();
      if (top.id === "gate") onEscapeGate(); else closeOverlay(top);
      return;
    }
    if (e.key === "Tab" && top) { // keep focus inside the open overlay
      const items = [...top.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(x => x.offsetParent !== null || x instanceof SVGElement);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1], a = document.activeElement;
      if (!top.contains(a)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      return;
    }
    const t = e.target as Element;
    if ((e.key === "Enter" || e.key === " ") && t.getAttribute?.("role") === "button" && !(t instanceof HTMLButtonElement)) {
      e.preventDefault();
      t.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    }
  });
}
