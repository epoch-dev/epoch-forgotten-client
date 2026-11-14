import { describe, expect, it } from 'vitest';
import { traceCommand } from '../../src/content/commandTrace';
import {
    projectDialogueGraph,
    projectNpcDialogues,
    projectQuest,
    projectScene,
    projectSpeaker,
    summarizeCondition,
} from '../../src/content/projections';
import { previewBundleFixture } from '../fixtures/previewBundle';

describe('content projections', () => {
    it('projects explicit dialogue graph edges', () => {
        const graph = projectDialogueGraph(
            previewBundleFixture.catalog.dialogue['core:dialogue/branch'],
            previewBundleFixture.catalog,
        );
        expect(graph.startNodeId).toBe('opening');
        expect(graph.nodes.find((node) => node.id === 'choose-path')?.choices).toHaveLength(2);
        expect(graph.nodes.find((node) => node.id === 'rejoin')?.next?.target).toBe('end');
    });

    it('projects typed speakers and semantic choice targets', () => {
        const graph = projectDialogueGraph(
            previewBundleFixture.catalog.dialogue['core:dialogue/branch'],
            previewBundleFixture.catalog,
        );
        const choiceNode = graph.nodes.find((node) => node.id === 'choose-path');
        expect(choiceNode?.speaker).toEqual({ kind: 'player', label: 'player' });
        expect(choiceNode?.choices?.[0]).toMatchObject({
            id: 'left',
            next: { target: 'left-path' },
        });
        expect(
            projectSpeaker(
                { kind: 'npc', npcId: 'core:npc/innkeeper' },
                previewBundleFixture.catalog,
            ),
        ).toEqual({
            kind: 'npc',
            label: 'Innkeeper',
            reference: 'core:npc/innkeeper',
        });
    });

    it('projects npc dialogue priority and fallback selection', () => {
        const npcDialogues = projectNpcDialogues(previewBundleFixture.catalog);
        expect(npcDialogues[0]).toMatchObject({
            npcId: 'core:npc/innkeeper',
            label: 'Innkeeper',
            title: 'Inn Keeper',
            priority: [
                {
                    dialogueId: 'core:dialogue/branch',
                    conditionSummary: 'always=true',
                    order: 1,
                },
            ],
            fallback: {
                kind: 'fixed',
                dialogueId: 'core:dialogue/branch',
            },
        });
    });

    it('projects quest lifecycle, goals, and transition command traces', () => {
        const quest = projectQuest(previewBundleFixture.catalog.quest['core:quest/tutorial']);
        expect(quest.journalHint).toBe('Talk to the innkeeper.');
        expect(quest.initialStageId).toBe('speak-with-innkeeper');
        expect(quest.stages[1]?.goals[0]?.reference).toBe('core:item/potion');
        expect(
            quest.transitions.find((entry) => entry.transitionId === 'advance-to-collection')?.commandTraces[0],
        ).toMatchObject({
            commandSummary: 'grant-gold 5',
            expectedEvents: ['gold-granted (5)'],
        });
    });

    it('summarizes semantic quest conditions', () => {
        expect(
            summarizeCondition({
                kind: 'quest-current-stage',
                questId: 'core:quest/tutorial',
                stageId: 'collect-potion',
            }),
        ).toBe('quest-current-stage core:quest/tutorial collect-potion');
    });

    it('projects scene geometry, entities, and encounter overlays', () => {
        const scene = projectScene(
            'core:scene/test',
            previewBundleFixture.catalog.scene['core:scene/test'],
            previewBundleFixture.catalog,
        );
        expect(scene.entities).toContainEqual({
            kind: 'npc',
            x: 10,
            y: 0,
            label: 'Innkeeper',
        });
        expect(scene.overlays).toHaveLength(1);
    });

    it('maps commands to descriptive expected event metadata', () => {
        expect(traceCommand({ kind: 'discover-quest', questId: 'core:quest/tutorial' })).toMatchObject({
            expectedEvents: ['quest-discovered (core:quest/tutorial)'],
            note: 'Preview metadata only.',
        });
    });
});
