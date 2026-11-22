/* Madhubani and Pichwai theme explorations from prototype v6. NOT imported by the site.
   In the prototype, `C` (the art palette) was filled from THEMES[name].pal and these branches ran on THEME. */

export const THEMES = {
  madhubani: {
    name: "Madhubani", sub: "painted in the Madhubani style of Mithila", sw: ["#d7262b", "#f2b705", "#2f8f3a", "#1f5fa8", "#e5508a"],
    pal: { sky: "#f8ead0", sky2: "#f3dfb6", ground: "#f2c14e", ground2: "#e9b23c", wall: "#f6d9c4", floorA: "#f4dca8", floorB: "#d7262b", madder: "#d7262b", madderL: "#ef5a3c", indigo: "#1f4fa0", indigoL: "#3c7fd0",
      ochre: "#f2b705", ochreL: "#ffd84d", iron: "#1d1d1b", leaf: "#2f8f3a", rose: "#e5508a", white: "#fbf3df", paper: "#f7ecd0", paper2: "#efdcb0", ink: "#1d1d1b", gold: "#d7262b", muted: "#c9b68c", river: "#1f5fa8", sea: "#bcd6e8", land: "#f7e6bd" },
  },
  pichwai: {
    name: "Pichwai Night", sub: "painted in the manner of a Nathdwara Pichwai", sw: ["#0b1030", "#e0b44c", "#e48aa0", "#2fa39a", "#c8452f"],
    pal: { sky: "#101a48", sky2: "#16225a", ground: "#123640", ground2: "#0e2a33", wall: "#161c4c", floorA: "#19225a", floorB: "#e0b44c", madder: "#c8452f", madderL: "#e26a4c", indigo: "#2b44a0", indigoL: "#5a7be0",
      ochre: "#dcaa3c", ochreL: "#f2d27a", iron: "#080a1a", leaf: "#4f9a5a", rose: "#e48aa0", white: "#f6eedb", paper: "#0b1030", paper2: "#151d4d", ink: "#f3e7c8", gold: "#e0b44c", muted: "#4a5694", river: "#2fa39a", sea: "#0f2a52", land: "#16205a" },
    filler: "lotus",
  },
};

/* UI tokens (CSS custom properties on body.t-<theme>) */
export const CSS = `
body.t-pichwai{
  --bg:#0b1030;--bg2:#151d4d;--ink:#f3e7c8;--muted:#9aa3c9;--accent:#e0b44c;--accent2:#e48aa0;--accent3:#2fa39a;--line:#e0b44c;--head:#f2d27a;
  --capbg:rgba(10,14,44,.94);--capshadow:0 0 0 4px rgba(224,180,76,.14),0 18px 40px rgba(0,0,0,.6);--btnbg:rgba(224,180,76,.08);--btnink:#f3e7c8;--btnshadow:0 0 0 0 transparent;
  --fh:"Gotu",serif;--fb:"Cormorant Garamond",Georgia,serif;--fbs:20px;--chip:rgba(224,180,76,.12);
}
body.t-madhubani{
  --bg:#f7ecd0;--bg2:#efdcb0;--ink:#1d1d1b;--muted:#7a6a4a;--accent:#d7262b;--accent2:#1f5fa8;--accent3:#2f8f3a;--line:#1d1d1b;--head:#1f5fa8;
  --capbg:#fbf3df;--capshadow:6px 6px 0 #f2b705;--btnbg:#f2b705;--btnink:#1d1d1b;--btnshadow:3px 3px 0 #1d1d1b;
  --fh:"Yatra One",serif;--fb:Spectral,Georgia,serif;--fbs:18px;--chip:#f3dfae;
}
body.t-madhubani .cap,body.t-madhubani .choice,body.t-madhubani .info,body.t-madhubani #modal .box{border:4px double var(--line)}
body.t-madhubani .page.on{animation:paint 1s cubic-bezier(.3,.7,.2,1)}
@keyframes paint{from{clip-path:polygon(0 0,0 0,-20% 100%,0 100%)}to{clip-path:polygon(0 0,120% 0,100% 100%,0 100%)}}
body.t-pichwai{background:radial-gradient(ellipse at 50% -10%, rgba(224,180,76,.16), transparent 55%),radial-gradient(ellipse at 100% 100%, rgba(47,163,154,.14), transparent 50%), var(--bg)}
body.t-pichwai .page.on{animation:lamp 1.1s cubic-bezier(.2,.8,.2,1)}
@keyframes lamp{from{clip-path:circle(0% at 50% 35%);filter:brightness(1.8)}to{clip-path:circle(150% at 50% 35%);filter:none}}
body.t-pichwai .stage{box-shadow:0 0 0 6px var(--bg),0 0 0 7px rgba(224,180,76,.5),0 30px 80px rgba(0,0,0,.6)}
body.t-pichwai .cap:before{content:"";position:absolute;inset:4px;border:1px solid rgba(224,180,76,.35);pointer-events:none}
/* fonts used only by these themes: Yatra One, Cormorant Garamond */
`;

