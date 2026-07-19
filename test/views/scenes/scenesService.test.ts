import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SceneDataDto } from '../../../src/common/api/.generated';
import { GameView } from '../../../src/views/game/types';

const mocks = vi.hoisted(() => ({
    currentScene: vi.fn(),
    setState: vi.fn(),
}));

vi.mock('../../../src/common/api/client', () => ({
    scenesClient: {
        currentScene: mocks.currentScene,
    },
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: {
        setState: mocks.setState,
    },
}));

import { ScenesService } from '../../../src/views/scenes/ScenesService';

const sceneData = (pendingDialogueNpcId?: string): SceneDataDto =>
    ({
        pendingDialogueNpcId,
        battleImageUri: 'battle.png',
        battleMusicUri: 'battle.ogg',
        imageUri: 'scene.png',
        musicUri: 'scene.ogg',
        name: 'prologue:scene/village',
        columns: 110,
        rows: 60,
        tileSize: 10,
        tiles: [],
        userPosition: { x: 0, y: 0 },
    }) satisfies SceneDataDto;

describe('ScenesService', () => {
    beforeEach(() => {
        mocks.currentScene.mockReset();
        mocks.setState.mockReset();
        ScenesService.userPosition = undefined;
        (
            ScenesService as unknown as { sceneData?: SceneDataDto }
        ).sceneData = undefined;
    });

    it('opens dialogue only when pendingDialogueNpcId is present', async () => {
        mocks.currentScene.mockResolvedValue({ data: sceneData('prologue:npc/martha') });

        await ScenesService.initialize();

        expect(mocks.setState).toHaveBeenCalledWith(expect.any(Function));
        const updater = mocks.setState.mock.calls[0]?.[0] as (prev: { view: GameView }) => {
            view: GameView;
            npcName?: string;
        };
        expect(updater({ view: GameView.World })).toEqual({
            view: GameView.Dialogue,
            npcName: 'prologue:npc/martha',
        });
    });

    it('does not open dialogue when pendingDialogueNpcId is absent', async () => {
        mocks.currentScene.mockResolvedValue({ data: sceneData() });

        await ScenesService.initialize();

        expect(mocks.setState).not.toHaveBeenCalled();
    });

    it('uses authored grid metadata for scene pixel size', async () => {
        mocks.currentScene.mockResolvedValue({ data: sceneData() });

        await expect(ScenesService.getSceneSize()).resolves.toEqual({
            width: 1100,
            height: 600,
        });
    });
});
