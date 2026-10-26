import { describe, expect, it } from 'vitest';
import { describePreviewBundleErrors } from '../../src/content/guard';
import { isPreviewContentCommand } from '../../src/content/commandTrace';
import { previewBundleFixture } from '../fixtures/previewBundle';

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const asArray = (value: unknown): readonly unknown[] =>
    Array.isArray(value) ? value : [];

const catalogEntryError = (kind: string, id: string) => [
    expect.stringContaining(`Catalog ${kind} "${id}" must be a `),
];

describe('describePreviewBundleErrors', () => {
    it('accepts consume-item commands emitted by the server preview bundle', () => {
        expect(
            isPreviewContentCommand({
                kind: 'consume-item',
                itemId: 'prologue:item/wolf-fang',
                quantity: 1,
            }),
        ).toBe(true);
    });

    it('accepts a valid preview bundle fixture', () => {
        expect(describePreviewBundleErrors(previewBundleFixture)).toEqual([]);
        expect(previewBundleFixture.version).toBe(3);
    });

    it('rejects bundles with mismatched source hashes', () => {
        expect(
            describePreviewBundleErrors({
                ...previewBundleFixture,
                sourceHash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            }),
        ).toEqual(['sourceHash does not match report.sourceHash.']);
    });

    it('rejects an NPC without a canonical identity label', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        id: 'core:npc/innkeeper',
                        title: 'Inn Keeper',
                        dialogues: {
                            priority: [
                                {
                                    dialogueId: 'core:dialogue/branch',
                                    condition: { kind: 'always', value: true },
                                },
                            ],
                            fallback: {
                                kind: 'fixed',
                                dialogueId: 'core:dialogue/branch',
                            },
                        },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects legacy dialogues[] npc selection', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        ...previewBundleFixture.catalog.npc['core:npc/innkeeper'],
                        dialogues: [
                            {
                                dialogueId: 'core:dialogue/branch',
                                condition: { kind: 'always', value: true },
                            },
                        ],
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects malformed npc priority conditions', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        ...previewBundleFixture.catalog.npc['core:npc/innkeeper'],
                        dialogues: {
                            priority: [
                                {
                                    dialogueId: 'core:dialogue/branch',
                                    condition: 'not-an-object',
                                },
                            ],
                            fallback: {
                                kind: 'fixed',
                                dialogueId: 'core:dialogue/branch',
                            },
                        },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects malformed npc fallback discriminants', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        ...previewBundleFixture.catalog.npc['core:npc/innkeeper'],
                        dialogues: {
                            priority: [],
                            fallback: {
                                kind: 'weighted',
                                dialogueId: 'core:dialogue/branch',
                            },
                        },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects empty random npc fallback pools', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        ...previewBundleFixture.catalog.npc['core:npc/innkeeper'],
                        dialogues: {
                            priority: [],
                            fallback: {
                                kind: 'random',
                                dialogueIds: ['core:dialogue/branch'],
                            },
                        },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects missing npc priority dialogue ids', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        ...previewBundleFixture.catalog.npc['core:npc/innkeeper'],
                        dialogues: {
                            priority: [
                                {
                                    dialogueId: '',
                                    condition: { kind: 'always', value: true },
                                },
                            ],
                            fallback: {
                                kind: 'fixed',
                                dialogueId: 'core:dialogue/branch',
                            },
                        },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects unknown npc dialogue selection fields', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                npc: {
                    'core:npc/innkeeper': {
                        ...previewBundleFixture.catalog.npc['core:npc/innkeeper'],
                        dialogues: {
                            priority: [],
                            fallback: {
                                kind: 'fixed',
                                dialogueId: 'core:dialogue/branch',
                            },
                            marker: 'legacy',
                        },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('npc', 'core:npc/innkeeper'));
    });

    it('rejects legacy dialogue author fields with a precise diagnostic', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                dialogue: {
                    'core:dialogue/stale': {
                        id: 'core:dialogue/stale',
                        nodes: [{ id: 'opening', author: 'A', text: 'Hi' }],
                    },
                },
            },
        };
        expect(describePreviewBundleErrors(stale)).toEqual([
            expect.stringContaining('Catalog dialogue "core:dialogue/stale" must be a semantic dialogue graph (startNodeId'),
        ]);
    });

    it('rejects legacy quest transition maps', () => {
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                quest: {
                    'core:quest/stale': {
                        id: 'core:quest/stale',
                        label: 'Stale',
                        stages: [],
                        transitions: {
                            start: { kind: 'start', to: { stageId: 'stage1', state: 'In-progress' } },
                        },
                    },
                },
            },
        };
        expect(describePreviewBundleErrors(stale)).toEqual([
            expect.stringContaining('Catalog quest "core:quest/stale" must be a quest definition'),
        ]);
    });

    it('rejects malformed dialogue choice conditions', () => {
        const dialogue = previewBundleFixture.catalog.dialogue['core:dialogue/branch'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                dialogue: {
                    'core:dialogue/branch': {
                        ...dialogue,
                        nodes: asArray(dialogue.nodes).map((node) =>
                            isRecord(node) && node.id === 'choose-path'
                                ? {
                                    ...node,
                                    choices: [
                                        {
                                            id: 'left',
                                            text: 'Left',
                                            next: {
                                                kind: 'node',
                                                nodeId: 'left-path',
                                            },
                                            condition: 'not-an-object',
                                        },
                                        {
                                            id: 'right',
                                            text: 'Right',
                                            next: {
                                                kind: 'node',
                                                nodeId: 'right-path',
                                            },
                                        },
                                    ],
                                }
                                : node,
                        ),
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('dialogue', 'core:dialogue/branch'));
    });

    it('rejects malformed nested dialogue conditions', () => {
        const dialogue = previewBundleFixture.catalog.dialogue['core:dialogue/branch'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                dialogue: {
                    'core:dialogue/branch': {
                        ...dialogue,
                        nodes: asArray(dialogue.nodes).map((node) =>
                            isRecord(node) && node.id === 'choose-path'
                                ? {
                                    ...node,
                                    choices: [
                                        {
                                            id: 'left',
                                            text: 'Left',
                                            next: { kind: 'end' },
                                            condition: {
                                                kind: 'all',
                                                conditions: [{ kind: 'flag', flagId: 'flag' }],
                                            },
                                        },
                                    ],
                                }
                                : node,
                        ),
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('dialogue', 'core:dialogue/branch'));
    });

    it('rejects malformed dialogue choice command arrays', () => {
        const dialogue = previewBundleFixture.catalog.dialogue['core:dialogue/branch'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                dialogue: {
                    'core:dialogue/branch': {
                        ...dialogue,
                        nodes: asArray(dialogue.nodes).map((node) =>
                            isRecord(node) && node.id === 'choose-path'
                                ? {
                                    ...node,
                                    choices: [
                                        {
                                            id: 'left',
                                            text: 'Left',
                                            next: {
                                                kind: 'node',
                                                nodeId: 'left-path',
                                            },
                                            commands: {
                                                kind: 'grant-gold',
                                                amount: 5,
                                            },
                                        },
                                        {
                                            id: 'right',
                                            text: 'Right',
                                            next: {
                                                kind: 'node',
                                                nodeId: 'right-path',
                                            },
                                        },
                                    ],
                                }
                                : node,
                        ),
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('dialogue', 'core:dialogue/branch'));
    });

    it('rejects malformed graph completion command arrays', () => {
        const dialogue = previewBundleFixture.catalog.dialogue['core:dialogue/branch'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                dialogue: {
                    'core:dialogue/branch': {
                        ...dialogue,
                        completionCommands: { kind: 'grant-gold', amount: 5 },
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('dialogue', 'core:dialogue/branch'));
    });

    it('rejects malformed quest transition conditions', () => {
        const quest = previewBundleFixture.catalog.quest['core:quest/tutorial'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                quest: {
                    'core:quest/tutorial': {
                        ...quest,
                        transitions: [
                            {
                                id: 'begin-tutorial',
                                kind: 'start',
                                toStageId: 'speak-with-innkeeper',
                                condition: [],
                            },
                            ...asArray(quest.transitions).slice(1),
                        ],
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('quest', 'core:quest/tutorial'));
    });

    it('rejects a transition condition with an invalid discriminant payload', () => {
        const quest = previewBundleFixture.catalog.quest['core:quest/tutorial'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                quest: {
                    'core:quest/tutorial': {
                        ...quest,
                        transitions: [
                            {
                                id: 'begin-tutorial',
                                kind: 'start',
                                toStageId: 'speak-with-innkeeper',
                                condition: {
                                    kind: 'quest-status',
                                    questId: 'core:quest/tutorial',
                                    status: 'unknown',
                                },
                            },
                            ...asArray(quest.transitions).slice(1),
                        ],
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('quest', 'core:quest/tutorial'));
    });

    it('rejects malformed quest transition commands', () => {
        const quest = previewBundleFixture.catalog.quest['core:quest/tutorial'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                quest: {
                    'core:quest/tutorial': {
                        ...quest,
                        transitions: [
                            {
                                id: 'begin-tutorial',
                                kind: 'start',
                                toStageId: 'speak-with-innkeeper',
                                condition: { kind: 'always', value: true },
                                commands: [{ kind: 'grant-gold', amount: 'five' }],
                            },
                            ...asArray(quest.transitions).slice(1),
                        ],
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('quest', 'core:quest/tutorial'));
    });

    it('rejects unknown command kinds', () => {
        const dialogue = previewBundleFixture.catalog.dialogue['core:dialogue/branch'];
        const stale = {
            ...previewBundleFixture,
            catalog: {
                ...previewBundleFixture.catalog,
                dialogue: {
                    'core:dialogue/branch': {
                        ...dialogue,
                        completionCommands: [{ kind: 'delete-save' }],
                    },
                },
            },
        };

        expect(describePreviewBundleErrors(stale)).toEqual(catalogEntryError('dialogue', 'core:dialogue/branch'));
    });

    it('rejects asset inventory entries without a valid category', () => {
        expect(
            describePreviewBundleErrors({
                ...previewBundleFixture,
                report: {
                    ...previewBundleFixture.report,
                    assets: {
                        references: [{ category: 'unknown', reference: 'music.ogg' }],
                    },
                },
            }),
        ).toEqual(['Invalid report block.']);
    });
});
