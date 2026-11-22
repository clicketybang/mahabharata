# Mahābhārata — The Painted Epic

A scroll-driven, branching retelling of the Mahābhārata in the manner of Srikalahasti Kalamkari.

- Static site: [Astro](https://astro.build) with React islands; content as data (JSON + MDX).
- Planning docs (roadmap, base rules, scene design) live in the claude.ai project "Mahabharat".

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Checks

```sh
npm run validate        # story-graph validator: the chronology guard (base-rules Rule 1)
npm run test:validator  # fixtures: one deliberate break per rule, each must fail for its own reason
npm run test:parity     # Playwright walk-through of the reader (needs Chrome + `pip install playwright`)
```

`npm run build` runs the validator first, so content that breaks the rules can't deploy.

## Content

- `src/content/moments/*.mdx`: one file per moment. Facts (story time, place, cast, branches, `ce_ref`) go in the frontmatter, and beats go underneath as `<Beat>` and `<Jump>` prose.
- `src/content/{people,places,edges,tellings}.json`
- Authors declare only `branches: [[character, id] | [place, id]]`. The reader generates the actual choices with `src/engine/rule.js`, the same module the validator checks.
