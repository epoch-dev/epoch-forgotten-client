import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { GameEventDto } from '../../../src/common/api/.generated';
import {
    completeDialogueRun,
    createDialogueRun,
} from '../../../src/views/dialogue/dialogueCompletion';
import type { DialogueGraph } from '../../../src/views/dialogue/dialogueGraph';

const mocks = vi.hoisted(() => ({
    completeDialogue: vi.fn(),
}));

vi.mock('../../../src/common/api/.generated', () => ({
    completeDialogue: mocks.completeDialogue,
}));

const graph = {
    id: 'prologue:dialogue/completion-test',
    revision: 'revision-1',
    startNodeId: 'line',
    nodes: [
        {
            kind: 'line',
            id: 'line',
            speaker: { kind: 'narrator' },
            text: 'Done.',
            next: { kind: 'end' },
        },
    ],
} as const satisfies DialogueGraph;

function createCompletedRun() {
    const run = createDialogueRun(graph);
    run.walker.advance();
    return run;
}

function mockCompletion(events: readonly GameEventDto[]): void {
    mocks.completeDialogue.mockResolvedValue({
        dialogueId: graph.id,
        events,
    });
}

describe('dialogue completion', () => {
    beforeEach(() => {
        mocks.completeDialogue.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reuses one completion ID for transport retries and creates a new ID for a new run', async () => {
        vi.spyOn(crypto, 'randomUUID')
            .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
            .mockReturnValueOnce('00000000-0000-4000-8000-000000000002');
        mockCompletion([]);
        mocks.completeDialogue.mockRejectedValueOnce(new Error('response lost'));

        const firstRun = createCompletedRun();
        await expect(completeDialogueRun('prologue:npc/amol', firstRun)).rejects.toThrow(
            'response lost',
        );
        await completeDialogueRun('prologue:npc/amol', firstRun);

        const secondRun = createCompletedRun();
        await completeDialogueRun('prologue:npc/amol', secondRun);

        const basePayload = {
            npcId: 'prologue:npc/amol',
            dialogueId: graph.id,
            revision: graph.revision,
            choicePath: [],
        };
        expect(mocks.completeDialogue).toHaveBeenNthCalledWith(1, {
            ...basePayload,
            completionId: '00000000-0000-4000-8000-000000000001',
        });
        expect(mocks.completeDialogue).toHaveBeenNthCalledWith(2, {
            ...basePayload,
            completionId: '00000000-0000-4000-8000-000000000001',
        });
        expect(mocks.completeDialogue).toHaveBeenNthCalledWith(3, {
            ...basePayload,
            completionId: '00000000-0000-4000-8000-000000000002',
        });
    });

    it('returns stale without leaving dialogue when completion is rejected with 409', async () => {
        const staleError = new AxiosError('Conflict');
        staleError.response = {
            status: 409,
            data: { message: 'Dialogue changed' },
        } as AxiosError['response'];
        mocks.completeDialogue.mockRejectedValue(staleError);

        const run = createCompletedRun();
        const result = await completeDialogueRun('prologue:npc/amol', run);

        expect(result).toEqual({ status: 'stale' });
    });

    it('returns accepted server events without applying a client outcome', async () => {
        const events = [
            {
                kind: 'dialogue-opened',
                npcId: 'prologue:npc/elias',
                label: 'Elias',
                dialogueId: 'prologue:dialogue/elias-follow-up',
                startNodeId: 'opening',
            },
        ] satisfies GameEventDto[];
        mockCompletion(events);

        await expect(completeDialogueRun('prologue:npc/amol', createCompletedRun())).resolves.toEqual({
            status: 'completed',
            events,
        });

        expect(mocks.completeDialogue).toHaveBeenCalledOnce();
    });
});
