import { AxiosError, AxiosHeaders } from 'axios';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BattleDto } from '../../../src/common/api/.generated';
import { GameView } from '../../../src/views/game/types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

const mocks = vi.hoisted(() => ({
    loadBattle: vi.fn(),
    continueBattle: vi.fn(),
    escapeBattle: vi.fn(),
    setView: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
}));

vi.mock('../../../src/common/api/.generated', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../src/common/api/.generated')>()),
    loadBattle: mocks.loadBattle,
    continueBattle: mocks.continueBattle,
    escapeBattle: mocks.escapeBattle,
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: () => ({ setView: mocks.setView }),
}));

vi.mock('../../../src/views/scenes/ScenesService', () => ({
    ScenesService: {
        getSceneData: async () => ({ battleImageUri: 'battle.png', battleMusicUri: 'battle.ogg' }),
    },
}));

vi.mock('../../../src/views/battle/BattleCharacterComponent', () => ({
    BattleCharacterComponent: () => null,
}));

vi.mock('../../../src/common/services/MusicService', () => ({
    MusicService: { getInstance: () => ({ play: vi.fn() }) },
}));

vi.mock('../../../src/common/services/SoundService', () => ({
    SoundService: { getInstance: () => ({ victory: vi.fn(), defeat: vi.fn() }) },
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: { error: mocks.toastError, success: mocks.toastSuccess },
}));

vi.mock('../../../src/common/utils', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../src/common/utils')>()),
    throttle: <T,>(func: T) => func,
    wait: async () => undefined,
}));

import { BattleComponent } from '../../../src/views/battle/BattleComponent';

const battle = (finished = false) =>
    ({
        finished,
        canEscape: true,
        state: {
            characters: [
                {
                    id: 'hero',
                    isControlled: true,
                    isAlive: true,
                    statistics: { mana: 10 },
                    skills: [
                        { name: 'passive', label: 'Passive', kind: 'Passive' },
                        { name: 'swing', label: 'Swing', kind: 'Active' },
                    ],
                },
                {
                    id: 'bushido',
                    isControlled: false,
                    isAlive: true,
                    statistics: { mana: 0 },
                    skills: [],
                },
            ],
        },
    }) as unknown as BattleDto;

const conflict = () =>
    new AxiosError('Conflict', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 409,
        statusText: 'Conflict',
        data: { message: 'Quest transition was already applied' },
        headers: {},
        config: { headers: new AxiosHeaders() },
    });

let container: HTMLDivElement;
let root: Root;

const flush = async () => {
    for (let index = 0; index < 5; index += 1) {
        await Promise.resolve();
    }
};

const click = async (label: string) => {
    const button = [...container.querySelectorAll('button')].find(
        (candidate) => candidate.textContent === label,
    );
    if (!button) {
        throw new Error(`${label} button was not rendered`);
    }
    await act(async () => {
        button.click();
        await flush();
    });
    return button;
};

describe('BattleComponent turn failures', () => {
    beforeEach(async () => {
        mocks.loadBattle.mockReset().mockResolvedValue(battle());
        mocks.continueBattle.mockReset();
        mocks.escapeBattle.mockReset();
        mocks.setView.mockReset();
        mocks.toastError.mockReset();
        mocks.toastSuccess.mockReset();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        await act(async () => {
            root.render(<BattleComponent />);
            await flush();
        });
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
    });

    it('keeps the player in an unfinished battle after a conflicting attack', async () => {
        mocks.continueBattle.mockRejectedValueOnce(conflict());

        const attack = await click('Attack');

        expect(mocks.toastError).toHaveBeenCalledWith({
            message: 'The battle changed before your turn resolved. Try again.',
        });
        expect(mocks.loadBattle).toHaveBeenCalledTimes(2);
        expect(mocks.setView).not.toHaveBeenCalled();
        expect(attack.disabled).toBe(false);
    });

    it('handles a conflicting escape the same way instead of rejecting unhandled', async () => {
        mocks.escapeBattle.mockRejectedValueOnce(conflict());

        await click('Run');

        expect(mocks.toastError).toHaveBeenCalledTimes(1);
        expect(mocks.setView).not.toHaveBeenCalled();
    });

    it('returns to the world when the reloaded battle is already finished', async () => {
        mocks.continueBattle.mockRejectedValueOnce(new Error('offline'));
        mocks.loadBattle.mockResolvedValueOnce(battle(true));

        await click('Attack');

        expect(mocks.toastError).not.toHaveBeenCalled();
        expect(mocks.setView).toHaveBeenCalledWith(GameView.World);
    });
});
