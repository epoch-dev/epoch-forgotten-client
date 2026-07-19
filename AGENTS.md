# Epoch Forgotten - Client

Browser client for Epoch Forgotten. React 18, Vite 6, Phaser scenes, hash router.

## Commands

| Script | Purpose |
|--------|---------|
| `yarn dev` | Local dev server |
| `yarn build` | Production build |
| `yarn test` | Vitest unit tests |
| `yarn lint` | ESLint, zero warnings |
| `yarn content:sync-preview` | Pull preview bundle v3 from sibling `epoch-forgotten` repo |
| `yarn gen-client:sync` | Regenerate and copy API client from sibling backend repo |

## Content preview (dev only)

Content Lab lives at `#/content-lab`. It is lazy-loaded only when `import.meta.env.DEV` is true. Production builds exclude Content Lab and preview bundle chunks.

| Piece | Location |
|-------|----------|
| Loader / guard | `src/content/loader.ts`, `guard.ts` |
| Projections | `src/content/projections.ts` |
| Command traces | `src/content/commandTrace.ts` |
| Asset checks | `src/content/assets.ts` |
| UI | `src/views/content-lab/` |
| Synced bundle | `src/content/.generated/preview-bundle.json` (gitignored, protocol v3) |

Preview guard validates bundle version 3, deep-checks conditions and every `ContentCommand` payload, and rejects stale v1/v2 bundles with `yarn content:sync-preview` recovery text.

Sync workflow from backend repo:

```bash
cd ../epoch-forgotten && yarn content:sync-preview
```

Or from client: `yarn content:sync-preview`.

If the bundle is missing, Content Lab shows recovery text with that command. The loader uses a Vite-ignored dynamic import so production builds succeed without the file.

Preview skill: `.cursor/skills/content-preview`.

## API and game events

OpenAPI-generated client lives in `src/common/api/.generated/`. Regenerate from backend with `yarn gen-client:sync` (JDK 21+ or Docker on backend).

| API | Client use |
|-----|------------|
| `GET /npcs/{npcName}` | Dialogue presentation + semantic graph |
| `POST /npcs/complete` | Submit choice path; receive `GameEvent[]` |
| `GET /quests/journal` | Journal lifecycle entries |

`GameEventHandler` (`src/common/services/GameEventHandler.ts`) must handle every `GameEvent` kind exhaustively. No local Effects accumulation or client-authored mutations.

## Boundaries

- **Always do:** Match backend DTO contracts; run `yarn lint` and `yarn test` after content-facing changes; use semantic graph navigation by node ID.
- **Ask first:** New dependencies; changes to production routing or auth.
- **Never do:** Edit `src/content/.generated/preview-bundle.json` by hand; ship Content Lab in production; add backend calls inside Content Lab; walk dialogue by array index; infer quest state from stage names.
