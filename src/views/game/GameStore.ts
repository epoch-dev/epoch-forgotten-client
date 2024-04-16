import { create } from 'zustand';
import { GameView } from './types';
import { MapMoveResultDtoEncounterData, MapMoveResultDtoNpcData } from '../../common/api/.generated';
import { SceneRenderer } from '../scenes/SceneRenderer';

type GameStore = {
    scene: SceneRenderer | undefined;
    view: GameView;
    encounter: MapMoveResultDtoEncounterData | undefined;
    npc: MapMoveResultDtoNpcData | undefined;
    setView: (view: GameView) => void;
    setScene: (scene: SceneRenderer) => void;
    setEncounter: (encounter: MapMoveResultDtoEncounterData) => void;
    setNpc: (npc: MapMoveResultDtoNpcData) => void;
};

export const useGameStore = create<GameStore>()((set) => ({
    scene: undefined,
    view: GameView.World,
    encounter: undefined,
    npc: undefined,
    setScene: (scene: SceneRenderer) => set({ scene }),
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
