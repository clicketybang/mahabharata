# Mobile performance — Sprint 2 (D3: measure first)

**Decision: no conversion to images needed.** Both painted scenes already scroll at a steady 60 frames per second on an emulated mid-range phone. Converting the worlds to raster images would cost the crisp line work for no measurable gain.

## Method
`npm run test:perf` (tests/perf/perf_check.py): Chrome at 390×844 (3× pixel density), touch, **4× CPU slowdown**. For each built scene it scrolls the whole scene in 120 steps, recording every animation frame and long task. It then taps three progress dots and opens and closes the maps, recording interaction latency (Event Timing API).
Lighthouse (mobile preset) measures the home page load.

## Results
| | Dice hall, before | Dice hall, after | Day 17, before | Day 17, after |
|---|---|---|---|---|
| Frame time, median | 16.7 ms | 16.7 ms | 16.7 ms | 16.7 ms |
| Frame time, 95th percentile | 16.8 ms | 16.8 ms | 16.7 ms | 16.8 ms |
| Janky frames (>50 ms) | 0.2% | 0.2% | 0.2% | 0.2% |
| Long tasks during scroll + taps | 2 (max 116 ms) | 2 (max 112 ms) | 1 (56 ms) | 1 (51 ms) |
| Slowest interaction | 160 ms | 160 ms | 96 ms | 88 ms |
| SVG elements in the world | 1,189 | 1,189 | 1,676 | 1,676 |

The slowest interaction (opening the maps, which draws the Kāla chart) stays under the 200 ms "good" threshold for Interaction to Next Paint.

Lighthouse, home page (mobile): **Performance 99 · Accessibility 100 · Best practices 100 · SEO 100** after adding a page description (was 90). Largest paint 1.7 s, total blocking time 20–30 ms.

## Caveats and what to watch
- Headless Chrome can't fully model a phone's graphics chip. **The owner should spot-check on a real mid-range Android phone and an iPhone (Safari)** as part of the Sprint 2 review.
- The cost grows with scene complexity. When artisan panels arrive (Sprints 9–11), the layered digitisation pipeline will be measured with this same script; images become the right choice there because the source is a scan, not vector art.
- Re-run `npm run test:perf` whenever a world gains more than about 30% more elements.
