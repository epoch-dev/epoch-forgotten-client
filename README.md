# Epoch: Forgotten - client

[![CI](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/ci.yaml/badge.svg)](https://github.com/epoch-dev/epoch-forgotten-client/actions/workflows/ci.yaml)

Browser client for Epoch Forgotten. React 18, Vite 6, Phaser scenes, hash router.

## Requirements

- Node.js
- Sibling `epoch-forgotten` repo (content preview sync and API client sync)
- Git submodule init for static assets (see below)

## Setup

1. Install dependencies:

```bash
yarn install
```

2. Fetch static assets:

```bash
git submodule update --init --recursive
```

3. Generate the API client (see [API client](#api-client)):

```bash
yarn gen-client:sync
```

4. Optional: sync content preview for Content Lab:

```bash
yarn content:sync-preview
```

Bundle path: `src/content/.generated/preview-bundle.json` (gitignored, protocol v3).

## Running

```bash
yarn dev
```

Content Lab (dev only): `#/content-lab`. Lazy-loaded when `import.meta.env.DEV` is true.

## Building

```bash
yarn build
```

Production builds exclude Content Lab and the preview bundle chunk.

## Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Local dev server |
| `yarn build` | Production build |
| `yarn test` | Vitest unit tests |
| `yarn lint` | ESLint |
| `yarn content:sync-preview` | Pull preview bundle v3 from sibling backend repo |
| `yarn gen-client:sync` | Regenerate the sibling backend spec and this client’s Orval output |

## Runtime integration

| Piece | Location |
|-------|----------|
| Generated API | `src/common/api/.generated/` |
| Dialogue graph walker | `src/views/dialogue/dialogueGraph.ts` |
| Dialogue completion | `src/views/dialogue/dialogueCompletion.ts` |
| Journal | `src/views/journal/` (`QuestJournalEntryDto`) |
| Game events | `src/common/services/GameEventHandler.ts` |

Server is authoritative for conditions, dialogue completion, quest lifecycle, and rewards. Client renders semantic dialogue graphs, submits the choice path, and handles exhaustive `GameEvent` kinds.

## Content preview

After backend pack changes, from either repo:

```bash
yarn content:sync-preview
```

Open `#/content-lab` in the browser. The loader deep-validates bundle v3 (catalog, conditions, commands). Stale v1/v2 bundles are rejected with recovery text. Never edit `src/content/.generated/preview-bundle.json` by hand.

Preview skill: `.cursor/skills/content-preview` in this repo.

## API client

Run `yarn gen-client:sync` after backend OpenAPI changes. It runs backend `yarn gen-api` in the
sibling repo, then Orval into `src/common/api/.generated/`. Orval requires Node.js 22.18 or newer.

CI regenerates the client from the backend commit pinned in `.server-ref` (an exact 40-character
`epoch-forgotten` SHA). When the client needs newer backend API changes, push those backend
commits first, then update the pin in the same client change:

```bash
git -C ../epoch-forgotten rev-parse HEAD > .server-ref
```

Manual CI runs accept an optional `server_ref` input that overrides the file. Branch names are
rejected. CI runs on `main` (pushes and manual runs) deploy to GitHub Pages after verification
passes.

## Generated files

| Path | Purpose |
|------|---------|
| `src/common/api/.generated/` | OpenAPI TypeScript Axios client |
| `src/content/.generated/` | Synced preview bundle v3 for Content Lab |

Do not commit or hand-edit generated files.

## Troubleshooting

If the TypeScript server misses updated API return types, reload the editor window after regenerating the client.

If Content Lab shows a stale-bundle error, run `yarn content:sync-preview` from either repo.