/* Border tiles and background texture: [horizontal tile SVG, vertical tile SVG, texture CSS] */
export const TILES = {
  madhubani: [
    `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22' viewBox='0 0 44 22'><rect width='44' height='22' fill='#f7ecd0'/><path d='M0 1.5 H44 M0 4.5 H44 M0 17.5 H44 M0 20.5 H44' stroke='#1d1d1b' stroke-width='1.3'/><path d='M0 17 L5.5 6 L11 17Z M22 17 L27.5 6 L33 17Z' fill='#d7262b' stroke='#1d1d1b' stroke-width='.9'/><path d='M11 6 L16.5 17 L22 6Z M33 6 L38.5 17 L44 6Z' fill='#f2b705' stroke='#1d1d1b' stroke-width='.9'/></svg>`,
    `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='44' viewBox='0 0 22 44'><rect width='22' height='44' fill='#f7ecd0'/><path d='M1.5 0 V44 M4.5 0 V44 M17.5 0 V44 M20.5 0 V44' stroke='#1d1d1b' stroke-width='1.3'/><path d='M17 0 L6 5.5 L17 11Z M17 22 L6 27.5 L17 33Z' fill='#2f8f3a' stroke='#1d1d1b' stroke-width='.9'/><path d='M6 11 L17 16.5 L6 22Z M6 33 L17 38.5 L6 44Z' fill='#e5508a' stroke='#1d1d1b' stroke-width='.9'/></svg>`,
    "radial-gradient(ellipse at 15% 10%, rgba(242,183,5,.14), transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(215,38,43,.08), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(47,143,58,.06), transparent 40%)",
  ],
  pichwai: [
    `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22' viewBox='0 0 44 22'><rect width='44' height='22' fill='#0b1030'/><path d='M0 2 H44 M0 20 H44' stroke='#e0b44c' stroke-width='1.4'/><path d='M22 16 C 18 12 18 8 22 5 C 26 8 26 12 22 16Z' fill='#e48aa0' stroke='#e0b44c' stroke-width='.8'/><path d='M22 16 C 16 15 13 11 14 8 C 18 9 21 12 22 16Z M22 16 C 28 15 31 11 30 8 C 26 9 23 12 22 16Z' fill='#f3b6c3' stroke='#e0b44c' stroke-width='.8'/><circle cx='4' cy='11' r='1.6' fill='#e0b44c'/><circle cx='40' cy='11' r='1.6' fill='#e0b44c'/><path d='M6 11 H14 M30 11 H38' stroke='#2fa39a' stroke-width='1.2'/></svg>`,
    `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='44' viewBox='0 0 22 44'><rect width='22' height='44' fill='#0b1030'/><path d='M2 0 V44 M20 0 V44' stroke='#e0b44c' stroke-width='1.4'/><path d='M16 22 C 12 18 8 18 5 22 C 8 26 12 26 16 22Z' fill='#e48aa0' stroke='#e0b44c' stroke-width='.8'/><circle cx='11' cy='4' r='1.6' fill='#e0b44c'/><circle cx='11' cy='40' r='1.6' fill='#e0b44c'/><path d='M11 6 V14 M11 30 V38' stroke='#2fa39a' stroke-width='1.2'/></svg>`,
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g fill='#e0b44c' opacity='.06'><circle cx='20' cy='30' r='1.4'/><circle cx='90' cy='15' r='1'/><circle cx='70' cy='80' r='1.6'/><circle cx='15' cy='100' r='1'/><path d='M60 40 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2z'/></g></svg>`)}")`,
  ],
};

