import { describe, expect, it } from 'vitest';
import {
    DialogueGraphWalker,
    type DialogueGraph,
} from '../../../src/views/dialogue/dialogueGraph';

const graph = {
    id: 'prologue:dialogue/engine-fixture',
    revision: 'dialogue-revision',
    startNodeId: 'opening',
    nodes: [
        {
            kind: 'choice',
            id: 'answer',
            speaker: { kind: 'player', label: 'Rin' },
            text: 'Answer Amol.',
            choices: [
                {
                    id: 'ask-about-crows',
                    text: 'Ask about the crows.',
                    next: { kind: 'node', nodeId: 'rejoin' },
                },
                {
                    id: 'leave',
                    text: 'Leave.',
                    next: { kind: 'end' },
                },
            ],
        },
        {
            kind: 'line',
            id: 'opening',
            speaker: { kind: 'npc', npcId: 'prologue:npc/amol', label: 'Amol' },
            text: 'The crows have an opinion.',
            next: { kind: 'node', nodeId: 'answer' },
        },
        {
            kind: 'line',
            id: 'rejoin',
            speaker: { kind: 'npc', npcId: 'prologue:npc/amol', label: 'Amol' },
            text: 'They are rarely quiet.',
            next: { kind: 'end' },
        },
    ],
} as const satisfies DialogueGraph;

describe('DialogueGraphWalker', () => {
    it('follows explicit semantic edges instead of node array order', () => {
        const walker = new DialogueGraphWalker(graph);

        expect(walker.getCurrentNode()?.id).toBe('opening');
        expect(walker.advance()?.id).toBe('answer');
        expect(walker.choose('ask-about-crows')?.id).toBe('rejoin');
        expect(walker.advance()).toBeUndefined();
        expect(walker.createCompletionSubmission('completion-1')).toEqual({
            dialogueId: 'prologue:dialogue/engine-fixture',
            revision: 'dialogue-revision',
            completionId: 'completion-1',
            choicePath: ['ask-about-crows'],
        });
    });

    it('rejects unavailable choices and premature completion', () => {
        const walker = new DialogueGraphWalker(graph);

        expect(() => walker.createCompletionSubmission('completion-1')).toThrow(
            'Dialogue must reach an explicit end',
        );
        expect(() => walker.choose('leave')).toThrow('does not accept a choice');
        walker.advance();
        expect(() => walker.choose('missing-option')).toThrow('is unavailable');
    });
});
