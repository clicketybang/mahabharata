/* UI icons in the kalam-line style of the place icons (Sprint 3, D5): an iron-ink outline drawn with
   `currentColor` (so they follow the button's text colour), ochre and madder fills, rounded joins.
   All are decorative: the buttons that hold them carry the accessible name. */
const wrap = (body: string, cls = "ic"): string =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;

/** a folded cloth map with a place and a dotted path */
export const iconMap = wrap(
  `<path d="M3 6.2 8.6 4l6.8 2.2L21 4v13.8l-5.6 2.2-6.8-2.2L3 20Z" fill="#eedfc0"/>` +
  `<path d="M8.6 4v13.8M15.4 6.2V20" />` +
  `<path d="M8.6 4l6.8 2.2v13.8l-6.8-2.2Z" fill="#c9973a" fill-opacity=".45"/>` +
  `<path d="M5.4 15.5c1.6-1.8 3.4-2.4 5.2-1.7s3.6.3 5-1.9" stroke-dasharray="1.2 1.9" stroke-width="1.3"/>` +
  `<circle cx="17.6" cy="10.6" r="1.7" fill="#a63a2b"/>`,
);

/** a cloth pennant with a madder band and a swallowtail */
export const iconBookmark = wrap(
  `<path d="M6.5 3h11v17.5l-5.5-4.2-5.5 4.2Z" fill="#c9973a" fill-opacity=".55"/>` +
  `<path d="M7.3 7.2h9.4" stroke-width="2.6" stroke="#a63a2b" stroke-linecap="butt"/>` +
  `<path d="M6.5 3h11v17.5l-5.5-4.2-5.5 4.2Z"/>` +
  `<circle cx="12" cy="11.4" r="1.3" fill="#a63a2b"/>`,
);

/** two crossed kalam strokes with a madder knot */
export const iconClose = wrap(
  `<path d="M6 6l12 12M18 6 6 18" stroke-width="2.2"/>` +
  `<circle cx="12" cy="12" r="2" fill="#a63a2b" stroke-width="1.2"/>`,
  "ic ic-close",
);

/** a returning curve with an ochre arrowhead */
export const iconReturn = wrap(
  `<path d="M9 7.5h6.2a4.8 4.8 0 0 1 0 9.6H8.5" stroke-width="1.9"/>` +
  `<path d="M10 3.6 5.2 7.5 10 11.4Z" fill="#c9973a"/>`,
  "ic ic-ret",
);
