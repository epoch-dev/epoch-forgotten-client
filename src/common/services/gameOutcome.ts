import type { GameEventDto } from '../api/.generated';
import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { ScenesService } from '../../views/scenes/ScenesService';
import { GameEventHandler } from './GameEventHandler';

// The server already committed this outcome, so failures here are logged rather than offered for retry;
// the API mutator has already shown the user any request error.
export const applyGameOutcome = async (events: readonly GameEventDto[]): Promise<void> => {
    useGameStore.getState().setView(GameView.World);
    try {
        await GameEventHandler.present(events);
        await ScenesService.initialize();
    } catch (error) {
        console.error('Unable to apply the committed game outcome', error);
        return;
    }
    if (useGameStore.getState().view === GameView.World) {
        ScenesService.openPendingDialogue();
    }
};
