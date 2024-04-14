import { create } from 'zustand';
import { GameView } from './types';
import { MapMoveResultDtoEncounterData, MapMoveResultDtoNpcData } from '../../common/api/.generated';
import { MapScene } from '../maps/MapScene';

type GameStore = {
    scene: MapScene | undefined;
    view: GameView;
    encounter: MapMoveResultDtoEncounterData | undefined;
    npc: MapMoveResultDtoNpcData | undefined;
    setView: (view: GameView) => void;
    setScene: (scene: MapScene) => void;
    setEncounter: (encounter: MapMoveResultDtoEncounterData) => void;
    setNpc: (npc: MapMoveResultDtoNpcData) => void;
};

export const useGameStore = create<GameStore>()((set) => ({
    scene: undefined,
    view: GameView.World,
    encounter: undefined,
    npc: undefined,
    setScene: (scene: MapScene) => set({ scene }),
    setView: (view: GameView) =>
        set((state) => {
            if (state.scene) {
                state.scene.blockMovement = view !== GameView.World;
            }
            return {
                ...state,
                view,
            };
        }),
    setEncounter: (encounter: MapMoveResultDtoEncounterData) => set({ encounter }),
    setNpc: (npc: MapMoveResultDtoNpcData) => set({ npc }),
}));
