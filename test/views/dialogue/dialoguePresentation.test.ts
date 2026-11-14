import { describe, expect, it } from 'vitest';
import type { DialoguePresentationDto } from '../../../src/common/api/.generated';
import {
    getLineImageUrl,
    getSpeakerImageUri,
    toDialogueGraph,
} from '../../../src/views/dialogue/dialoguePresentation';
import { DialogueGraphWalker } from '../../../src/views/dialogue/dialogueGraph';

const presentation = {
    id: 'prologue:dialogue/test',
    revision: 'rev-1',
    startNodeId: 'opening',
    nodes: [
        {
            id: 'opening',
            kind: 'line',
            text: 'Hello there.',
            speaker: { kind: 'npc', npcId: 'prologue:npc/martha', label: 'Martha' },
            next: { kind: 'node', nodeId: 'answer' },
        },
        {
            id: 'answer',
            kind: 'choice',
            text: 'What now?',
            speaker: { kind: 'player', label: 'Rin' },
            choices: [
                {
                    id: 'leave',
                    text: 'Leave.',
                    next: { kind: 'end' },
                },
            ],
        },
    ],
} satisfies DialoguePresentationDto;

describe('dialoguePresentation', () => {
    it('maps generated dialogue presentation into a semantic graph', () => {
        const graph = toDialogueGraph(presentation);
        const walker = new DialogueGraphWalker(graph);

        expect(walker.getCurrentNode()?.id).toBe('opening');
        expect(walker.getCurrentNode()?.speaker).toEqual({
            kind: 'npc',
            npcId: 'prologue:npc/martha',
            label: 'Martha',
            imageUri: undefined,
        });
        expect(walker.advance()?.id).toBe('answer');
        expect(walker.choose('leave')).toBeUndefined();
        expect(walker.createCompletionSubmission('completion-1')).toEqual({
            dialogueId: 'prologue:dialogue/test',
            revision: 'rev-1',
            completionId: 'completion-1',
            choicePath: ['leave'],
        });
    });

    it('carries line imageUri separately from speaker portrait', () => {
        const withArtwork = {
            ...presentation,
            nodes: [
                {
                    id: 'opening',
                    kind: 'line',
                    text: 'The vessel glows.',
                    speaker: {
                        kind: 'npc',
                        npcId: 'prologue:npc/vargoth',
                        label: 'Vargoth',
                        imageUri: 'story/gen-vargoth.png',
                    },
                    imageUri: 'story/bracelet-vessel.png',
                    next: { kind: 'end' },
                },
            ],
        } satisfies DialoguePresentationDto;

        const node = toDialogueGraph(withArtwork).nodes[0];
        expect(node).toMatchObject({
            kind: 'line',
            imageUri: 'story/bracelet-vessel.png',
            speaker: {
                kind: 'npc',
                label: 'Vargoth',
                imageUri: 'story/gen-vargoth.png',
            },
        });
        expect(getSpeakerImageUri(node.speaker)).toBe('story/gen-vargoth.png');
        expect(node.kind === 'line' ? node.imageUri : undefined).toBe('story/bracelet-vessel.png');
        expect(getLineImageUrl('story/bracelet-vessel.png')).toContain('story/bracelet-vessel.png');
    });

    it('keeps narrator lines without speaker portrait', () => {
        const narratorLine = {
            ...presentation,
            nodes: [
                {
                    id: 'narration',
                    kind: 'line',
                    text: 'A cold wind rises.',
                    speaker: { kind: 'narrator' },
                    imageUri: 'story/fox-omen.png',
                    next: { kind: 'end' },
                },
            ],
        } satisfies DialoguePresentationDto;

        const node = toDialogueGraph(narratorLine).nodes[0];
        expect(node.kind).toBe('line');
        if (node.kind !== 'line') {
            throw new Error('Expected a line node');
        }
        expect(getSpeakerImageUri(node.speaker)).toBeUndefined();
        expect(node.imageUri).toBe('story/fox-omen.png');
        if (!node.imageUri) {
            throw new Error('Expected narrator line artwork');
        }
        expect(getLineImageUrl(node.imageUri)).toContain('story/fox-omen.png');
    });

    it('rejects an NPC speaker without its canonical label', () => {
        const missingLabel = {
            ...presentation,
            nodes: [
                {
                    id: 'opening',
                    kind: 'line',
                    text: 'Hello there.',
                    speaker: {
                        kind: 'npc',
                        npcId: 'prologue:npc/martha',
                    },
                    next: { kind: 'end' },
                },
            ],
        } as DialoguePresentationDto;

        expect(() => toDialogueGraph(missingLabel)).toThrow(
            'Dialogue npc speaker is missing label',
        );
    });
});
