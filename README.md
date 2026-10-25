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

3. Sync the OpenAPI client from the backend (after API schema changes):

```bash
yarn gen-client:sync
```

Generated API types live in `src/common/api/.generated/` (gitignored). Orval generation requires Node.js 22.18 or newer.

4. Optional: sync content preview for Content Lab:

```bash
yarn content:sync-preview
```

Bundle path: `src/content/.generated/preview-bundle.json` (gitignored, protocol v3).

## Running

### Dev

```bash
yarn dev
```

Content Lab (dev only): `#/content-lab`. Lazy-loaded when `import.meta.env.DEV` is true.

### Stage

```bash
yarn stage
```

## Building

### Stage

```bash
yarn build:stage
```

### Production

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

Regenerate when backend OpenAPI changes:

```bash
yarn gen-client:sync
```

`gen-client:sync` first runs backend `yarn gen-api`, then runs this repository's Orval configuration into `src/common/api/.generated/`.

CI and deployment regenerate the ignored client from an immutable backend revision. Set the
`EPOCH_FORGOTTEN_SERVER_REF` Actions repository variable to an exact 40-character
`epoch-forgotten` commit SHA for push and pull-request CI. Manual CI and deployment runs require
the same SHA as `server_ref`; branch names are rejected.

Until the corresponding backend API changes are committed and pushed, no valid SHA exists. Do not
update the repository variable or start a deployment before that commit is available remotely.

## Generated files

| Path | Purpose |
|------|---------|
| `src/common/api/.generated/` | OpenAPI TypeScript Axios client |
| `src/content/.generated/` | Synced preview bundle v3 for Content Lab |

Do not commit or hand-edit generated files.

## Troubleshooting

If the TypeScript server misses updated API return types, reload the editor window after `yarn gen-client:sync`.

If Content Lab shows a stale-bundle error, run `yarn content:sync-preview` from either repo.