/* Motifs used only by these themes (C = the theme palette) */
export const motifs = C => ({
  lotus(x, y, r) {
    let s = `<g transform="translate(${x} ${y})">`;
    [-60, -30, 0, 30, 60].forEach((a, i) => s += `<path transform="rotate(${a})" d="M0 0 C ${r * .45} ${-r * .4} ${r * .3} ${-r * .9} 0 ${-r * 1.1} C ${-r * .3} ${-r * .9} ${-r * .45} ${-r * .4} 0 0Z" fill="${i % 2 ? C.rose : "#f3b6c3"}" stroke="${C.gold}" stroke-width="1.2"/>`);
    return s + `<path d="M${-r * .9} 2 q ${r * .9} ${r * .4} ${r * 1.8} 0" fill="${C.leaf}" stroke="${C.gold}" stroke-width="1"/></g>`;
  },
  fish(x, y, s = 1, rot = 0) {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-20 0 C -10 -13 12 -13 20 0 C 12 13 -10 13 -20 0Z" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.6"/><path d="M-20 0 L-33 -10 L-30 0 L-33 10Z" fill="${C.madder}" stroke="${C.iron}" stroke-width="1.4"/><path d="M-10 -8 V8 M-4 -10 V10 M2 -10 V10" stroke="${C.iron}" stroke-width="1"/><path d="M-12 -9 q 8 -8 16 -8" fill="none" stroke="${C.madder}" stroke-width="2"/><circle cx="11" cy="-2" r="3.4" fill="#fff" stroke="${C.iron}" stroke-width="1.2"/><circle cx="11.6" cy="-2" r="1.5" fill="${C.iron}"/></g>`;
  },
  flower5(x, y, r) {
    let s = `<g transform="translate(${x} ${y})">`;
    for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; s += `<circle cx="${(Math.cos(a) * r * .62).toFixed(1)}" cy="${(Math.sin(a) * r * .62).toFixed(1)}" r="${r * .45}" fill="${i % 2 ? C.rose : C.madder}" stroke="${C.iron}" stroke-width="1.1"/>`; }
    return s + `<circle r="${r * .35}" fill="${C.ochre}" stroke="${C.iron}" stroke-width="1.1"/></g>`;
  },
  mbird(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 C -10 -12 8 -14 14 -4 L 22 -6 L 15 0 C 8 8 -8 8 -14 0Z" fill="${C.leaf}" stroke="${C.iron}" stroke-width="1.5"/><path d="M-14 0 C -24 -4 -32 2 -38 10 C -28 6 -22 8 -14 4" fill="${C.indigoL}" stroke="${C.iron}" stroke-width="1.3"/><path d="M-4 -2 q 6 -6 12 0" fill="none" stroke="${C.iron}" stroke-width="1"/><circle cx="10" cy="-6" r="1.8" fill="${C.iron}"/><path d="M0 7 v6 M5 6 v6" stroke="${C.iron}" stroke-width="1.4"/></g>`;
  },
});

/* Theme branches that existed in the prototype's art code:
   - filler(x,y,r): madhubani → r<.35 ? fish(x,y,.7+r,(r-.17)*80) : r<.72 ? flower5(x,y,6+r*6) : mbird(x,y,.6+r*.4);
                    pichwai → r>.55 ? lotus(x,y,10+r*6) : star(x,y,3+r*4)
   - defs(): madhubani clothPat = diagonal hatching:
       <pattern id="clothPat" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.4" height="7" fill="#1d1d1b" opacity=".55"/></pattern>
   - fig() eye, madhubani (not blind/veiled): large almond eye
       <path d="M-2 -149 Q8 -160 19 -149 Q8 -141 -2 -149Z" fill="#fff" stroke="${C.iron}" stroke-width="2"/><circle cx="10" cy="-149.5" r="3.2" fill="${C.iron}"/><path d="M-2 -149 L-10 -146" stroke="${C.iron}" stroke-width="2"/><path d="M0 -158 q 9 -6 18 0" fill="none" stroke="${C.iron}" stroke-width="1.6"/>
   - pichwai ("night"): sun() adds a lamp glow `<circle r="${r*3}" fill="url(#lampG)" opacity=".5"/>`; bird(), leafSprig(), soldier(),
     arrowShape() and the horizon lines stroke in C.gold / C.ochreL instead of C.iron; leafSprig bud is C.rose;
     worldDay17 scatters 40 fillers (not 26) and lotuses (not rosettes) on the ground; worldDice adds a star scatter,
     lamp glows under each hanging lamp, lotus garlands; Kāla bands opacity .55; Deśa fog circles #2a3266. */
