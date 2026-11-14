---
name: content-preview
description: Syncs and reviews Epoch Forgotten content in dev Content Lab after backend pack changes. Validates preview bundle v3, deep guard, semantic dialogue graphs, quest lifecycle, balance findings, and asset inventory. Use when validating dialogues, scenes, quests, or compiler diagnostics in the preview UI.
---

# Content preview

Dev-only visual check. No pack edits in this skill unless the user also requests authoring.

## Invocation

Invoke `/content-preview` after a passing backend `yarn content:check` and preview sync.

## Prerequisites

- Sibling repo `epoch-forgotten` with passing `yarn content:check`
- Client dev server: `yarn dev`
- Synced bundle v3:

```bash
yarn content:sync-preview
# or from backend: yarn content:sync-preview
```

Bundle path: `src/content/.generated/preview-bundle.json` (gitignored). Protocol v3; catalog/report/pack protocols remain v1.

## Workflow

1. Confirm backend content check passed (`yarn content:check` in API repo).
2. Sync preview bundle to client.
3. Open `#/content-lab` in the browser.
4. Walk sections relevant to the change:

| Section | Verify |
|---------|--------|
| overview | source hash, balance/compiler issues |
| scenes | geometry, NPCs, passages, encounter overlays |
| dialogues | `startNodeId`, semantic node/option IDs, typed speakers, explicit edges/end, unreachable diagnostics, choice conditions, command/event traces |
| npc-dialogues | ordered priority conditions and fixed/random fallback per NPC |
| quests | hidden/discovered/active/on-hold/completed/failed, `journalHint`, `initialStageId`, stages, named goals, transition graph, traces |
| assets | missing or broken URIs |

5. If bundle fails to load, follow on-screen recovery command. Do not create stub JSON by hand. Stale v1/v2 bundles must be re-synced, not patched.
6. For prose concerns, compare against `epoch-forgotten/docs/content/character-voice.md` and run `/avoid-ai-writing` on flagged lines.

## Hard rules

- Never edit `src/content/.generated/preview-bundle.json` by hand.
- Never commit `preview-bundle.json`.
- Never enable Content Lab in production builds.
- Route authoring fixes through `/content-author`; brief and dependency-graph approvals still apply.
- Guard deep-validates conditions and `ContentCommand` payloads. Do not assume top-level shape alone is enough.
- Report mismatches as backend pack or sync issues, not loader hacks.

## Output

Report: bundle version, source hash, sections checked, diagnostic notes, balance/asset blockers, whether sync is current.
