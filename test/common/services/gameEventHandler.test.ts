import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameEventDto } from '../../../src/common/api/.generated';
import { GameView } from '../../../src/views/game/types';

const mocks = vi.hoisted(() => ({
    setState: vi.fn(),
    loadScene: vi.fn(),
    getState: vi.fn(() => ({ scene: { loadScene: mocks.loadScene } })),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    initialize: vi.fn(),
    newQuest: vi.fn(),
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: {
        setState: mocks.setState,
        getState: mocks.getState,
    },
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: {
        success: (...args: unknown[]) => mocks.toastSuccess(...args),
        error: (...args: unknown[]) => mocks.toastError(...args),
    },
}));

vi.mock('../../../src/views/scenes/ScenesService', () => ({
    ScenesService: {
        initialize: (...args: unknown[]) => mocks.initialize(...args),
    },
}));

vi.mock('../../../src/common/services/SoundService', () => ({
    SoundService: {
        getInstance: () => ({
            newQuest: (...args: unknown[]) => mocks.newQuest(...args),
        }),
    },
}));

import { GameEventHandler } from '../../../src/common/services/GameEventHandler';

describe('GameEventHandler', () => {
    beforeEach(() => {
        mocks.setState.mockClear();
        mocks.toastSuccess.mockClear();
        mocks.toastError.mockClear();
        mocks.initialize.mockClear();
        mocks.loadScene.mockClear();
        mocks.newQuest.mockClear();
    });

    it('handles item-granted with exact payload', async () => {
        const event = {
            kind: 'item-granted',
            itemId: 'core:item/potion',
            label: 'Health Potion',
            quantity: 2,
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        expect(mocks.toastSuccess).toHaveBeenCalledWith({
            message: 'Received Health Potion (2)',
        });
        expect(mocks.setState).not.toHaveBeenCalled();
    });

    it('handles item-consumed with exact payload', async () => {
        const event = {
            kind: 'item-consumed',
            itemId: 'core:item/potion',
            label: 'Health Potion',
            quantity: 1,
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        expect(mocks.toastSuccess).toHaveBeenCalledWith({
            message: 'Used Health Potion (1)',
        });
    });

    it('handles character-recruited with exact payload', async () => {
        const event = {
            kind: 'character-recruited',
            characterId: 'prologue:character/rin',
            label: 'Rin',
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        expect(mocks.toastSuccess).toHaveBeenCalledWith({
            message: 'Rin joined your party!',
        });
    });

    it('ignores affinity-changed', async () => {
        const event = {
            kind: 'affinity-changed',
            characterId: 'prologue:character/rin',
            label: 'Rin',
            amount: 1,
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        expect(mocks.toastSuccess).not.toHaveBeenCalled();
        expect(mocks.setState).not.toHaveBeenCalled();
    });

    it('opens battle view from encounter-started', async () => {
        const event = {
            kind: 'encounter-started',
            encounterId: 'prologue:encounter/wolves',
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        expect(mocks.setState).toHaveBeenCalledWith(expect.any(Function));
        const updater = mocks.setState.mock.calls[0]?.[0] as (prev: { view: GameView }) => {
            view: GameView;
            encounterName?: string;
        };
        expect(updater({ view: GameView.World })).toEqual({
            view: GameView.Battle,
            encounterName: 'prologue:encounter/wolves',
        });
    });

    it('opens dialogue view from dialogue-opened', async () => {
        const event = {
            kind: 'dialogue-opened',
            npcId: 'prologue:npc/amol',
            label: 'Amol',
            dialogueId: 'prologue:dialogue/amol',
            startNodeId: 'opening',
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        const updater = mocks.setState.mock.calls[0]?.[0] as (prev: { view: GameView }) => {
            view: GameView;
            npcName?: string;
        };
        expect(updater({ view: GameView.World })).toEqual({
            view: GameView.Dialogue,
            npcName: 'prologue:npc/amol',
        });
    });

    it('handles gold-granted and experience-granted with exact amounts', async () => {
        await GameEventHandler.present([
            { kind: 'gold-granted', amount: 25 } satisfies GameEventDto,
            { kind: 'experience-granted', amount: 40 } satisfies GameEventDto,
        ]);

        expect(mocks.toastSuccess).toHaveBeenNthCalledWith(1, { message: 'Obtained 25 gold!' });
        expect(mocks.toastSuccess).toHaveBeenNthCalledWith(2, { message: 'Obtained 40 experience!' });
    });

    it('refreshes the scene on teleported', async () => {
        const event = {
            kind: 'teleported',
            sceneId: 'prologue:scene/village',
            position: { x: 1, y: 2 },
        } satisfies GameEventDto;

        await GameEventHandler.present([event]);

        expect(mocks.initialize).toHaveBeenCalledOnce();
        expect(mocks.loadScene).toHaveBeenCalledOnce();
    });

    it('ignores flag-changed and quest-goal-progressed', async () => {
        await GameEventHandler.present([
            { kind: 'flag-changed', flagId: 'prologue:flag/test', value: true } satisfies GameEventDto,
            {
                kind: 'quest-goal-progressed',
                questId: 'prologue:quest/main',
                stageId: 'stage-1',
                goalId: 'goal-1',
                label: 'Wolves',
                progress: 1,
                target: 3,
            } satisfies GameEventDto,
        ]);

        expect(mocks.toastSuccess).not.toHaveBeenCalled();
        expect(mocks.setState).not.toHaveBeenCalled();
    });

    it('handles quest lifecycle events in order', async () => {
        const events = [
            {
                kind: 'quest-discovered',
                questId: 'prologue:quest/main',
                label: 'Main Quest',
            },
            {
                kind: 'quest-started',
                questId: 'prologue:quest/main',
                label: 'Main Quest',
                stageId: 'stage-1',
                transitionId: 'start',
            },
            {
                kind: 'quest-advanced',
                questId: 'prologue:quest/main',
                label: 'Main Quest',
                fromStageId: 'stage-1',
                toStageId: 'stage-2',
                transitionId: 'advance',
            },
            {
                kind: 'quest-held',
                questId: 'prologue:quest/main',
                label: 'Main Quest',
                stageId: 'stage-2',
                transitionId: 'hold',
            },
            {
                kind: 'quest-resumed',
                questId: 'prologue:quest/main',
                label: 'Main Quest',
                stageId: 'stage-2',
                transitionId: 'resume',
            },
            {
                kind: 'quest-completed',
                questId: 'prologue:quest/main',
                label: 'Main Quest',
                stageId: 'stage-3',
                transitionId: 'complete',
            },
            {
                kind: 'quest-failed',
                questId: 'prologue:quest/side',
                label: 'Side Quest',
                stageId: 'stage-2',
                transitionId: 'fail',
            },
        ] satisfies GameEventDto[];

        await GameEventHandler.present(events);

        expect(mocks.newQuest).toHaveBeenCalledOnce();
        expect(mocks.toastSuccess).toHaveBeenCalledTimes(6);
        expect(mocks.toastError).toHaveBeenCalledWith({
            message: 'Side Quest failed!',
        });
    });
});
