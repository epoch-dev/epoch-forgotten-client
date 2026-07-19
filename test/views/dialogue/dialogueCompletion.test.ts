import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import type { GameEventDto } from '../../../src/common/api/.generated';
import {
    completeDialogueRun,
    createDialogueRun,
} from '../../../src/views/dialogue/dialogueCompletion';
import type { DialogueGraph } from '../../../src/views/dialogue/dialogueGraph';
import { useGameStore } from '../../../src/views/game/GameStore';
import { GameView } from '../../../src/views/game/types';

const mocks = vi.hoisted(() => ({
    completeDialogue: vi.fn(),
}));

vi.mock('../../../src/common/api/client', () => ({
    npcsClient: {
        completeDialogue: mocks.completeDialogue,
    },
    scenesClient: {
        currentScene: vi.fn(),
    },
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
        data: {
            dialogueId: graph.id,
            events,
        },
    });
}

describe('dialogue completion', () => {
    beforeEach(() => {
        mocks.completeDialogue.mockReset();
        useGameStore.setState({
            view: GameView.Party,
            npcName: undefined,
            encounterName: undefined,
        });
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
        expect(useGameStore.getState().view).toBe(GameView.Party);
    });

    it.each([
        {
            name: 'defaults to World when no event navigates',
            events: [] as GameEventDto[],
            expectedView: GameView.World,
        },
        {
            name: 'lets a chained dialogue override World',
            events: [
                {
                    kind: 'dialogue-opened',
                    npcId: 'prologue:npc/elias',
                    dialogueId: 'prologue:dialogue/elias-follow-up',
                    startNodeId: 'opening',
                },
            ] satisfies GameEventDto[],
            expectedView: GameView.Dialogue,
        },
        {
            name: 'lets an encounter override World',
            events: [
                {
                    kind: 'encounter-started',
                    encounterId: 'prologue:encounter/wolves',
                },
            ] satisfies GameEventDto[],
            expectedView: GameView.Battle,
        },
    ])('$name', async ({ events, expectedView }) => {
        mockCompletion(events);

        await completeDialogueRun('prologue:npc/amol', createCompletedRun());

        expect(useGameStore.getState().view).toBe(expectedView);
    });
});
