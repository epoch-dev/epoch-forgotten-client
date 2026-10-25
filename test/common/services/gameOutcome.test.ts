import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameEventDto } from '../../../src/common/api/.generated';
import { GameView } from '../../../src/views/game/types';

const mocks = vi.hoisted(() => ({
    initialize: vi.fn(),
    openPendingDialogue: vi.fn(),
    present: vi.fn(),
    setView: vi.fn(),
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: {
        getState: () => ({
            setView: mocks.setView,
        }),
    },
}));

vi.mock('../../../src/common/services/GameEventHandler', () => ({
    GameEventHandler: {
        present: mocks.present,
    },
}));

vi.mock('../../../src/views/scenes/ScenesService', () => ({
    ScenesService: {
        initialize: mocks.initialize,
        openPendingDialogue: mocks.openPendingDialogue,
    },
}));

import { applyGameOutcome } from '../../../src/common/services/gameOutcome';

describe('applyGameOutcome', () => {
    beforeEach(() => {
        mocks.initialize.mockReset().mockResolvedValue(undefined);
        mocks.openPendingDialogue.mockReset();
        mocks.present.mockReset().mockResolvedValue(undefined);
        mocks.setView.mockReset();
    });

    it('presents server events before refreshing the world state', async () => {
        const events = [
            {
                kind: 'dialogue-opened',
                npcId: 'prologue:npc/martha',
                label: 'Martha',
                dialogueId: 'prologue:dialogue/martha-follow-up',
                startNodeId: 'opening',
            },
        ] satisfies GameEventDto[];

        await expect(applyGameOutcome(events)).resolves.toEqual({ refreshed: true });

        expect(mocks.setView).toHaveBeenCalledWith(GameView.World);
        expect(mocks.present).toHaveBeenCalledWith(events);
        expect(mocks.initialize.mock.invocationCallOrder[0]).toBeGreaterThan(
            mocks.present.mock.invocationCallOrder[0] ?? Number.NEGATIVE_INFINITY,
        );
        expect(mocks.openPendingDialogue).toHaveBeenCalledOnce();
    });

    it('keeps an accepted outcome complete when the world refresh fails', async () => {
        mocks.initialize.mockRejectedValue(new Error('offline'));

        await expect(applyGameOutcome([])).resolves.toEqual({ refreshed: false });

        expect(mocks.present).toHaveBeenCalledWith([]);
        expect(mocks.openPendingDialogue).not.toHaveBeenCalled();
    });
});
