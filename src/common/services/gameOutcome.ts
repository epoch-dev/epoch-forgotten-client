import type { GameEventDto } from '../api/.generated';
import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { ScenesService } from '../../views/scenes/ScenesService';
import { GameEventHandler } from './GameEventHandler';
import { ToastService } from './ToastService';

export type GameOutcomeResult = Readonly<{
    refreshed: boolean;
}>;

const refreshWorldState = async (): Promise<boolean> => {
    try {
        await ScenesService.initialize();
        ScenesService.openPendingDialogue();
        return true;
    } catch {
        ToastService.error({ message: 'Unable to refresh the world.' });
        return false;
    }
};

export const applyGameOutcome = async (
    events: readonly GameEventDto[],
): Promise<GameOutcomeResult> => {
    useGameStore.getState().setView(GameView.World);
    await GameEventHandler.present(events);

    return {
        refreshed: await refreshWorldState(),
    };
};
