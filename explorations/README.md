# Explorations — not shipped

The prototype (v6) carried three visual themes behind a hidden switcher. On 2026-11-16 the owner chose
**Srikalahasti Kalamkari** as the final design, and in Sprint 1 (decision D5) the other two were moved
here, out of the shipped site, so the work is kept in git.

`themes.js` holds everything that differed between themes in the prototype:

- **Madhubani** (Mithila): palette, UI tokens, triangle-border tiles, fish / flower / bird fillers,
  the large Madhubani eye on figures, the "paint" page animation, double-rule frames, offset shadows.
- **Pichwai Night** (Nathdwara): palette, UI tokens, lotus-border tiles, lotus and star fillers,
  lamp-glow sun, night variants of the worlds (gold strokes, lamps under the arches, star scatter),
  the "lamp" page animation and the gold-ring stage frame.

To revive one: give `src/art/palette.ts` a theme switch, restore the `THEME` branches noted in
`themes.js`, and add the CSS tokens and rules to `src/styles/`. Nothing here is imported by the site.
