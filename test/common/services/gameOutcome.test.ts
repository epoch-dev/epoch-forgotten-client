import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameEventDto, SceneDataDto } from '../../../src/common/api/.generated';
import { applyGameOutcome } from '../../../src/common/services/gameOutcome';
import { useGameStore } from '../../../src/views/game/GameStore';
import { GameView } from '../../../src/views/game/types';

const mocks = vi.hoisted(() => ({
    currentScene: vi.fn(),
}));

vi.mock('../../../src/common/api/.generated', () => ({
    currentScene: mocks.currentScene,
}));

const sceneWithPendingDialogue = (pendingDialogueNpcId?: string): Partial<SceneDataDto> => ({
    userPosition: { x: 0, y: 0 },
    pendingDialogueNpcId,
});

describe('applyGameOutcome', () => {
    beforeEach(() => {
        mocks.currentScene.mockReset().mockResolvedValue(sceneWithPendingDialogue());
        useGameStore.setState({
            view: GameView.Party,
            npcName: undefined,
            encounterName: undefined,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns to World and refreshes the scene when no event navigates', async () => {
        await applyGameOutcome([]);

        expect(useGameStore.getState().view).toBe(GameView.World);
        expect(mocks.currentScene).toHaveBeenCalledOnce();
    });

    it('opens the pending dialogue when the outcome leaves the player in World', async () => {
        mocks.currentScene.mockResolvedValue(sceneWithPendingDialogue('prologue:npc/vargoth'));

        await applyGameOutcome([]);

        expect(useGameStore.getState()).toMatchObject({
            view: GameView.Dialogue,
            npcName: 'prologue:npc/vargoth',
        });
    });

    it('lets a chained dialogue override World and the pending dialogue', async () => {
        mocks.currentScene.mockResolvedValue(sceneWithPendingDialogue('prologue:npc/vargoth'));
        const events = [
            {
                kind: 'dialogue-opened',
                npcId: 'prologue:npc/elias',
                label: 'Elias',
                dialogueId: 'prologue:dialogue/elias-follow-up',
                startNodeId: 'opening',
            },
        ] satisfies GameEventDto[];

        await applyGameOutcome(events);

        expect(useGameStore.getState()).toMatchObject({
            view: GameView.Dialogue,
            npcName: 'prologue:npc/elias',
        });
    });

    it('lets an encounter override World and the pending dialogue', async () => {
        mocks.currentScene.mockResolvedValue(sceneWithPendingDialogue('prologue:npc/vargoth'));
        const events = [
            { kind: 'encounter-started', encounterId: 'prologue:encounter/wolves' },
        ] satisfies GameEventDto[];

        await applyGameOutcome(events);

        expect(useGameStore.getState()).toMatchObject({
            view: GameView.Battle,
            encounterName: 'prologue:encounter/wolves',
            npcName: undefined,
        });
    });

    it('logs a failed refresh without throwing because the outcome is already committed', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const offline = new Error('offline');
        mocks.currentScene.mockRejectedValue(offline);

        await expect(applyGameOutcome([])).resolves.toBeUndefined();

        expect(useGameStore.getState().view).toBe(GameView.World);
        expect(consoleError).toHaveBeenCalledWith('Unable to apply the committed game outcome', offline);
    });
});
